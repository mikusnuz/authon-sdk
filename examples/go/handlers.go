package main

import (
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	authon "github.com/mikusnuz/authon-sdk/go"
)

type templateData struct {
	User         *authon.User
	Error        string
	Success      string
	Flash        string
	Data         any
	PublishableKey string
}

func newData(r *http.Request) templateData {
	return templateData{
		User:           currentUser(r),
		PublishableKey: os.Getenv("AUTHON_PUBLISHABLE_KEY"),
	}
}

func render(w http.ResponseWriter, name string, data templateData) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := templates.ExecuteTemplate(w, name, data); err != nil {
		log.Printf("template %s error: %v", name, err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	d := newData(r)
	render(w, "home.html", d)
}

func signInHandler(w http.ResponseWriter, r *http.Request) {
	if currentUser(r) != nil {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
	d := newData(r)
	render(w, "sign-in.html", d)
}

func signUpHandler(w http.ResponseWriter, r *http.Request) {
	if currentUser(r) != nil {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
	d := newData(r)
	render(w, "sign-up.html", d)
}

func resetPasswordHandler(w http.ResponseWriter, r *http.Request) {
	d := newData(r)
	render(w, "reset-password.html", d)
}

func profileHandler(w http.ResponseWriter, r *http.Request) {
	d := newData(r)
	render(w, "profile.html", d)
}

func profileUpdateHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	d := newData(r)

	displayName := r.FormValue("displayName")
	avatarURL := r.FormValue("avatarUrl")
	phone := r.FormValue("phone")

	params := authon.UpdateUserParams{}
	if displayName != "" {
		params.FirstName = &displayName
	}
	if avatarURL != "" {
		params.Username = &avatarURL
	}
	if phone != "" {
		params.Phone = &phone
	}

	_, err := backend.Users.Update(r.Context(), d.User.ID, params)
	if err != nil {
		d.Error = err.Error()
		render(w, "profile.html", d)
		return
	}

	d.Success = "Profile updated successfully"
	render(w, "profile.html", d)
}

func mfaHandler(w http.ResponseWriter, r *http.Request) {
	d := newData(r)
	render(w, "mfa.html", d)
}

func sessionsHandler(w http.ResponseWriter, r *http.Request) {
	d := newData(r)
	render(w, "sessions.html", d)
}

func deleteAccountHandler(w http.ResponseWriter, r *http.Request) {
	d := newData(r)
	render(w, "delete-account.html", d)
}

func deleteAccountConfirmHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	confirmation := r.FormValue("confirm")
	if confirmation != "DELETE" {
		d := newData(r)
		d.Error = "Please type DELETE to confirm"
		render(w, "delete-account.html", d)
		return
	}

	user := currentUser(r)
	if err := backend.Users.Delete(r.Context(), user.ID); err != nil {
		d := newData(r)
		d.Error = err.Error()
		render(w, "delete-account.html", d)
		return
	}

	clearTokenCookie(w)
	http.Redirect(w, r, "/?deleted=1", http.StatusFound)
}

func signOutHandler(w http.ResponseWriter, r *http.Request) {
	clearTokenCookie(w)
	http.Redirect(w, r, "/", http.StatusFound)
}

func oauthCallbackHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	token := r.FormValue("token")
	if token == "" {
		http.Error(w, "Missing token", http.StatusBadRequest)
		return
	}

	_, err := backend.VerifyToken(r.Context(), token)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	setTokenCookie(w, token)
	w.WriteHeader(http.StatusOK)
}

func webhookHandler(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusBadRequest)
		return
	}

	signature := r.Header.Get("X-Authon-Signature")
	secret := os.Getenv("AUTHON_WEBHOOK_SECRET")

	if secret == "" {
		log.Printf("Webhook received (no secret configured): %s", truncate(string(body), 200))
		w.WriteHeader(http.StatusOK)
		return
	}

	event, err := backend.Webhooks.Verify(body, signature, secret)
	if err != nil {
		http.Error(w, "Invalid signature", http.StatusBadRequest)
		return
	}

	log.Printf("Webhook event at %s: %v", time.Now().Format(time.RFC3339), event)
	w.WriteHeader(http.StatusOK)
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}

func formatTime(t time.Time) string {
	if t.IsZero() {
		return "N/A"
	}
	return t.Format("Jan 2, 2006")
}

func initials(user *authon.User) string {
	if user == nil {
		return "?"
	}
	name := user.DisplayName
	if name == "" {
		name = user.FirstName + " " + user.LastName
		name = strings.TrimSpace(name)
	}
	if name == "" && user.Email != "" {
		return strings.ToUpper(string(user.Email[0]))
	}
	parts := strings.Fields(name)
	if len(parts) == 0 {
		return "?"
	}
	result := string(parts[0][0])
	if len(parts) > 1 {
		result += string(parts[len(parts)-1][0])
	}
	return strings.ToUpper(result)
}
