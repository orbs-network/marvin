package util

import "fmt"

func Info(format string, a ...interface{}) {
	fmt.Printf(format+"\n", a)
}
