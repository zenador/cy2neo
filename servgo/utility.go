package main

import (
	"bytes"
	"text/template"
)

// Dict Convenience type
type Dict map[string]interface{}

// List Convenience type
type List []interface{}

func format(fmt string, p interface{}) string {
	b := &bytes.Buffer{}
	template.Must(template.New("").Parse(fmt)).Execute(b, p)
	return b.String()
}
