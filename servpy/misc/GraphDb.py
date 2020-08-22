import os
# from flask import g
from neo4j import GraphDatabase

# from app import app

graph_auth_un = os.environ.get('NEO4J_DB_USER', "neo4j")
graph_auth_pw = os.environ.get('NEO4J_DB_PW', "neo4j")
graph_auth = (graph_auth_un, graph_auth_pw)

host = "localhost"
port = 7474
graph_endpoint = 'http://{}:{}/db/data/transaction/commit'.format(host, port)
bolt_endpoint = 'bolt://{}'.format(host)

class GraphDb:
	def __init__(self):
		self.driver = GraphDatabase.driver(bolt_endpoint, auth=graph_auth, encrypted=False)

	@classmethod
	def instance(cls):
		"""Singleton like accessor to instantiate backend object"""

		if not hasattr(cls, "_instance"):
			cls._instance = cls()

		return cls._instance

	def getDb(self):
		return self.driver

'''
def get_db():
	with app.app_context():
		if not hasattr(g, 'neo4j_db'):
			g.neo4j_db = driver
		return g.neo4j_db
'''
