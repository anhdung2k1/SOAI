# 🚀 Kubernetes Monitoring Stack - Getting Started Guide

**Status**: ✅ **Deployment Complete and Verified**

All components are running and auto-provisioned with **LoadBalancer** external access!

---

## 📋 Quick Start (TL;DR)

```bash
# 1. Get the External IP
kubectl get svc -n monitoring -o wide

# 2. Open in browser (use EXTERNAL-IP from service)
http://172.26.217.215:3000        # Grafana
http://172.26.217.215:9090        # Prometheus

# 3. Login to Grafana
Username: admin
Password: admin@123
```

---

## 🌐 Access Your Services

Your Kubernetes cluster has:

| Component | Purpose | External URL |
|-----------|---------|--------------|
| **Grafana** | Visualization & dashboards | http://172.26.217.215:3000 |
| **Prometheus** | Metrics collection & storage | http://172.26.217.215:9090 |
| **AlertManager** | Alert routing & notifications | ClusterIP only |
| **Node Exporter** | System metrics collection | Automatic |

**All components are auto-configured and ready to use!**

---

## ✨ What's Pre-Configured

✅ **Grafana Datasources**
- Prometheus automatically configured as default datasource

✅ **Grafana Dashboards** (Auto-imported)
- SOAI Docker & System Monitoring
- SOAI cAdvisor Exporter
- Node Exporter Full Dashboard

✅ **Prometheus** 
- Scrape targets configured (Prometheus, Node Exporter, Grafana)
- Alert rules loaded and active

✅ **Storage**
- Grafana: 5Gi persistent storage
- Prometheus: 10Gi persistent storage
- All data persists across pod restarts

✅ **External Access**
- Grafana: LoadBalancer with external IP
- Prometheus: LoadBalancer with external IP

---

## 🌐 Connect to Services

### Step 1: Get External IP

```bash
kubectl get svc -n monitoring -o wide
```

Expected output:
```
NAME            TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)
grafana         LoadBalancer   10.43.127.205   172.26.217.215   3000:32143/TCP
prometheus      LoadBalancer   10.43.216.222   172.26.217.215   9090:31187/TCP
alertmanager    ClusterIP      10.43.71.152    <none>           9093/TCP
node-exporter   ClusterIP      10.43.104.92    <none>           9100/TCP
```

### Step 2: Access Grafana

**URL:** `http://172.26.217.215:3000`

1. Open browser
2. Login with credentials:
   - Username: `admin`
   - Password: `admin@123`
3. View pre-imported dashboards

### Step 3: Access Prometheus

**URL:** `http://172.26.217.215:9090`

1. Open browser
2. View metrics and scrape targets
3. Query with PromQL

---

## 📊 Service Types

| Service | Type | Access | External IP |
|---------|------|--------|------------|
| Grafana | LoadBalancer | External + Internal | Yes |
| Prometheus | LoadBalancer | External + Internal | Yes |
| AlertManager | ClusterIP | Internal only | No |
| Node Exporter | ClusterIP | Internal only | No |

---

## 📋 Verify Services

### Check All Services
```bash
kubectl get svc -n monitoring
```

### Check Specific External IP
```bash
# Grafana
kubectl get svc grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Prometheus
kubectl get svc prometheus -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

### Test Connectivity
```bash
# Grafana health
curl http://172.26.217.215:3000/api/health

# Prometheus health
curl http://172.26.217.215:9090/-/healthy
```

---

## 🔄 Modify Configuration

### Change Service Type

To use ClusterIP (internal only) or NodePort instead:

1. Edit values.yaml:
```bash
nano helm-chart/monitoring/values.yaml
```

2. Modify service type:
```yaml
prometheus:
  service:
    type: LoadBalancer  # Change to: ClusterIP, NodePort, or ExternalName
    port: 9090

grafana:
  service:
    type: LoadBalancer  # Change to: ClusterIP, NodePort, or ExternalName
    port: 3000
```

3. Apply changes:
```bash
helm upgrade monitoring monitoring -n monitoring
```

### Change Port

```yaml
prometheus:
  service:
    type: LoadBalancer
    port: 9091  # Change from 9090

grafana:
  service:
    type: LoadBalancer
    port: 8080  # Change from 3000
```

Then upgrade:
```bash
helm upgrade monitoring monitoring -n monitoring
```

### Change Credentials

```yaml
grafana:
  adminUser: myuser
  adminPassword: mypassword
```

Then upgrade:
```bash
helm upgrade monitoring monitoring -n monitoring
```

---

## 🔐 Default Credentials

| Service | Username | Password |
|---------|----------|----------|
| Grafana | admin | admin@123 |
| Prometheus | (no auth) | (no auth) |
| AlertManager | (no auth) | (no auth) |

---

## 🛠️ Common Commands

### Check Deployment Status
```bash
# All resources
kubectl get all -n monitoring

# Only pods
kubectl get pods -n monitoring

# Services with external IPs
kubectl get svc -n monitoring -o wide

# Storage
kubectl get pvc -n monitoring
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

### Manage Deployment
```bash
# Check status
helm status monitoring -n monitoring

# Upgrade configuration
helm upgrade monitoring monitoring -n monitoring

# Uninstall
helm uninstall monitoring -n monitoring

# Reinstall
helm install monitoring monitoring -n monitoring
```

---

## 🆘 Troubleshooting

### External IP is `<pending>`

The LoadBalancer hasn't been assigned an IP yet. This is normal - wait a moment:

```bash
# Watch for external IP assignment
kubectl get svc -n monitoring -w

# Check service events
kubectl describe svc grafana -n monitoring
```

