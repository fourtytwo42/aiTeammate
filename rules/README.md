# General Project-Building Cursor Rules

This folder contains general cursor rules that can be copied into any project to help AI assistants build projects following the project-artifacts documentation structure.

## Purpose

These rules provide:
- General guidelines for building any project
- Testing requirements (90%+ coverage including E2E Playwright)
- Code quality standards
- Implementation patterns
- Documentation requirements

## Usage

**When creating a new project (REQUIRED):**
1. **Create `.cursor/rules/` directory** in project root
2. **Copy ALL general rules** from this folder to the project's `.cursor/rules/` directory:
   ```bash
   mkdir -p .cursor/rules
   cp brain/resources/project-cursor-rules/project-implementation.mdc .cursor/rules/
   cp brain/resources/project-cursor-rules/testing-requirements.mdc .cursor/rules/
   cp brain/resources/project-cursor-rules/code-quality.mdc .cursor/rules/
   cp brain/resources/project-cursor-rules/documentation-requirements.mdc .cursor/rules/
   cp brain/resources/project-cursor-rules/self-improve.mdc .cursor/rules/
   cp brain/resources/project-cursor-rules/cursor-rules.mdc .cursor/rules/
   ```
3. **Create project-specific cursor rules** (see template below)
4. **Update project-specific rules** with project details (styling, libraries, versions, etc.)

**Why copy general rules?**
- Makes the project **self-contained and portable**
- You can copy the entire project folder to a new VM and start building immediately
- No need to have access to the original workspace
- All rules needed to build the project are included in the project itself

## General Rules Included

1. **project-implementation.mdc** - Core implementation guide for building projects from documentation
   - Includes initial VM setup (Node.js, GitHub CLI, PM2, PostgreSQL)
   - GitHub CLI authentication with URL/code flow
   - PM2 persistence configuration
2. **testing-requirements.mdc** - Mandatory testing standards (90%+ coverage, E2E Playwright)
3. **code-quality.mdc** - Code quality standards and verification
4. **documentation-requirements.mdc** - Documentation standards for projects
5. **self-improve.mdc** - Rule improvement guidelines and CRITICAL global formatting rule (no em dashes)
6. **cursor-rules.mdc** - How to add or edit Cursor rules in projects (meta-rule)

## Project-Specific Rules

Each project should also have its own cursor rules in `.cursor/rules/` that specify:
- Project-specific styling guidelines
- Exact library versions to use
- Project-specific testing requirements
- Project-specific patterns and conventions
- Technology stack specifics

See `PROJECT_SPECIFIC_RULES_TEMPLATE.mdc` for a template.

## Integration with Project Artifacts

These rules work with the project-artifacts documentation structure:
- Rules reference project documentation using codebase search
- No hardcoded paths - use search to find project files
- Rules follow the artifact structure defined in project-artifacts.mdc

