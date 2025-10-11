# CI/CD Pipeline Documentation

## Overview

The HealthFlowEgy HCX platform uses a modern, automated CI/CD pipeline built with GitHub Actions. The pipeline ensures code quality, security, and reliable deployments across multiple environments.

## Pipeline Architecture

### Workflows

#### 1. Main Pipeline (`main-pipeline.yml`)

**Purpose**: Complete build, test, and deployment pipeline for main and develop branches.

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual dispatch with environment selection

**Stages**:
1. **Validation & Security** - Code validation and security scanning
2. **Build** - Compile all services (Backend, Frontend, AI)
3. **Test** - Unit tests, integration tests
4. **Version & Package** - Generate semantic version and build Docker images
5. **Deploy to Development** - Automatic deployment to dev environment (develop branch)
6. **Deploy to Staging** - Manual approval deployment to staging (main branch)
7. **Deploy to Production** - Manual approval deployment to production (main branch)
8. **Notifications** - Send deployment status notifications

**Key Features**:
- ✅ Standardized on JDK 17
- ✅ Semantic versioning
- ✅ Security scanning with Trivy
- ✅ Docker image caching for faster builds
- ✅ Parallel job execution
- ✅ Environment-specific deployments
- ✅ Automated smoke tests

#### 2. Feature Testing (`feature-testing.yml`)

**Purpose**: Fast feedback for feature branches with optimized testing.

**Triggers**:
- Push to `feature/*`, `bugfix/*`, `hotfix/*` branches
- Pull requests to `develop`

**Stages**:
1. **Quick Validation** - Fast syntax checks
2. **Detect Changes** - Identify changed services
3. **Conditional Testing** - Test only changed components
4. **Code Quality** - Code style and quality checks
5. **Security Scan** - Security vulnerability scanning
6. **Summary** - Generate test summary

**Key Features**:
- ⚡ Fast execution (only tests changed code)
- 🎯 Change detection for targeted testing
- 📊 Test result summaries
- 🔒 Security scanning

## Semantic Versioning

