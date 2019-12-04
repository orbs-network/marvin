package app

import (
	"database/sql"
	"net/http"
)

// See https://medium.com/statuscode/how-i-write-go-http-services-after-seven-years-37c208122831

type server struct {
	db     *sql.DB
	router *someRouter
	email  EmailSender
}

func (s *server) routes() {
	s.router.HandleFunc("/status/", s.handleStatus())
	s.router.HandleFunc("/about", s.handleAbout())
	s.router.HandleFunc("/jobs/list", s.handleJobsList())
	s.router.HandleFunc("/", s.handleIndex())
}

func (s *server) handleStatus() http.HandlerFunc {
	thing := prepareStatus()
	return func(w http.ResponseWriter, r *http.Request) {
		// use thing
	}
}

func (s *server) handleJobsList() http.HandlerFunc {
	thing := prepareStatus()
	return func(w http.ResponseWriter, r *http.Request) {
		// use thing
	}
}

func (s *server) handleAbout() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// use thing
	}

}

/*
func (s *server) adminOnly(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !currentUser(r).IsAdmin {
			http.NotFound(w, r)
			return
		}
		h(w, r)
	}
}
*/
