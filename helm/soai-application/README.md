# SOAI Application Helm Chart

This Helm chart deploys the **SOAI AI Agent System** consisting of modular microservices such as **Authentication**, **Recruitment**, **GenAI**, **Web**, and supporting infrastructure including **MySQL**, **Redis**, and **Consul**. This documentation provides a full description of all configurable Helm values and their default settings as defined in the `values.yaml` file.

---

## 📌 Global Configuration

| Key                                     | Type     | Description                            | Default           |
| --------------------------------------- | -------- | -------------------------------------- | ----------------- |
| `global.security.tls.enabled`           | `bool`   | Enable TLS for all services            | `true`            |
| `global.security.tls.duration`          | `string` | Certificate validity duration          | `2160h`           |
| `global.security.tls.renewBefore`       | `string` | Renewal threshold before expiration    | `360h`            |
| `global.security.issuer.name`           | `string` | cert-manager issuer name               | `ca-issuer`       |
| `global.security.issuer.kind`           | `string` | Issuer kind (`Issuer`/`ClusterIssuer`) | `Issuer`          |
| `global.security.issuer.group`          | `string` | cert-manager API group                 | `cert-manager.io` |
| `registry.url`                          | `string` | Docker registry URL                    | `anhdung12399`    |
| `registry.repoPath`                     | `string` | Repository path                        | `""`              |
| `timezone`                              | `string` | Container timezone                     | `UTC`             |
| `nodeSelector`                          | `object` | Pod scheduling selector                | `{}`              |
| `annotations`                           | `object` | Global annotations                     | `{}`              |
| `labels`                                | `object` | Global labels                          | `{}`              |
| `networkPolicy.enabled`                 | `bool`   | Enable NetworkPolicy                   | `false`           |
| `topologySpreadConstraints`             | `object` | Pod spread configuration               | `{}`              |
| `podSecurityContext.supplementalGroups` | `list`   | Extra Linux groups                     | `[]`              |
| `fsGroup.manual`                        | `int`    | Manual fsGroup                         | `null`            |
| `fsGroup.namespace`                     | `bool`   | Use namespace fsGroup value            | `null`            |

---

## 🔁 Update Strategy

| Key                   | Type     | Description                | Default         |
| --------------------- | -------- | -------------------------- | --------------- |
| `updateStrategy.type` | `string` | Deployment update strategy | `RollingUpdate` |

---

## 🧩 Server Components

Each microservice includes configuration for ports, replicas, probes, and service type.

### **MySQL Server**

| Key                               | Description     | Default        |
| --------------------------------- | --------------- | -------------- |
| `server.mysqlServer.name`         | Deployment name | `mysql-server` |
| `server.mysqlServer.replicaCount` | Replicas        | `1`            |
| `server.mysqlServer.port`         | Port            | `3306`         |

### **Redis**

| Key                         | Description | Default |
| --------------------------- | ----------- | ------- |
| `server.redis.name`         | Name        | `redis` |
| `server.redis.replicaCount` | Replicas    | `1`     |
| `server.redis.port`         | Port        | `6379`  |

### **Authentication Service**

| Key                                   | Description        | Default          |
| ------------------------------------- | ------------------ | ---------------- |
| `server.authentication.name`          | Name               | `authentication` |
| `server.authentication.replicaCount`  | Replicas           | `1`              |
| `server.authentication.serviceType`   | Service type       | `ClusterIP`      |
| `server.authentication.httpPort`      | HTTP port          | `9090`           |
| `server.authentication.httpsPort`     | HTTPS port         | `9443`           |
| `server.authentication.httpNodePort`  | NodePort (if used) | `30903`          |
| `server.authentication.httpsNodePort` | NodePort           | `30943`          |

### **Recruitment Service**

| Key                                | Description   | Default              |
| ---------------------------------- | ------------- | -------------------- |
| `server.recruitment.name`          | Name          | `recruitment`        |
| `server.recruitment.replicaCount`  | Replicas      | `1`                  |
| `server.recruitment.logLevel`      | Logging level | `INFO`              |
| `server.recruitment.serviceType`   | Service type  | `ClusterIP`          |
| `server.recruitment.httpPort`      | HTTP port     | `8003`               |
| `server.recruitment.httpsPort`     | HTTPS port    | `8433`               |
| `server.recruitment.httpNodePort`  | NodePort      | `30803`              |
| `server.recruitment.httpsNodePort` | NodePort      | `30833`              |
| `server.recruitment.worker.name`   | Worker name   | `recruitment-worker` |

### **GenAI Service**

