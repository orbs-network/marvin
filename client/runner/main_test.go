package runner

import (
	"github.com/orbs-network/orbs-client-sdk-go/codec"
	orbsClient "github.com/orbs-network/orbs-client-sdk-go/orbs"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestCanCreateOrbsSdkClient(t *testing.T) {
	client := orbsClient.NewClient("http://localhost:7050", 42, codec.NETWORK_TYPE_TEST_NET)
	require.NotNil(t, client, "client is nil")
}

func TestSendTransaction(t *testing.T) {
	client := orbsClient.NewClient("http://localhost:7050", 42, codec.NETWORK_TYPE_TEST_NET)
	res, err := TrySendSync(client, []byte{1, 2, 3, 4})
	require.NoError(t, err, "returned error: %s", err)
	require.Equal(t, codec.TRANSACTION_STATUS_COMMITTED, res.TransactionStatus, "not committed - %s", res.TransactionStatus)
}
