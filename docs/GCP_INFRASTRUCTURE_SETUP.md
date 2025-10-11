# GCP Infrastructure Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the Google Cloud Platform (GCP) infrastructure for the HealthFlowEgy HCX platform across three environments: Development, Staging, and Production.

## Architecture Overview

### Environment Structure

```
GCP Project: hcx-healthflowegy
├── Development Environment (GKE Cluster: hcx-dev)
│   ├── Region: us-central1
│   ├── Node Pool: 2-4 nodes (n1-standard-2)
│   ├── Namespace: hcx-dev
│   └── Services: API Gateway, HCX APIs, HCX Onboard, PostgreSQL, Redis
│
├── Staging Environment (GKE Cluster: hcx-staging)
│   ├── Region: us-central1
│   ├── Node Pool: 2-4 nodes (n1-standard-4)
│   ├── Namespace: hcx-staging
│   └── Services: API Gateway, HCX APIs, HCX Onboard, PostgreSQL, Redis
│
└── Production Environment (GKE Cluster: hcx-prod)
    ├── Region: us-central1 (Primary), europe-west1 (DR)
    ├── Node Pool: 3-6 nodes (n1-standard-4)
    ├── Namespace: hcx-prod
    └── Services: API Gateway, HCX APIs, HCX Onboard, Cloud SQL, Memorystore
```

## Prerequisites

### 1. GCP Account Setup

- Google Cloud account with billing enabled
- Project created: `hcx-healthflowegy`
- Billing account linked
- Owner or Editor role assigned

### 2. Local Tools Installation

```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize gcloud
gcloud init

# Install kubectl
gcloud components install kubectl

# Install Terraform (optional, for IaC)
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

### 3. Enable Required APIs

```bash
# Set your project ID
export PROJECT_ID="hcx-healthflowegy"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  container.googleapis.com \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  cloudresourcemanager.googleapis.com \
  servicenetworking.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

## Cost Estimation

### Monthly Cost Breakdown (USD)

| Environment | GKE Cluster | Cloud SQL | Redis | Storage | Total/Month |
|-------------|-------------|-----------|-------|---------|-------------|
| Development | $150 | $50 | $30 | $20 | ~$250 |
| Staging | $250 | $100 | $50 | $30 | ~$430 |
| Production | $500 | $300 | $150 | $100 | ~$1,050 |
| **Total** | | | | | **~$1,730** |

**Notes**:
- Costs vary based on actual usage
- Use committed use discounts for production (up to 57% savings)
- Consider preemptible nodes for dev/staging (up to 80% savings)
- Enable autoscaling to optimize costs

## Step-by-Step Setup

### Phase 1: Network Setup

#### 1. Create VPC Network

```bash
# Create custom VPC
gcloud compute networks create hcx-vpc \
  --subnet-mode=custom \
  --bgp-routing-mode=regional

# Create subnets for each environment
gcloud compute networks subnets create hcx-dev-subnet \
  --network=hcx-vpc \
  --region=us-central1 \
  --range=10.0.0.0/20 \
  --secondary-range=hcx-dev-pods=10.4.0.0/14,hcx-dev-services=10.8.0.0/20

gcloud compute networks subnets create hcx-staging-subnet \
  --network=hcx-vpc \
  --region=us-central1 \
  --range=10.16.0.0/20 \
  --secondary-range=hcx-staging-pods=10.20.0.0/14,hcx-staging-services=10.24.0.0/20

gcloud compute networks subnets create hcx-prod-subnet \
  --network=hcx-vpc \
  --region=us-central1 \
  --range=10.32.0.0/20 \
  --secondary-range=hcx-prod-pods=10.36.0.0/14,hcx-prod-services=10.40.0.0/20
```

#### 2. Configure Firewall Rules

```bash
# Allow internal communication
gcloud compute firewall-rules create hcx-allow-internal \
  --network=hcx-vpc \
  --allow=tcp,udp,icmp \
  --source-ranges=10.0.0.0/8

# Allow SSH for debugging
gcloud compute firewall-rules create hcx-allow-ssh \
  --network=hcx-vpc \
  --allow=tcp:22 \
  --source-ranges=0.0.0.0/0

# Allow health checks
gcloud compute firewall-rules create hcx-allow-health-checks \
  --network=hcx-vpc \
  --allow=tcp \
  --source-ranges=35.191.0.0/16,130.211.0.0/22
```

### Phase 2: Development Environment

