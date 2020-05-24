import requests
from json import dumps
from flask import Response
from neo4j.types.graph import Node
import re

from misc.GraphDb import GraphDb, graph_auth, graph_endpoint

db = GraphDb.instance().getDb()

def getNodeProps(n):
	return dict((k, v) for k, v in n.items() if v is not None)

def dictify(iterable):
	d = {}
	for k, v in iterable.items():
		if isinstance(v, Node):
			d[k] = getNodeProps(v)
		else:
			d[k] = v
	return d

def pprintQuery(query):
	query = re.sub(r'\t', '', query)
	query = re.sub(r'(\n){2,}', '\n', query)
	query = re.sub(r'^\n', '', query)
	return query

def addNeoTimeout(query, timeout, tail):
	query = dumps(pprintQuery(query))[1:-1]
	query = """CALL apoc.cypher.runTimeboxed("{}", null, {}) YIELD value RETURN {};""".format(query, timeout, ", ".join(["value.{name} as {name}".format(name=i) for i in tail]))
	return query

def getGraph(query):
	params = {
		"statements": [{
			"statement": query,
			"parameters": {},
			"resultDataContents": ["row", "graph"]
		}]
	}
	r = requests.post(graph_endpoint, json=params, auth=graph_auth)
	resp = r.json()
	resp["query"] = pprintQuery(query)
	return Response(dumps(resp), mimetype="application/json")

# for write queries that don't need to return results
def runGraphQuery(query):
	with db.session() as dbSession:
		dbSession.run(query).consume()

# for read queries that return results
def getTable(query):
	with db.session() as dbSession:
		with dbSession.begin_transaction() as tx:# need this extra layer for the transient apoc timeouts
			results = tx.run(query)
			results = [dictify(row) for row in results]
			return results
			# return Response(dumps(results), mimetype="application/json")
	return []
