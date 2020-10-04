package main

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"

	"github.com/gorilla/mux"
)

var queries = map[string]string{
	"1": `
	MATCH (n)
	OPTIONAL MATCH (n)-[r]->()
	RETURN n,r
	LIMIT 5;
	`,
	"2": `
	MATCH (n)-[r*0..3]->(m)
	RETURN n,r,m
	LIMIT 5;
	`,
	"person": `
	MATCH (a:Person {eid: '{{.EID}}'})-[r]-(e)
	return a, e, r;
	`,
}

func gWeb(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	// w.Write([]byte("res"))

	params := Dict{
		"query_id":  vars["query_id"],
		"entity_id": vars["entity_id"],
	}
	fullData := Dict{
		"params": params,
	}
	renderTemplate(w, "graph_eg", fullData)
}

func gAPI(w http.ResponseWriter, r *http.Request) {
	type Post struct {
		QID string `json:"query_id"`
		EID string `json:"entity_id"`
	}
	var post Post
	json.NewDecoder(r.Body).Decode(&post)

	matched, _ := regexp.MatchString(`^\w+$`, post.QID)
	if !matched {
		post.QID = "invalid"
	}

	matched, _ = regexp.MatchString(`^[\w.-]+$`, post.EID)
	if !matched {
		post.EID = "invalid"
	}

	query := format(queries[post.QID], post)
	log.Println(query)
	res, err := getGraph(query)
	if err != nil {
		log.Fatalf("%s", err)
	}

	res["query"] = query
	res["eid"] = post.EID

	resByte, err := json.Marshal(res)
	if err != nil {
		return
	}
	w.Header().Add("Content-Type", "application/json")
	w.Write(resByte)
	// log.Println(string(resByte))
}

func gUpdate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	info := vars["info"]
	type EventData struct {
		Info string
	}
	socket.BroadcastToAll("updated", EventData{info})
}
