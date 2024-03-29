package util

import (
	"fmt"
	"os"
	"time"
)

func Info(format string, a ...interface{}) {
	s := fmt.Sprintf(format, a...)
	fmt.Printf(fmt.Sprintf("[INFO]  %s %s\n", nowISO(), s))
}

func Debug(format string, a ...interface{}) {
	isDebug := os.Getenv("VERBOSE") == "true"
	if !isDebug {
		return
	}
	s := fmt.Sprintf(format, a...)
	fmt.Printf(fmt.Sprintf("[DEBUG] %s %s\n", nowISO(), s))
}

func nowISO() string {
	// Full ISO8601 is "2006-01-02T15:04:05.000Z"
	return time.Now().Format("15:04:05.000Z ")
}
