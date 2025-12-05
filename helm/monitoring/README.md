# 📊 Kubernetes Monitoring Stack - Complete Setup

**Grafana + Prometheus + AlertManager + Node Exporter on Kubernetes via Helm**

[![Status](https://img.shields.io/badge/status-deployed-brightgreen)]()
[![Helm](https://img.shields.io/badge/Helm-v3-blue)]()
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.x%2B-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 🎯 Overview

This Helm chart deploys a complete monitoring stack on Kubernetes with:
- ✅ **Grafana** - Visualization with pre-imported dashboards
- ✅ **Prometheus** - Metrics collection and alerting
- ✅ **AlertManager** - Alert routing and management
- ✅ **Node Exporter** - System metrics collection
- ✅ **Auto-Provisioning** - Dashboards and datasources pre-configured
- ✅ **Persistent Storage** - Data survives pod restarts
- ✅ **External Access** - LoadBalancer with external IP

---

## ⚡ Quick Start

### Step 1: Deploy to Kubernetes
```bash
helm install monitoring ./ -n monitoring --create-namespace
```

### Step 2: Get External IP
```bash
kubectl get svc -n monitoring -o wide
```

### Step 3: Access Services
- **Grafana**: http://172.26.217.215:3000 (admin / admin@123)
- **Prometheus**: http://172.26.217.215:9090

**That's it! Your monitoring stack is ready!** 🎉

---

## 📁 Project Structure

```
helm/monitoring/                   ← Umbrella chart directory
│
├── Chart.yaml                     ← Umbrella chart metadata with dependencies
├── values.yaml                    ← Root configuration
├── README.md                      ← This file
├── MIGRATION_SUMMARY.md           ← Migration guide
│
├── grafana/                       ← Grafana sub-chart
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── README.md
│   ├── templates/                 ← 8 Grafana Kubernetes manifests
│   │   ├── _helpers.tpl
│   │   ├── grafana-deployment.yaml
│   │   ├── grafana-service.yaml
│   │   ├── grafana-pvc.yaml
│   │   ├── grafana-secret.yaml
│   │   └── grafana-configmap-*.yaml (3 files)
│   └── dashboards/                ← Pre-configured Grafana dashboards
│       ├── node-exporter-full.json
│       ├── soai-cadvisor-exporter-filtered.json
│       └── soai-docker-and-system-monitoring-filtered.json
│
└── prometheus/                    ← Prometheus sub-chart
    ├── Chart.yaml
    ├── values.yaml
    ├── README.md
    └── templates/                 ← 5 Prometheus Kubernetes manifests
        ├── _helpers.tpl
        ├── prometheus-statefulset.yaml
        ├── prometheus-service.yaml
        ├── prometheus-configmap.yaml
        ├── prometheus-alert-rules.yaml
        └── rbac.yaml
```

---

## 🚀 Deployment

### Prerequisites
- Kubernetes 1.18+ cluster running
- kubectl configured with cluster access
- Helm 3.x installed

### Installation
```bash
# Create namespace and deploy
helm install monitoring helm/monitoring -n monitoring --create-namespace

# Verify deployment
kubectl get pods -n monitoring
kubectl get svc -n monitoring
```

### Verify Installation
```bash
# Check all resources
kubectl get all -n monitoring

# Wait for all pods to be Running
kubectl get pods -n monitoring --watch

# Check PersistentVolumes
kubectl get pvc -n monitoring

# Check services with external IPs
kubectl get svc -n monitoring -o wide
```

---

## 📖 Documentation

### Chart Documentation
1. **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - Overview of the new monitoring structure
2. **[grafana/README.md](./grafana/README.md)** - Grafana sub-chart documentation
3. **[prometheus/README.md](./prometheus/README.md)** - Prometheus sub-chart documentation

---

## ✨ Pre-Configured Features

### Grafana
- ✅ Prometheus datasource auto-configured
- ✅ 3 pre-imported dashboards:
  - SOAI Docker & System Monitoring
  - SOAI cAdvisor Exporter
  - Node Exporter Full
- ✅ Admin credentials: admin / admin@123
- ✅ Auto-update interval: 30 seconds

### Prometheus
- ✅ Scrape interval: 15 seconds
- ✅ Alert rules configured
- ✅ Scrape targets: Prometheus, Node Exporter, Grafana
- ✅ AlertManager integration

### AlertManager
- ✅ Configured to receive alerts from Prometheus
- ✅ Ready for notification routing
- ✅ Customizable alert rules

### Node Exporter
- ✅ Runs as DaemonSet (one per node)
- ✅ Collects system metrics
- ✅ Accessible from Prometheus

---

## 💾 Storage

| Component | Storage | Size | Type |
|-----------|---------|------|------|
| Grafana | grafana-pvc | 5Gi | PersistentVolumeClaim |
| Prometheus | prometheus-pvc | 10Gi | PersistentVolumeClaim |

All data persists across pod restarts. Modify sizes in `values.yaml` if needed.

---

## 🔐 Security

- ✅ ServiceAccount with minimal required permissions
- ✅ RBAC configured for monitoring namespace
- ✅ Pod security considerations
- ✅ Network policies ready (customize as needed)

---

## 🛠️ Common Tasks

### Update Configuration
```bash
# Edit configuration
nano helm/monitoring/values.yaml

# Apply changes
helm upgrade monitoring helm/monitoring -n monitoring
```

### View Logs
```bash
# Grafana logs
kubectl logs -f deployment/grafana -n monitoring

# Prometheus logs
kubectl logs -f deployment/prometheus -n monitoring

# AlertManager logs
kubectl logs -f deployment/alertmanager -n monitoring
```

### Restart Components
```bash
# Restart Grafana
kubectl rollout restart deployment/grafana -n monitoring

# Restart Prometheus
kubectl rollout restart deployment/prometheus -n monitoring
```

### Uninstall
```bash
helm uninstall monitoring -n monitoring
```

---

## 🧪 Verification Checklist

- [ ] All pods are Running: `kubectl get pods -n monitoring`
- [ ] Services are created: `kubectl get svc -n monitoring`
- [ ] External IPs assigned: `kubectl get svc -n monitoring -o wide`
- [ ] PVCs are Bound: `kubectl get pvc -n monitoring`
- [ ] Can access Grafana: http://172.26.217.215:3000
- [ ] Can login to Grafana: admin / admin@123
- [ ] Dashboards are visible in Grafana
- [ ] Prometheus datasource is configured
- [ ] Prometheus scraping targets: http://172.26.217.215:9090/targets
- [ ] Metrics are being collected

---

## 📊 Grafana Dashboards

### Pre-Imported Dashboards
1. **SOAI Docker and System Monitoring**
   - Docker container metrics
   - System resource usage
   - Network statistics

2. **SOAI cAdvisor Exporter**
   - Container metrics
   - Resource limits
   - Performance data

3. **Node Exporter Full**
   - System metrics
   - CPU, Memory, Disk
   - Network interfaces

### Create Custom Dashboard
1. Access Grafana: http://172.26.217.215:3000
2. Click "+" → "Dashboard"
3. Add panels using Prometheus queries
4. Save and customize

---

## 📈 Prometheus Queries

### Common PromQL Examples
```promql
# System uptime
up{job="prometheus"}

# CPU usage
node_cpu_seconds_total

# Memory usage
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes

# Container memory
container_memory_usage_bytes

# Request rate
rate(http_requests_total[5m])
```

---

## 🚨 Alert Rules

Alert rules are pre-configured in Prometheus templates and automatically loaded. Customize alerts by:
1. Editing `helm/monitoring/prometheus/templates/prometheus-alert-rules.yaml`
2. Updating the Helm values in `helm/monitoring/prometheus/values.yaml`
3. Redeploying: `helm upgrade monitoring helm/monitoring -n monitoring`

---

## 🔧 Troubleshooting

### Pods Not Starting
```bash
# Check pod status
kubectl describe pod <pod-name> -n monitoring

# Check logs
kubectl logs <pod-name> -n monitoring
```

### External IP Not Assigned
```bash
# Check LoadBalancer status
kubectl describe svc grafana -n monitoring

# Wait for external IP assignment
kubectl get svc -n monitoring -w
```

### Can't Access Services
```bash
# Verify service exists
kubectl get svc grafana -n monitoring

# Check if pod is running
kubectl get pods -n monitoring

# Test network connectivity
ping 172.26.217.215
curl http://172.26.217.215:3000
```

### Dashboards Not Loading
```bash
# Restart Grafana
kubectl rollout restart deployment/grafana -n monitoring

# Check Grafana logs
kubectl logs -f deployment/grafana -n monitoring | grep dashboard
```

---

## 📚 Additional Resources

- **Grafana Documentation**: https://grafana.com/docs/
- **Prometheus Documentation**: https://prometheus.io/docs/
- **Helm Documentation**: https://helm.sh/docs/
- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **AlertManager Documentation**: https://prometheus.io/docs/alerting/latest/

---

## 🤝 Contributing

To customize or extend this setup:

1. **Modify root values**: Edit `helm/monitoring/values.yaml`
2. **Modify Grafana**: Edit `helm/monitoring/grafana/` (values, templates, dashboards)
3. **Modify Prometheus**: Edit `helm/monitoring/prometheus/` (values, templates, alert rules)
4. **Add dashboards**: Add JSON files to `helm/monitoring/grafana/dashboards/`
5. **Redeploy**: `helm upgrade monitoring helm/monitoring -n monitoring`

---

## 📋 Checklist: First 5 Minutes

- [ ] Read [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) (2 minutes)
- [ ] Deploy chart: `helm install monitoring helm/monitoring -n monitoring` (1 minute)
- [ ] Get external IP: `kubectl get svc -n monitoring -o wide` (30 seconds)
- [ ] Access Grafana: http://172.26.217.215:3000 (30 seconds)
- [ ] View dashboard (1 minute)

---

## 📝 License

This Helm chart is provided as-is. Modify and use as needed for your environment.

---

## 📞 Support

For issues or questions:
1. Check [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) for structure overview
2. Review component-specific READMEs: [grafana/README.md](./grafana/README.md) or [prometheus/README.md](./prometheus/README.md)
3. Check pod logs: `kubectl logs -f deployment/grafana -n monitoring`
4. Verify all components: `kubectl get all -n monitoring`

---

**Last Updated**: 2025-12-04  
**Status**: ✅ Ready to deploy  
**Version**: 1.0.0  

🎉 **Your Kubernetes monitoring stack is ready to go!**
