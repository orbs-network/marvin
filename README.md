# marvin

UNDER CONSTRUCTION

![The first ten million years were the worst, and the second ten million years, they were the worst too. The third ten million I didn't enjoy at all. After that I went into a bit of a decline.](https://upload.wikimedia.org/wikipedia/en/2/25/Marvin-TV-3.jpg)

Infrastructure that records and compares metrics between a new branch and the master branch. It does so by sending transactions to a virtual chain under test, recording the resulting metrics, scraping the logs, storing everything, and displaying visualizations in the hope someone will bother looking at them.

Named after [Marvin the Paranoid Android](https://en.wikipedia.org/wiki/Marvin_the_Paranoid_Android), tasked with taking care of everything.

# Architecture

## Testnet
Config for now: https://boyar-testnet-bootstrap.s3-us-west-2.amazonaws.com/boyar/config.json
Metrics are crawled by Prometheus from `/metric` endpoint.
> For example: http://52.204.239.242/vchains/2013/metrics 

## Accessing logs
Until an ELK is in place, the only way to view logs is to access the node's machine, into the docker container, then view the log file.
* Login with `ssh ubuntu@ec2-35-161-123-97.us-west-2.compute.amazonaws.com` (for example)
* Run: `sudo docker ps | grep 2013` - note the Container ID
* Log into the docker container: `sudo docker exec -it <container_id> bash`
* Run `vim` and/or `less`. If these are not installed, install them with: `apt-get update && apt-get install -y vim less`.
* 

### Debugging
See a [very comprehensive article](https://www.freecodecamp.org/news/how-i-investigated-memory-leaks-in-go-using-pprof-on-a-large-codebase-4bec4325e192/)

* AWS: Dump goroutines: `http://52.204.239.242/vchains/2013/debug/pprof/goroutine?debug=1`
* Show allocation tree:
  * Browse to `http://52.204.239.242/vchains/2013/debug/pprof/heap` - this will download a binary heap dump

* Dump heap file (local):
 * curl -sK -v http://localhost:7050/debug/pprof/heap > heap_local_01.out
 * pprof -http=:8080 heap_file - where `heap_file` is the binary heap dump

## Prometheus
`Part of docker compose`

This is the TSDB (Time-Series Database) that holds all metrics data. 
It is configured to crawl the `/metrics` endpoint of every node, every few seconds, and store the metrics data.
Therefore, there is no need for a separate process to push metrics into it.
* AWS: [Console](http://ec2-34-222-245-15.us-west-2.compute.amazonaws.com:9090/graph)
* Local: [Console](http://localhost:9099/graph)

## Grafana
`Part of docker compose`

This is the visualization app. It reads data from Prometheus and serves it in a visually pleasing form.
* AWS: [Detailed](http://ec2-34-222-245-15.us-west-2.compute.amazonaws.com:3000/d/Eqvddt3iz/detailed?refresh=10s&orgId=1&from=now-3h&to=now)
* [Local](http://localhost:3000/d/yiCOQa5Wz/prometheus-2-0-stats?refresh=1m&orgId=1)

## SQL
`Part of docker compose`

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
    
 > Changing any DB property (such as user / password / DB name) in docker-compose requires restarting docker with `./start-network.sh`
 
 > It takes time (30s on a Mac) to initialize the DB, after running `./start-network.sh`

We use [knex](http://knexjs.org/) library to communicate with the DB.
Regular connection:
```
const knex = require('knex')({
    client: 'mysql2',
    version: '5.7',
    connection: {
        host: '127.0.0.1',
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'marvin'
    },
    pool: {min: 0}
});

```

Connection with SSH:
```

```


## Client

* Runs transactions against the testnet, using [orbs-client-sdk-go](https://github.com/orbs-network/orbs-client-sdk-go)
* Suggested alias to add to shell startup:
> alias marvin="ssh ubuntu@ec2-34-222-245-15.us-west-2.compute.amazonaws.com" 
See the [client guide](client/CLIENT.md)

## Orchestrator
* Runs one or more instances of the Client, depending on the required load on the testnet.
* Reads output of the Client, inserts to SQL
* VERBOSE=true MYSQL_USER=<...> MYSQL_PASSWORD=<...> node index.js
## ELK
Based on https://github.com/deviantony/docker-elk
* To configure Orbs to send logs to ELK, add the following property to Boyar config:
> "logger-http-endpoint": "https://listener.logz.io:8071/?token=<some_token>&type=prod"

# Developer Notes

## Running Marvin locally
Marvin consists of Prometheus, Grafana, MySQL.
It is all part of a docker-compose, so it can be run locally as follows:

`cd docker && docker-compose up -d`

You can then run the Orchestrator locally, and interact with it using REST API calls 
(using Postman, for example).

 


## Running testnet locally

* To rebuild Orbs, clone the [repo](https://github.com/orbs-network/orbs-network-go/), then from its root directory, run:
> docker/build/build.sh

This will rebuild the Docker images from local code.

* To start the network, or restart an already running network, run:
> cd docker ; ./start-network

* To stop the network, run:
> cd docker ; ./stop-network

## Requesting the Marvin deployment to start a test:
Replace the machine below with the actual Marvin deployment
```
URI="ec2-34-222-245-15.us-west-2.compute.amazonaws.com:4567/jobs/start"
curl -d '{"tpm":10, "duration_sec":300}' -H "Content-Type: application/json" -X POST ${URI}
```
 
## Updating local client
On local machine:
> cd <marvin_home> ; ./client-build.sh


## Updating deployed Marvin
On local machine:
> cd <marvin_home> ; ./deploy-marvin.sh
* Login to `marvin` machine and run:
> cd marvin ; ./client-build.sh
> 

## Restarting deployed testnet
* Login to marvin machine and run:
TBD

## Running Prometheus locally
See https://prometheus.io/docs/prometheus/latest/installation/
To start with a config file located at `/tmp/prometheus.yml`, use: 
>  docker run --network=host --mount source=prometheus,target=/etc/prometheus prom/prometheus

### Querying Prometheus via HTTP API
See https://prometheus.io/docs/prometheus/latest/querying/api/#http-api

Job Executor uses HTTP API to extract data from Prometheus.
* Examples:

`http://ec2-34-222-245-15.us-west-2.compute.amazonaws.com:9090/api/v1/query?query=BlockStorage_BlockHeight`
`http://ec2-34-222-245-15.us-west-2.compute.amazonaws.com:9090/api/v1/query_range?query=BlockStorage_BlockHeight&start=2019-11-13T22:59:00Z&end=2019-11-13T23:00:00Z&step=15s`
`http://ec2-34-222-245-15.us-west-2.compute.amazonaws.com:9090/api/v1/query_range?query=Runtime_HeapAlloc_Bytes{vcid=%223015%22,machine=%22node1%22}&start=2019-11-13T20:59:00Z&end=2019-11-13T21:00:00Z&step=15s`
`http://ec2-34-222-245-15.us-west-2.compute.amazonaws.com:9090/api/v1/query_range?query=rate(TransactionPool_TotalCommits_Count{vcid=%223015%22,machine=%22node1%22}[1m])&start=2019-11-13T20:59:00Z&end=2019-11-13T21:00:00Z&step=10s`

then read from the resulting JSON:
> data.result[0].metric.__name__
> data.result[0].metric.values - array of 2-element arrays. So for example, calc max() over  `values[0][1], values[1][1], values[2][1]`, etc.
## Running Grafana
This project uses Orbs' Hosted Grafana solution which is also used by the production network.
It is configured with a built-in Prometheus instance that accepts data by [remote_write](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write).
Project [Kartoha](https://github.com/orbs-network/kartoha) can be used to generate the Prometheus `yml` config file.


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