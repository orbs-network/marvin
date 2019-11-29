package util

import (
	"fmt"
	"os"
	"time"
)

func Die(format string, args ...interface{}) {
	fmt.Fprintf(os.Stderr, "ERROR:\n  ")
	fmt.Fprintf(os.Stderr, format, args...)
	fmt.Fprintf(os.Stderr, "\n\n")
	os.Exit(2)
}

func DoesFileExist(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}

func TimeToISO(t time.Time) string {
	return t.Format("2006-01-02T15:04:05.000Z")
}
