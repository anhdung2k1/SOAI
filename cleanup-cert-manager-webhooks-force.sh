#!/bin/bash

# Script to forcefully clean up stale cert-manager webhook configurations
# This script automatically deletes all webhook configurations related to cert-manager
# without requiring user interaction

set -euo pipefail

echo "Checking for cert-manager webhook configurations..."

# Get all validating webhook configurations and check for cert-manager references
echo "Checking validating webhook configurations..."
VALIDATING_WEBHOOKS=$(kubectl get validatingwebhookconfigurations -o name 2>/dev/null | grep -i cert-manager || echo "")

if [ -z "$VALIDATING_WEBHOOKS" ]; then
    # Also check for athena-monitoring-cert-manager
    VALIDATING_WEBHOOKS=$(kubectl get validatingwebhookconfigurations -o name 2>/dev/null | grep -i "athena.*monitoring.*cert" || echo "")
fi

if [ -z "$VALIDATING_WEBHOOKS" ]; then
    echo "No cert-manager validating webhooks found"
else
    echo "Found validating webhooks:"
    echo "$VALIDATING_WEBHOOKS"
    echo ""
    echo "Deleting validating webhook configurations..."
    echo "$VALIDATING_WEBHOOKS" | while read -r webhook; do
        if [ -n "$webhook" ]; then
            # Extract name after the last / (format: validatingwebhookconfiguration.admissionregistration.k8s.io/name)
            webhook_name=$(echo "$webhook" | sed 's/.*\///')
            echo "  Deleting: $webhook_name"
            kubectl delete validatingwebhookconfigurations "$webhook_name" 2>/dev/null && echo "    ✓ Deleted $webhook_name" || echo "    ✗ Failed to delete $webhook_name"
        fi
    done
fi

# Get all mutating webhook configurations and check for cert-manager references
echo ""
echo "Checking mutating webhook configurations..."
MUTATING_WEBHOOKS=$(kubectl get mutatingwebhookconfigurations -o name 2>/dev/null | grep -i cert-manager || echo "")

if [ -z "$MUTATING_WEBHOOKS" ]; then
    # Also check for athena-monitoring-cert-manager
    MUTATING_WEBHOOKS=$(kubectl get mutatingwebhookconfigurations -o name 2>/dev/null | grep -i "athena.*monitoring.*cert" || echo "")
fi

if [ -z "$MUTATING_WEBHOOKS" ]; then
    echo "No cert-manager mutating webhooks found"
else
    echo "Found mutating webhooks:"
    echo "$MUTATING_WEBHOOKS"
    echo ""
    echo "Deleting mutating webhook configurations..."
    echo "$MUTATING_WEBHOOKS" | while read -r webhook; do
        if [ -n "$webhook" ]; then
            # Extract name after the last / (format: mutatingwebhookconfiguration.admissionregistration.k8s.io/name)
            webhook_name=$(echo "$webhook" | sed 's/.*\///')
            echo "  Deleting: $webhook_name"
            kubectl delete mutatingwebhookconfigurations "$webhook_name" 2>/dev/null && echo "    ✓ Deleted $webhook_name" || echo "    ✗ Failed to delete $webhook_name"
        fi
    done
fi

# Also try to find webhooks that reference the monitoring namespace service
echo ""
echo "Checking for webhooks referencing athena-monitoring-cert-manager-webhook.monitoring.svc..."
echo "This is the most important check - finding webhooks that point to the non-existent service..."

# Check all validating webhooks for references to the problematic service
for webhook in $(kubectl get validatingwebhookconfigurations -o name 2>/dev/null || true); do
    # Extract name after the last /
    webhook_name=$(echo "$webhook" | sed 's/.*\///')
    if kubectl get validatingwebhookconfigurations "$webhook_name" -o yaml 2>/dev/null | grep -q "athena-monitoring-cert-manager-webhook"; then
        echo "Found validating webhook referencing athena-monitoring-cert-manager-webhook: $webhook_name"
        echo "  Deleting: $webhook_name"
        kubectl delete validatingwebhookconfigurations "$webhook_name" 2>/dev/null && echo "    ✓ Deleted $webhook_name" || echo "    ✗ Failed to delete $webhook_name"
    fi
    # Also check for webhook.cert-manager.io which might point to wrong service
    if kubectl get validatingwebhookconfigurations "$webhook_name" -o yaml 2>/dev/null | grep -q "webhook.cert-manager.io"; then
        if kubectl get validatingwebhookconfigurations "$webhook_name" -o yaml 2>/dev/null | grep -q "monitoring.svc"; then
            echo "Found validating webhook with cert-manager.io pointing to monitoring namespace: $webhook_name"
            echo "  Deleting: $webhook_name"
            kubectl delete validatingwebhookconfigurations "$webhook_name" 2>/dev/null && echo "    ✓ Deleted $webhook_name" || echo "    ✗ Failed to delete $webhook_name"
        fi
    fi
done

# Check all mutating webhooks for references to the problematic service
for webhook in $(kubectl get mutatingwebhookconfigurations -o name 2>/dev/null || true); do
    # Extract name after the last /
    webhook_name=$(echo "$webhook" | sed 's/.*\///')
    if kubectl get mutatingwebhookconfigurations "$webhook_name" -o yaml 2>/dev/null | grep -q "athena-monitoring-cert-manager-webhook"; then
        echo "Found mutating webhook referencing athena-monitoring-cert-manager-webhook: $webhook_name"
        echo "  Deleting: $webhook_name"
        kubectl delete mutatingwebhookconfigurations "$webhook_name" 2>/dev/null && echo "    ✓ Deleted $webhook_name" || echo "    ✗ Failed to delete $webhook_name"
    fi
    # Also check for webhook.cert-manager.io which might point to wrong service
    if kubectl get mutatingwebhookconfigurations "$webhook_name" -o yaml 2>/dev/null | grep -q "webhook.cert-manager.io"; then
        if kubectl get mutatingwebhookconfigurations "$webhook_name" -o yaml 2>/dev/null | grep -q "monitoring.svc"; then
            echo "Found mutating webhook with cert-manager.io pointing to monitoring namespace: $webhook_name"
            echo "  Deleting: $webhook_name"
            kubectl delete mutatingwebhookconfigurations "$webhook_name" 2>/dev/null && echo "    ✓ Deleted $webhook_name" || echo "    ✗ Failed to delete $webhook_name"
        fi
    fi
done

echo ""
echo "Webhook cleanup completed!"
echo ""
echo "To verify, run:"
echo "  kubectl get validatingwebhookconfigurations | grep -i cert"
echo "  kubectl get mutatingwebhookconfigurations | grep -i cert"
