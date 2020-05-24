from misc.DbUtility import getGraph
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
}

class GWeb(Handler):
	def get(self, query_id="1"):
		params = {
			"query_id": "{}".format(query_id),
		}
		return self.render('graph_eg.html', params=params)

class GApi(Handler):
	def post(self):
		query_id = self.request.json.get('query_id', "")
		query = queries.get(query_id, "")
		return getGraph(query)

class GUpdate(Handler):
	def get(self, info):
		socketio.emit('updated', {'info': info})
		return ""
