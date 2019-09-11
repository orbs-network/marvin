package orbsclient

import (
	"github.com/orbs-network/orbs-client-sdk-go/codec"
	orbsClient "github.com/orbs-network/orbs-client-sdk-go/orbs"
)

const TestKeysFilename = "addresses.json"

func main() {
	run(Config())
}

func run(cfg *config) {

	SendTransaction()

}

func SendTransaction() (response *codec.SendTransactionResponse, err error) {

	client := orbsClient.NewClient("http://127.0.0.1:7050/vchains/1000", 1000, codec.NETWORK_TYPE_TEST_NET)
	addresses := readAddressesFromFile(TestKeysFilename)
	payload, _, _ := client.CreateTransaction(OwnerOfAllSupply.PublicKey(), OwnerOfAllSupply.PrivateKey(), "ResettableBenchmarkToken", "transfer", uint64(123), addresses[0])
	return client.SendTransaction(payload)
}
