#!/usr/bin/env sh

ID=$1
TIMEOUT=$2
VCHAIN=$3
TOTAL_TX=$4
ERR_TX=$5

SEM_VER="v1.2.2-f87f67f3"

if [[ $# -lt 5 ]] ; then
  echo "Usage: <ID> <TIMEOUT_SEC> <VCHAIN> <TOTAL_TX> <ERR_TX>"
  exit 1
fi


start=`date "+%Y-%m-%dT%H:%M:%S"`
sleep ${TIMEOUT}
end=`date "+%Y-%m-%dT%H:%M:%S"`
echo "{\"name\":\"${ID}\",\"error\":\"\",\"startTime\":\"${start}Z\",\"endTime\":\"${end}Z\",\"totalTransactions\":${TOTAL_TX},\"errorTransactions\":${ERR_TX},\"vchain\":${VCHAIN},\"commitHash\":\"f87f67f385f3743a86843ecb5601e6a27dd3ffcc\",\"semanticVersion\":\"${SEM_VER}\",\"transactions\":null}"
