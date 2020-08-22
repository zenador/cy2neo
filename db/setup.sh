#!/bin/bash

declare -A COMMUNITY

COMMUNITY=(
	[dbms.tx_log.rotation.retention_policy]="100M size"
	[dbms.memory.pagecache.size]="512M"
	[dbms.default_listen_address]="0.0.0.0"
)

for conf in ${!COMMUNITY[@]} ; do
    if ! grep -q "^$conf" "${NEO4J_HOME}"/conf/neo4j.conf
    then
        echo -e "\n"$conf=${COMMUNITY[$conf]} >> /etc/neo4j/neo4j.conf
    fi
done

neo4j-admin set-initial-password neo4j 2>/dev/null || true
