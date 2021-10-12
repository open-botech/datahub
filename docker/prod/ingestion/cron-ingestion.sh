#!/bin/bash
./ingestion-ck-prod.sh >ingestion-ck.log 2>&1
./ingestion-es-prod.sh >ingestion-es.log 2>&1
