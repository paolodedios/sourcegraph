package validation

import (
	"strings"
	"testing"

	"github.com/sourcegraph/sourcegraph/internal/conf"
	srcprometheus "github.com/sourcegraph/sourcegraph/internal/src-prometheus"
	"github.com/sourcegraph/sourcegraph/schema"
)

func Test_prometheusValidator(t *testing.T) {
	type args struct {
		prometheusURL string
		config        conf.Unified
	}
	tests := []struct {
		name                 string
		args                 args
		wantProblemSubstring string
	}{
		{
			name: "no problem if prometheus not set",
			args: args{
				prometheusURL: "",
			},
			wantProblemSubstring: "",
		},
		{
			name: "no problem if no alerts set",
			args: args{
				prometheusURL: "http://prometheus:9090",
				config:        conf.Unified{},
			},
			wantProblemSubstring: "",
		},
		{
			name: "url and alerts set, but malformed prometheus URL",
			args: args{
				prometheusURL: " http://prometheus:9090",
				config: conf.Unified{
					SiteConfiguration: schema.SiteConfiguration{
						ObservabilityAlerts: []*schema.ObservabilityAlerts{{
							Level: "critical",
						}},
					},
				},
			},
			wantProblemSubstring: "misconfigured",
		},
		{
			name: "prometheus not found (with only observability.alerts configured)",
			args: args{
				prometheusURL: "http://no-prometheus:9090",
				config: conf.Unified{
					SiteConfiguration: schema.SiteConfiguration{
						ObservabilityAlerts: []*schema.ObservabilityAlerts{{
							Level: "critical",
						}},
					},
				},
			},
			wantProblemSubstring: "failed to fetch alerting configuration",
		},
		{
			name: "prometheus not found (with only observability.silenceAlerts configured)",
			args: args{
				prometheusURL: "http://no-prometheus:9090",
				config: conf.Unified{
					SiteConfiguration: schema.SiteConfiguration{
						ObservabilitySilenceAlerts: []string{"warning_gitserver_disk_space_remaining"},
					},
				},
			},
			wantProblemSubstring: "failed to fetch alerting configuration",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			validate := newPrometheusValidator(srcprometheus.NewClient(tt.args.prometheusURL))
			problems := validate(tt.args.config)
			if tt.wantProblemSubstring == "" {
				if len(problems) > 0 {
					t.Errorf("expected no problems, got %+v", problems)
				}
			} else {
				found := false
				for _, p := range problems {
					if strings.Contains(p.String(), tt.wantProblemSubstring) {
						found = true
						break
					}
				}
				if !found {
					t.Errorf("expected problem '%s', got %+v", tt.wantProblemSubstring, problems)
				}
			}
		})
	}
}
