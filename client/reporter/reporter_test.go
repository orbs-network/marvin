package reporter

import (
	"github.com/orbs-network/marvin/client/util"
	"testing"
	"time"
)

func TestReporterToJson(t *testing.T) {

	report := &Report{
		Name:              "TEST",
		Error:             "",
		StartTime:         util.TimeToISO(time.Now().Add(-1 * time.Minute)),
		EndTime:           util.TimeToISO(time.Now()),
		TotalTransactions: 2,
		ErrorTransactions: 1,
		VChain:            1234,
		CommitHash:        "0a1b2c3d4e5f",
		SemanticVersion:   "v10.20.30",
		Transactions: []*Transaction{
			&Transaction{
				TxId:        []byte{1, 2, 3, 4},
				Result:      "COMMITTED",
				BlockHeight: 1,
			},
			&Transaction{
				TxId:        []byte{10, 20, 30, 40},
				Result:      "REJECTED_VIRTUAL_CHAIN_MISMATCH",
				BlockHeight: 2,
			},
		},
	}

	res, _ := report.ToJson()
	t.Logf("Result: %s", res)
}

/*

 */
