package runner

import (
	"context"
	"encoding/hex"
	"fmt"
	"github.com/orbs-network/marvin/client/reporter"
	"github.com/orbs-network/marvin/client/util"
	"github.com/orbs-network/orbs-client-sdk-go/codec"
	orbsClient "github.com/orbs-network/orbs-client-sdk-go/orbs"
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

	report := &reporter.Report{
		Name:              "STRESS",
		Error:             "",
		StartTime:         util.TimeToISO(time.Now()),
		EndTime:           "",
		TotalTransactions: 0,
		ErrorTransactions: 0,
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
		util.Info("Sending to URL: %s to account %s", url, hex.EncodeToString(target))
		res, err := TrySend(client, target)
		if err == nil {
			util.Info("Sent successfully: %s", res.TransactionStatus)
			tx = &reporter.Transaction{
				TxId:        res.TxHash,
				Result:      string(res.TransactionStatus),
				BlockHeight: res.BlockHeight,
			}
		} else {
			util.Info("Error: %s", err)
			tx = &reporter.Transaction{
				TxId:        nil,
				Result:      err.Error(),
				BlockHeight: 0,
			}
			errorTxs++

		}
		txs = append(txs, tx)
	}
	report.EndTime = util.TimeToISO(time.Now())
	report.TotalTransactions = uint64(len(txs))
	report.ErrorTransactions = errorTxs
	report.Transactions = txs

	// Send single transaction
	return report, nil
}
