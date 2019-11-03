module.exports = {
    state: {
        job_id: '0',
        job_status: 'NOT_STARTED',
        pct_done: 0,
        should_stop: false,
        instance_counter: 0,
        accumulated_total_tx: 0,
        accumulated_error_tx: 0,
        live_clients: 0,
    },
    config: {
        port: 0,
        parent_port: 0,
    }
};