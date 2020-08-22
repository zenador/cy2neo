from flask_socketio import SocketIO#, emit

from app import app

socketio = SocketIO(app)

'''
@socketio.on('connect', namespace='/')
def test_connect():
	print('Client connected')

@socketio.on('disconnect', namespace='/')
def test_disconnect():
	print('Client disconnected')

@socketio.on('my event')
def test_message(r):
	emit('my response', {'data': 'got it!'})
	print(r.get("data"))
'''
