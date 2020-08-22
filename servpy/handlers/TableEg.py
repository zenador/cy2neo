from misc.DbUtility import getTable
from misc.Handler import Handler

queries = {
	"1": {
		"title": "normal",
		"query": """
			MATCH (n)
			RETURN n
			LIMIT 5;
		""",
		"header": ["n"],
		"columns": ["Node"],
	},
}

class TWeb(Handler):
	def get(self, query_id="1"):
		query = queries.get(query_id, {})
		title = query.get("title", "Unknown")
		header = query.get("header", [])
		columns = query.get("columns", [])
		columns = [{"title": column} for column in columns]
		params = {
			"query_id": "{}".format(query_id),
		}
		return self.render('table_eg.html', title=title, header=header, columns=columns, params=params)

class TApi(Handler):
	def post(self):
		query_id = self.request.json.get('query_id', "")
		query = queries.get(query_id, {}).get("query", "")
		return getTable(query)
