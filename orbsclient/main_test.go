package orbsclient

import (
	"github.com/orbs-network/orbs-client-sdk-go/codec"
	orbsClient "github.com/orbs-network/orbs-client-sdk-go/orbs"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestCanCreateOrbsSdkClient(t *testing.T) {
	client := orbsClient.NewClient("http://127.0.0.1:7050/vchains/1000", 1000, codec.NETWORK_TYPE_TEST_NET)
	require.NotNil(t, client, "client is nil")
}

func TestSendTransaction(t *testing.T) {
	res, err := SendTransaction()
	require.NoError(t, err, "returned error")
	require.Equal(t, codec.TRANSACTION_STATUS_COMMITTED, res.TransactionStatus, "not committed")
}
