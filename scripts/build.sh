#!/bin/bash


docker build -t cloud-administration-project-db -f Dockerfile.db .
docker build -t cloud-administration-project-app -f Dockerfile.app .
