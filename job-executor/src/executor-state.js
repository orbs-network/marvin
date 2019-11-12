module.exports = {
    state: {
        job_id: '0',
        vchain: '',
        job_status: 'NOT_STARTED',
        job_runtime_millis: 0,
        duration_sec: 0,
        pct_done: 0,
        should_stop: false,
        instance_counter: 0,
        accumulated_total_tx: 0,
        accumulated_error_tx: 0,
        live_clients: 0,
        tpm: 0,
        start_time: 0,

        summary: {
            total_dur: 0,
            total_tx_count: 0,
            err_tx_count: 0,
            max_service_time_ms: 0,
            avg_service_time_ms: 0,
            median_service_time_ms: 0,
            p90_service_time_ms: 0,
            p95_service_time_ms: 0,
            p99_service_time_ms: 0,
        }
    },
    all_tx: {
        tx_durations: [],
        hdr: null,
    }
    // config: {
    //     port: 0,
    //     parent_port: 0,
    // }
};