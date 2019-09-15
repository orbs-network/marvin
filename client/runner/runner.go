package runner

import (
	"encoding/hex"
	"fmt"
	"github.com/orbs-network/marvin/client/util"
	"github.com/orbs-network/orbs-client-sdk-go/codec"
	orbsClient "github.com/orbs-network/orbs-client-sdk-go/orbs"
	"math/rand"
)

type Runner struct {
	Config *Config
}

func (r *Runner) Execute() error {

	ctrlRand := rand.New(rand.NewSource(0))
	vchain := r.Config.netConfig.Chains[0].Id
	firstIP := r.Config.netConfig.ValidatorNodes[0].IP
	addresses := r.Config.addresses

	url := fmt.Sprintf("http://%s/vchains/%d", firstIP, vchain)
	client := orbsClient.NewClient(url, uint32(vchain), codec.NETWORK_TYPE_TEST_NET)

	for i := 0; i < 10; i++ {
		target := addresses[ctrlRand.Intn(len(addresses))]
		util.Info("Sending to URL: %s to account %s", url, hex.EncodeToString(target))
		res, err := trySendToRandomAddress(client, target)
		if err == nil {
			util.Info("Sent successfully: %s", res.TransactionStatus)
		} else {
			util.Info("Error: %s", err)
		}
	}

	// Send single transaction
	return nil
}

func trySendToRandomAddress(client *orbsClient.OrbsClient, target []byte) (response *codec.SendTransactionResponse, err error) {
	payload, err := createPayload(client, target)
	if err != nil {
		panic("Error creating transaction")
	}

	return client.SendTransaction(payload)

}

func createPayload(client *orbsClient.OrbsClient, targetAddress []byte) (rawTransaction []byte, err error) {
	tx, _, err := client.CreateTransaction(
		util.OwnerOfAllSupply.PublicKey(),
		util.OwnerOfAllSupply.PrivateKey(),
		"BenchmarkToken",
		"transfer",
		uint64(1),
		targetAddress,
	)
	return tx, err

}
