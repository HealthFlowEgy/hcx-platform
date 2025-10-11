# CI/CD Migration Guide

## Overview

This guide helps you migrate from the old CI/CD workflows to the new unified pipeline system. The new system provides better reliability, security, and maintainability.

## What's Changing

### Old System (Deprecated)

- **4 workflow files** with overlapping responsibilities
- **Inconsistent Java versions** (JDK 11 and 17)
- **Incomplete deployment automation**
- **No semantic versioning**
- **Limited security scanning**

### New System

- **2 consolidated workflows** with clear separation
- **Standardized on JDK 17**
- **Full deployment automation**
- **Semantic versioning**
- **Comprehensive security scanning**

## Migration Timeline

### Phase 1: Preparation (Week 1)

**Status**: ✅ Complete

**Actions**:
- [x] Create new workflow files
- [x] Create deployment scripts
- [x] Update documentation
- [x] Test in feature branch

### Phase 2: Testing (Week 2)

**Status**: 🔄 In Progress

**Actions**:
- [ ] Test new workflows in feature branches
- [ ] Verify all services build correctly
- [ ] Test deployment to development
- [ ] Validate smoke tests
- [ ] Fix any issues found

### Phase 3: Rollout (Week 3)

**Status**: ⏳ Pending

**Actions**:
- [ ] Merge to develop branch
- [ ] Monitor develop branch deployments
- [ ] Test staging deployment
- [ ] Get team approval
- [ ] Merge to main branch

### Phase 4: Cleanup (Week 4)

**Status**: ⏳ Pending

**Actions**:
- [ ] Archive old workflow files
- [ ] Update team documentation
- [ ] Train team on new workflows
- [ ] Remove deprecated files

## Step-by-Step Migration

### Step 1: Review Changes

**Action**: Review the new workflow files

**Files to Review**:
- `.github/workflows/main-pipeline.yml`
- `.github/workflows/feature-testing.yml`
- `scripts/smoke-tests.sh`
- `scripts/verify-deployment.sh`
- `scripts/rollback-deployment.sh`
- `docs/CICD.md`

**Key Changes**:
1. Java version standardized to 17
2. Semantic versioning implemented
3. Deployment automation added
4. Security scanning enhanced
5. Smoke tests added

### Step 2: Configure Secrets

**Action**: Ensure all required secrets are configured in GitHub

**Required Secrets**:

| Secret Name | Description | How to Generate |
|-------------|-------------|-----------------|
| `GITHUB_TOKEN` | Auto-provided by GitHub | N/A (automatic) |
| `KUBE_CONFIG_DEV` | Kubernetes config for dev | `cat ~/.kube/config-dev \| base64 -w 0` |
| `KUBE_CONFIG_STAGING` | Kubernetes config for staging | `cat ~/.kube/config-staging \| base64 -w 0` |
| `KUBE_CONFIG_PROD` | Kubernetes config for prod | `cat ~/.kube/config-prod \| base64 -w 0` |
| `SLACK_WEBHOOK` | Slack webhook URL | Create in Slack settings |
| `CODECOV_TOKEN` | Codecov token | Get from codecov.io |
| `SNYK_TOKEN` | Snyk API token | Get from snyk.io |

**To Add Secrets**:
1. Go to repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add name and value
4. Click "Add secret"

### Step 3: Update Java Version

**Action**: Ensure all services are compatible with JDK 17

**Files to Check**:
- `api-gateway/pom.xml`
- `hcx-apis/pom.xml`
- `hcx-onboard/pom.xml`
- `backend/*/pom.xml`

**Required Changes**:

```xml
<properties>
    <java.version>17</java.version>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
</properties>
```

**Verification**:
```bash
# Test locally with JDK 17
cd api-gateway
mvn clean test

cd ../hcx-apis
mvn clean test

cd ../hcx-onboard
mvn clean test
```

### Step 4: Test in Feature Branch

**Action**: Create a test branch and verify the new workflows

