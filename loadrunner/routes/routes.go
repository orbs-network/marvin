package routes

import (
	"fmt"
	"net/http"
)

func HomePage(w http.ResponseWriter, r *http.Request) {
	_, err := fmt.Fprintf(w, "Welcome to HomePage!")
	if err != nil {
		fmt.Println("Error", err)
	}
	fmt.Println("This is homepage")
}

func StatusPage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"alive": true}`)
}

func JobsListPage(w http.ResponseWriter, r *http.Request) {
	ListJobs
	//jobs, err := readJobs()
	//
	//fmt.Fprintf(w, jobs.Unmarshall)
}

func JobStart(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusBadRequest)
	//json.NewEncoder(w).Encode(bookings)
}
