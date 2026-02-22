package authon

import "time"

// User represents an Authon user.
type User struct {
	ID              string            `json:"id"`
	Email           string            `json:"email,omitempty"`
	EmailVerified   bool              `json:"emailVerified"`
	Phone           string            `json:"phone,omitempty"`
	PhoneVerified   bool              `json:"phoneVerified"`
	Username        string            `json:"username,omitempty"`
	FirstName       string            `json:"firstName,omitempty"`
	LastName        string            `json:"lastName,omitempty"`
	DisplayName     string            `json:"displayName,omitempty"`
	AvatarURL       string            `json:"avatarUrl,omitempty"`
	Banned          bool              `json:"banned"`
	Metadata        map[string]any    `json:"metadata,omitempty"`
	ExternalAccounts []ExternalAccount `json:"externalAccounts,omitempty"`
	CreatedAt       time.Time         `json:"createdAt"`
	UpdatedAt       time.Time         `json:"updatedAt"`
}

// ExternalAccount represents an OAuth-linked external account.
type ExternalAccount struct {
	Provider   string `json:"provider"`
	ProviderID string `json:"providerId"`
	Email      string `json:"email,omitempty"`
}

// Session represents an active user session.
type Session struct {
	ID           string    `json:"id"`
	UserID       string    `json:"userId"`
	Status       string    `json:"status"`
	LastActiveAt time.Time `json:"lastActiveAt"`
	ExpireAt     time.Time `json:"expireAt"`
	CreatedAt    time.Time `json:"createdAt"`
}

// WebhookEvent represents an incoming webhook event from Authon.
type WebhookEvent struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"`
	Data      any       `json:"data"`
	Timestamp time.Time `json:"timestamp"`
}

// ListResult is a paginated list response.
type ListResult[T any] struct {
	Data       []T `json:"data"`
	TotalCount int `json:"totalCount"`
	Page       int `json:"page"`
	PerPage    int `json:"perPage"`
}

// ListOptions specifies pagination and filtering for list endpoints.
type ListOptions struct {
	Page    int
	PerPage int
}

// CreateUserParams specifies parameters for creating a user.
type CreateUserParams struct {
	Email     string         `json:"email,omitempty"`
	Phone     string         `json:"phone,omitempty"`
	Username  string         `json:"username,omitempty"`
	FirstName string         `json:"firstName,omitempty"`
	LastName  string         `json:"lastName,omitempty"`
	Password  string         `json:"password,omitempty"`
	Metadata  map[string]any `json:"metadata,omitempty"`
}

// UpdateUserParams specifies parameters for updating a user.
type UpdateUserParams struct {
	Email     *string         `json:"email,omitempty"`
	Phone     *string         `json:"phone,omitempty"`
	Username  *string         `json:"username,omitempty"`
	FirstName *string         `json:"firstName,omitempty"`
	LastName  *string         `json:"lastName,omitempty"`
	Metadata  *map[string]any `json:"metadata,omitempty"`
}

// AuthonError represents an API error response.
type AuthonError struct {
	StatusCode int    `json:"statusCode"`
	Message    string `json:"message"`
	Code       string `json:"code,omitempty"`
}

func (e *AuthonError) Error() string {
	if e.Code != "" {
		return e.Code + ": " + e.Message
	}
	return e.Message
}
