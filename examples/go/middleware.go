package main

import (
	"context"
	"net/http"

	authon "github.com/mikusnuz/authon-sdk/go"
)

type contextKey string

const userContextKey contextKey = "current_user"

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("authon_token")
		if err != nil || cookie.Value == "" {
			http.Redirect(w, r, "/sign-in", http.StatusFound)
			return
		}

		user, err := backend.VerifyToken(r.Context(), cookie.Value)
		if err != nil {
			http.SetCookie(w, &http.Cookie{
				Name:   "authon_token",
				Value:  "",
				MaxAge: -1,
				Path:   "/",
			})
			http.Redirect(w, r, "/sign-in", http.StatusFound)
			return
		}

		ctx := context.WithValue(r.Context(), userContextKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func currentUser(r *http.Request) *authon.User {
	user, _ := r.Context().Value(userContextKey).(*authon.User)
	return user
}

func setTokenCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "authon_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   60 * 60 * 24 * 30,
	})
}

func clearTokenCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:   "authon_token",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})
}
