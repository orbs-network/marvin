const config = {
    slack_url: '',
    executor_host: '',
    executor_port: '',

};

const profiles = {
    stress: {
        tpm: 300,
        duration_sec: 300,
    },
    endurance: {
        tpm: 5,
        duration_sec: 3600,
    },
    test: {
        tpm: 60,
        duration_sec: 10,
    }
};

module.exports = {
    config: config,
    profiles: profiles,
};