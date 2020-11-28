package main

import (
	"crypto/sha256"
	"crypto/subtle"
	"net/http"
)

var userhash []byte = hasher(getEnv("GRAPH_UI_USER", "admin"))
var passhash []byte = hasher(getEnv("GRAPH_UI_PW", "password"))
var realm string = "Please enter username and password"

func hasher(s string) []byte {
	val := sha256.Sum256([]byte(s))
	return val[:]
}

func auth(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, pass, ok := r.BasicAuth()
		if !ok || subtle.ConstantTimeCompare(hasher(user),
			userhash) != 1 || subtle.ConstantTimeCompare(hasher(pass), passhash) != 1 {
			w.Header().Set("WWW-Authenticate", `Basic realm="`+realm+`"`)
			http.Error(w, "Unauthorized.", http.StatusUnauthorized)
			return
		}
		// w.Header().Set("Access-Control-Allow-Origin", `*`)
		// w.Header().Set("Access-Control-Allow-Headers", `*`)
		handler(w, r)
	}
}
