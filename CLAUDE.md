# CLAUDE.md - AI Assistant Guide for eva-tk

**Last Updated:** 2025-11-19
**Repository:** Drko99-0/eva-tk
**Current State:** Early stage / Initial setup

---

## 📋 Project Overview

### About eva-tk
**eva-tk** is a toolkit project currently in its initial development phase. The repository is in early stages with minimal existing code structure.

### Current Status
- **Stage:** Initial setup
- **Files:** Minimal (README.md only)
- **Branch Strategy:** Feature branches with `claude/` prefix
- **Main Branch:** TBD (not yet established)

---

## 🏗️ Repository Structure

### Current Structure
```
eva-tk/
├── .git/              # Git repository metadata
├── README.md          # Project readme (minimal content)
└── CLAUDE.md          # This file - AI assistant guide
```

### Recommended Future Structure
As the project develops, consider organizing code as follows:

```
eva-tk/
├── src/               # Source code
│   ├── core/         # Core functionality
│   ├── utils/        # Utility functions
│   ├── models/       # Data models
│   └── index.ts      # Main entry point
├── tests/            # Test files
│   ├── unit/         # Unit tests
│   └── integration/  # Integration tests
├── docs/             # Documentation
├── examples/         # Usage examples
├── .github/          # GitHub workflows and templates
├── package.json      # Node.js dependencies (if applicable)
├── tsconfig.json     # TypeScript config (if applicable)
├── README.md         # Project documentation
└── CLAUDE.md         # This guide
```

---

## 🔧 Development Workflow

### Git Branching Strategy

#### Branch Naming Convention
- **Feature branches:** `claude/claude-md-<session-id>`
- **Current working branch:** `claude/claude-md-mi6nv8keed65v20w-01QrkaEXHyQCRZQ7Fb82ZcBN`

#### Important Git Rules
1. **ALWAYS** develop on the designated Claude feature branch
2. **NEVER** push directly to main/master without permission
3. **ALWAYS** use `git push -u origin <branch-name>` for first push
4. Branch names MUST start with `claude/` and end with the session ID
5. Push failures (403) indicate incorrect branch naming

### Commit Guidelines

#### Commit Message Format
```
<type>: <brief description>

<optional detailed description>

<optional footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `style:` - Code formatting

**Examples:**
```bash
feat: add core toolkit initialization

docs: update README with installation instructions

fix: resolve dependency resolution issue
```

### Network Retry Policy
For git operations (push/pull/fetch):
- Retry up to 4 times on network failures
- Use exponential backoff: 2s, 4s, 8s, 16s
- Only retry on network errors, not auth or validation errors

---

## 📝 Coding Conventions

### General Principles
1. **Keep it Simple:** Prefer clarity over cleverness
2. **DRY:** Don't Repeat Yourself - extract common patterns
3. **SOLID:** Follow SOLID principles for object-oriented code
4. **Type Safety:** Use strong typing (TypeScript recommended)
5. **Error Handling:** Always handle errors gracefully
6. **Documentation:** Document public APIs and complex logic

### Code Style

#### Naming Conventions
- **Files:** kebab-case (`user-service.ts`)
- **Classes:** PascalCase (`UserService`)
- **Functions/Methods:** camelCase (`getUserById`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Interfaces:** PascalCase with 'I' prefix optional (`IUser` or `User`)

#### File Organization
```typescript
// 1. Imports (external first, then internal)
import { external } from 'external-package';
import { internal } from './internal-module';

// 2. Constants
const DEFAULT_TIMEOUT = 5000;

// 3. Types/Interfaces
interface Config {
  timeout: number;
}

// 4. Main code
export class Service {
  // implementation
}

// 5. Exports
export { Config };
```

#### Error Handling Pattern
```typescript
try {
  // risky operation
} catch (error) {
  // Log the error
  console.error('Operation failed:', error);

  // Rethrow or handle gracefully
  throw new Error(`Failed to perform operation: ${error.message}`);
}
```

### Security Best Practices
🔒 **CRITICAL:** Always check for and prevent:
- Command injection
- SQL injection
- XSS (Cross-Site Scripting)
- Path traversal
- Insecure deserialization
- Improper input validation
- Hardcoded secrets/credentials

**Never commit:**
- API keys
- Passwords
- Private keys
- `.env` files with secrets
- `credentials.json` or similar files

---

## 🧪 Testing Guidelines

### Test Structure
```
tests/
├── unit/           # Fast, isolated tests
├── integration/    # Tests across modules
└── fixtures/       # Test data and mocks
```

### Testing Principles
1. **Write tests for new features** - Test-driven development encouraged
2. **Maintain high coverage** - Aim for >80% coverage
3. **Test edge cases** - Don't just test the happy path
4. **Use descriptive names** - Test names should explain what they verify
5. **Keep tests isolated** - No shared state between tests

### Test Naming Convention
```typescript
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when valid ID provided', async () => {
      // test implementation
    });

    it('should throw error when user not found', async () => {
      // test implementation
    });
  });
});
```

---

## 🤖 AI Assistant Guidelines

### Task Planning
1. **ALWAYS use TodoWrite** - Track all multi-step tasks
2. **Break down complex tasks** - Create sub-tasks for clarity
3. **Update status in real-time** - Mark tasks as in_progress/completed immediately
4. **One task at a time** - Only one task should be in_progress

### Code Quality Standards
1. **Read before writing** - Always read existing files before editing
2. **Prefer editing over creating** - Modify existing files rather than creating new ones
3. **No security vulnerabilities** - Review code for OWASP Top 10
4. **Fix immediately** - If you write insecure code, fix it right away
5. **Use type safety** - Prefer typed languages and strict type checking

### Tool Usage Preferences
1. **File Operations:**
   - Read files: Use `Read` tool (not `cat`)
   - Edit files: Use `Edit` tool (not `sed/awk`)
   - Create files: Use `Write` tool (not `echo >`)

2. **Search Operations:**
   - File patterns: Use `Glob` (not `find`)
   - Content search: Use `Grep` (not `grep/rg`)
   - Code exploration: Use `Task` with `Explore` agent

3. **Git Operations:**
   - Always use full commands: `git push -u origin <branch>`
   - Implement retry logic for network failures
   - Never skip hooks (no `--no-verify`)

### Communication Style
1. **Be concise** - Users see terminal output
2. **No emojis** - Unless explicitly requested
3. **No excessive praise** - Be objective and factual
4. **Use markdown** - Format for readability
5. **Include file references** - Use `file:line` format

### Example File References
When referencing code, use this format:
```
The user authentication is handled in src/auth/service.ts:42
```

---

## 📚 Documentation Standards

### Code Documentation
1. **Public APIs** - Must have JSDoc/TSDoc comments
2. **Complex logic** - Add inline comments explaining "why"
3. **Type definitions** - Document all custom types
4. **Examples** - Provide usage examples for public APIs

### JSDoc Format
```typescript
/**
 * Retrieves a user by their unique identifier
 *
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to the user object
 * @throws {NotFoundError} When user doesn't exist
 *
 * @example
 * ```ts
 * const user = await getUserById('123');
 * console.log(user.name);
 * ```
 */
