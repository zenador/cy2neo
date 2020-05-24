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
		title = queries.get(query_id, {}).get("title", "Unknown")
		header = queries.get(query_id, {}).get("header", [])
		columns = queries.get(query_id, {}).get("columns", [])
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
