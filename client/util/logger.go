package util

import (
	"fmt"
	"time"
)

func Info(format string, a ...interface{}) {
	s := fmt.Sprintf(format, a...)
	fmt.Printf(fmt.Sprintf("%s %s\n", nowISO(), s))
}

func nowISO() string {
	// Full ISO8601 is "2006-01-02T15:04:05.000Z"
	return time.Now().Format("15:04:05.000Z ")
}
