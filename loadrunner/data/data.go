package data

type Job struct {
	Id        string `json: "job_id"`
	StartTime string `json: "start_time"`
	EndTime   string `json: "end_time"`
}