**Commands**:
```bash
# Create test branch
git checkout -b test/cicd-migration

# Push to trigger feature-testing workflow
git push origin test/cicd-migration

# Monitor workflow in GitHub Actions
```

**What to Verify**:
- ✅ All jobs complete successfully
- ✅ Build artifacts are created
- ✅ Tests pass
- ✅ Security scans complete
- ✅ Docker images build (if pushed to develop/main)

### Step 5: Test Deployment Scripts

**Action**: Test deployment scripts locally

**Smoke Tests**:
```bash
# Test against local environment
./scripts/smoke-tests.sh http://localhost:8080

# Test against development
./scripts/smoke-tests.sh https://dev.hcx.healthflowegy.com
```

**Deployment Verification**:
```bash
# Verify development deployment
./scripts/verify-deployment.sh development

# Verify staging deployment
./scripts/verify-deployment.sh staging
```

**Rollback Test** (in non-production):
```bash
# Test rollback in development
./scripts/rollback-deployment.sh development
```

### Step 6: Merge to Develop

**Action**: Merge the new workflows to develop branch

**Commands**:
```bash
# Ensure you're on the feature branch
git checkout feature/cicd-improvements

# Merge latest develop
git pull origin develop

# Push to trigger PR
git push origin feature/cicd-improvements

# Create PR to develop in GitHub
```

**PR Checklist**:
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Scripts tested
- [ ] Team reviewed
- [ ] Secrets configured

### Step 7: Monitor Develop Deployments

**Action**: Monitor the first few deployments to develop

**What to Watch**:
- Build times
- Test results
- Deployment success
- Smoke test results
- Any errors or warnings

**Monitoring Tools**:
- GitHub Actions dashboard
- Kubernetes dashboard
- Application logs
- Health check endpoints

### Step 8: Test Staging Deployment

**Action**: Deploy to staging and verify

**Process**:
1. Merge develop to main (or create release PR)
2. Wait for workflow to reach staging deployment
3. Approve staging deployment in GitHub
4. Monitor deployment
5. Run manual verification tests
6. Check all integrations

**Verification Checklist**:
- [ ] All services deployed
- [ ] Health checks pass
- [ ] Smoke tests pass
- [ ] Database connectivity works
- [ ] Redis connectivity works
- [ ] API endpoints respond correctly
- [ ] Frontend loads correctly

### Step 9: Production Deployment

**Action**: Deploy to production with caution

**Pre-Deployment Checklist**:
- [ ] Staging deployment successful
- [ ] All tests passed
- [ ] Team notified
- [ ] Backup verified
- [ ] Rollback plan ready
- [ ] Monitoring alerts configured

**Deployment Process**:
1. Approve production deployment in GitHub
2. Monitor deployment closely
3. Watch for any errors
4. Verify health checks
5. Run smoke tests
6. Check metrics and logs
7. Notify team of completion

**Post-Deployment**:
- Monitor for 30 minutes
- Check error rates
- Verify performance metrics
- Be ready to rollback if needed

### Step 10: Cleanup

**Action**: Remove old workflow files after successful migration

**Files to Archive**:
- `.github/workflows/ci-cd.yml`
- `.github/workflows/hcx-ci-cd.yml`
- `.github/workflows/ci-cd-sprint1.yml`

**Commands**:
```bash
# Move to archive directory
mkdir -p .github/workflows/archive
git mv .github/workflows/ci-cd.yml .github/workflows/archive/
git mv .github/workflows/hcx-ci-cd.yml .github/workflows/archive/
git mv .github/workflows/ci-cd-sprint1.yml .github/workflows/archive/

# Commit changes
git add .
git commit -m "chore: archive deprecated CI/CD workflows"
git push origin main
```

## Rollback Plan

If you need to rollback to the old workflows:

### Option 1: Revert the Merge

```bash
# Find the merge commit
git log --oneline

# Revert the merge
git revert -m 1 <merge-commit-sha>
git push origin main
```

### Option 2: Restore Old Workflows

