package reporter

import (
	"encoding/json"
	"fmt"
)

type Transaction struct {
	TxId        []byte
	Result      string
	BlockHeight uint64
}

type Report struct {
	Name              string `json:"name"`
	Error             string
	StartTime         string
	EndTime           string
	TotalTransactions uint64
	ErrorTransactions uint64

	Transactions []*Transaction `json:"transactions"`
}

func (r *Report) ToJson() (string, error) {
	j, err := json.Marshal(r)
	if err != nil {
		return fmt.Sprintf("{'error': %s}", err), err
	}

	return string(j), nil
}
