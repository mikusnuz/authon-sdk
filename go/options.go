package authup

const defaultAPIURL = "https://api.authup.dev"

// Option configures the AuthupBackend client.
type Option func(*AuthupBackend)

// WithAPIURL sets a custom API base URL.
func WithAPIURL(url string) Option {
	return func(b *AuthupBackend) {
		b.apiURL = url
	}
}
