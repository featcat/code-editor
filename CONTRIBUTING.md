# Contributing to Code Editor

Thank you for your interest in contributing to Code Editor! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/monaco-languageclient.git
   cd code-editor
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/huaanhuang/monaco-languageclient.git
   ```

## Development Setup

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The demo app will be available at `http://localhost:5173/` (or another port if 5173 is in use).

## Development Workflow

### Creating a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in the feature branch
2. Test your changes thoroughly
3. Ensure the code builds without errors:
   ```bash
   npm run build
   ```
4. Run linting:
   ```bash
   npm run lint
   ```

### Testing Your Changes

- Test the demo application: `npm run dev`
- Verify the build output: `npm run build`
- Test in a real project by linking locally:
  ```bash
  npm link
  cd /path/to/test-project
  npm link @huaanhuang/code-editor
  ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` types when possible
- Document complex types with comments

### Code Style

- Follow the existing code style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Format code using Prettier (if configured)

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use CSS modules for component styles

### File Organization

```
src/
├── components/          # React components
│   ├── ComponentName.tsx
│   └── ComponentName.module.css
├── hooks/              # Custom React hooks
├── types.ts            # Type definitions
└── index.ts            # Public API exports
```

## Commit Guidelines

### Commit Message Format

Use clear and descriptive commit messages:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
```
feat(editor): add support for custom key bindings

fix(lsp): resolve connection timeout issue

docs(readme): update installation instructions
```

### Commit Best Practices

- Keep commits atomic and focused
- Write meaningful commit messages
- Reference issue numbers when applicable: `fix: resolve #123`

## Pull Request Process

### Before Submitting

1. ✅ Update your branch with latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. ✅ Ensure all tests pass and code builds:
   ```bash
   npm run build
   ```

3. ✅ Run linting:
   ```bash
   npm run lint
   ```

4. ✅ Update documentation if needed

5. ✅ Update CHANGELOG.md with your changes

### Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request on GitHub

3. Fill out the PR template with:
   - Clear description of changes
   - Related issue numbers
   - Screenshots (for UI changes)
   - Testing instructions

4. Wait for review and address feedback

### PR Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged

## Issue Reporting

### Before Opening an Issue

- Search existing issues to avoid duplicates
- Check if the issue is already fixed in the latest version

### Creating a Good Issue

**For Bugs:**
- Clear title describing the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, browser)
- Screenshots or error messages
- Minimal reproduction example

**For Feature Requests:**
- Clear description of the feature
- Use cases and benefits
- Possible implementation approach
- Examples from other libraries (if applicable)

### Issue Template

```markdown
## Description
[Clear description of the issue or feature]

## Steps to Reproduce (for bugs)
1. Step one
2. Step two
3. ...

## Expected Behavior
[What you expected to happen]

## Actual Behavior
[What actually happened]

## Environment
- OS: [e.g., macOS 14.0]
- Node: [e.g., 18.17.0]
- Browser: [e.g., Chrome 120]
- Package Version: [e.g., 0.0.1]

## Additional Context
[Any other relevant information]
```

## Project Structure

```
code-editor/
├── src/
│   ├── components/         # React components
│   │   ├── CodeEditor.tsx
│   │   ├── RunnerControls.tsx
│   │   └── JsonEditor.tsx
│   ├── hooks/             # Custom hooks
│   ├── types.ts           # TypeScript definitions
│   ├── index.ts           # Public API
│   ├── App.tsx            # Demo application
│   └── main.tsx           # Demo entry point
├── docs/                  # Documentation
├── dist/                  # Build output (gitignored)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Resources

- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/)
- [LSP Specification](https://microsoft.github.io/language-server-protocol/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Questions?

If you have questions about contributing:
1. Check existing documentation
2. Search closed issues and PRs
3. Open a discussion on GitHub
4. Ask in your PR or issue

Thank you for contributing! 🎉