The pipeline automatically generates semantic versions following the [Semantic Versioning 2.0.0](https://semver.org/) specification.

### Version Format

- **Main branch**: `v{MAJOR}.{MINOR}.{PATCH}` (e.g., `v1.2.3`)
- **Develop branch**: `v{MAJOR}.{MINOR}.{PATCH}-dev.{RUN_NUMBER}` (e.g., `v1.2.3-dev.42`)

### Version Increment Rules

| Commit Message Pattern | Version Increment | Example |
|------------------------|-------------------|---------|
| Contains `BREAKING CHANGE` | Major version | `v1.0.0` → `v2.0.0` |
| Starts with `feat:` | Minor version | `v1.0.0` → `v1.1.0` |
| Other commits | Patch version | `v1.0.0` → `v1.0.1` |

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat:` - New feature (minor version bump)
- `fix:` - Bug fix (patch version bump)
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples**:
```
feat(hcx-apis): add pre-authorization endpoint

Implements the pre-authorization check endpoint according to HCX protocol v0.9.

Closes #123
```

```
fix(api-gateway): resolve timeout issue in health check

BREAKING CHANGE: Health check endpoint now returns 503 instead of 500 on failure
```

## Environment Configuration

### Required Secrets

Configure these secrets in GitHub repository settings:

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `GITHUB_TOKEN` | GitHub token (auto-provided) | Docker image push |
| `KUBE_CONFIG_DEV` | Kubernetes config for dev (base64) | Development deployment |
| `KUBE_CONFIG_STAGING` | Kubernetes config for staging (base64) | Staging deployment |
| `KUBE_CONFIG_PROD` | Kubernetes config for production (base64) | Production deployment |
| `SLACK_WEBHOOK` | Slack webhook URL | Notifications |
| `CODECOV_TOKEN` | Codecov token | Coverage reporting |
| `SNYK_TOKEN` | Snyk API token | Dependency scanning |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JAVA_VERSION` | `17` | Java version for builds |
| `NODE_VERSION` | `18` | Node.js version for frontend |
| `PYTHON_VERSION` | `3.11` | Python version for AI services |
| `REGISTRY` | `ghcr.io` | Container registry |

## Deployment Process

### Development Environment

**Trigger**: Automatic on push to `develop` branch

**Process**:
1. Build and test all services
2. Generate version with `-dev` suffix
3. Build and push Docker images
4. Deploy to development Kubernetes cluster
5. Run smoke tests
6. Verify health checks

**URL**: https://dev.hcx.healthflowegy.com

### Staging Environment

**Trigger**: Manual approval after successful develop deployment (main branch)

**Process**:
1. Requires manual approval in GitHub
2. Deploy to staging Kubernetes cluster
3. Run comprehensive smoke tests
4. Verify all integrations

**URL**: https://staging.hcx.healthflowegy.com

### Production Environment

**Trigger**: Manual approval after successful staging deployment (main branch)

**Process**:
1. Requires manual approval in GitHub
2. Deploy using blue-green strategy
3. Run production smoke tests
4. Gradual traffic shift (planned for future)
5. Create Git tag with version
6. Send notifications

**URL**: https://hcx.healthflowegy.com

## Deployment Scripts

### Smoke Tests

**Location**: `scripts/smoke-tests.sh`

**Usage**:
```bash
./scripts/smoke-tests.sh <base_url>
```

**Example**:
```bash
./scripts/smoke-tests.sh https://dev.hcx.healthflowegy.com
```

**Tests**:
- Health check endpoint
- HCX API health
- API Gateway health
- Coverage eligibility check
- Database connectivity
- Redis connectivity
- Metrics endpoint
- Participant registry

### Deployment Verification

**Location**: `scripts/verify-deployment.sh`

**Usage**:
```bash
./scripts/verify-deployment.sh <environment>
```

**Example**:
```bash
./scripts/verify-deployment.sh staging
```

**Checks**:
- Kubernetes deployment status
- Pod readiness
- Service health checks
- Smoke tests execution

### Rollback

**Location**: `scripts/rollback-deployment.sh`

**Usage**:
```bash
./scripts/rollback-deployment.sh <environment> [version]
```

**Examples**:
```bash
# Rollback to previous revision
./scripts/rollback-deployment.sh production

# Rollback to specific version
./scripts/rollback-deployment.sh production v1.2.3
```

**Process**:
1. Shows deployment history
2. Confirms rollback action
3. Rolls back all services
4. Verifies rollback success

## Docker Images

### Registry

Images are stored in GitHub Container Registry (GHCR):
- `ghcr.io/healthflowegy/hcx-platform/api-gateway`
- `ghcr.io/healthflowegy/hcx-platform/hcx-apis`
- `ghcr.io/healthflowegy/hcx-platform/hcx-onboard`

### Tags

Each image is tagged with:
- Semantic version (e.g., `v1.2.3`)
- `latest` (main branch only)
- Git SHA (e.g., `main-abc1234`)

### Security Scanning

All images are scanned with Trivy for:
- Critical vulnerabilities
- High severity issues
- Known CVEs

Results are uploaded to GitHub Security tab.

## Monitoring and Notifications

### GitHub Actions Dashboard

View pipeline status:
1. Go to repository → Actions tab
2. Select workflow run
3. View job details and logs

### Deployment Summary

Each deployment generates a summary with:
- Deployment status
- Version deployed
- Environment
- Commit SHA
- Author

### Notifications (Planned)

Future notifications will be sent to:
- Slack channel (on deployment success/failure)
- Email (on production deployments)
- GitHub releases (on version tags)

## Troubleshooting

### Build Failures

**Issue**: Maven build fails with dependency errors

**Solution**:
1. Check if all dependencies are available
2. Clear Maven cache: `mvn dependency:purge-local-repository`
3. Verify pom.xml versions

**Issue**: Docker build fails

**Solution**:
1. Check Dockerfile syntax
2. Verify base image availability
3. Check build context

### Test Failures

**Issue**: Unit tests fail

**Solution**:
1. Check test logs in GitHub Actions
2. Verify database/redis services are running
3. Check environment variables

**Issue**: Integration tests timeout

**Solution**:
1. Increase timeout in workflow
2. Check service dependencies
3. Verify network connectivity

### Deployment Failures

**Issue**: Kubernetes deployment fails

**Solution**:
1. Check kubectl credentials
2. Verify namespace exists
3. Check resource quotas
4. Review deployment logs

**Issue**: Health checks fail after deployment

**Solution**:
1. Check service logs
2. Verify database connectivity
3. Check environment variables
4. Run manual smoke tests

### Rollback Issues

**Issue**: Rollback fails

**Solution**:
1. Check deployment history
2. Verify previous version exists
3. Manual rollback using kubectl:
   ```bash
   kubectl rollout undo deployment/hcx-gateway -n hcx-prod
   ```

## Best Practices

### For Developers

1. **Commit Messages**: Follow conventional commits
2. **Branch Naming**: Use `feature/`, `bugfix/`, `hotfix/` prefixes
3. **Pull Requests**: Create PRs to `develop` branch
4. **Testing**: Ensure tests pass locally before pushing
5. **Code Review**: Wait for PR approval before merging

### For Releases

1. **Version Bumps**: Use appropriate commit messages
2. **Changelog**: Update CHANGELOG.md before release
3. **Testing**: Verify in staging before production
4. **Monitoring**: Watch metrics after deployment
5. **Rollback Plan**: Know how to rollback if needed

### For Operations

1. **Monitoring**: Set up alerts for failed deployments
2. **Backups**: Ensure database backups before deployments
3. **Rollback**: Test rollback procedures regularly
4. **Documentation**: Keep runbooks updated
5. **Incidents**: Document and learn from failures

## Migration from Old Workflows

### Deprecated Workflows

The following workflows are deprecated and will be removed:
- `ci-cd.yml` (replaced by `main-pipeline.yml`)
- `hcx-ci-cd.yml` (merged into `main-pipeline.yml`)
- `ci-cd-sprint1.yml` (functionality merged)

### Migration Steps

1. **Review Changes**: Compare old and new workflows
2. **Update Secrets**: Ensure all required secrets are configured
3. **Test Branch**: Create test branch and verify pipeline
4. **Monitor**: Watch first few deployments closely
5. **Cleanup**: Remove old workflow files after verification

### Key Differences

| Aspect | Old Workflows | New Workflows |
|--------|---------------|---------------|
| Java Version | Mixed (11 & 17) | Standardized (17) |
| Workflows | 4 separate files | 2 consolidated files |
| Versioning | Branch-based | Semantic versioning |
| Deployment | Placeholder | Fully automated |
| Testing | Separate workflow | Integrated pipeline |
| Security | Basic | Comprehensive |

## Performance Metrics

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Build Time | < 15 minutes | ~20 minutes |
| Test Coverage | > 80% | ~75% |
| Deployment Frequency | Multiple per day | On-demand |
| Mean Time to Recovery | < 30 minutes | N/A |
| Change Failure Rate | < 5% | N/A |

### Optimization Tips

1. **Caching**: Use Maven and npm caching
2. **Parallel Jobs**: Run independent jobs in parallel
3. **Conditional Execution**: Skip unchanged components
4. **Resource Limits**: Set appropriate timeouts
5. **Artifact Cleanup**: Set retention policies

## Future Enhancements

### Planned Features

- [ ] Canary deployments with gradual traffic shift
- [ ] Automated performance testing
- [ ] Slack notifications
- [ ] GitHub release automation
- [ ] Deployment metrics dashboard
- [ ] Automated rollback on failure
- [ ] Multi-region deployments
- [ ] A/B testing support

### Under Consideration

- [ ] GitOps with ArgoCD
- [ ] Service mesh integration
- [ ] Chaos engineering tests
- [ ] Cost optimization reports
- [ ] Compliance scanning

## Support

### Getting Help

- **Documentation**: Check this file and related docs
- **Issues**: Create GitHub issue with `ci-cd` label
- **Team**: Contact DevOps team on Slack
- **Runbooks**: See `docs/runbooks/` directory

### Contributing

To improve the CI/CD pipeline:

1. Create feature branch: `feature/cicd-improvement-name`
2. Make changes and test thoroughly
3. Update documentation
4. Create pull request with detailed description
5. Wait for review and approval

---

**Last Updated**: October 11, 2025  
**Version**: 1.0  
**Maintained By**: DevOps Team

