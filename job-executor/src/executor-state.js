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
        tpm: 0,
        all_results: [],
        summary: {
            total_dur: 0,
            total_tx_count: 0,
            err_tx_count: 0,
            max_service_time_ms: 0,
            avg_service_time_ms: 0,
        }
    }
    // config: {
    //     port: 0,
    //     parent_port: 0,
    // }
};