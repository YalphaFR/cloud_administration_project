#!/bin/bash
# On définit manuellement les champs pour renommer 'language' en 'lang'
docker exec -it mongodb_container mongoimport --db netflix_db --collection films \
  --type csv --file /import.csv \
  --fields "show_id,type,title,director,cast,country,date_added,release_year,rating,duration,genres,lang,description,popularity,vote_count,vote_average,budget,revenue" \
  --ignoreBlanks