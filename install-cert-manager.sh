#!/bin/bash

# Script to install cert-manager in Kubernetes cluster
# This script checks if cert-manager is installed and installs it if needed

set -e

NAMESPACE="cert-manager"
VERSION="v1.15.3"

echo "Checking if cert-manager is already installed..."

# Check if cert-manager namespace exists
if kubectl get namespace "$NAMESPACE" &>/dev/null; then
    echo "Namespace $NAMESPACE already exists"
    
    # Check if cert-manager pods are running
    if kubectl get pods -n "$NAMESPACE" | grep -q cert-manager; then
        echo "cert-manager appears to be installed. Checking status..."
        kubectl get pods -n "$NAMESPACE"
        echo ""
        echo "cert-manager is already installed. Exiting."
        exit 0
    else
        echo "Namespace exists but no cert-manager pods found. Proceeding with installation..."
    fi
else
    echo "Namespace $NAMESPACE does not exist. Will create it during installation."
fi

echo ""
echo "Installing cert-manager version $VERSION..."

# Add the cert-manager Helm repository
echo "Adding cert-manager Helm repository..."
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Install cert-manager
echo "Installing cert-manager..."
helm install cert-manager jetstack/cert-manager \
    --namespace "$NAMESPACE" \
    --create-namespace \
    --version "$VERSION" \
    --set installCRDs=true \
    --set webhook.timeoutSeconds=30

echo ""
echo "Waiting for cert-manager pods to be ready..."
kubectl wait --for=condition=ready pod \
    -l app.kubernetes.io/instance=cert-manager \
    -n "$NAMESPACE" \
    --timeout=300s || true

echo ""
echo "Checking cert-manager installation status..."
kubectl get pods -n "$NAMESPACE"

echo ""
echo "Checking cert-manager CRDs..."
kubectl get crd | grep cert-manager || echo "No cert-manager CRDs found yet (they may still be installing)"

echo ""
echo "cert-manager installation completed!"
echo ""
echo "To verify the installation, run:"
echo "  kubectl get pods -n $NAMESPACE"
echo "  kubectl get crd | grep cert-manager"