```bash
# Restore from archive
git mv .github/workflows/archive/ci-cd.yml .github/workflows/
git mv .github/workflows/archive/hcx-ci-cd.yml .github/workflows/
git mv .github/workflows/archive/ci-cd-sprint1.yml .github/workflows/

# Remove new workflows
git rm .github/workflows/main-pipeline.yml
git rm .github/workflows/feature-testing.yml

# Commit and push
git commit -m "chore: rollback to old CI/CD workflows"
git push origin main
```

## Common Issues and Solutions

### Issue 1: Java Version Mismatch

**Symptom**: Build fails with Java version errors

**Solution**:
```bash
# Update pom.xml files
find . -name "pom.xml" -exec sed -i 's/<java.version>11<\/java.version>/<java.version>17<\/java.version>/g' {} \;

# Test locally
mvn clean test
```

### Issue 2: Docker Build Fails

**Symptom**: Docker build fails with base image errors

**Solution**:
```dockerfile
# Update Dockerfile base image
FROM eclipse-temurin:17-jre-alpine
```

### Issue 3: Secrets Not Found

**Symptom**: Workflow fails with "secret not found" error

**Solution**:
1. Go to repository Settings → Secrets
2. Add missing secret
3. Re-run workflow

### Issue 4: Deployment Timeout

**Symptom**: Deployment job times out

**Solution**:
```yaml
# Increase timeout in workflow
timeout-minutes: 30  # Increase from 15
```

### Issue 5: Health Checks Fail

**Symptom**: Smoke tests fail after deployment

**Solution**:
1. Check service logs: `kubectl logs -n hcx-dev deployment/hcx-gateway`
2. Verify database connectivity
3. Check environment variables
4. Restart pods if needed

## Testing Checklist

Use this checklist to verify the migration:

### Pre-Migration
- [ ] Review all changes
- [ ] Configure secrets
- [ ] Update Java version
- [ ] Test locally

### During Migration
- [ ] Feature branch tests pass
- [ ] Develop deployment successful
- [ ] Staging deployment successful
- [ ] Production deployment successful

### Post-Migration
- [ ] All services running
- [ ] Health checks pass
- [ ] Smoke tests pass
- [ ] Monitoring working
- [ ] Team trained
- [ ] Documentation updated

## Training Resources

### For Developers

**Topics to Cover**:
1. Conventional commit messages
2. Branch naming conventions
3. Feature testing workflow
4. How to read workflow logs
5. When deployments happen

**Resources**:
- `docs/CICD.md` - Full CI/CD documentation
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

### For DevOps

**Topics to Cover**:
1. Workflow architecture
2. Deployment process
3. Rollback procedures
4. Monitoring and alerts
5. Troubleshooting

**Resources**:
- `docs/CICD.md` - Full CI/CD documentation
- `scripts/` - Deployment scripts
- GitHub Actions documentation

## Success Criteria

The migration is successful when:

- ✅ All workflows run without errors
- ✅ Deployments complete successfully
- ✅ Smoke tests pass consistently
- ✅ Build times are acceptable (< 20 minutes)
- ✅ Team is comfortable with new system
- ✅ Documentation is complete
- ✅ Old workflows are archived

## Support

### Getting Help

**Issues**: Create GitHub issue with label `ci-cd-migration`

**Urgent**: Contact DevOps team on Slack

**Documentation**: See `docs/CICD.md`

### Feedback

Please provide feedback on:
- What worked well
- What was confusing
- What could be improved
- Any issues encountered

## Next Steps

After successful migration:

1. **Monitor**: Watch deployments for first week
2. **Optimize**: Identify and fix bottlenecks
3. **Enhance**: Add planned features (canary, notifications)
4. **Document**: Update runbooks with lessons learned
5. **Train**: Ensure all team members understand new system

---

**Migration Started**: October 11, 2025  
**Expected Completion**: November 1, 2025  
**Status**: Phase 1 Complete  
**Contact**: DevOps Team

