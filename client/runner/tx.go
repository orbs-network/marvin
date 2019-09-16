package runner

import (
	"github.com/orbs-network/marvin/client/keys"
	"github.com/orbs-network/orbs-client-sdk-go/codec"
	orbsClient "github.com/orbs-network/orbs-client-sdk-go/orbs"
)

func createPayload(client *orbsClient.OrbsClient, targetAddress []byte) (rawTransaction []byte, err error) {
	tx, _, err := client.CreateTransaction(
		keys.OwnerOfAllSupply.PublicKey(),
		keys.OwnerOfAllSupply.PrivateKey(),
		"BenchmarkToken",
		"transfer",
		uint64(1),
		targetAddress,
	)
	return tx, err

}

func TrySend(client *orbsClient.OrbsClient, target []byte) (response *codec.SendTransactionResponse, err error) {
	payload, err := createPayload(client, target)
	if err != nil {
		panic("Error creating transaction")
	}

	return client.SendTransaction(payload)

}
