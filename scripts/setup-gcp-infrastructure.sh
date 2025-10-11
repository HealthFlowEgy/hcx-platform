#!/bin/bash
set -e

# GCP Infrastructure Setup Script for HCX Platform
# This script automates the creation of GCP infrastructure for dev, staging, and production

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${PROJECT_ID:-hcx-healthflowegy}"
REGION="${REGION:-us-central1}"
ENVIRONMENT="${1:-all}"  # dev, staging, prod, or all

echo -e "${BLUE}======================================"
echo "HCX Platform GCP Infrastructure Setup"
echo "======================================${NC}"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Environment: $ENVIRONMENT"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command_exists gcloud; then
    echo -e "${RED}Error: gcloud CLI not found. Please install Google Cloud SDK.${NC}"
    exit 1
fi

if ! command_exists kubectl; then
    echo -e "${YELLOW}Warning: kubectl not found. Installing...${NC}"
    gcloud components install kubectl
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Set project
echo -e "${BLUE}Setting GCP project...${NC}"
gcloud config set project $PROJECT_ID
echo -e "${GREEN}✓ Project set to $PROJECT_ID${NC}"
echo ""

# Enable required APIs
echo -e "${BLUE}Enabling required GCP APIs...${NC}"
gcloud services enable \
  container.googleapis.com \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  cloudresourcemanager.googleapis.com \
  servicenetworking.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com

echo -e "${GREEN}✓ APIs enabled${NC}"
echo ""

# Create VPC if it doesn't exist
echo -e "${BLUE}Setting up VPC network...${NC}"
if ! gcloud compute networks describe hcx-vpc &>/dev/null; then
    gcloud compute networks create hcx-vpc \
      --subnet-mode=custom \
      --bgp-routing-mode=regional
    echo -e "${GREEN}✓ VPC created${NC}"
else
    echo -e "${YELLOW}VPC already exists, skipping...${NC}"
fi
echo ""

# Function to create subnet
create_subnet() {
    local env=$1
    local subnet_range=$2
    local pods_range=$3
    local services_range=$4
    
    echo -e "${BLUE}Creating subnet for $env...${NC}"
    if ! gcloud compute networks subnets describe hcx-$env-subnet --region=$REGION &>/dev/null; then
        gcloud compute networks subnets create hcx-$env-subnet \
          --network=hcx-vpc \
          --region=$REGION \
          --range=$subnet_range \
          --secondary-range=hcx-$env-pods=$pods_range,hcx-$env-services=$services_range
        echo -e "${GREEN}✓ Subnet created for $env${NC}"
    else
        echo -e "${YELLOW}Subnet already exists for $env, skipping...${NC}"
    fi
}

# Create subnets
if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "dev" ]; then
    create_subnet "dev" "10.0.0.0/20" "10.4.0.0/14" "10.8.0.0/20"
fi

if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "staging" ]; then
    create_subnet "staging" "10.16.0.0/20" "10.20.0.0/14" "10.24.0.0/20"
fi

if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "prod" ]; then
    create_subnet "prod" "10.32.0.0/20" "10.36.0.0/14" "10.40.0.0/20"
fi

echo ""

# Create firewall rules
echo -e "${BLUE}Setting up firewall rules...${NC}"
if ! gcloud compute firewall-rules describe hcx-allow-internal &>/dev/null; then
    gcloud compute firewall-rules create hcx-allow-internal \
      --network=hcx-vpc \
      --allow=tcp,udp,icmp \
      --source-ranges=10.0.0.0/8
    echo -e "${GREEN}✓ Internal firewall rule created${NC}"
fi

if ! gcloud compute firewall-rules describe hcx-allow-health-checks &>/dev/null; then
    gcloud compute firewall-rules create hcx-allow-health-checks \
      --network=hcx-vpc \
      --allow=tcp \
      --source-ranges=35.191.0.0/16,130.211.0.0/22
    echo -e "${GREEN}✓ Health check firewall rule created${NC}"
fi
echo ""

