package authon

const defaultAPIURL = "https://api.authon.dev"

// Option configures the AuthonBackend client.
type Option func(*AuthonBackend)

// WithAPIURL sets a custom API base URL.
func WithAPIURL(url string) Option {
	return func(b *AuthonBackend) {
		b.apiURL = url
	}
}
