#!/usr/bin/env bash

STATUS=`minishift status | grep Minishift | awk '{print $2}'`
echo "Minishift status: $STATUS"
if [[ "$STATUS" == "Stopped" ]]; then
    echo "starting minishift"
    minishift start
fi;

echo "applying environments..."
eval $(minishift oc-env)
eval $(minishift docker-env)

echo "applying bash-completion..."
source ./.minishift-completion
source ./.oc-completion

# enable port-forwarding for dgraph (server + ratel)
echo "enabling port-forwarding..."
oc port-forward `oc get pods --selector=app=dgraph-ratel -o name | cut -f2 -d /` 8001:8000 &
oc port-forward dgraph-server-0 9080 &
oc port-forward dgraph-server-0 8080 &