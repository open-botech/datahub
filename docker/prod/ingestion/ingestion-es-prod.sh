#!/bin/bash

export DATAHUB_VERSION=my
/usr/local/bin/docker-compose -p datahub -f docker-compose-hb-es-prod.yml up
