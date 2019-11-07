package routes

import (
	"encoding/json"
	"net/http"
)

func JobStart(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(bookings)
}
