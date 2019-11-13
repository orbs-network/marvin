package runner

import (
	"encoding/hex"
	"github.com/orbs-network/marvin/client/keys"
	"github.com/orbs-network/marvin/client/reporter"
	"github.com/orbs-network/marvin/client/util"
	orbsClient "github.com/orbs-network/orbs-client-sdk-go/orbs"
	"github.com/pkg/errors"
	"time"
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

func TrySendSync(client *orbsClient.OrbsClient, target []byte) (tx *reporter.ShortTransaction, err error) {
	util.Debug("Sending to URL: %s to account %s", client.Endpoint, hex.EncodeToString(target))
	startTxTime := time.Now()
	payload, err := createPayload(client, target)
	if err != nil {
		return nil, errors.New("Error creating transaction")
	}

	res, err := client.SendTransaction(payload)
	endTxTime := time.Now()
	return TransactionResult(endTxTime, startTxTime, err, res), err
}
