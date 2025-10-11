# GCP Quick Start Guide

## Overview

This guide provides the fastest way to get the HCX platform running on Google Cloud Platform.

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed
- `kubectl` installed
- GitHub CLI (`gh`) installed

## Quick Setup (30 minutes)

### Step 1: Set Environment Variables

```bash
export PROJECT_ID="hcx-healthflowegy"
export REGION="us-central1"
```

### Step 2: Authenticate and Set Project

```bash
# Login to GCP
gcloud auth login

# Set project
gcloud config set project $PROJECT_ID

# Enable billing (if not already enabled)
# Visit: https://console.cloud.google.com/billing
```

### Step 3: Run Automated Setup Script

```bash
# Navigate to repository
cd /path/to/hcx-platform

# Run setup script for development environment
./scripts/setup-gcp-infrastructure.sh dev
```

This script will:
- Enable required GCP APIs
- Create VPC and subnets
- Create GKE cluster
- Deploy PostgreSQL and Redis
- Export kubeconfig

**Estimated time**: 15-20 minutes

### Step 4: Configure GitHub Secrets

```bash
# Set kubeconfig secret for development
gh secret set KUBE_CONFIG_DEV < /tmp/kubeconfig-dev-base64.txt

# Verify secret was set
gh secret list | grep KUBE_CONFIG
```

### Step 5: Test the Setup

```bash
# Get cluster credentials
gcloud container clusters get-credentials hcx-dev --region=$REGION

# Check cluster status
kubectl get nodes
kubectl get namespaces
kubectl get pods -n hcx-dev

# Test database connectivity
kubectl run test-db --image=postgres:15-alpine --rm -it -n hcx-dev -- \
  psql -h postgres.hcx-dev.svc.cluster.local -U hcx_user -d hcx_dev
```

### Step 6: Deploy Application

```bash
# Push CI/CD changes to trigger deployment
git checkout feature/cicd-improvements
git push origin feature/cicd-improvements

# Create PR to develop
gh pr create --base develop --title "CI/CD Improvements" --body "Implements new CI/CD pipeline"

# Merge PR (after review)
gh pr merge --merge
```

The CI/CD pipeline will automatically:
1. Build Docker images
2. Push to GitHub Container Registry
3. Deploy to development cluster
4. Run smoke tests

## Verification

### Check Deployment Status

```bash
# Watch deployment progress
kubectl get deployments -n hcx-dev -w

# Check pod status
kubectl get pods -n hcx-dev

# Check services
kubectl get services -n hcx-dev

# Check ingress
kubectl get ingress -n hcx-dev
```

### Access Application

```bash
# Get external IP
kubectl get ingress hcx-ingress -n hcx-dev -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Test health endpoint
curl http://<EXTERNAL_IP>/health
```

## Staging and Production Setup

### For Staging

```bash
# Run setup script for staging
./scripts/setup-gcp-infrastructure.sh staging

# Configure GitHub secret
gh secret set KUBE_CONFIG_STAGING < /tmp/kubeconfig-staging-base64.txt

# Set up Cloud SQL (see GCP_INFRASTRUCTURE_SETUP.md for details)
```

### For Production

```bash
# Run setup script for production
./scripts/setup-gcp-infrastructure.sh prod

# Configure GitHub secret
gh secret set KUBE_CONFIG_PROD < /tmp/kubeconfig-prod-base64.txt

# Set up Cloud SQL with HA (see GCP_INFRASTRUCTURE_SETUP.md for details)
```

## Cost Management

### Check Current Costs

```bash
# View billing dashboard
gcloud beta billing accounts list

# Check project costs
# Visit: https://console.cloud.google.com/billing/reports
```

### Optimize Costs

```bash
# Use preemptible nodes for dev (saves ~80%)
gcloud container node-pools create preemptible-pool \
  --cluster=hcx-dev \
  --region=$REGION \
  --machine-type=n1-standard-2 \
  --preemptible \
  --num-nodes=2

# Enable autoscaling (already enabled by default)
# Clusters will scale down when not in use
```

### Stop Development Cluster (when not needed)

```bash
# Resize to 0 nodes (stops billing for compute)
gcloud container clusters resize hcx-dev \
  --num-nodes=0 \
  --region=$REGION

# Resume later
gcloud container clusters resize hcx-dev \
  --num-nodes=2 \
  --region=$REGION
```

## Troubleshooting

### Issue: Cluster creation fails

```bash
# Check quotas
gcloud compute project-info describe --project=$PROJECT_ID

# Request quota increase if needed
# Visit: https://console.cloud.google.com/iam-admin/quotas
```

### Issue: Cannot connect to cluster

```bash
# Re-authenticate
gcloud auth login

# Get credentials again
gcloud container clusters get-credentials hcx-dev --region=$REGION

# Verify context
kubectl config current-context
```

### Issue: Pods not starting

```bash
# Check pod logs
kubectl logs -n hcx-dev <pod-name>

# Describe pod for events
kubectl describe pod -n hcx-dev <pod-name>

# Check resource constraints
kubectl top nodes
kubectl top pods -n hcx-dev
```

### Issue: Database connection fails

```bash
# Check if PostgreSQL is running
kubectl get pods -n hcx-dev -l app=postgres

# Check PostgreSQL logs
kubectl logs -n hcx-dev -l app=postgres

# Test connectivity
kubectl run test-db --image=postgres:15-alpine --rm -it -n hcx-dev -- \
  psql -h postgres.hcx-dev.svc.cluster.local -U hcx_user -d hcx_dev
```

## Cleanup

### Delete Development Environment

```bash
# Delete GKE cluster
gcloud container clusters delete hcx-dev --region=$REGION --quiet

# Delete firewall rules
gcloud compute firewall-rules delete hcx-allow-internal --quiet
gcloud compute firewall-rules delete hcx-allow-health-checks --quiet

# Delete subnets
gcloud compute networks subnets delete hcx-dev-subnet --region=$REGION --quiet

# Delete VPC (only if no other subnets exist)
gcloud compute networks delete hcx-vpc --quiet
```

### Delete All Environments

```bash
# WARNING: This will delete everything!
./scripts/cleanup-gcp-infrastructure.sh all
```

## Next Steps

1. ✅ Development environment running
2. ⏳ Set up staging environment
3. ⏳ Set up production environment
4. ⏳ Configure DNS and SSL
5. ⏳ Set up monitoring and alerting
6. ⏳ Configure backups
7. ⏳ Perform load testing

## Resources

- **Full Setup Guide**: `docs/GCP_INFRASTRUCTURE_SETUP.md`
- **CI/CD Documentation**: `docs/CICD.md`
- **Migration Guide**: `docs/CICD_MIGRATION_GUIDE.md`
- **GCP Console**: https://console.cloud.google.com
- **GCP Documentation**: https://cloud.google.com/docs

## Support

- **Issues**: Create GitHub issue with `infrastructure` label
- **Questions**: Contact DevOps team
- **GCP Support**: https://cloud.google.com/support

---

**Setup Time**: ~30 minutes  
**Monthly Cost**: ~$250 (dev only)  
**Status**: Ready to use

