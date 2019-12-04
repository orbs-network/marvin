package main

import (
	"github.com/gorilla/mux"
	mysql "github.com/orbs-network/marvin/db"
	"github.com/orbs-network/marvin/routes"
	"log"
	"net/http"
)

func main() {

	// Start REST listener
	handleRequests()
}

func handleRequests() {

	dbHandler, err := mysql.CreateConnection()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Starting development server at http://127.0.0.1:10000/")
	log.Printf("Connected to DB: %v\n", dbHandler.Db)
	log.Println("Quit the server with CONTROL-C.")
	// creates a new instance of a mux router
	myRouter := mux.NewRouter() //.StrictSlash(true)
	myRouter.HandleFunc("/", routes.HomePage)
	myRouter.HandleFunc("/status", routes.StatusPage)
	myRouter.HandleFunc("/jobs/start", routes.JobStart)
	myRouter.HandleFunc("/jobs/list", routes.JobsListPage)
	log.Fatal(http.ListenAndServe(":10000", myRouter))
}
