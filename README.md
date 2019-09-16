# marvin

UNDER CONSTRUCTION

![The first ten million years were the worst, and the second ten million years, they were the worst too. The third ten million I didn't enjoy at all. After that I went into a bit of a decline.](https://upload.wikimedia.org/wikipedia/en/2/25/Marvin-TV-3.jpg)

Infrastructure that records and compares metrics between a new branch and the master branch. It does so by sending transactions to a virtual chain under test, recording the resulting metrics, scraping the logs, storing everything, and displaying visualizations in the hope someone will bother looking at them.

Named after [Marvin the Paranoid Android](https://en.wikipedia.org/wiki/Marvin_the_Paranoid_Android), tasked with taking care of everything.

# Architecture

## Testnet
TBD
Config for now: https://boyar-testnet-bootstrap.s3-us-west-2.amazonaws.com/boyar/config.json


## Prometheus
* Browse to http://localhost:9099/graph
> From inside docker, Prometheus is served on port 9090

## Grafana
* Browse to http://localhost:3000/
* Directly to dashboard: http://localhost:3000/d/yiCOQa5Wz/prometheus-2-0-stats?refresh=1m&orgId=1

## Client

See the [client guide](client/CLIENT.md)


## ELK

# Developer Notes

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
participant CircleCI
participant Stress-Client
participant TestNet
participant Prometheus
participant Grafana
participant Github
participant Slack


User->CircleCI: //Merge
aboxright over CircleCI: Run build & tests

CircleCI->Prometheus: Mark test start
CircleCI->Stress-Client: Run test
activate Stress-Client
Stress-Client->TestNet: Send TX
deactivate Stress-Client
CircleCI->Prometheus: Mark test end
Prometheus->Stress-Client: Pull results
box over Stress-Client: Process results

activate Stress-Client
deactivate Stress-Client

CircleCI->Github: Write results as Github comment / Grafana URL
User->Grafana: Browse for results
Github->Slack: Send Webook with results
```