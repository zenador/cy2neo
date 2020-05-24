#!/usr/bin/env python

from flask import Flask, g
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'secret!')

@app.teardown_appcontext
def close_db(error):
	if hasattr(g, 'neo4j_db'):
		g.neo4j_db.close()