#### 1. Create Development GKE Cluster

```bash
gcloud container clusters create hcx-dev \
  --region=us-central1 \
  --network=hcx-vpc \
  --subnetwork=hcx-dev-subnet \
  --cluster-secondary-range-name=hcx-dev-pods \
  --services-secondary-range-name=hcx-dev-services \
  --enable-ip-alias \
  --enable-autoscaling \
  --min-nodes=2 \
  --max-nodes=4 \
  --num-nodes=2 \
  --machine-type=n1-standard-2 \
  --disk-size=50 \
  --disk-type=pd-standard \
  --enable-autorepair \
  --enable-autoupgrade \
  --maintenance-window-start=2024-01-01T00:00:00Z \
  --maintenance-window-duration=4h \
  --addons=HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver \
  --workload-pool=$PROJECT_ID.svc.id.goog \
  --enable-stackdriver-kubernetes \
  --logging=SYSTEM,WORKLOAD \
  --monitoring=SYSTEM
```

#### 2. Get Credentials

```bash
gcloud container clusters get-credentials hcx-dev --region=us-central1
```

#### 3. Create Namespace

```bash
kubectl create namespace hcx-dev
kubectl config set-context --current --namespace=hcx-dev
```

#### 4. Deploy PostgreSQL (Development)

```bash
# Create persistent volume claim
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: hcx-dev
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
EOF

# Deploy PostgreSQL
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: hcx-dev
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: hcx_dev
        - name: POSTGRES_USER
          value: hcx_user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: hcx-dev
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
EOF

# Create secret
kubectl create secret generic postgres-secret \
  --from-literal=password='dev_password_change_me' \
  -n hcx-dev
```

#### 5. Deploy Redis (Development)

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: hcx-dev
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        command: ["redis-server"]
        args: ["--requirepass", "$(REDIS_PASSWORD)"]
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: password
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: hcx-dev
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
  type: ClusterIP
EOF

# Create secret
kubectl create secret generic redis-secret \
  --from-literal=password='dev_redis_password' \
  -n hcx-dev
```

#### 6. Export Development Kubeconfig

```bash
# Get the kubeconfig for development
kubectl config view --minify --flatten > /tmp/kubeconfig-dev.yaml

# Encode to base64 for GitHub secret
cat /tmp/kubeconfig-dev.yaml | base64 -w 0 > /tmp/kubeconfig-dev-base64.txt

echo "Development kubeconfig (base64) saved to: /tmp/kubeconfig-dev-base64.txt"
```

### Phase 3: Staging Environment

#### 1. Create Staging GKE Cluster

```bash
gcloud container clusters create hcx-staging \
  --region=us-central1 \
  --network=hcx-vpc \
  --subnetwork=hcx-staging-subnet \
  --cluster-secondary-range-name=hcx-staging-pods \
  --services-secondary-range-name=hcx-staging-services \
  --enable-ip-alias \
  --enable-autoscaling \
  --min-nodes=2 \
  --max-nodes=4 \
  --num-nodes=2 \
  --machine-type=n1-standard-4 \
  --disk-size=100 \
  --disk-type=pd-ssd \
  --enable-autorepair \
  --enable-autoupgrade \
  --addons=HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver \
  --workload-pool=$PROJECT_ID.svc.id.goog \
  --enable-stackdriver-kubernetes \
  --logging=SYSTEM,WORKLOAD \
  --monitoring=SYSTEM
```

#### 2. Setup Staging Database (Cloud SQL)

```bash
# Create Cloud SQL instance for staging
gcloud sql instances create hcx-staging-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-7680 \
  --region=us-central1 \
  --network=hcx-vpc \
  --no-assign-ip \
  --storage-type=SSD \
  --storage-size=50GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --enable-bin-log \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=4

# Create database
gcloud sql databases create hcx_staging \
  --instance=hcx-staging-db

# Create user
gcloud sql users create hcx_user \
  --instance=hcx-staging-db \
  --password='staging_password_change_me'
```

#### 3. Setup Staging Redis (Memorystore)

```bash
gcloud redis instances create hcx-staging-redis \
  --size=5 \
  --region=us-central1 \
  --network=hcx-vpc \
  --tier=standard \
  --redis-version=redis_7_0
```

#### 4. Get Staging Credentials

```bash
gcloud container clusters get-credentials hcx-staging --region=us-central1
kubectl create namespace hcx-staging

