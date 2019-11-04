const execSync = require('child_process').execSync;
const {config} = require('./orchestrator-config');
const {info} = require('./util');

// Read a url from the environment variables
function notifySlack(message) {
    info(`Sending to Slack URL: ${config.slack_url}`);
    const baseCommand = `curl -s -X POST --data-urlencode "payload={\\"text\\": \\"${message}\\"}" ${config.slack_url}`;
    try {
        execSync(baseCommand);
    } catch(ex) {
        info(`Failed to notify Slack: ${ex}`);
    }
}

module.exports = {
    notifySlack: notifySlack,
};
