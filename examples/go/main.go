package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	authon "github.com/mikusnuz/authon-sdk/go"
)

var (
	backend   *authon.AuthonBackend
	templates *template.Template
)

func main() {
	apiKey := os.Getenv("AUTHON_API_KEY")
	if apiKey == "" {
		apiKey = "sk_test_placeholder"
	}

	apiURL := os.Getenv("AUTHON_API_URL")
	opts := []authon.Option{}
	if apiURL != "" {
		opts = append(opts, authon.WithAPIURL(apiURL))
	}

	backend = authon.NewAuthonBackend(apiKey, opts...)

	funcMap := template.FuncMap{
		"initials": initials,
		"formatTime": formatTime,
		"emailUsername": func(email string) string {
			if idx := strings.Index(email, "@"); idx > 0 {
				return email[:idx]
			}
			return email
		},
		"formatRelative": func(t time.Time) string {
			if t.IsZero() {
				return "N/A"
			}
			diff := time.Since(t)
			mins := int(diff.Minutes())
			if mins < 1 {
				return "Just now"
			}
			if mins < 60 {
				return fmt.Sprintf("%dm ago", mins)
			}
			hours := mins / 60
			if hours < 24 {
				return fmt.Sprintf("%dh ago", hours)
			}
			return fmt.Sprintf("%dd ago", hours/24)
		},
	}
	templates = template.Must(template.New("").Funcs(funcMap).ParseGlob("templates/*.html"))

	mux := http.NewServeMux()

	mux.Handle("GET /static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	mux.HandleFunc("GET /", homeHandler)
	mux.HandleFunc("GET /sign-in", signInHandler)
	mux.HandleFunc("GET /sign-up", signUpHandler)
	mux.HandleFunc("GET /reset-password", resetPasswordHandler)

	mux.Handle("GET /profile", authMiddleware(http.HandlerFunc(profileHandler)))
	mux.Handle("POST /profile", authMiddleware(http.HandlerFunc(profileUpdateHandler)))
	mux.Handle("GET /mfa", authMiddleware(http.HandlerFunc(mfaHandler)))
	mux.Handle("GET /sessions", authMiddleware(http.HandlerFunc(sessionsHandler)))
	mux.Handle("GET /delete-account", authMiddleware(http.HandlerFunc(deleteAccountHandler)))
	mux.Handle("POST /delete-account", authMiddleware(http.HandlerFunc(deleteAccountConfirmHandler)))

	mux.HandleFunc("POST /sign-out", signOutHandler)
	mux.HandleFunc("POST /webhook", webhookHandler)
	mux.HandleFunc("POST /oauth/callback", oauthCallbackHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
