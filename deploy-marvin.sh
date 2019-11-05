#!/bin/bash -e

LOAD_NVM="export NVM_DIR=\"$HOME/.nvm\" && [ -s \"$NVM_DIR/nvm.sh\" ] && \. \"$NVM_DIR/nvm.sh\" && nvm use v10.16.3"

runRemoteCommand(){
    ssh ubuntu@ec2-34-222-245-15.us-west-2.compute.amazonaws.com "cd marvin && $1"
}

#runRemoteCommand "git pull && ./client-build.sh"
runRemoteCommand ""
#runRemoteCommand "$LOAD_NVM && cd orchestrator && npm install"
#runRemoteCommand "$LOAD_NVM && cd job-executor && npm install"
#runRemoteCommand "pm2 restart 0"

echo "Deployment of Marvin completed!"

exit 0