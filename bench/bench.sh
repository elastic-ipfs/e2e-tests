#!/bin/bash

TARGET_HTTP_PORT=3001
LABEL=$1

if [ -z "$LABEL" ]
  then
  LABEL="next"
fi

mkdir -p result

# TODO fix path, use cwd

RESULT_FILE=bench/result/$LABEL-regression-1.json npm run test:regression > result/$LABEL-regression-1
RESULT_FILE=bench/result/$LABEL-load-1.json npm run test:load > result/$LABEL-load-1
RESULT_FILE=bench/result/$LABEL-regression-2.json npm run test:regression > result/$LABEL-regression-2
RESULT_FILE=bench/result/$LABEL-load-2.json npm run test:load > result/$LABEL-load-2

echo " *** done ***"
