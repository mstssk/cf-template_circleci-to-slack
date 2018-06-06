#!/bin/sh -eux

cd `dirname $0`

# gcloud beta functions deploy circleci2slack --project <project_id> --trigger-http
gcloud beta functions deploy circleci2slack --project $1 --trigger-http
