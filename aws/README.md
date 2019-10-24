# TESTNET-MASTER on AWS

This folder contains configuration for working with the `testnet-master`.
The IPs can be found in `prometheus/prometheus.yml`.

We don't have a start/stop script for this yet, so if docker-compose.yml is modified, you need to manually restart docker-compose:
* Stop the Prometheus DB: `docker-compose stop tsdb`
* Remove Prometheus container: `docker rm -fv b6d16b61c1eb` (where the id can be found with `docker ps -a`)
* Delete the contents of the Prometheus volume: `cd ~/prom-storage; sudo rm -rf *` (CAREFUL with that)
* Start the Prometheus DB: `docker-compose up -d`

