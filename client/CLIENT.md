# ORBS CLIENT

Back to [main](../README.md)

This client exercises a virtual chain, in a variety of scenarios.
The 2 most common scenarios are:

* `Stress test`: high-load over short timespan, designed to test the capacity limits of the virtual chain
* `Endurance test`: low-load over a long timespan, designed to test the stability of a virtual chain

## Installation
Login to the machine where you want to install, for example: 
> ssh ubuntu@ec2-34-222-245-15.us-west-2.compute.amazonaws.com

Run the commands:
> cd marvin ; ./client-build.sh

## Running

### Local client running against local testnet 

```sh
cd client
./client config/testnet-local.json HELLO,5
```

This will run the client with network config from `config/testnet-local.json` and runtime config of test name HELLO and total runtime of 5 seconds 
This will be a short run - to run continuously, run the Orchestrator instead.


## Design

The Orbs Client uses repo `orbs-client-sdk-go` for interacting with the virtual chain.

## Run scenarios

### Stress tests

Important: make sure the OS open-files limit is high enough. The default 256 on Mac 
does not support high TPS rate. Use `ulimit -n <somevalue>`. On mac, the max is 24576. 

TBD Configuration

### Endurance tests

TBD Configuration

