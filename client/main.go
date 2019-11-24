package main

import (
	"fmt"
	"github.com/orbs-network/marvin/client/runner"
	"github.com/orbs-network/marvin/client/util"
	"math/rand"
	"os"
)

func main() {

	if len(os.Args) < 2 {
		fmt.Println("Usage: {vchain},{ip1[|ip2|...]} {run_name},{runtime_sec},{tx_per_minute}")
		fmt.Println("Example: 2013,35.167.243.123 TEST1,5,60")
		os.Exit(1)
	}

	argsWithoutProg := os.Args[1:]
	netConfigStr := argsWithoutProg[0]
	runConfigStr := argsWithoutProg[1]
	//testFlavor := argsWithoutProg[2]

	util.Debug("Net config: %s", netConfigStr)
	util.Debug("Run config: %s", runConfigStr)
	cfg := runner.CreateConfig(netConfigStr, runConfigStr)
	run(cfg)
}

func run(cfg *runner.Config) {

	r := runner.NewRunner(cfg, rand.New(rand.NewSource(0)))

	report, err := r.Execute()
	if err != nil {
		util.Info("Error: %s", err)
		os.Exit(1)
	}
	reportJson, _ := report.ToJson()
	fmt.Println(reportJson)
}
