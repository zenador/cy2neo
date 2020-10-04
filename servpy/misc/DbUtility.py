import requests
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

def addNeoAutoComplete(query, nodes, relTypes=[]):
	newNodeStr = " + ".join(["collect(id("+node+"))" for node in nodes])
	newRelTypesStr = "|".join(relTypes)
	if newRelTypesStr:
		newRelTypesStr = ":" + newRelTypesStr
	return """CALL {""" + query + """}
	//WITH (collect(distinct id(n1)) + collect(distinct id(n2))) as ids
	WITH apoc.coll.toSet(""" + newNodeStr + """) as ids
	MATCH (n)-[r""" + newRelTypesStr + """]->(m)
	WHERE id(n) in ids
	AND id(m) in ids
	RETURN n,r,m"""

def getGraph(query):
	params = {
		"statements": [{
			"statement": query,
			"parameters": {},
			"resultDataContents": ["row", "graph"]
		}]
	}
	r = requests.post(graph_endpoint, json=params, auth=graph_auth)
	return r.json()

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
