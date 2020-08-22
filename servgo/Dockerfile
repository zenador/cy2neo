# FROM ubuntu:20.04
# RUN \
# 	apt-get update && \
#     apt-get install -y wget git && \
#     wget -c https://dl.google.com/go/go1.14.6.linux-amd64.tar.gz -O - | tar -xz -C /usr/local && \
# 	export PATH=$PATH:/usr/local/go/bin && \
# 	go version
# RUN \
# 	export PATH=$PATH:/usr/local/go/bin && \
# 	go get github.com/gorilla/mux && \
# 	go get github.com/neo4j/neo4j-go-driver/neo4j

FROM golang:1.14-alpine AS builder
WORKDIR /proj
COPY ./servgo/go.mod .
COPY ./servgo/go.sum .
RUN go mod download
COPY ./client .
COPY ./servgo .
RUN go build -o servgo

FROM alpine
WORKDIR /proj
# COPY --from=builder /proj .
COPY --from=builder /proj/servgo .
COPY --from=builder /proj/templates ./templates
COPY --from=builder /proj/static ../client/static
CMD [ "./servgo" ]
