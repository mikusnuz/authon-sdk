package authon

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// AuthonBackend is the server-side Authon client.
type AuthonBackend struct {
	secretKey  string
	apiURL     string
	httpClient *http.Client

	Users    *UserService
	Webhooks *WebhookService
}

// NewAuthonBackend creates a new backend client with the given secret key.
func NewAuthonBackend(secretKey string, opts ...Option) *AuthonBackend {
	b := &AuthonBackend{
		secretKey:  secretKey,
		apiURL:     defaultAPIURL,
		httpClient: http.DefaultClient,
	}
	for _, opt := range opts {
		opt(b)
	}
	b.Users = &UserService{backend: b}
	b.Webhooks = &WebhookService{}
	return b
}

// VerifyToken verifies an access token and returns the associated user.
func (b *AuthonBackend) VerifyToken(ctx context.Context, accessToken string) (*User, error) {
	req, err := b.newRequest(ctx, http.MethodGet, "/v1/auth/verify", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	var user User
	if err := b.do(req, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// UserService handles user management operations.
type UserService struct {
	backend *AuthonBackend
}

// List retrieves a paginated list of users.
func (s *UserService) List(ctx context.Context, opts *ListOptions) (*ListResult[User], error) {
	path := "/v1/users"
	if opts != nil {
		path = fmt.Sprintf("/v1/users?page=%d&perPage=%d", opts.Page, opts.PerPage)
	}

	req, err := s.backend.newRequest(ctx, http.MethodGet, path, nil)
	if err != nil {
		return nil, err
	}

	var result ListResult[User]
	if err := s.backend.do(req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

// Get retrieves a user by ID.
func (s *UserService) Get(ctx context.Context, userID string) (*User, error) {
	req, err := s.backend.newRequest(ctx, http.MethodGet, "/v1/users/"+userID, nil)
	if err != nil {
		return nil, err
	}

	var user User
	if err := s.backend.do(req, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// Create creates a new user.
func (s *UserService) Create(ctx context.Context, params CreateUserParams) (*User, error) {
	req, err := s.backend.newRequest(ctx, http.MethodPost, "/v1/users", params)
	if err != nil {
		return nil, err
	}

	var user User
	if err := s.backend.do(req, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// Update updates an existing user.
func (s *UserService) Update(ctx context.Context, userID string, params UpdateUserParams) (*User, error) {
	req, err := s.backend.newRequest(ctx, http.MethodPatch, "/v1/users/"+userID, params)
	if err != nil {
		return nil, err
	}

	var user User
	if err := s.backend.do(req, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// Delete deletes a user by ID.
func (s *UserService) Delete(ctx context.Context, userID string) error {
	req, err := s.backend.newRequest(ctx, http.MethodDelete, "/v1/users/"+userID, nil)
	if err != nil {
		return err
	}
	return s.backend.do(req, nil)
}

// Ban bans a user by ID.
func (s *UserService) Ban(ctx context.Context, userID string) (*User, error) {
	req, err := s.backend.newRequest(ctx, http.MethodPost, "/v1/users/"+userID+"/ban", nil)
	if err != nil {
		return nil, err
	}

	var user User
	if err := s.backend.do(req, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// Unban unbans a user by ID.
func (s *UserService) Unban(ctx context.Context, userID string) (*User, error) {
	req, err := s.backend.newRequest(ctx, http.MethodPost, "/v1/users/"+userID+"/unban", nil)
	if err != nil {
		return nil, err
	}

	var user User
	if err := s.backend.do(req, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

func (b *AuthonBackend) newRequest(ctx context.Context, method, path string, body any) (*http.Request, error) {
	url := b.apiURL + path

	var bodyReader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("authon: failed to marshal request body: %w", err)
		}
		bodyReader = bytes.NewReader(data)
	}

	req, err := http.NewRequestWithContext(ctx, method, url, bodyReader)
	if err != nil {
		return nil, fmt.Errorf("authon: failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+b.secretKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "authon-go/0.1.0")

	return req, nil
}

func (b *AuthonBackend) do(req *http.Request, v any) error {
	resp, err := b.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("authon: request failed: %w", err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("authon: failed to read response: %w", err)
	}

	if resp.StatusCode >= 400 {
		var apiErr AuthonError
		if json.Unmarshal(data, &apiErr) == nil && apiErr.Message != "" {
			apiErr.StatusCode = resp.StatusCode
			return &apiErr
		}
		return &AuthonError{
			StatusCode: resp.StatusCode,
			Message:    string(data),
		}
	}

	if v != nil && len(data) > 0 {
		if err := json.Unmarshal(data, v); err != nil {
			return fmt.Errorf("authon: failed to decode response: %w", err)
		}
	}

	return nil
}
