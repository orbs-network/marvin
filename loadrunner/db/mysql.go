package db

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"log"
)

type DbHandler struct {
	Db *sql.DB
}

func CreateConnection() (*DbHandler, error) {
	db, err := sql.Open("mysql", "root:secret@/marvin")
	if err != nil {
		return nil, err
	}
	err = db.Ping()
	if err != nil {
		return nil, err
	}
	return &DbHandler{Db: db}, nil
}

func (h *DbHandler) ListJobs() (*sql.Rows, error) {
	stmtOut, err := h.Db.Prepare("SELECT * FROM jobs")

	rows, err := stmtOut.Query()
	if err != nil {
		return nil, err
	}

	log.Printf("Rows: %v\n", rows)
	return rows, nil
}
