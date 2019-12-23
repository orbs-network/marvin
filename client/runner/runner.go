package runner

import (
	"context"
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
	TargetUrl       string
}

func NewRunner(cfg *Config, ctrlRand *rand.Rand) *Runner {
	firstIP := cfg.netConfig.TargetIps[0]
	vchain := cfg.netConfig.Vchain
	url := fmt.Sprintf("http://%s/vchains/%d", firstIP, vchain)

	return &Runner{
		Config:          cfg,
		CtrlRand:        ctrlRand,
		TargetAddresses: cfg.Accounts,
		TargetUrl:       url,
	}
}

func (runner *Runner) NewClient() *orbsClient.OrbsClient {
	return orbsClient.NewClient(runner.TargetUrl, uint32(runner.Config.netConfig.Vchain), codec.NETWORK_TYPE_TEST_NET)
}

func (runner *Runner) Execute() (*reporter.Report, error) {

	runConf := runner.Config.runConfig
	util.Debug("Checking status of target IP %s ...", runner.TargetUrl)
	nodeStatus, err := reporter.ReadStatus(runner.TargetUrl)
	if err != nil {
		return nil, errors.Errorf("Cannot run test - failed to read node status from URL: %s", runner.TargetUrl)
	}

	report := runner.initReport(nodeStatus)

	runtimeCtx, _ := context.WithTimeout(context.Background(), runConf.runTime)
	runResult, err := runner.loop(runtimeCtx)
	if err != nil {
		return nil, err
	}
	report.Update(runResult)

	return report, nil
}

func (runner *Runner) loop(runtimeCtx context.Context) (runResult *reporter.RunResult, err error) {

	runResult = &reporter.RunResult{
		Txs:           []*reporter.ShortTransaction{},
		ErrorTxsCount: 0,
		SlowestTxMs:   0,
	}

	interval := time.Minute / time.Duration(runner.Config.runConfig.tpm)
	util.Debug("Interval between transactions: %s", interval)

	pacer := time.Tick(interval)
	txChan := make(chan *reporter.ShortTransaction, 100)

	go func(ctx context.Context) {
		util.Debug("TX listener goroutine start")
		for {
			select {
			case <-ctx.Done():
				util.Debug("TX listener goroutine end")
				return
			case tx := <-txChan:
				//util.Debug("TX listener read tx")
				runResult.Txs = append(runResult.Txs, tx)
				if runResult.SlowestTxMs < tx.Duration {
					runResult.SlowestTxMs = tx.Duration
				}
			}
		}
	}(runtimeCtx)

	for {
		if runtimeCtx.Err() != nil {
			break
		}
		go func(client *orbsClient.OrbsClient, target []byte) {
			//util.Debug("Goroutine start TrySendSync: client=%p", client)
			tx, err := TrySendSync(client, target)
			//util.Debug("Goroutine end TrySendSync: client=%p", client)
			if err != nil {
				runResult.ErrorTxsCount++
			}
			txChan <- tx
		}(runner.NewClient(), runner.randomAddress())
		<-pacer
	}
	return runResult, nil
}

func (runner *Runner) initReport(nodeStatus *reporter.Status) *reporter.Report {
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

func TransactionResult(endTxTime time.Time, startTxTime time.Time, err error, res *codec.SendTransactionResponse) *reporter.ShortTransaction {
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
	return runner.Config.netConfig.Vchain
}

func (runner *Runner) getOrbsClient(url string) *orbsClient.OrbsClient {
	return orbsClient.NewClient(url, uint32(runner.vchain()), codec.NETWORK_TYPE_TEST_NET)
}

func (runner *Runner) nodeUrl() string {
	firstIP := runner.Config.netConfig.TargetIps[0]
	return fmt.Sprintf("http://%s/vchains/%d", firstIP, runner.vchain())
}
