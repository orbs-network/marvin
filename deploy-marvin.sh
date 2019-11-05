#!/bin/bash -e

runRemoteCommand(){
    ssh ubuntu@ec2-34-222-245-15.us-west-2.compute.amazonaws.com "cd marvin && $1"
}

runRemoteCommand "git pull && ./client-build.sh"
runRemoteCommand "cd orchestrator && npm install"
runRemoteCommand "cd job-executor && npm install"
runRemoteCommand "pm2 restart 0"

echo "Deployment of Marvin completed!"

exit 0