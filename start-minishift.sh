#!/bin/bash

minishift start

eval $(minishift oc-env)
eval $(minishift docker-env)