# Export kubeconfig
kubectl config view --minify --flatten > /tmp/kubeconfig-staging.yaml
cat /tmp/kubeconfig-staging.yaml | base64 -w 0 > /tmp/kubeconfig-staging-base64.txt
```

### Phase 4: Production Environment

#### 1. Create Production GKE Cluster

```bash
gcloud container clusters create hcx-prod \
  --region=us-central1 \
  --network=hcx-vpc \
  --subnetwork=hcx-prod-subnet \
  --cluster-secondary-range-name=hcx-prod-pods \
  --services-secondary-range-name=hcx-prod-services \
  --enable-ip-alias \
  --enable-autoscaling \
  --min-nodes=3 \
  --max-nodes=10 \
  --num-nodes=3 \
  --machine-type=n1-standard-4 \
  --disk-size=100 \
  --disk-type=pd-ssd \
  --enable-autorepair \
  --enable-autoupgrade \
  --addons=HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver \
  --workload-pool=$PROJECT_ID.svc.id.goog \
  --enable-stackdriver-kubernetes \
  --logging=SYSTEM,WORKLOAD \
  --monitoring=SYSTEM \
  --enable-cloud-logging \
  --enable-cloud-monitoring \
  --maintenance-window-start=2024-01-01T02:00:00Z \
  --maintenance-window-duration=4h
```

#### 2. Setup Production Database (Cloud SQL with HA)

```bash
# Create Cloud SQL instance with high availability
gcloud sql instances create hcx-prod-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-4-15360 \
  --region=us-central1 \
  --network=hcx-vpc \
  --no-assign-ip \
  --storage-type=SSD \
  --storage-size=100GB \
  --storage-auto-increase \
  --availability-type=REGIONAL \
  --backup-start-time=02:00 \
  --enable-bin-log \
  --enable-point-in-time-recovery \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=3

# Create database
gcloud sql databases create hcx_production \
  --instance=hcx-prod-db

# Create user
gcloud sql users create hcx_user \
  --instance=hcx-prod-db \
  --password='STRONG_PRODUCTION_PASSWORD_CHANGE_ME'
```

#### 3. Setup Production Redis (Memorystore with HA)

```bash
gcloud redis instances create hcx-prod-redis \
  --size=10 \
  --region=us-central1 \
  --network=hcx-vpc \
  --tier=standard \
  --redis-version=redis_7_0 \
  --replica-count=1 \
  --read-replicas-mode=READ_REPLICAS_ENABLED
```

#### 4. Get Production Credentials

```bash
gcloud container clusters get-credentials hcx-prod --region=us-central1
kubectl create namespace hcx-prod

# Export kubeconfig
kubectl config view --minify --flatten > /tmp/kubeconfig-prod.yaml
cat /tmp/kubeconfig-prod.yaml | base64 -w 0 > /tmp/kubeconfig-prod-base64.txt
```

### Phase 5: Configure GitHub Secrets

#### 1. Add Kubeconfig Secrets

```bash
# Using GitHub CLI
gh secret set KUBE_CONFIG_DEV < /tmp/kubeconfig-dev-base64.txt
gh secret set KUBE_CONFIG_STAGING < /tmp/kubeconfig-staging-base64.txt
gh secret set KUBE_CONFIG_PROD < /tmp/kubeconfig-prod-base64.txt
```

#### 2. Add Database Secrets

```bash
# Development
gh secret set DB_HOST_DEV --body "postgres.hcx-dev.svc.cluster.local"
gh secret set DB_PASSWORD_DEV --body "dev_password_change_me"

# Staging (Cloud SQL)
STAGING_DB_IP=$(gcloud sql instances describe hcx-staging-db --format="value(ipAddresses[0].ipAddress)")
gh secret set DB_HOST_STAGING --body "$STAGING_DB_IP"
gh secret set DB_PASSWORD_STAGING --body "staging_password_change_me"

# Production (Cloud SQL)
PROD_DB_IP=$(gcloud sql instances describe hcx-prod-db --format="value(ipAddresses[0].ipAddress)")
gh secret set DB_HOST_PROD --body "$PROD_DB_IP"
gh secret set DB_PASSWORD_PROD --body "STRONG_PRODUCTION_PASSWORD_CHANGE_ME"
```

#### 3. Add Redis Secrets

```bash
# Development
gh secret set REDIS_HOST_DEV --body "redis.hcx-dev.svc.cluster.local"
gh secret set REDIS_PASSWORD_DEV --body "dev_redis_password"