async function getUserById(userId: string): Promise<User> {
  // implementation
}
```

### README Sections
Keep README.md updated with:
1. Project description
2. Installation instructions
3. Quick start guide
4. API documentation
5. Contributing guidelines
6. License information

---

## 🔄 Continuous Integration

### Pre-commit Checks
Before committing, ensure:
- [ ] Code compiles/builds successfully
- [ ] Tests pass
- [ ] Linting passes
- [ ] No console.log statements (unless intentional)
- [ ] No TODO comments (or tracked in issues)

### Automated Workflows
Consider setting up GitHub Actions for:
- Running tests on PR
- Linting and type checking
- Building artifacts
- Security scanning
- Dependency updates

---

## 🚀 Deployment Guidelines

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped (semantic versioning)
- [ ] No breaking changes (or properly documented)
- [ ] Security audit completed

### Versioning
Follow [Semantic Versioning](https://semver.org/):
- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes (backward compatible)

---

## 🐛 Debugging Tips

### Common Issues
1. **Import errors** - Check file paths and exports
2. **Type errors** - Verify type definitions match usage
3. **Build failures** - Clear cache/node_modules and rebuild
4. **Test failures** - Check for shared state between tests

### Debugging Tools
- Use `console.log` sparingly (remove before commit)
- Prefer debugger breakpoints in IDE
- Use proper logging library for production
- Enable source maps for better stack traces

---

## 📞 Getting Help

### Resources
- **Repository Issues:** Track bugs and features
- **Pull Requests:** Code review and collaboration
- **Documentation:** Keep docs/ folder updated

### For AI Assistants
- If task unclear, ask user for clarification
- If blocked by hooks, ask user to check configuration
- If uncertain about approach, present options to user
- Always verify assumptions before making changes

---

## 🎯 Current Priorities

### Immediate Next Steps
1. **Define project scope** - Clarify what eva-tk will be
2. **Set up project structure** - Create recommended directory layout
3. **Choose technology stack** - Decide on languages/frameworks
4. **Initialize package manager** - Set up npm/yarn/pnpm if needed
5. **Configure tooling** - Set up linting, formatting, testing
6. **Write comprehensive README** - Document project goals

### Future Considerations
- Set up CI/CD pipeline
- Add code coverage reporting
- Configure automated releases
- Set up issue/PR templates
- Add contributing guidelines
- Choose and add license

---

## 📜 Change Log

### 2025-11-19 - Initial Creation
- Created comprehensive CLAUDE.md guide
- Established coding conventions and guidelines
- Documented git workflow and branching strategy
- Set up AI assistant guidelines and best practices

---

## 🔖 Quick Reference

### Essential Commands
```bash
# Check status
git status

# Create new branch
git checkout -b claude/feature-name-<session-id>

# Commit changes
git add .
git commit -m "type: description"

# Push to remote
git push -u origin <branch-name>

# Pull latest changes
git pull origin <branch-name>
```

### File References Format
```
file_path:line_number
Example: src/core/service.ts:125
```

### Todo List Usage
Always use TodoWrite for:
- Multi-step tasks (3+ steps)
- Complex implementations
- User-provided task lists
- Tracking progress through workflows

---

## ✅ Checklist for AI Assistants

Before completing any task:
- [ ] Used TodoWrite to plan and track work
- [ ] Read existing files before editing
- [ ] Followed git branching conventions
- [ ] Checked for security vulnerabilities
- [ ] Updated documentation if needed
- [ ] Ran tests (if applicable)
- [ ] Committed with clear message
- [ ] Pushed to correct branch

---

**Note:** This document should be updated as the project evolves. Keep it synchronized with actual project structure and conventions.
