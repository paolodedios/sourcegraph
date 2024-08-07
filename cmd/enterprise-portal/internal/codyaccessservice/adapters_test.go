package codyaccessservice

import (
	"fmt"
	"testing"

	"github.com/hexops/autogold/v2"
	"github.com/stretchr/testify/assert"

	"github.com/sourcegraph/sourcegraph/cmd/enterprise-portal/internal/database/codyaccess"
)

func TestConvertAccessAttrsToProto(t *testing.T) {
	t.Run("zero value", func(t *testing.T) {
		proto := convertAccessAttrsToProto(&codyaccess.CodyGatewayAccessWithSubscriptionDetails{})
		assert.False(t, proto.Enabled)
	})

	t.Run("disabled returns access tokens", func(t *testing.T) {
		proto := convertAccessAttrsToProto(&codyaccess.CodyGatewayAccessWithSubscriptionDetails{
			CodyGatewayAccess: codyaccess.CodyGatewayAccess{
				Enabled: false,
			},
			LicenseKeyHashes: [][]byte{[]byte("abc"), []byte("efg")},
		})
		assert.False(t, proto.Enabled)
		// NOTE: These are not real access tokens
		autogold.Expect([]string{`token:"slk_616263"`, `token:"slk_656667"`}).Equal(t, toStrings(proto.GetAccessTokens()))
		// Returns nil rate limits
		assert.Nil(t, proto.ChatCompletionsRateLimit)
		assert.Nil(t, proto.CodeCompletionsRateLimit)
		assert.Nil(t, proto.EmbeddingsRateLimit)
	})

	t.Run("enabled with empty access token", func(t *testing.T) {
		proto := convertAccessAttrsToProto(&codyaccess.CodyGatewayAccessWithSubscriptionDetails{
			CodyGatewayAccess: codyaccess.CodyGatewayAccess{
				Enabled: true,
			},
			LicenseKeyHashes: [][]byte{[]byte(""), nil},
		})
		assert.True(t, proto.Enabled)
		assert.Empty(t, proto.GetAccessTokens())
	})

	t.Run("enabled returns everything", func(t *testing.T) {
		proto := convertAccessAttrsToProto(&codyaccess.CodyGatewayAccessWithSubscriptionDetails{
			CodyGatewayAccess: codyaccess.CodyGatewayAccess{
				Enabled: true,
			},
			LicenseKeyHashes: [][]byte{[]byte("abc"), []byte("efg")},
		})
		assert.True(t, proto.Enabled)
		// NOTE: These are not real access tokens
		autogold.Expect([]string{`token:"slk_616263"`, `token:"slk_656667"`}).Equal(t, toStrings(proto.GetAccessTokens()))
		// Returns non-nil rate limits
		assert.NotNil(t, proto.ChatCompletionsRateLimit)
		assert.NotNil(t, proto.CodeCompletionsRateLimit)
		assert.NotNil(t, proto.EmbeddingsRateLimit)
	})
}

func toStrings[T fmt.Stringer](stringers []T) []string {
	strs := make([]string, len(stringers))
	for i, s := range stringers {
		strs[i] = s.String()
	}
	return strs
}
