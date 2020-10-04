#FROM neo4j:4.1.1
#COPY *.csv import/
#COPY import.sh import.sh
#ENV EXTENSION_SCRIPT=import.sh
#ENV NEO4J_dbms_directories_logs=/neologs
#ENV NEO4J_dbms_default__database=neo4j
#ENV NEO4J_AUTH=neo4j/neo4j

FROM ubuntu:20.04 AS neo
RUN \
	apt-get update && \
    apt-get install -y wget software-properties-common && \
    add-apt-repository -y ppa:openjdk-r/ppa && \
    wget -O - https://debian.neo4j.com/neotechnology.gpg.key | apt-key add - && \
	echo 'deb https://debian.neo4j.com stable latest' | tee -a /etc/apt/sources.list.d/neo4j.list && \
	apt-get update && \
	apt-get install -y neo4j=1:4.1.1

# COPY *.sh scripts/
# RUN \
# 	bash ./scripts/setup.sh
# CMD [ "sleep", "infinity" ]
# $ docker exec -it dockdockneo bash ./scripts/import.sh && bash ./scripts/index.sh
# $ docker exec -it dockdockneo neo4j console

FROM neo AS db
COPY import/*.csv import/
COPY *.sh scripts/
RUN \
	bash ./scripts/setup.sh && \
	bash ./scripts/import.sh && \
	# bash ./scripts/index-wrapper.sh && \
	bin/neo4j-admin dump --database=neo4j --to=/dbdata

FROM neo
# COPY --from=db /var/lib/neo4j/data/databases/neo4j /var/lib/neo4j/data/databases/neo4j
COPY --from=db /dbdata /dbdata
COPY setup.sh scripts/
RUN \
	bash ./scripts/setup.sh && \
	bin/neo4j-admin load --from=/dbdata --database=neo4j && \
	rm -rf /dbdata
CMD [ "neo4j", "console" ]