| Key                          | Description  | Default     |
| ---------------------------- | ------------ | ----------- |
| `server.genai.name`          | Name         | `genai`     |
| `server.genai.replicaCount`  | Replicas     | `1`         |
| `server.genai.logLevel`      | Log level    | `INFO`     |
| `server.genai.serviceType`   | Service type | `ClusterIP` |
| `server.genai.httpPort`      | HTTP port    | `8004`      |
| `server.genai.httpsPort`     | HTTPS port   | `8434`      |
| `server.genai.httpNodePort`  | NodePort     | `30804`     |
| `server.genai.httpsNodePort` | NodePort     | `30834`     |

### **Web Frontend**

| Key                        | Description | Default        |
| -------------------------- | ----------- | -------------- |
| `server.web.name`          | Name        | `web`          |
| `server.web.replicaCount`  | Replicas    | `1`            |
| `server.web.serviceType`   | LB service  | `LoadBalancer` |
| `server.web.httpPort`      | HTTP port   | `8080`         |
| `server.web.httpsPort`     | HTTPS port  | `8443`         |
| `server.web.httpNodePort`  | NodePort    | `30800`        |
| `server.web.httpsNodePort` | NodePort    | `30844`        |

### **Consul**

| Key                          | Description    | Default  |
| ---------------------------- | -------------- | -------- |
| `server.consul.name`         | Name           | `consul` |
| `server.consul.replicaCount` | Replicas       | `1`      |
| `server.consul.serviceType`  | `LoadBalancer` |          |
| `server.consul.httpPort`     | Port           | `8500`   |
| `server.consul.httpNodePort` | NodePort       | `30500`  |

---

## ❤️ Health Probes

### **Readiness / Liveness Probes**

| Key                   | Default |
| --------------------- | ------- |
| `initialDelaySeconds` | `60`    |
| `periodSeconds`       | `60`    |
| `timeoutSeconds`      | `15`    |
| `successThreshold`    | `1`     |
| `failureThreshold`    | `5`     |

All microservices inherit these default probes unless overridden.

---

## ⚙️ Resource Allocation

| Component        | CPU Req | CPU Limit | Mem Req  | Mem Limit |
| ---------------- | ------- | --------- | -------- | --------- |
| `initcontainer`  | `50m`   | `1`       | `50Mi`   | `200Mi`   |
| `mysql`          | `500m`  | `2`       | `512Mi`  | `2048Mi`  |
| `authentication` | `500m`  | `2`       | `512Mi`  | `2048Mi`  |
| `recruitment`    | `1`     | `2`       | `1024Mi` | `4096Mi`  |
| `genai`          | `200m`  | `1`       | `512Mi`  | `2048Mi`  |
| `web`            | `100m`  | `200m`    | `50Mi`   | `100Mi`   |
| `consul`         | `100m`  | `200m`    | `256Mi`  | `512Mi`   |

---

## 🗄 Persistent Storage

| Key                                                    | Description               | Default                      |
| ------------------------------------------------------ | ------------------------- | ---------------------------- |
| `storage.enabled`                                      | Enable persistent storage | `true`                       |
| `storage.reclaimPolicy`                                | PV reclaim policy         | `Retain`                     |
| `storage.persistentVolume.enabled`                     | Enable manual PV          | `false`                      |
| `storage.persistentVolume.hostPath.mysql`              | Host path                 | `/mnt/soai/data-mysql`       |
| `storage.persistentVolume.hostPath.recruitment`        | Host path                 | `/mnt/soai/data-recruitment` |
| `storage.persistentVolume.storageCapacity.mysql`       | Capacity                  | `2Gi`                        |
| `storage.persistentVolume.storageCapacity.recruitment` | Capacity                  | `8Gi`                        |
| `storage.storageClass.enabled`                         | Use custom StorageClass   | `false`                      |
| `storage.storageClass.name`                            | Name                      | `local-storage`              |

---

## 🔑 Secrets & Credentials

| Key                     | Description       | Default                  |
| ----------------------- | ----------------- | ------------------------ |
| `password.dbUser`       | Database username | `soai_user`              |
| `password.dbPass`       | Database password | `soai_password`          |
| `password.keystorePass` | Keystore password | `soai_keystore_password` |

---

## 🤖 OpenAI Integration

| Key             | Description    | Default |
| --------------- | -------------- | ------- |
| `openai.apiKey` | OpenAI API Key | `""`    |

---

## 📍 Issuer Allowed IPs

| Key                | Description                | Default |
| ------------------ | -------------------------- | ------- |
| `issuer.ipAddress` | Whitelisted IPs for issuer | `[]`    |

---

## 📘 Notes

* All services share consistent readiness/liveness probe defaults.
* TLS configuration assumes a cert-manager `Issuer` named `ca-issuer`.
* Storage can be configured using PVs or the default cluster StorageClass.
* NodePorts apply only when `serviceType` is `NodePort` or `LoadBalancer`.
