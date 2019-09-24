package reporter

import (
	"encoding/json"
	"fmt"
)

type Transaction struct {
	TxId        []byte `json:"txId"`
	Result      string `json:"txResult"`
	BlockHeight uint64 `json:"blockHeight"`
	Duration    uint64 `json:"durationMillis"`
	PApiUrl     string `json:"papiUrl"`
}

type version struct {
	Semantic string `json:"Semantic"`
	Commit   string `json:"Commit"`
}

type Status struct {
	Status  string  `json:"Status"`
	Version version `json:"Version"`
}

type Report struct {
	Name              string `json:"name"`
	Error             string `json:"error"`
	StartTime         string `json:"startTime"`
	EndTime           string `json:"endTime"`
	TotalTransactions uint64 `json:"totalTransactions"`
	ErrorTransactions uint64 `json:"errorTransactions"`
	VChain            uint32 `json:"vchain"`
	CommitHash        string `json:"commitHash"`
	SemanticVersion   string `json:"semanticVersion"`

	Transactions []*Transaction `json:"transactions"`
}

func (r *Report) ToJson() (string, error) {
	j, err := json.Marshal(r)
	if err != nil {
		return fmt.Sprintf("{'error': %s}", err), err
	}

	return string(j), nil
}
