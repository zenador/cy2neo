#!/bin/bash

neo4j-admin import --nodes=Person="import/person.csv" --relationships=REPORTS_TO="import/reports.csv" --skip-bad-relationships=true --skip-duplicate-nodes=true