### Can't Connect to External IP

```bash
# Verify service is running
kubectl get svc grafana -n monitoring

# Check pod status
kubectl get pods -n monitoring

# Test network connectivity
ping 172.26.217.215
curl http://172.26.217.215:3000

# Check firewall
# Ensure port 3000 and 9090 are open
```

### Dashboards Not Showing

```bash
# Restart Grafana
kubectl rollout restart deployment/grafana -n monitoring

# Check logs
kubectl logs -f deployment/grafana -n monitoring | grep -i dashboard
```

### Prometheus Not Collecting Metrics

```bash
# Check targets at Prometheus UI
http://172.26.217.215:9090/targets

# Or from CLI
kubectl exec -it deployment/prometheus -n monitoring -- curl http://localhost:9090/api/v1/targets
```

---

## 📚 Using Grafana

### View Auto-Imported Dashboards
1. Open: http://172.26.217.215:3000
2. Login: admin / admin@123
3. Click "Dashboards" in left sidebar
4. Browse available dashboards:
   - SOAI Docker and System Monitoring
   - SOAI cAdvisor Exporter
   - Node Exporter Full

### Create Custom Dashboard
1. Click "+" → "Dashboard"
2. Add panels using Prometheus datasource (pre-configured)
3. Use PromQL queries to visualize metrics

### Check Prometheus Datasource
1. Go to Settings → Data sources
2. Verify "Prometheus" is configured at `http://prometheus.monitoring.svc.cluster.local:9090`

---

## 📈 Using Prometheus

### View Scrape Targets
1. Go to http://172.26.217.215:9090/targets
2. See all configured scrape targets:
   - Prometheus (self-monitoring)
   - Node Exporter (system metrics)
   - Grafana (metrics)

### Query Metrics
1. Go to http://172.26.217.215:9090/graph
2. Enter PromQL query, e.g.:
   ```
   node_cpu_seconds_total
   container_memory_usage_bytes
   up
   ```
3. Click "Execute" to view metrics

### Common PromQL Queries
```promql
# System uptime
up{job="prometheus"}

# CPU usage
node_cpu_seconds_total

# Memory usage
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes

# Requests per second
rate(http_requests_total[1m])
```

---

## 🚨 Using AlertManager

### Access AlertManager
AlertManager is ClusterIP only. To access from within the cluster:

```bash
# From within cluster
kubectl exec -it deployment/grafana -n monitoring -- curl http://alertmanager:9093
```

### View Alerts
1. Open Grafana: http://172.26.217.215:3000
2. Navigate to Alerting → Alert Rules
3. See all active alerts configured in Prometheus
4. Alert rules are loaded from `prometheus-lab/alert.rules.yml`

### Configure Notifications
Edit `helm-chart/monitoring/alert-manager/alertmanager.yml` to configure:
- Slack notifications
- Email notifications
- PagerDuty integration
- Custom webhooks

Then upgrade:
```bash
helm upgrade monitoring monitoring -n monitoring
```

---

## 📦 Helm Chart Commands

### View Chart Values
```bash
cd helm-chart
helm show values monitoring
```

### Upgrade Configuration
```bash
cd helm-chart
# Edit values.yaml
nano monitoring/values.yaml

# Apply changes
helm upgrade monitoring monitoring -n monitoring
```

### Reinstall Stack
```bash
# Uninstall
helm uninstall monitoring -n monitoring

# Reinstall
cd helm-chart
helm install monitoring monitoring -n monitoring
```

### View Deployment Status
```bash
helm status monitoring -n monitoring
```

### Get Deployment History
```bash
helm history monitoring -n monitoring
```

---

## 📚 File Structure

```
helm-chart/
├── monitoring/                          # Helm chart
│   ├── Chart.yaml                       # Chart metadata
│   ├── values.yaml                      # Configuration
│   ├── templates/
│   │   ├── configmaps/                  # Config files
│   │   ├── deployments/                 # Pod definitions
│   │   ├── daemonsets/                  # Node Exporter
│   │   ├── services/                    # Network access
│   │   ├── rbac/                        # Security
│   │   └── pvc.yaml                     # Storage
│   ├── dashboards/                      # Dashboard JSONs
│   ├── alert-rules/                     # Prometheus alerts
│   └── alert-manager/                   # Alert configuration
├── GETTING-STARTED.md                   # This file
├── README.md                            # Project overview
```
---

## 🎯 Next Steps

1. **Get External IP:**
   ```bash
   kubectl get svc -n monitoring -o wide
   ```

2. **Access Grafana:**
   ```
   http://<EXTERNAL-IP>:3000
   admin / admin@123
   ```

3. **Explore Dashboards:**
   - Click "Dashboards" in left sidebar
   - View pre-imported SOAI dashboards

4. **Query Prometheus:**
   ```
   http://<EXTERNAL-IP>:9090
   ```

5. **Customize (Optional):**
   - Edit `helm-chart/monitoring/values.yaml`
   - Run `helm upgrade monitoring monitoring -n monitoring`

---

## 📞 Need Help?

| Issue | Solution |
|-------|----------|
| Can't access services | Check external IP: `kubectl get svc -n monitoring -o wide` |
| External IP pending | Wait a moment for LoadBalancer to assign IP |
| Wrong credentials | Check values.yaml for admin credentials |
| Dashboards missing | Restart Grafana: `kubectl rollout restart deployment/grafana -n monitoring` |
| Prometheus not collecting | Check targets at: `http://<EXTERNAL-IP>:9090/targets` |