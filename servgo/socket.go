package main

import (
	"log"

	gosocketio "github.com/ambelovsky/gosf-socketio"
	"github.com/ambelovsky/gosf-socketio/transport"
)

var socket = initSocket()

func initSocket() (server *gosocketio.Server) {
	server = gosocketio.NewServer(transport.GetDefaultWebsocketTransport())
	server.On(gosocketio.OnConnection, func(c *gosocketio.Channel) {
		log.Println("New client connected")
	})
	return
}
