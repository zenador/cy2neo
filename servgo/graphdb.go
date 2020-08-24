package main

import (
	"os"
	"strconv"

	"github.com/neo4j/neo4j-go-driver/neo4j"
)

var graphAuthUser = getEnv("NEO4J_DB_USER", "neo4j")
var graphAuthPw = getEnv("NEO4J_DB_PW", "neo4j")

var host = getEnv("NEO4J_DB_HOST", "localhost")
var port = getEnvInt("NEO4J_DB_PORT", 7474)
var boltPort = getEnvInt("NEO4J_DB_PORT_BOLT", 7687)
var graphEndpoint = "http://" + host + ":" + strconv.Itoa(port) + "/db/data/transaction/commit"
var boltEndpoint = "bolt://" + host + ":" + strconv.Itoa(boltPort)

var db = initGraphDb()

func initGraphDb() neo4j.Driver {
	config := func(c *neo4j.Config) {
		c.Encrypted = false
	}
	driver, err := neo4j.NewDriver(boltEndpoint, neo4j.BasicAuth(graphAuthUser, graphAuthPw, ""), config)
	if err != nil {
		return nil
	}
	return driver
}

func getEnv(key string, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	if value, exists := os.LookupEnv(key); exists {
		if iValue, err := strconv.Atoi(value); err != nil {
			return iValue
		}
	}
	return defaultVal
}
