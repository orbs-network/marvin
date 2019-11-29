package runner

import (
	"encoding/json"
	"fmt"
	"github.com/orbs-network/marvin/client/keys"
	"github.com/orbs-network/marvin/client/util"
	"github.com/pkg/errors"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	netConfig *nodeConfiguration
	runConfig *runConfiguration
	Accounts  [][]byte
}

type nodeConfiguration struct {
	Vchain    VirtualChainId
	TargetIps []string
}

type runConfiguration struct {
	runTime time.Duration
	name    string
	tpm     int
}

type VirtualChainId uint32

type ValidatorNode struct {
	Address string `json:"address"`
	IP      string `json:"ip"`
	Active  bool   `json:"active,string"`
}

func CreateConfig(netConfigStr string, runConfigStr string) *Config {

	netConfig, err := ParseNetConfig(netConfigStr)
	if err != nil {
		panic(fmt.Sprintf("Failed to parse net config=%s: %s", netConfigStr, err))
	}

	runConfig, err := ParseRunConfig(runConfigStr)
	if err != nil {
		panic(fmt.Sprintf("Failed to parse run config=%s: %s", runConfigStr, err))
	}

	accounts := keys.ReadAccountsFromFile(keys.TestAccountsFilename)

	return &Config{
		netConfig: netConfig,
		runConfig: runConfig,
		Accounts:  accounts,
	}
}

func parseStringConfig(input string) (*nodeConfiguration, error) {
	var value nodeConfiguration
	if err := json.Unmarshal([]byte(input), &value); err != nil {
		return nil, err
	}
	return &value, nil
}

func ParseNetConfig(s string) (*nodeConfiguration, error) {
	tokens := strings.Split(s, ",")
	if len(tokens) < 2 {
		return nil, errors.Errorf("too few net config properties: %s", s)
	}
	vchain, err := strconv.Atoi(tokens[0])
	if err != nil {
		return nil, errors.Errorf("VChain %s is not a number", tokens[0])
	}
	ipsStr := tokens[1]
	ips := strings.Split(ipsStr, "|")
	if len(ips) < 1 {
		return nil, errors.New("no target IPs specified")
	}

	return &nodeConfiguration{
		Vchain:    VirtualChainId(vchain),
		TargetIps: ips,
	}, nil
}

func ParseRunConfig(s string) (*runConfiguration, error) {

	tokens := strings.Split(s, ",")
	if len(tokens) < 3 {
		util.Die("Error in command line: too few run config properties: %s", s)
	}

	runName := tokens[0]
	runtimeSec, err := strconv.Atoi(tokens[1])
	tpm, err := strconv.Atoi(tokens[2])
	if err != nil {
		util.Die("Error in runtime param: %s", err)
	}

	if len(runName) == 0 || runtimeSec <= 0 || tpm <= 0 {
		util.Die("runName is empty or runtimeSec is non-positive or tpm is non-positive")
	}

	return &runConfiguration{
		name:    runName,
		runTime: time.Duration(runtimeSec) * time.Second,
		tpm:     tpm,
	}, nil

}
