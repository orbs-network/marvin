#!/bin/bash -e

# Important note: trying to run the stress test locally? you will need to increase your max allowed sockets open / open files
# as shown in this stack overflow URL:
# https://stackoverflow.com/questions/7578594/how-to-increase-limits-on-sockets-on-osx-for-load-testing

echo "Cleaning up all containers, if any are running"
docker ps -a
echo "Cleaned the following containers:"
(docker ps -aq | xargs docker rm -fv) || echo "No containers to clean! Good!"

# Prepare persistent blocks for Docker network
rm -rf _tmp/blocks

# Clean log folders
rm -rf _logs

export REMOTE_ENV="true"

CONSENSUSALGO="leanhelix" docker-compose up -d

echo "Your testing network is up and running"
echo "It's API endpoints are:"
echo "***************************************"
echo "Node 1:"
echo "http://localhost:7050/api/v1/"
echo "http://localhost:7050/metrics"
echo ""
echo "Node 2:"
echo "http://localhost:7051/api/v1/"
echo "http://localhost:7051/metrics"
echo ""
echo "Node 3:"
echo "http://localhost:7052/api/v1/"
echo "http://localhost:7052/metrics"
echo ""
echo "Node 4:"
echo "http://localhost:7053/api/v1/"
echo "http://localhost:7053/metrics"

exit 0