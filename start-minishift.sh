#!/usr/bin/env bash

if [ -d ~/.minishift ]; then
    read -p "Installation is active. Remove it? [y/n]" -n 1 -s res
    echo
    if [ "$res" == "y" ]; then
        echo "Removing current installation..."

        minishift stop || true
        minishift delete || true
        rm -rf ~/.minishift
    fi;
fi

SLEEP=1
STATUS=`minishift status | grep Minishift | awk '{print $2}'`
echo "Minishift status: $STATUS"
if [[ "$STATUS" == "Stopped" ]] || [[ "$STATUS" == "" ]]; then
    echo "starting minishift"
    minishift start
    SLEEP=15
fi;

echo "applying environments..."
eval $(minishift oc-env)
eval $(minishift docker-env)

echo "applying bash-completion..."
source ./.minishift-completion
source ./.oc-completion

if [[ $(oc get projects -o=name | grep deernation) == "" ]]; then
    oc new-project deernation --display-name=DeerNation
fi;

oc project deernation || return 1

# oc config use-context `oc config get-contexts --no-headers=true --output=name | grep deernation`

oc apply -f kubernetes/.

sleep $SLEEP

# enable port-forwarding for dgraph (server + ratel)
echo "enabling port-forwarding..."

# wait for pod to be ready
while [[ $(oc get pod -l app=dgraph-server --no-headers | awk '{print $3}') != "Running" ]]; do
    echo "waiting for dgraph-server pod to be running"
    sleep 1
done
oc port-forward dgraph-server-0 9080 &
oc port-forward dgraph-server-0 8080 &

while [[ $(oc get pod -l app=dgraph-ratel --no-headers | awk '{print $3}') != "Running" ]]; do
    echo "waiting for dgraph-ratel pod to be running"
    sleep 1
done
oc port-forward `oc get pods --selector=app=dgraph-ratel -o name | cut -f2 -d /` 8000 &
