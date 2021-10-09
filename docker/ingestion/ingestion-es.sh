#!/bin/bash

export DATAHUB_VERSION=my
docker-compose -p datahub -f docker-compose-hb-es.yml up
