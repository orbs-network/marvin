package reporter

import (
	"encoding/json"
	"fmt"
	"github.com/orbs-network/marvin/client/util"
	"github.com/pkg/errors"
	"io/ioutil"
	"net/http"
	"time"
)

type Transaction struct {
	TxId        []byte `json:"txId"`
	Result      string `json:"txResult"`
	BlockHeight uint64 `json:"blockHeight"`
	Duration    uint64 `json:"durationMillis"`
	PApiUrl     string `json:"papiUrl"`
}

type ShortTransaction struct {
	Result      string `json:"res"`
	BlockHeight uint64 `json:"h"`
	Duration    uint64 `json:"dur"`
}

type version struct {
	Semantic string `json:"Semantic"`
	Commit   string `json:"Commit"`
}

type Status struct {
	Status  string  `json:"Status"`
	Version version `json:"Version"`
}

type TxResultType struct {
	TxResult      string `json:"TxResult"`
	TxResultCount uint64 `json:"TxResultCount"`
}

type RunResult struct {
	Txs           []*ShortTransaction
	ErrorTxsCount uint64
	SlowestTxMs   uint64
	TxResultTypes map[string]uint64
}

type Report struct {
	Name              string            `json:"name"`
	Error             string            `json:"error"`
	StartTime         string            `json:"startTime"`
	EndTime           string            `json:"endTime"`
	TotalTransactions uint64            `json:"totalTransactions"`
	ErrorTransactions uint64            `json:"errorTransactions"`
	VChain            uint32            `json:"vchain"`
	TxResultTypes     map[string]uint64 `json:"txResultTypes"`
	TxDurations       []uint64          `json:"txDurations"`
	//TxResultTypes        []*TxResultType `json:"txResultTypes"`
	CommitHash           string `json:"commitHash"`
	SemanticVersion      string `json:"semanticVersion"`
	SlowestTransactionMs uint64 `json:"slowestTransactionMs"`

	Transactions []*ShortTransaction `json:"transactions"`
}

func (r *Report) ToJson() (string, error) {
	j, err := json.Marshal(r)
	if err != nil {
		return fmt.Sprintf("{'error': %s}", err), err
	}

	return string(j), nil
}

func (r *Report) Update(runResult *RunResult) {
	r.EndTime = util.TimeToISO(time.Now())
	r.TotalTransactions = uint64(len(runResult.Txs))
	r.ErrorTransactions = runResult.ErrorTxsCount
	r.TxResultTypes = runResult.TxResultTypes
	//r.TxResultTypes = []*TxResultType{}
	//for k, v := range runResult.TxResultTypes {
	//	r.TxResultTypes = append(r.TxResultTypes, &TxResultType{
	//		TxResult:      k,
	//		TxResultCount: v,
	//	})
	//}
	//sort.Slice(r.TxResultTypes[:], func(i, j int) bool {
	//	return r.TxResultTypes[i].TxResultCount > r.TxResultTypes[j].TxResultCount
	//})
	r.Transactions = nil // Revert this to print all transactions
	//r.Transactions = runResult.Txs
	txDurations := make([]uint64, len(runResult.Txs))
	for i, tx := range runResult.Txs {
		txDurations[i] = tx.Duration
	}
	r.TxDurations = txDurations
	r.SlowestTransactionMs = runResult.SlowestTxMs

}

func ReadStatus(url string) (*Status, error) {

	response, err := http.Get(url)
	if err != nil {
		return nil, errors.Errorf("Failed to access URL %s: %s", url, err)
	}
	defer response.Body.Close()

	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, errors.Errorf("Failed to read response from URL %s: %s", url, err)
	}

	status := &Status{}

	err = json.Unmarshal(body, status)
	if err != nil {
		return nil, errors.Errorf("Failed to parse response from URL %s: %s", url, err)
	}

	return status, nil
}
