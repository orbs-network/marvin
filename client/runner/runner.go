package runner

import (
	"context"
	"encoding/hex"
	"fmt"
	"github.com/orbs-network/marvin/client/reporter"
	"github.com/orbs-network/marvin/client/util"
	"github.com/orbs-network/orbs-client-sdk-go/codec"
	orbsClient "github.com/orbs-network/orbs-client-sdk-go/orbs"
	"github.com/pkg/errors"
	"math/rand"
	"time"
)

type Runner struct {
	Config *Config
}

func (runner *Runner) Execute() (*reporter.Report, error) {

	runConf := runner.Config.runConfig
	netConf := runner.Config.netConfig
	addresses := runner.Config.accounts

	runtimeCtx, _ := context.WithTimeout(context.Background(), runConf.runTime)

	ctrlRand := rand.New(rand.NewSource(0))

	vchain := netConf.Chains[0].Id
	firstIP := netConf.ValidatorNodes[0].IP

	url := fmt.Sprintf("http://%s/vchains/%d", firstIP, vchain)
	client := orbsClient.NewClient(url, uint32(vchain), codec.NETWORK_TYPE_TEST_NET)

	status, err := util.ReadStatus(url)
	if err != nil {
		return nil, errors.Errorf("Cannot read status from URL: %s", url)
	}

	report := &reporter.Report{
		Name:              runConf.name,
		Error:             "",
		StartTime:         util.TimeToISO(time.Now()),
		EndTime:           "",
		TotalTransactions: 0,
		ErrorTransactions: 0,
		VChain:            uint32(vchain),
		CommitHash:        status.Version.Commit,
		SemanticVersion:   status.Version.Semantic,
		Transactions:      nil,
	}

	var txs []*reporter.Transaction
	var tx *reporter.Transaction
	var errorTxs uint64

	for i := 0; i < 10; i++ {
		if runtimeCtx.Err() != nil {
			break
		}
		target := addresses[ctrlRand.Intn(len(addresses))]
		util.Debug("Sending to URL: %s to account %s", url, hex.EncodeToString(target))
		startTxTime := time.Now()
		res, err := TrySend(client, target)
		endTxTime := time.Now()
		txDuration := uint64(endTxTime.Sub(startTxTime) / time.Millisecond)
		if err == nil {
			util.Debug("Sent successfully: %s", res.TransactionStatus)

			tx = &reporter.Transaction{
				PApiUrl:     client.Endpoint,
				TxId:        res.TxHash,
				Result:      string(res.TransactionStatus),
				BlockHeight: res.BlockHeight,
				Duration:    txDuration,
			}
		} else {
			util.Debug("Error: %s", err)
			tx = &reporter.Transaction{
				TxId:        nil,
				Result:      err.Error(),
				BlockHeight: 0,
				Duration:    txDuration,
			}
			errorTxs++

		}
		txs = append(txs, tx)
	}
	report.EndTime = util.TimeToISO(time.Now())
	report.TotalTransactions = uint64(len(txs))
	report.ErrorTransactions = errorTxs
	//report.Transactions = txs

	// Send single transaction
	return report, nil
}
