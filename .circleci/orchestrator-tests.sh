#!/bin/bash -e

source .circleci/install-node.sh
cd orchestrator && npm install && npm test