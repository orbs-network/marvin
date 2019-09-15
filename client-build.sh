#!/bin/bash -e

git pull
docker build -t endurance:client -f aws/leanhelix-endurance/images/client/Dockerfile .

echo "The client has been built successfully!"