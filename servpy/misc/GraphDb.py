import os
# from flask import g
from neo4j import GraphDatabase

# from app import app

graph_auth_un = os.environ.get('NEO4J_DB_USER', "neo4j")
graph_auth_pw = os.environ.get('NEO4J_DB_PW', "neo4j")
graph_auth = (graph_auth_un, graph_auth_pw)

host = os.environ.get('NEO4J_DB_HOST', "localhost")
port = os.environ.get('NEO4J_DB_PORT', 7474)
bolt_port = os.environ.get('NEO4J_DB_PORT_BOLT', 7687)
graph_endpoint = 'http://{}:{}/db/data/transaction/commit'.format(host, port)
bolt_endpoint = 'bolt://{}:{}'.format(host, bolt_port)

class GraphDb:
	def init(self):
		self.driver = GraphDatabase.driver(bolt_endpoint, auth=graph_auth, encrypted=False)

	@classmethod
	def instance(cls):
		"""Singleton like accessor to instantiate backend object"""

		if not hasattr(cls, "_instance"):
			cls._instance = cls()
			cls._instance.init()

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
