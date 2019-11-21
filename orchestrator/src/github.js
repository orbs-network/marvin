const rp = require('request-promise-native');

async function getCommitFromMetricsURL(uri) {
    const options = {
        method: 'GET',
        uri,
        json: true,
    };

    try {
        const metrics = await rp(options);
        return metrics['Version.Commit'].Value;
    } catch (err) {
        return err;
    }
}

async function getCommiterUsernameByCommitHash(commitHash) {
    const uri = `https://api.github.com/repos/orbs-network/orbs-network-go/commits/${commitHash}`;

    const options = {
        uri,
        headers: { 'User-Agent': 'Request-Promise' },
        json: true,
    };

    try {
        const result = await rp(options);
        return result.author.login;
    } catch (err) {
        return err;
    }
}

function getSlackUsernameForGithubUser(githubLoginHandle) {
    const githubToSlack = {
        'noambergIL': 'UBJ7KDUTG',
        'itamararjuan': 'UC41FJ8LX',
        'IdoZilberberg': 'UAFNVB3PS',
        'amir-arad': 'UPAKXMAAF',
        'electricmonk': 'U94KTLRSR',
        'ronno': 'UB0RYKSFP',
        'vistra': 'UNM6TTUUT',
        'talkol': 'UBW4D5L22',
        'owlen': 'UMDKJ8JCQ',
        'OrLavy': 'UNFC532B1',
        'OdedWx': 'U9KP5DQV9',
        'netoneko': 'U9594T135',
        'jlevison': 'U9VJ8BA2F',
        'gilamran': 'UAGNTRH4K',
        'bolshchikov': 'UFJ8S9G0K',
        'andr444': 'UCX7XHX1A'
    };

    return githubToSlack[githubLoginHandle];
}

module.exports = {
    getCommitFromMetricsURL,
    getCommiterUsernameByCommitHash,
    getSlackUsernameForGithubUser,
};