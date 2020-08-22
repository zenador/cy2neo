#!/usr/bin/env python

from flask_restful import Api

from app import app
from misc.Socket import socketio
from handlers import GraphEg, TableEg

api = Api(app)

api.add_resource(GraphEg.GWeb, "/", "/<string:query_id>/<string:entity_id>")
api.add_resource(GraphEg.GApi, "/get_graph")
api.add_resource(GraphEg.GUpdate, "/update/<string:info>")
api.add_resource(TableEg.TWeb, "/table", "/table/<string:query_id>")
api.add_resource(TableEg.TApi, "/get_table")

# app.debug = True

if __name__ == '__main__':
	# app.run(host="0.0.0.0", port=8080, debug=True)
	socketio.run(app, host="0.0.0.0", port=8080, debug=True)
