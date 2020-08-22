#!/usr/bin/env python

from flask import Flask, g
import os

curr_folder = "."
client_folder = "../client"
static_dir = client_folder + "/static"
template_dir = curr_folder + "/templates"
app = Flask(__name__, static_folder=static_dir, template_folder=template_dir)
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'secret!')

@app.teardown_appcontext
def close_db(error):
	if hasattr(g, 'neo4j_db'):
		g.neo4j_db.close()
