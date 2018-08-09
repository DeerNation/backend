#!/usr/bin/env bash

oc login -u developer
oc project deernation
oc config use-context `oc config get-contexts --no-headers=true --output=name | grep deernation | grep admin` || exit 1

for file in kubernetes/*.yaml; do
    [ -e "$file" ] || continue
    istioctl kube-inject -f "$file" | oc apply -n deernation -f -
done