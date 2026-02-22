package authon

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
)

// WebhookService handles webhook verification.
type WebhookService struct{}

// Verify validates a webhook payload against the provided HMAC-SHA256 signature.
// Returns the parsed event data on success.
func (w *WebhookService) Verify(payload []byte, signature string, secret string) (map[string]any, error) {
	if len(payload) == 0 {
		return nil, errors.New("authon: empty webhook payload")
	}
	if signature == "" {
		return nil, errors.New("authon: empty webhook signature")
	}
	if secret == "" {
		return nil, errors.New("authon: empty webhook secret")
	}

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payload)
	expected := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(expected), []byte(signature)) {
		return nil, errors.New("authon: invalid webhook signature")
	}

	var result map[string]any
	if err := json.Unmarshal(payload, &result); err != nil {
		return nil, errors.New("authon: failed to parse webhook payload: " + err.Error())
	}

	return result, nil
}
