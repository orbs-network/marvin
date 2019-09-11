package orbsclient

import "time"

type config struct {
	runTime time.Duration
}

func Config() *config {
	return &config{
		runTime: 5 * time.Second,
	}
}
