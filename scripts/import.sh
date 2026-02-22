#!/bin/bash

docker exec -it mongodb mongoimport --db netflix_db --collection movies --type csv --file /import.csv --headerline --ignoreBlanks