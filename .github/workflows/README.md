# GitHub Actions Workflow

This directory contains GitHub Actions workflows for automated processes.

## Workflows

### publish.yml - NPM Publishing

Automatically publishes the package to npm when a new tag is pushed.

**Trigger**: Push tags (e.g., `1.0.0`, `v1.0.0`, `2.1.3-beta`)

**Process**:
1. Extracts version from tag name (removes 'v' prefix if present)
2. Updates `package.json` version
3. Installs dependencies
4. Runs linting (if configured)
5. Builds the package
6. Publishes to npm
7. Creates a GitHub release

**Required Secrets**:
- `NPM_TOKEN`: Your npm access token for publishing

**Setup Instructions**:

1. **Create NPM Access Token**
   - Log in to npmjs.com
   - Go to Access Tokens → Generate New Token
   - Select "Automation" type
   - Copy the token

2. **Add Token to GitHub Secrets**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

3. **Publish a Release**
   ```bash
   # Create and push a tag
   git tag -a 1.0.0 -m "Release version 1.0.0"
   git push origin 1.0.0
   
   # Or with 'v' prefix
   git tag -a v1.0.1 -m "Release version 1.0.1"
   git push origin v1.0.1
   ```

4. **Monitor the Workflow**
   - Go to Actions tab in your repository
   - Watch the "Publish to NPM" workflow run
   - Check for any errors

**Version Format**:
- `1.0.0` → published as version 1.0.0
- `v1.0.0` → published as version 1.0.0 (v prefix removed)
- `2.1.3-beta` → published as version 2.1.3-beta
- `v3.0.0-rc.1` → published as version 3.0.0-rc.1

**Notes**:
- The workflow only runs on tag pushes, not on normal commits
- Package is published with `--access public` (required for scoped packages)
- A GitHub release is created automatically after successful npm publish
- Linting runs before build to ensure code quality
