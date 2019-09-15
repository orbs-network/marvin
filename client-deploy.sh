#!/bin/bash -e

docker-compose -f aws/leanhelix-endurance/client/docker-compose.yml down
docker-compose -f aws/leanhelix-endurance/client/docker-compose.yml up -d

echo "Client has been deployed!"