# marvin

UNDER CONSTRUCTION

![The first ten million years were the worst, and the second ten million years, they were the worst too. The third ten million I didn't enjoy at all. After that I went into a bit of a decline.](https://upload.wikimedia.org/wikipedia/en/2/25/Marvin-TV-3.jpg)

Infrastructure that records and compares metrics between a new branch and the master branch. It does so by sending transactions to a virtual chain under test, recording the resulting metrics, scraping the logs, storing everything, and displaying visualizations in the hope someone will bother looking at them.

Named after [Marvin the Paranoid Android](https://en.wikipedia.org/wiki/Marvin_the_Paranoid_Android), tasked with taking care of everything.

# Architecture

## Testnet
TBD
Config for now: https://boyar-testnet-bootstrap.s3-us-west-2.amazonaws.com/boyar/config.json
Metrics are crawled by Prometheus from `/metric` endpoint.
> For example: http://35.167.243.123/vchains/2013/metrics 

## Accessing logs
Until an ELK is in place, the only way to view logs is to access the node's machine, into the docker container, then view the log file.
* Login with `ssh ubuntu@ec2-35-161-123-97.us-west-2.compute.amazonaws.com` (for example)
* Run: `sudo docker ps | grep 2013` - note the Container ID
* Log into the docker container: `sudo docker exec -it <container_id> bash`
* Run `vim` and/or `less`. If these are not installed, install them with: `apt-get update && apt-get install -y vim less`.
* 

### Debugging
See a [very comprehensive article](https://www.freecodecamp.org/news/how-i-investigated-memory-leaks-in-go-using-pprof-on-a-large-codebase-4bec4325e192/)

* AWS: Dump goroutines: `http://35.167.243.123/vchains/2013/debug/pprof/goroutine?debug=1`
* Show allocation tree:
  * Browse to `http://35.167.243.123/vchains/2013/debug/pprof/heap` - this will download a binary heap dump

* Dump heap file (local):
 * curl -sK -v http://localhost:7050/debug/pprof/heap > heap_local_01.out
 * pprof -http=:8080 heap_file - where `heap_file` is the binary heap dump

## Prometheus
This is the TSDB (Time-Series Database) that holds all metrics data. 
It is configured to crawl the `/metrics` endpoint of every node, every few seconds, and store the metrics data.
Therefore, there is no need for a separate process to push metrics into it.
* AWS: [Console](http://ec2-34-222-245-15.us-west-2.compute.amazonaws.com:9090/graph)
* Local: [Console](http://localhost:9099/graph)

## Grafana
This is the visualization app. It reads data from Prometheus and serves it in a visually pleasing form.
* AWS: [Detailed](http://ec2-34-222-245-15.us-west-2.compute.amazonaws.com:3000/d/Eqvddt3iz/detailed?refresh=10s&orgId=1&from=now-3h&to=now)
* [Local](http://localhost:3000/d/yiCOQa5Wz/prometheus-2-0-stats?refresh=1m&orgId=1)

## SQL
This database holds all transaction results.
* Use an app such as `Sequel Pro` to access the DB.
* Connection details in Sequel Pro: Enter the *SSH* tab and enter the connection details: 
    
    * MySQL Host: 127.0.0.1
    * User/pass: the DB's user/pass
    * Database: marvin
    * Port: 3306
    * SSH Host: ec2-34-222-245-15.us-west-2.compute.amazonaws.com (or your machine)
    * SSH User: ubuntu (or whatever applies to you)
    * SSH Password: empty
    * SSH Port: empty
    * Connect using SSL: unchecked
    
All transactions are in table `transactions`.    
    


## Client
* Runs transactions against the testnet, using [orbs-client-sdk-go](https://github.com/orbs-network/orbs-client-sdk-go)
* Suggested alias to add to shell startup:
> alias marvin="ssh ubuntu@ec2-34-222-245-15.us-west-2.compute.amazonaws.com" 
See the [client guide](client/CLIENT.md)

## Orchestrator
* Runs one or more instances of the Client, depending on the required load on the testnet.
* Reads output of the Client, inserts to SQL

## ELK
Based on https://github.com/deviantony/docker-elk


# Developer Notes

## Running testnet locally
To start the network, or restart an already running network, run:
> cd docker ; ./start-network

To stop the network, run:
> cd docker ; ./stop-network

## Updating deployed Client
* Login to marvin machine and run:
> cd marvin ; ./client-build.sh

## Updating deployed testnet
TBD

## Running Prometheus locally
See https://prometheus.io/docs/prometheus/latest/installation/
To start with a config file located at `/tmp/prometheus.yml`, use: 
>  docker run --network=host --mount source=prometheus,target=/etc/prometheus prom/prometheus

## Running Grafana
This project uses Orbs' Hosted Grafana solution which is also used by the production network.
It is configured with a built-in Prometheus instance that accepts data by [remote_write](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write).
Project [Kartoha](https://github.com/orbs-network/kartoha) can be used to generate the Prometheus `yml` config file.

## Running Prometheus on local machine


## Sequence diagram
Paste the following [here](sequencediagram.org):

```
title Testnet-master
actor User
participantgroup #lightgrey **CI**
participant CircleCI
participantgroup #lightblue **AWS**
participant Stress-Client
participant TestNet
participant Prometheus
participant SQL
participant Grafana
end
participant Github
end
participant Slack


activate Prometheus
User->CircleCI: //Merge code
aboxright over CircleCI: Run build & tests

CircleCI->Prometheus: Mark stress test start
CircleCI->Stress-Client: Run test
activate Stress-Client

Stress-Client->TestNet: Send TX
Prometheus-->TestNet: Pull TX results

deactivate Stress-Client
CircleCI->Prometheus: Mark stress test end
box over Stress-Client: Calculate results
Stress-Client->SQL: Insert to DB: aggregated results (maybe all TX)

Stress-Client->Github: Push as Github comment: aggregated results and/or Grafana URL
Stress-Client->Slack: Push as Slack webhook: aggregated results and/or Grafana URL
User->Grafana: View graphs
deactivate Prometheus
```