# Function to create GKE cluster
create_gke_cluster() {
    local env=$1
    local machine_type=$2
    local min_nodes=$3
    local max_nodes=$4
    local disk_size=$5
    local disk_type=$6
    
    echo -e "${BLUE}Creating GKE cluster for $env...${NC}"
    if ! gcloud container clusters describe hcx-$env --region=$REGION &>/dev/null; then
        gcloud container clusters create hcx-$env \
          --region=$REGION \
          --network=hcx-vpc \
          --subnetwork=hcx-$env-subnet \
          --cluster-secondary-range-name=hcx-$env-pods \
          --services-secondary-range-name=hcx-$env-services \
          --enable-ip-alias \
          --enable-autoscaling \
          --min-nodes=$min_nodes \
          --max-nodes=$max_nodes \
          --num-nodes=$min_nodes \
          --machine-type=$machine_type \
          --disk-size=$disk_size \
          --disk-type=$disk_type \
          --enable-autorepair \
          --enable-autoupgrade \
          --addons=HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver \
          --workload-pool=$PROJECT_ID.svc.id.goog \
          --enable-stackdriver-kubernetes \
          --logging=SYSTEM,WORKLOAD \
          --monitoring=SYSTEM
        
        echo -e "${GREEN}✓ GKE cluster created for $env${NC}"
        
        # Get credentials
        gcloud container clusters get-credentials hcx-$env --region=$REGION
        
        # Create namespace
        kubectl create namespace hcx-$env
        
        echo -e "${GREEN}✓ Namespace created for $env${NC}"
    else
        echo -e "${YELLOW}GKE cluster already exists for $env, skipping...${NC}"
    fi
}

# Create GKE clusters
if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "dev" ]; then
    create_gke_cluster "dev" "n1-standard-2" 2 4 50 "pd-standard"
fi

if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "staging" ]; then
    create_gke_cluster "staging" "n1-standard-4" 2 4 100 "pd-ssd"
fi

if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "prod" ]; then
    create_gke_cluster "prod" "n1-standard-4" 3 10 100 "pd-ssd"
fi

echo ""

# Function to deploy PostgreSQL (for dev only)
deploy_postgres() {
    local env=$1
    
    echo -e "${BLUE}Deploying PostgreSQL for $env...${NC}"
    
    # Get credentials
    gcloud container clusters get-credentials hcx-$env --region=$REGION
    
    # Create secret
    kubectl create secret generic postgres-secret \
      --from-literal=password="dev_password_$(openssl rand -hex 8)" \
      -n hcx-$env --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy PostgreSQL
    kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: hcx-$env
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: hcx-$env
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
          value: hcx_$env
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
          subPath: postgres
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: hcx-$env
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
EOF
    
    echo -e "${GREEN}✓ PostgreSQL deployed for $env${NC}"
}

# Function to deploy Redis (for dev only)
deploy_redis() {
    local env=$1
    
    echo -e "${BLUE}Deploying Redis for $env...${NC}"
    
    # Create secret
    kubectl create secret generic redis-secret \
      --from-literal=password="redis_$(openssl rand -hex 8)" \
      -n hcx-$env --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy Redis
    kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: hcx-$env
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
        args: ["--requirepass", "\$(REDIS_PASSWORD)"]
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
  namespace: hcx-$env
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
  type: ClusterIP
EOF
    
    echo -e "${GREEN}✓ Redis deployed for $env${NC}"
}

# Deploy databases for dev
if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "dev" ]; then
    deploy_postgres "dev"
    deploy_redis "dev"
fi

echo ""

# Function to export kubeconfig
export_kubeconfig() {
    local env=$1
    
    echo -e "${BLUE}Exporting kubeconfig for $env...${NC}"
    
    # Get credentials
    gcloud container clusters get-credentials hcx-$env --region=$REGION
    
    # Export kubeconfig
    kubectl config view --minify --flatten > /tmp/kubeconfig-$env.yaml
    cat /tmp/kubeconfig-$env.yaml | base64 -w 0 > /tmp/kubeconfig-$env-base64.txt
    
    echo -e "${GREEN}✓ Kubeconfig exported to /tmp/kubeconfig-$env-base64.txt${NC}"
}

# Export kubeconfigs
if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "dev" ]; then
    export_kubeconfig "dev"
fi

if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "staging" ]; then
    export_kubeconfig "staging"
fi

if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "prod" ]; then
    export_kubeconfig "prod"
fi

echo ""
echo -e "${GREEN}======================================"
echo "Infrastructure Setup Complete!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo "1. Configure GitHub secrets with the kubeconfig files:"
echo "   - /tmp/kubeconfig-dev-base64.txt"
echo "   - /tmp/kubeconfig-staging-base64.txt"
echo "   - /tmp/kubeconfig-prod-base64.txt"
echo ""
echo "2. For staging and production, set up Cloud SQL and Memorystore:"
echo "   See docs/GCP_INFRASTRUCTURE_SETUP.md for detailed instructions"
echo ""
echo "3. Deploy applications using the CI/CD pipeline"
echo ""
echo "Estimated monthly cost: ~\$1,730"
echo ""

