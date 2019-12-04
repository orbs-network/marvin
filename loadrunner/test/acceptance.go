package test

import "testing"

func TestReportIsBasedOnJobStartParams(t *testing.T) {

	// need mock report

	var job *JobDefinition
	runJob(job)

}

func TestJobUpdatedInDb(t *testing.T) {
	// need mock db
}

func TestClientCalledOnJobsStartRoute(t *testing.T) {
	// need mock client
}
