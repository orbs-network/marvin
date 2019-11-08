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
	Config          *Config
	CtrlRand        *rand.Rand
	TargetAddresses [][]byte
}

func (runner *Runner) Execute() (*reporter.Report, error) {

	runConf := runner.Config.runConfig
	url := runner.nodeUrl()
	client := runner.getOrbsClient(url)
	nodeStatus, err := util.ReadStatus(url)
	if err != nil {
		return nil, errors.Errorf("Cannot read nodeStatus from URL: %s", url)
	}

	report := runner.createReport(nodeStatus)

	var txs []*reporter.ShortTransaction
	var errorTxs uint64
	var slowestTransactionMs uint64

	runtimeCtx, _ := context.WithTimeout(context.Background(), runConf.runTime)
	for i := 0; i < 10; i++ {
		if runtimeCtx.Err() != nil {
			break
		}
		util.Debug("Sending to URL: %s to account %s", client.Endpoint, hex.EncodeToString(runner.randomAddress()))
		startTxTime := time.Now()
		sendResult, err := TrySendSync(client, runner.randomAddress())
		endTxTime := time.Now()
		if err != nil {
			errorTxs++
		}
		tx := runner.transactionResult(endTxTime, startTxTime, err, sendResult)
		txs = append(txs, tx)
		if slowestTransactionMs < tx.Duration {
			slowestTransactionMs = tx.Duration
		}
	}
	runner.updateReport(report, txs, errorTxs, slowestTransactionMs)

	return report, nil
}

func (runner *Runner) createReport(nodeStatus *reporter.Status) *reporter.Report {
	return &reporter.Report{
		Name:              runner.Config.runConfig.name,
		Error:             "",
		StartTime:         util.TimeToISO(time.Now()),
		EndTime:           "",
		TotalTransactions: 0,
		ErrorTransactions: 0,
		VChain:            uint32(runner.vchain()),
		CommitHash:        nodeStatus.Version.Commit,
		SemanticVersion:   nodeStatus.Version.Semantic,
		Transactions:      nil,
	}
}

func (runner *Runner) updateReport(report *reporter.Report, txs []*reporter.ShortTransaction, errorTxs uint64, slowestTransactionMs uint64) {
	report.EndTime = util.TimeToISO(time.Now())
	report.TotalTransactions = uint64(len(txs))
	report.ErrorTransactions = errorTxs
	report.Transactions = txs
	report.SlowestTransactionMs = slowestTransactionMs
}

func (runner *Runner) transactionResult(endTxTime time.Time, startTxTime time.Time, err error, res *codec.SendTransactionResponse) *reporter.ShortTransaction {
	txDuration := uint64(endTxTime.Sub(startTxTime) / time.Millisecond)
	var tx *reporter.ShortTransaction
	if err == nil {
		util.Debug("Sent successfully: %s", res.TransactionStatus)

		tx = &reporter.ShortTransaction{
			//PApiUrl:     client.Endpoint,
			//TxId:        res.TxHash,
			Result:      string(res.TransactionStatus),
			BlockHeight: res.BlockHeight,
			Duration:    txDuration,
		}
	} else {
		util.Debug("Error: %s", err)
		tx = &reporter.ShortTransaction{
			Result:      err.Error(),
			BlockHeight: 0,
			Duration:    txDuration,
		}
	}
	return tx
}

func (runner *Runner) randomAddress() []byte {
	return runner.TargetAddresses[runner.CtrlRand.Intn(len(runner.TargetAddresses))]
}

func (runner *Runner) vchain() VirtualChainId {
	return runner.Config.netConfig.Chains[0].Id
}

func (runner *Runner) getOrbsClient(url string) *orbsClient.OrbsClient {
	return orbsClient.NewClient(url, uint32(runner.vchain()), codec.NETWORK_TYPE_TEST_NET)
}

func (runner *Runner) nodeUrl() string {
	firstIP := runner.Config.netConfig.ValidatorNodes[0].IP
	return fmt.Sprintf("http://%s/vchains/%d", firstIP, runner.vchain())
}
