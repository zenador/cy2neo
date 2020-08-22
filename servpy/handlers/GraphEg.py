from json import dumps
from flask import Response

from misc.DbUtility import getGraph, pprintQuery
from misc.Handler import Handler
from misc.Socket import socketio

queries = {
	"1": """
		MATCH (n)
		OPTIONAL MATCH (n)-[r]->()
		RETURN n,r
		LIMIT 5;
	""",
	"2": """
		MATCH (n)-[r*0..3]->(m)
		RETURN n,r,m
		LIMIT 5;
	""",
	"person": """
		MATCH (a:Person {{eid: '{entity_id}'}})-[r]-(e)
		return a, e, r;
	""",
}

class GWeb(Handler):
	def get(self, query_id="1", entity_id="1"):
		params = {
			"query_id": "{}".format(query_id),
			"entity_id": "{}".format(entity_id),
		}
		return self.render('graph_eg.html', params=params)

class GApi(Handler):
	def post(self):
		params = self.request.json
		query_id = params.get('query_id', "")
		entity_id = params.get('entity_id', "")
		query = queries.get(query_id, "").format(**params)
		print(query)
		resp = getGraph(query)
		resp["query"] = pprintQuery(query)
		resp["eid"] = entity_id
		return Response(dumps(resp), mimetype="application/json")

class GUpdate(Handler):
	def get(self, info):
		socketio.emit('updated', {'info': info})
		return ""
