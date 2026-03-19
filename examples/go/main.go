package main

import (
	"html/template"
	"log"
	"net/http"
	"os"
	"time"

	authon "github.com/mikusnuz/authon-sdk/go"
)

var tmpl *template.Template

type pageData struct {
	User      *authon.User
	ProjectID string
	APIURL    string
}

func main() {
	var err error
	tmpl, err = template.ParseFiles("templates/index.html")
	if err != nil {
		log.Fatalf("failed to parse template: %v", err)
	}

	apiKey := os.Getenv("AUTHON_API_KEY")
	apiURL := os.Getenv("AUTHON_API_URL")

	var opts []authon.Option
	if apiURL != "" {
		opts = append(opts, authon.WithAPIURL(apiURL))
	}
	if apiURL == "" {
		apiURL = "https://api.authon.dev"
	}

	backend := authon.NewAuthonBackend(apiKey, opts...)

	projectID := os.Getenv("AUTHON_PROJECT_ID")
	webhookSecret := os.Getenv("AUTHON_WEBHOOK_SECRET")

	mux := http.NewServeMux()

	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		var user *authon.User
		cookie, err := r.Cookie("authon_token")
		if err == nil && cookie.Value != "" {
			u, err := backend.VerifyToken(r.Context(), cookie.Value)
			if err == nil {
				user = u
			} else {
				http.SetCookie(w, &http.Cookie{
					Name:    "authon_token",
					Value:   "",
					MaxAge:  -1,
					Path:    "/",
					Expires: time.Unix(0, 0),
				})
			}
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		if err := tmpl.Execute(w, pageData{User: user, ProjectID: projectID, APIURL: apiURL}); err != nil {
			http.Error(w, "template error", http.StatusInternalServerError)
		}
	})

	mux.HandleFunc("POST /auth/token", func(w http.ResponseWriter, r *http.Request) {
		type body struct {
			Token string `json:"token"`
		}
		var b body
		if err := decodeJSON(r, &b); err != nil || b.Token == "" {
			http.Error(w, `{"error":"missing token"}`, http.StatusBadRequest)
			return
		}
		http.SetCookie(w, &http.Cookie{
			Name:     "authon_token",
			Value:    b.Token,
			HttpOnly: true,
			Path:     "/",
			MaxAge:   3600,
		})
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"ok":true}`))
	})

	mux.HandleFunc("POST /auth/signout", func(w http.ResponseWriter, r *http.Request) {
		http.SetCookie(w, &http.Cookie{
			Name:    "authon_token",
			Value:   "",
			MaxAge:  -1,
			Path:    "/",
			Expires: time.Unix(0, 0),
		})
		http.Redirect(w, r, "/", http.StatusSeeOther)
	})

	mux.HandleFunc("POST /webhook", func(w http.ResponseWriter, r *http.Request) {
		body := readBody(r)
		sig := r.Header.Get("X-Authon-Signature")
		event, err := backend.Webhooks.Verify(body, sig, webhookSecret)
		if err != nil {
			http.Error(w, `{"error":"invalid signature"}`, http.StatusBadRequest)
			return
		}
		log.Printf("Webhook received: %v", event)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"ok":true}`))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Printf("Authon Go example running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
