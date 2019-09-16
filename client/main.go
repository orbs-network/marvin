package main

import (
	"fmt"
	"github.com/orbs-network/marvin/client/runner"
	"github.com/orbs-network/marvin/client/util"
	"os"
)

func main() {

	if len(os.Args) < 2 {
		fmt.Println("Usage: <net_config_path> <test_name> <runtime_sec>")
		fmt.Println("Example: config/testnet-aws.json HELLO|5")
		os.Exit(1)
	}

	argsWithoutProg := os.Args[1:]
	netConfigPath := argsWithoutProg[0]
	runConfigStr := argsWithoutProg[1]
	util.Debug("Start, reading config from %s", netConfigPath)
	run(runner.CreateConfig(netConfigPath, runConfigStr))
}

func run(cfg *runner.Config) {

	r := &runner.Runner{
		Config: cfg,
	}
	report, err := r.Execute()
	if err != nil {
		util.Info("Error: %s", err)
		os.Exit(1)
	}
	reportJson, _ := report.ToJson()
	fmt.Println(reportJson)
}
