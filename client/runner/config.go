package runner

import (
	"encoding/json"
	"fmt"
	"github.com/orbs-network/marvin/client/keys"
	"github.com/orbs-network/marvin/client/util"
	"io/ioutil"
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
	Chains         []*VirtualChain  `json:"chains"`
	ValidatorNodes []*ValidatorNode `json:"network"`
}

type runConfiguration struct {
	runTime time.Duration
	name    string
}

type VirtualChainId uint32

type VirtualChain struct {
	Id         VirtualChainId
	HttpPort   int
	GossipPort int
	Config     map[string]interface{}
}

type ValidatorNode struct {
	Address string `json:"address"`
	IP      string `json:"ip"`
	Active  bool   `json:"active,string"`
}

func CreateConfig(cfgPath string, runConfigStr string) *Config {

	netConfig, err := ReadFileConfig(cfgPath)
	if err != nil {
		panic(fmt.Sprintf("Failed parsing cfgPath=%s: %s", cfgPath, err))
	}

	runConfig, err := ParseRunConfig(runConfigStr)
	if err != nil {
		panic(fmt.Sprintf("Failed parsing runConfig=%s: %s", runConfigStr, err))
	}

	accounts := keys.ReadAccountsFromFile(keys.TestAccountsFilename)

	return &Config{
		netConfig: netConfig,
		runConfig: runConfig,
		Accounts:  accounts,
	}
}

func ReadFileConfig(configPath string) (*nodeConfiguration, error) {
	input, err := ioutil.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("could not read configuration from source: %s", err)
	}

	return parseStringConfig(string(input))
}

func parseStringConfig(input string) (*nodeConfiguration, error) {
	var value nodeConfiguration
	if err := json.Unmarshal([]byte(input), &value); err != nil {
		return nil, err
	}
	return &value, nil
}

func ParseRunConfig(s string) (*runConfiguration, error) {

	tokens := strings.Split(s, ",")
	if len(tokens) < 2 {
		util.Die("Error in command line: too few run config properties: %s", s)
	}

	runName := tokens[0]
	sec, err := strconv.Atoi(tokens[1])
	if err != nil {
		util.Die("Error in runtime param: %s", err)
	}

	return &runConfiguration{
		name:    runName,
		runTime: time.Duration(sec) * time.Second,
	}, nil

}
