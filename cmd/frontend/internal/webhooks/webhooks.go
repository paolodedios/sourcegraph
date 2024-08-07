package webhooks

import (
	"context"
	"fmt"
	"github.com/google/go-github/v55/github"
	"github.com/sourcegraph/sourcegraph/internal/batches/service"
	"github.com/sourcegraph/sourcegraph/internal/batches/sources"
	"github.com/sourcegraph/sourcegraph/internal/batches/store"
	ghtypes "github.com/sourcegraph/sourcegraph/internal/github_apps/types"
	"github.com/sourcegraph/sourcegraph/internal/observation"
	"github.com/sourcegraph/sourcegraph/lib/errors"
	"github.com/sourcegraph/sourcegraph/lib/pointers"
	"net/http"
	"net/url"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/sourcegraph/log"
	"golang.org/x/sync/errgroup"

	"github.com/sourcegraph/sourcegraph/internal/database"
	"github.com/sourcegraph/sourcegraph/internal/encryption/keyring"
	"github.com/sourcegraph/sourcegraph/internal/extsvc"
)

const pingEventType = "ping"

type eventHandlers map[string][]Handler

// Router is responsible for handling incoming http requests for all webhooks
// and routing to any registered WebhookHandlers, events are routed by their code host kind
// and event type.
type Router struct {
	Logger log.Logger
	DB     database.DB

	mu sync.RWMutex
	// Mapped by codeHostKind: webhookEvent: handlers
	handlers map[string]eventHandlers
}

type Registerer interface {
	Register(webhookRouter *Router)
}

// RegistererHandler combines the Registerer and http.Handler interfaces.
// This allows for webhooks to use both the old paths (.api/gitlab-webhooks)
// and the generic new path (.api/webhooks).
type RegistererHandler interface {
	Registerer
	http.Handler
}

func defaultHandlers() map[string]eventHandlers {
	handlePing := func(_ context.Context, _ database.DB, _ extsvc.CodeHostBaseURL, event any) error {
		return nil
	}
	handleInstallation := func(ctx context.Context, db database.DB, _ extsvc.CodeHostBaseURL, event any) error {
		e, ok := event.(*github.InstallationEvent)
		if !ok {
			return errors.New(fmt.Sprintf("expected *InstallationEvent, got %T", event))
		}

		baseURL, err := url.Parse(e.GetInstallation().GetHTMLURL())
		if err != nil {
			return err
		}

		app, err := db.GitHubApps().GetByAppID(ctx, int(e.GetInstallation().GetAppID()), fmt.Sprintf("%s://%s/", baseURL.Scheme, baseURL.Host))
		if err != nil {
			return err
		}

		installInfo, err := db.GitHubApps().Install(ctx, ghtypes.GitHubAppInstallation{
			InstallationID:   int(e.GetInstallation().GetID()),
			AppID:            app.ID,
			URL:              e.GetInstallation().GetHTMLURL(),
			AccountLogin:     e.GetInstallation().GetAccount().GetLogin(),
			AccountAvatarURL: e.GetInstallation().GetAccount().GetAvatarURL(),
			AccountURL:       e.GetInstallation().GetAccount().GetHTMLURL(),
			AccountType:      e.GetInstallation().GetAccount().GetType(),
		})

		if err != nil {
			return err
		}

		if app.Kind == ghtypes.UserCredentialGitHubAppKind || app.Kind == ghtypes.SiteCredentialGitHubAppKind {
			if err := handleCredentialCreation(ctx, db, app, installInfo.AccountLogin); err != nil {
				return err
			}
		}

		return nil
	}
	return map[string]eventHandlers{
		extsvc.KindGitHub: map[string][]Handler{
			pingEventType:  {handlePing},
			"installation": {handleInstallation},
		},
		extsvc.KindBitbucketServer: map[string][]Handler{
			pingEventType: {handlePing},
		},
	}
}

func handleCredentialCreation(ctx context.Context, db database.DB, app *ghtypes.GitHubApp, owner string) error {
	observationCtx := observation.NewContext(log.NoOp())
	bstore := store.New(db, observationCtx, keyring.Default().BatchChangesCredentialKey)
	svc := service.New(bstore)

	// external service urls always end with a trailing slash. `url.JoinPath` ensures that's the case irrespective
	// of whether the base URL ends with a trailing slash or not.
	esu, err := url.JoinPath(app.BaseURL, "/")
	if err != nil {
		return errors.Newf("Unexpected error while creating external service url for github app: %s", err.Error())
	}

	if app.Kind == ghtypes.UserCredentialGitHubAppKind {
		if _, err = svc.CreateBatchChangesUserCredential(
			ctx,
			sources.AuthenticationStrategyGitHubApp,
			service.CreateBatchChangesUserCredentialArgs{
				ExternalServiceURL:  esu,
				ExternalServiceType: extsvc.VariantGitHub.AsType(),
				GitHubAppKind:       app.Kind,
				Username:            pointers.Ptr(owner),
				GitHubAppID:         app.ID,
				UserID:              int32(app.CreatedByUserId),
			}); err != nil {
			return errors.Wrapf(err, "Unexpected error while creating user credential for github app")
		}
	} else {
		if _, err := svc.CreateBatchChangesSiteCredential(
			ctx,
			sources.AuthenticationStrategyGitHubApp,
			service.CreateBatchChangesSiteCredentialArgs{
				ExternalServiceURL:  esu,
				ExternalServiceType: extsvc.VariantGitHub.AsType(),
				GitHubAppKind:       app.Kind,
				Username:            pointers.Ptr(owner),
				GitHubAppID:         app.ID,
			}); err != nil {
			return errors.Wrapf(err, "Unexpected error while creating site credential for github app")
		}
	}

	return nil
}

