package util

import (
	"encoding/json"
	"fmt"
	"github.com/orbs-network/marvin/client/reporter"
	"github.com/pkg/errors"
	"io/ioutil"
	"net/http"
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

func ReadStatus(url string) (*reporter.Status, error) {

	response, err := http.Get(url)
	if err != nil {
		return nil, errors.Errorf("Failed to access %: %s", url, err)
	}
	defer response.Body.Close()

	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, errors.Errorf("Failed to read response from %: %s", url, err)
	}

	status := &reporter.Status{}

	err = json.Unmarshal(body, status)
	if err != nil {
		return nil, errors.Errorf("Failed to parse response from %: %s", url, err)
	}

	return status, nil
}
