#!/bin/bash

echo "person $(date)"
until cypher-shell -u neo4j -p neo4j 'CREATE CONSTRAINT ON (n:Person) ASSERT n.eid IS UNIQUE;'
do
  echo "create person index failed, sleeping"
  sleep 10
done

echo "done $(date)"