# Staging (Memorystore)
STAGING_REDIS_IP=$(gcloud redis instances describe hcx-staging-redis --region=us-central1 --format="value(host)")
gh secret set REDIS_HOST_STAGING --body "$STAGING_REDIS_IP"

# Production (Memorystore)
PROD_REDIS_IP=$(gcloud redis instances describe hcx-prod-redis --region=us-central1 --format="value(host)")
gh secret set REDIS_HOST_PROD --body "$PROD_REDIS_IP"
```

## Kubernetes Manifests

Create the Kubernetes deployment manifests in the repository:

### Directory Structure

```
infrastructure/
└── kubernetes/
    ├── base/
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── configmap.yaml
    │   └── kustomization.yaml
    └── overlays/
        ├── development/
        │   ├── kustomization.yaml
        │   └── patches/
        ├── staging/
        │   ├── kustomization.yaml
        │   └── patches/
        └── production/
            ├── kustomization.yaml
            └── patches/
```

## Monitoring and Logging

### 1. Enable Cloud Monitoring

```bash
# Create monitoring workspace
gcloud monitoring workspaces create \
  --project=$PROJECT_ID

# Create uptime checks
gcloud monitoring uptime create hcx-dev-uptime \
  --display-name="HCX Dev Health Check" \
  --resource-type=uptime-url \
  --monitored-resource=https://dev.hcx.healthflowegy.com/health
```

### 2. Setup Logging

```bash
# Create log sink for errors
gcloud logging sinks create hcx-error-logs \
  storage.googleapis.com/hcx-logs-bucket \
  --log-filter='severity>=ERROR'
```

## Security Best Practices

### 1. Enable Binary Authorization

```bash
gcloud container binauthz policy import policy.yaml
```

### 2. Configure Workload Identity

```bash
# Enable Workload Identity on cluster
gcloud container clusters update hcx-prod \
  --workload-pool=$PROJECT_ID.svc.id.goog \
  --region=us-central1
```

### 3. Setup Secret Manager

```bash
# Create secrets in Secret Manager
echo -n "production-db-password" | \
  gcloud secrets create hcx-prod-db-password \
  --data-file=-
```

## Backup and Disaster Recovery

### 1. Database Backups

```bash
# Automated backups are enabled by default
# Manual backup
gcloud sql backups create \
  --instance=hcx-prod-db
```

### 2. Cluster Backups

```bash
# Install Velero for cluster backups
kubectl apply -f https://github.com/vmware-tanzu/velero/releases/download/v1.12.0/velero-v1.12.0-linux-amd64.tar.gz
```

## Cost Optimization

### 1. Enable Autoscaling

```bash
# Already enabled in cluster creation
# Verify autoscaling
gcloud container clusters describe hcx-prod \
  --region=us-central1 \
  --format="value(autoscaling)"
```

### 2. Use Committed Use Discounts

```bash
# Purchase 1-year or 3-year commitments for production
# Can save up to 57% on compute costs
```

### 3. Enable Preemptible Nodes (Dev/Staging)

```bash
# Add preemptible node pool to dev cluster
gcloud container node-pools create preemptible-pool \
  --cluster=hcx-dev \
  --region=us-central1 \
  --machine-type=n1-standard-2 \
  --preemptible \
  --num-nodes=2
```

## Verification

### 1. Verify Clusters

```bash
gcloud container clusters list
kubectl get nodes
kubectl get namespaces
```

### 2. Verify Databases

```bash
gcloud sql instances list
gcloud redis instances list
```

### 3. Test Connectivity

```bash
kubectl run test-pod --image=postgres:15-alpine --rm -it -- psql -h postgres.hcx-dev.svc.cluster.local -U hcx_user -d hcx_dev
```

## Troubleshooting

### Common Issues

1. **Cluster creation fails**: Check quotas and API enablement
2. **Database connection fails**: Verify VPC peering and firewall rules
3. **Pod scheduling fails**: Check node resources and taints

## Next Steps

1. ✅ Complete infrastructure setup
2. ✅ Configure GitHub secrets
3. ✅ Deploy applications using CI/CD
4. ✅ Configure DNS and SSL certificates
5. ✅ Setup monitoring and alerting
6. ✅ Perform load testing
7. ✅ Document runbooks

---

**Setup Time**: 2-4 hours  
**Cost**: ~$1,730/month  
**Maintenance**: Automated updates enabled  
**Support**: GCP support available

