# Quick Start: Using General Project-Building Rules

## Overview

This folder contains general cursor rules that help AI assistants build projects following the project-artifacts documentation structure. These rules are designed to be copied into any project.

## What's Included

### General Rules (Copy to All Projects)

1. **project-implementation.mdc** - Core implementation guide
   - Initial VM setup (Node.js, GitHub CLI, PM2, PostgreSQL)
   - How to find and read project documentation
   - Implementation workflow
   - Testing requirements (90%+ coverage)
   - Code quality standards
   - Autonomous progression guidelines

2. **self-improve.mdc** - Rule improvement guidelines
   - CRITICAL global formatting rule (no em dashes)
   - Guidelines for improving rules based on code patterns
   - Rule quality checks and maintenance

3. **cursor-rules.mdc** - How to add or edit Cursor rules
   - Rule structure format
   - File organization guidelines
   - Best practices for rule creation

4. **testing-requirements.mdc** - Mandatory testing standards
   - 90%+ test coverage requirement
   - Unit, integration, and E2E Playwright tests
   - Test pyramid structure
   - Regression testing requirements

5. **code-quality.mdc** - Code quality standards
   - Linting requirements
   - Formatting requirements
   - Type checking
   - Code cleanup standards

6. **documentation-requirements.mdc** - Documentation standards
   - Required documentation
   - Update workflow
   - Documentation standards

### Template

7. **PROJECT_SPECIFIC_RULES_TEMPLATE.mdc** - Template for project-specific rules
   - Copy and customize for each project
   - Includes sections for styling, libraries, versions, patterns

## How to Use

### When Creating a New Project

1. **Create project documentation** (following project-artifacts.mdc):
   - Main project file: `project-name.md`
   - Implementation artifact: `project-name-implementation.md`
   - Other artifacts as needed

2. **Create `.cursor/rules/` directory** in project root

3. **Copy general rules (REQUIRED - makes project self-contained):**
   ```bash
   # Create .cursor/rules directory
   mkdir -p .cursor/rules
   
   # Copy all general rules
   cp brain/resources/project-cursor-rules/project-implementation.mdc .cursor/rules/
   cp brain/resources/project-cursor-rules/testing-requirements.mdc .cursor/rules/
   cp brain/resources/project-cursor-rules/code-quality.mdc .cursor/rules/
   cp brain/resources/project-cursor-rules/documentation-requirements.mdc .cursor/rules/
   cp brain/resources/project-cursor-rules/self-improve.mdc .cursor/rules/
   cp brain/resources/project-cursor-rules/cursor-rules.mdc .cursor/rules/
   ```
   
   **Why copy general rules?** 
   - Makes the project self-contained and portable
   - You can copy the entire project folder to a new VM and start building immediately
   - No need to have access to the original workspace or `brain/resources/project-cursor-rules/`
   - All rules needed to build the project are included in the project itself

4. **Create project-specific rules:**
   ```bash
   cp brain/resources/project-cursor-rules/PROJECT_SPECIFIC_RULES_TEMPLATE.mdc .cursor/rules/project-specific.mdc
   ```
   Then customize `project-specific.mdc` with:
   - Exact technology versions
   - Project-specific styling guidelines
   - Project-specific code patterns
   - Library-specific usage patterns

5. **Initialize project:**
   - Set up project structure
   - Install dependencies (exact versions from project-specific rules)
   - Configure environment
   - Verify setup works

## Key Features

### No Hardcoded Paths

- Rules use codebase search to find project documentation
- No assumptions about file locations
- Works with any project structure

### 90%+ Test Coverage

- All projects must achieve 90%+ test coverage
- E2E Playwright tests required for all critical user flows
- Tests written as code is implemented (TDD)

### Autonomous Progression

- AI assistants work autonomously through all stages
- No stopping between stages
- Only pause for critical blockers

### Project-Specific Customization

- General rules provide foundation
- Project-specific rules customize for each project
- Ensures consistency while allowing flexibility

## Integration

These rules work with:
- **project-artifacts.mdc** - Documentation structure
- **Project documentation** - Implementation guides, architecture, etc.
- **Project-specific cursor rules** - Customized for each project

## Questions?

See the individual rule files for detailed information:
- `project-implementation.mdc` - Implementation workflow
- `testing-requirements.mdc` - Testing standards
- `code-quality.mdc` - Quality standards
- `documentation-requirements.mdc` - Documentation standards
- `PROJECT_SPECIFIC_RULES_TEMPLATE.mdc` - Template for project-specific rules

