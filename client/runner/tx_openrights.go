package runner

import (
	"fmt"
	"time"

	"github.com/orbs-network/marvin/client/keys"
	"github.com/orbs-network/marvin/client/reporter"
	"github.com/orbs-network/marvin/client/util"
	orbsClient "github.com/orbs-network/orbs-client-sdk-go/orbs"
	"github.com/pkg/errors"
)

func createPayloadOpenRights(client *orbsClient.OrbsClient) (rawTransaction []byte, err error) {
	tx, _, err := client.CreateTransaction(
		keys.OwnerOfAllSupply.PublicKey(),
		keys.OwnerOfAllSupply.PrivateKey(),
		"Registry",
		"registerMedia",
		string("2180312697546797164_14115607"),
		string("fffffff9fc11fffee7ffeff0fffd1ff80fe006f0002000010003000300038007"),
		string("Dima Dimitry"),
		string("1565026089"),
		string("https://some-image.com/vp/c763718f898c5f78979ef9f8ed19be9d/5DCD6B14/t51.2885-15/sh0.08/e35/s640x640/66615906_407924376495714_8082663129990530053_n.jpg?_nc_ht=scontent.cdninstagram.com"),
	)
	return tx, err
}

func TrySendSyncOpenRights(client *orbsClient.OrbsClient) (tx *reporter.ShortTransaction, err error) {
	util.Debug("Sending to URL: %s", client.Endpoint)
	startTxTime := time.Now()
	payload, err := createPayloadOpenRights(client)
	if err != nil {
		return nil, errors.New("Error creating transaction")
	}

	res, err := client.SendTransaction(payload)

	endTxTime := time.Now()
	return TransactionResult(endTxTime, startTxTime, err, res), err
}
