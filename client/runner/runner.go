package runner

import (
	"fmt"
	"github.com/orbs-network/marvin/client/util"
	"github.com/orbs-network/orbs-client-sdk-go/codec"
	orbsClient "github.com/orbs-network/orbs-client-sdk-go/orbs"
)

type Runner struct {
	Config *Config
}

func (r *Runner) Execute() (response *codec.SendTransactionResponse, err error) {

	vchain := r.Config.netConfig.Chains[0].Id
	firstIP := r.Config.netConfig.ValidatorNodes[0].IP
	addresses := r.Config.addresses

	url := fmt.Sprintf("http://%s/vchains/%d", firstIP, vchain)
	client := orbsClient.NewClient(url, uint32(vchain), codec.NETWORK_TYPE_TEST_NET)

	// Send single transaction

	payload, err := createPayload(client, addresses[0])
	if err != nil {
		panic("Error creating transaction")
	}

	util.Info("Sending to URL: %s", url)
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
