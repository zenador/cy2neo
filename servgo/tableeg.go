package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

var queriesT = map[string]Dict{
	"1": Dict{
		"title": "normal",
		"query": `
			MATCH (n)
			RETURN n
			LIMIT 5;
		`,
		"header":  []string{"n"},
		"columns": []string{"Node"},
	},
}

func tWeb(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	queryID := vars["query_id"]
	query := queriesT[queryID]
	columnsH := query["columns"].([]string)
	var columns List
	for _, column := range columnsH {
		columns = append(columns, map[string]string{"title": column})
	}
	params := Dict{
		"query_id": queryID,
	}
	fullData := Dict{
		"title":   query["title"],
		"header":  query["header"],
		"columns": columns,
		"params":  params,
	}
	renderTemplate(w, "table_eg", fullData)
}

func tAPI(w http.ResponseWriter, r *http.Request) {
	type Post struct {
		QID string `json:"query_id"`
	}
	var post Post
	json.NewDecoder(r.Body).Decode(&post)

	query := queriesT[post.QID]["query"].(string)
	log.Println(query)
	res, err := getTable(query)
	if err != nil {
		log.Fatalf("%s", err)
	}

	resByte, err := json.Marshal(res)
	if err != nil {
		return
	}
	w.Header().Add("Content-Type", "application/json")
	w.Write(resByte)
	// log.Println(string(resByte))
}
