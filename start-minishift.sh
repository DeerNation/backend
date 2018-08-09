#!/usr/bin/env bash

if [ -d ~/.minishift ]; then
    read -p "Installation is active. Remove it? [y/n]" -n 1 -s res
    echo
    if [ "$res" == "y" ]; then
        echo "Removing current installation..."
        killall -9 oc
        minishift stop || true
        minishift delete || true
        rm -rf ~/.minishift
        rm -rf ~/.kube
    fi;
fi

SLEEP=1
STATUS=`minishift status | grep Minishift | awk '{print $2}'`
echo "Minishift status: $STATUS"
if [[ "$STATUS" == "Stopped" ]] || [[ "$STATUS" == "" ]]; then
    minishift addon enable admin-user
    minishift addon enable anyuid

    echo "starting minishift"
    minishift start --memory 8GB --vm-driver virtualbox --cpus 3
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

# prepare istio
oc login -u system:admin
oc adm policy add-scc-to-user anyuid -z istio-ingress-service-account -n istio-system
oc adm policy add-scc-to-user anyuid -z default -n istio-system
oc adm policy add-scc-to-user anyuid -z prometheus -n istio-system
oc adm policy add-scc-to-user anyuid -z istio-egressgateway-service-account -n istio-system
oc adm policy add-scc-to-user anyuid -z istio-citadel-service-account -n istio-system
oc adm policy add-scc-to-user anyuid -z istio-ingressgateway-service-account -n istio-system
oc adm policy add-scc-to-user anyuid -z istio-cleanup-old-ca-service-account -n istio-system
oc adm policy add-scc-to-user anyuid -z istio-mixer-post-install-account -n istio-system
oc adm policy add-scc-to-user anyuid -z istio-mixer-service-account -n istio-system
oc adm policy add-scc-to-user anyuid -z istio-pilot-service-account -n istio-system
oc adm policy add-scc-to-user anyuid -z istio-sidecar-injector-service-account -n istio-system
oc adm policy add-scc-to-user anyuid -z istio-galley-service-account -n istio-system

oc apply -f kubernetes/istio/.
sleep 20

printf "Waiting for istio system to get ready."
oc project istio-system
while [[ $(oc get pods --no-headers | grep -v Running | grep -v Completed | wc -l) != "0" ]]; do
    printf "."
    sleep 10
done
echo "istio is ready"

oc adm policy add-scc-to-user anyuid -z default -n deernation
oc adm policy add-scc-to-user privileged -z default -n deernation

./apply.sh

sleep $SLEEP

oc port-forward -n istio-system `oc get pods -n istio-system --selector=app=istio-ingressgateway -o name | cut -f2 -d /` 8080:80 &

# enable port-forwarding for dgraph (server + ratel)
#echo "enabling port-forwarding..."
#
## wait for pod to be ready
#while [[ $(oc get pod -l app=dgraph-server --no-headers | awk '{print $3}') != "Running" ]]; do
#    echo "waiting for dgraph-server pod to be running"
#    sleep 1
#done
#oc port-forward dgraph-server-0 9080 &
#oc port-forward dgraph-server-0 8080 &
#
#while [[ $(oc get pod -l app=dgraph-ratel --no-headers | awk '{print $3}') != "Running" ]]; do
#    echo "waiting for dgraph-ratel pod to be running"
#    sleep 1
#done
#oc port-forward `oc get pods --selector=app=dgraph-ratel -o name | cut -f2 -d /` 8000 &
