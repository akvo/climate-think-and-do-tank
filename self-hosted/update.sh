#!/bin/bash
set -euv

#Git Pull
git pull

#Rebuild App
docker compose build --no-cache

#Restart Service
docker compose stop && docker compose up -d
