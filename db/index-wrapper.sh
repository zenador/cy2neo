#!/bin/bash

neo4j start
sleep 10

bash index.sh

neo4j stop
