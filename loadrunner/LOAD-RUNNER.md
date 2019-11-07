# Load Runner

Go implementation of Orchestrator+Executor+Client

# Interface

## Slack update
JobName, StartDate, Duration, Status, VChain, Version, PlannedDuration, PlannedTPM,
TotalTxCount, ErrorTxCount, ServiceTimeMax, ServiceTimeAvg, ServiceTimeP90, ServiceTimeP99

## Transactions Data
TxStatus (COMMITTED,ERROR) struct const
BlockHeight uint64
ServiceTimeMs uint64

## MySQL

### Jobs table
Same as Slack update


