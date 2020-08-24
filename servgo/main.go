package main

import (
	"html/template"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	defer db.Close()
	router := mux.NewRouter().StrictSlash(true)

	staticDir := "/static/"
	router.PathPrefix(staticDir).Handler(http.StripPrefix(staticDir, http.FileServer(http.Dir(clientFolder+staticDir))))

	router.Handle("/socket.io/", socket)
	router.HandleFunc("/get_table", tAPI).Methods("POST")
	router.HandleFunc("/table/{query_id}", tWeb)
	router.HandleFunc("/update/{info}", gUpdate)
	router.HandleFunc("/get_graph", gAPI).Methods("POST")
	router.HandleFunc("/{query_id}/{entity_id}", gWeb)

	log.Fatal(http.ListenAndServe(":8088", router))
}

var currFolder = "."
var clientFolder = "../client"
var templatePrefix = currFolder + "/templates/"
var templateSuffix = ".html"
var templateList = []string{"graph_eg", "table_eg"}
var templates = map[string]*template.Template{}

// var templates *template.Template

func init() {
	// pathList := []string{}
	for _, name := range templateList {
		templates[name] = template.Must(template.ParseGlob(templatePrefix + "frame/*" + templateSuffix))
		templates[name] = template.Must(templates[name].ParseFiles(templatePrefix + name + templateSuffix))
		// pathList = append(pathList, templatePrefix + name + templateSuffix)
	}
	// templates = template.Must(template.ParseFiles(pathList...))
}

func renderTemplate(w http.ResponseWriter, tmpl string, params Dict) {
	err := templates[tmpl].ExecuteTemplate(w, tmpl+templateSuffix, params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
