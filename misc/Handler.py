from flask_restful import Resource
from flask import request, render_template, make_response, redirect

class Handler(Resource):
	def __init__(self):
		self.request = request

	def response(self, string):
		return make_response(string, 200, {'Content-Type' : 'text/html'})

	def render(self, *args, **kwargs):
		return self.response(render_template(*args, **kwargs))

	def redirect(self, url):
		return redirect('http://' + self.request.host + url)