// Register associates a given event type(s) with the specified handler.
// Handlers are organized into a stack and executed sequentially, so the order in
// which they are provided is significant.
func (wr *Router) Register(handler Handler, codeHostKind string, eventTypes ...string) {
	wr.mu.Lock()
	defer wr.mu.Unlock()
	if wr.handlers == nil {
		wr.handlers = defaultHandlers()
	}
	if _, ok := wr.handlers[codeHostKind]; !ok {
		wr.handlers[codeHostKind] = make(map[string][]Handler)
	}
	for _, eventType := range eventTypes {
		wr.handlers[codeHostKind][eventType] = append(wr.handlers[codeHostKind][eventType], handler)
	}
}

// NewHandler is responsible for handling all incoming webhooks
// and invoking the correct handlers depending on where the webhooks
// come from.
func NewHandler(logger log.Logger, db database.DB, gh *Router) http.Handler {
	base := mux.NewRouter().PathPrefix("/.api/webhooks").Subrouter()
	base.Path("/{webhook_uuid}").Methods("POST").Handler(handler(logger, db, gh))

	return base
}

// Handler is a handler for a webhook event, the 'event' param could be any of the event types
// permissible based on the event type(s) the handler was registered against. If you register a handler
// for many event types, you should do a type switch within your handler.
// Handlers are responsible for fetching the necessary credentials to perform their associated tasks.
type Handler func(ctx context.Context, db database.DB, codeHostURN extsvc.CodeHostBaseURL, event any) error

func handler(logger log.Logger, db database.DB, wh *Router) http.HandlerFunc {
	logger = logger.Scoped("webhooks.handler")
	return func(w http.ResponseWriter, r *http.Request) {
		uuidString := mux.Vars(r)["webhook_uuid"]
		if uuidString == "" {
			http.Error(w, "missing uuid", http.StatusBadRequest)
			return
		}

		webhookUUID, err := uuid.Parse(uuidString)
		if err != nil {
			logger.Error("Error while parsing Webhook UUID", log.Error(err))
			http.Error(w, fmt.Sprintf("Could not parse UUID from URL path %q.", uuidString), http.StatusBadRequest)
			return
		}

		webhook, err := db.Webhooks(keyring.Default().WebhookKey).GetByUUID(r.Context(), webhookUUID)
		if err != nil {
			logger.Error("Error while fetching webhook by UUID", log.Error(err))
			http.Error(w, "Could not find webhook with provided UUID.", http.StatusNotFound)
			return
		}
		SetWebhookID(r.Context(), webhook.ID)

		var secret string
		if webhook.Secret != nil {
			secret, err = webhook.Secret.Decrypt(r.Context())
			if err != nil {
				logger.Error("Error while decrypting webhook secret", log.Error(err))
				http.Error(w, "Could not decrypt webhook secret.", http.StatusInternalServerError)
				return
			}
		}

		switch webhook.CodeHostKind {
		case extsvc.KindGitHub:
			handleGitHubWebHook(logger, w, r, webhook.CodeHostURN, secret, &GitHubWebhook{Router: wh})
			return
		case extsvc.KindGitLab:
			wh.handleGitLabWebHook(logger, w, r, webhook.CodeHostURN, secret)
			return
		case extsvc.KindBitbucketServer:
			wh.handleBitbucketServerWebhook(logger, w, r, webhook.CodeHostURN, secret)
			return
		case extsvc.KindBitbucketCloud:
			wh.HandleBitbucketCloudWebhook(logger, w, r, webhook.CodeHostURN, secret)
			return
		case extsvc.KindAzureDevOps:
			wh.HandleAzureDevOpsWebhook(logger, w, r, webhook.CodeHostURN)
			return
		}

		http.Error(w, fmt.Sprintf("webhooks not implemented for code host kind %q", webhook.CodeHostKind), http.StatusNotImplemented)
	}
}

// Dispatch accepts an event for a particular event type and dispatches it
// to the appropriate stack of handlers, if any are configured.
func (wr *Router) Dispatch(ctx context.Context, eventType string, codeHostKind string, codeHostURN extsvc.CodeHostBaseURL, e any) error {
	wr.mu.RLock()
	defer wr.mu.RUnlock()

	if _, ok := wr.handlers[codeHostKind][eventType]; !ok {
		wr.Logger.Warn("No handler for event found", log.String("eventType", eventType), log.String("codeHostKind", codeHostKind))
		return nil
	}

	g := errgroup.Group{}
	for _, handler := range wr.handlers[codeHostKind][eventType] {
		// capture the handler variable within this loop
		handler := handler
		g.Go(func() error {
			return handler(ctx, wr.DB, codeHostURN, e)
		})
	}
	return g.Wait()
}
