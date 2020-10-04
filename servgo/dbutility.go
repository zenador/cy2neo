package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/neo4j/neo4j-go-driver/neo4j"
)

func dictify(record neo4j.Record) (d Dict) {
	d = make(Dict)
	for _, key := range record.Keys() {
		value, _ := record.Get(key)
		if node, ok := value.(neo4j.Node); ok {
			d[key] = node.Props()
		} else {
			d[key] = value
		}
	}
	return
}

func pprintQuery(query string) string {
	query = regexp.MustCompile(`\t`).ReplaceAllLiteralString(query, "")
	query = regexp.MustCompile(`(\n){2,}`).ReplaceAllLiteralString(query, "\n")
	query = regexp.MustCompile(`^\n`).ReplaceAllLiteralString(query, "")
	return query
}

func jsonEscape(i string) string {
	b, err := json.Marshal(i)
	if err != nil {
		panic(err)
	}
	s := string(b)
	return s[1 : len(s)-1]
}

func addNeoTimeout(query string, timeout int, tail []string) string {
	query = pprintQuery(query)
	var newTail []string
	for _, unit := range tail {
		newTail = append(newTail, "value."+unit+" as "+unit)
	}
	fmtTail := strings.Join(newTail, ", ")
	query = `CALL apoc.cypher.runTimeboxed("` + query + `", null, ` + strconv.Itoa(timeout) + `) YIELD value RETURN ` + fmtTail + `;`
	return query
}

func addNeoAutoComplete(query string, nodes []string, relTypes []string) string {
	var newNodes []string
	for _, node := range nodes {
		newNodes = append(newNodes, "collect(id("+node+"))")
	}
	newNodeStr := strings.Join(newNodes, " + ")
	newRelTypesStr := strings.Join(relTypes, "|")
	if newRelTypesStr != "" {
		newRelTypesStr = ":" + newRelTypesStr
	}
	return `CALL {` + query + `}
	//WITH (collect(distinct id(n1)) + collect(distinct id(n2))) as ids
	WITH apoc.coll.toSet(` + newNodeStr + `) as ids
	MATCH (n)-[r` + newRelTypesStr + `]->(m)
	WHERE id(n) in ids
	AND id(m) in ids
	RETURN n,r,m`
}

func getGraph(query string) (responseDict Dict, err error) {
	params := Dict{
		"statements": List{
			Dict{
				"statement":          query,
				"parameters":         map[string]string{},
				"resultDataContents": []string{"row", "graph"},
			},
		},
	}
	paramStr, err := json.Marshal(params)
	if err != nil {
		return
	}

	req, err := http.NewRequest("POST", graphEndpoint, bytes.NewBuffer(paramStr))
	if err != nil {
		return
	}

	req.SetBasicAuth(graphAuthUser, graphAuthPw)
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return
	}

	responseData, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return
	}

	err = json.Unmarshal(responseData, &responseDict)
	if err != nil {
		return
	}

	return
}

// for write queries that don't need to return results
func runGraphQuery(query string) (err error) {
	// sessionConfig := neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite}
	// session, err := db.NewSession(sessionConfig)
	session, err := db.Session(neo4j.AccessModeWrite)
	if err != nil {
		return
	}
	defer session.Close()

	result, err := session.Run(query, nil)
	if err != nil {
		return
	}

	_, err = result.Consume()
	return
}

// for read queries that return results
func getTable(query string) (responseList []Dict, err error) {
	session, err := db.Session(neo4j.AccessModeWrite)
	if err != nil {
		return
	}
	defer session.Close()

	_, err = session.ReadTransaction(func(tx neo4j.Transaction) (interface{}, error) {
		results, err := tx.Run(query, nil)
		if err != nil {
			return nil, err
		}
		for results.Next() {
			responseList = append(responseList, dictify(results.Record()))
		}
		return results.Summary()
	})
	return
}
