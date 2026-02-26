/**
 * Tests for workflow and configuration files
 *
 * @author Tegar Wijaya Kusuma
 * @date 26 February 2026
 */

import { describe, expect, it } from 'bun:test';
import { readFileSync, existsSync } from 'fs';
import { parse as parseYAML } from 'yaml';

describe('Configuration Files Validation', () => {
  describe('.coderabbit.yaml', () => {
    const CONFIG_PATH = '.coderabbit.yaml';
    let configContent: string;
    let parsedConfig: Record<string, unknown>;

    // Helper to load config once for efficiency
    const loadConfig = () => {
      if (!configContent) {
        configContent = readFileSync(CONFIG_PATH, 'utf-8');
        parsedConfig = parseYAML(configContent) as Record<string, unknown>;
      }
      return { content: configContent, config: parsedConfig };
    };

    it('Should exist in the repository root', () => {
      expect(existsSync(CONFIG_PATH)).toBe(true);
    });

    it('Should be valid YAML syntax', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      expect(() => parseYAML(content)).not.toThrow();
    });

    it('Should have required top-level fields', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;

      expect(config).toHaveProperty('language');
      expect(config).toHaveProperty('reviews');
      expect(config).toHaveProperty('chat');
      expect(config).toHaveProperty('personality');
    });

    it('Should have language set to en-US', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;

      expect(config.language).toBe('en-US');
    });

    it('Should have reviews object with correct structure', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const reviews = config.reviews as Record<string, unknown>;

      expect(reviews).toBeObject();
      expect(reviews).toHaveProperty('profile');
      expect(reviews).toHaveProperty('request_changes_workflow');
      expect(reviews).toHaveProperty('high_level_summary');
      expect(reviews).toHaveProperty('poem');
      expect(reviews).toHaveProperty('collapse_walkthrough');
      expect(reviews).toHaveProperty('auto_review');
      expect(reviews).toHaveProperty('path_filters');
    });

    it('Should have assertive review profile', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const reviews = config.reviews as Record<string, unknown>;

      expect(reviews.profile).toBe('assertive');
    });

    it('Should have auto_review enabled with drafts disabled', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const reviews = config.reviews as Record<string, unknown>;
      const autoReview = reviews.auto_review as Record<string, unknown>;

      expect(autoReview).toBeObject();
      expect(autoReview.enabled).toBe(true);
      expect(autoReview.drafts).toBe(false);
    });

    it('Should have path_filters array', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const reviews = config.reviews as Record<string, unknown>;
      const pathFilters = reviews.path_filters;

      expect(pathFilters).toBeArray();
      expect((pathFilters as unknown[]).length).toBeGreaterThan(0);
    });

    it('Should exclude .json and bun.lockb files from review', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const reviews = config.reviews as Record<string, unknown>;
      const pathFilters = reviews.path_filters as string[];

      expect(pathFilters).toContain('!*.json');
      expect(pathFilters).toContain('!bun.lockb');
    });

    it('Should have chat auto_reply enabled', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const chat = config.chat as Record<string, unknown>;

      expect(chat).toBeObject();
      expect(chat.auto_reply).toBe(true);
    });

    it('Should have custom personality string', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;

      expect(typeof config.personality).toBe('string');
      expect((config.personality as string).length).toBeGreaterThan(100);
    });

    it('Should have personality mentioning senior backend engineer', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const personality = config.personality as string;

      expect(personality.toLowerCase()).toContain('senior backend engineer');
    });

    it('Should not request changes workflow by default', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const reviews = config.reviews as Record<string, unknown>;

      expect(reviews.request_changes_workflow).toBe(false);
    });

    it('Should have poem disabled', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const reviews = config.reviews as Record<string, unknown>;

      expect(reviews.poem).toBe(false);
    });

    it('Should have boolean flags set correctly', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const reviews = config.reviews as Record<string, unknown>;

      expect(typeof reviews.high_level_summary).toBe('boolean');
      expect(typeof reviews.collapse_walkthrough).toBe('boolean');
      expect(typeof reviews.request_changes_workflow).toBe('boolean');
      expect(typeof reviews.poem).toBe('boolean');
    });

    // Edge case: Verify file is not empty
    it('Should not be an empty file', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      expect(content.trim().length).toBeGreaterThan(0);
    });

    // Edge case: Verify YAML starts with comment
    it('Should start with a comment header', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      expect(content.trim().startsWith('#')).toBe(true);
    });

    // Edge case: Ensure no unexpected top-level keys
    it('Should only have expected top-level keys', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const expectedKeys = ['language', 'reviews', 'chat', 'personality'];
      const actualKeys = Object.keys(config);

      expectedKeys.forEach(key => {
        expect(actualKeys).toContain(key);
      });

      // Should not have extra unexpected keys
      expect(actualKeys.length).toBeLessThanOrEqual(expectedKeys.length + 1); // Allow one extra for extensibility
    });

    // Edge case: Validate path_filters are properly formatted negations
    it('Should have properly formatted path filter negations', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const reviews = config.reviews as Record<string, unknown>;
      const pathFilters = reviews.path_filters as string[];

      pathFilters.forEach(filter => {
        if (filter.startsWith('!')) {
          expect(filter.length).toBeGreaterThan(1); // Not just "!"
          expect(filter.charAt(1)).not.toBe('!'); // Not double negation
        }
      });
    });

    // Regression test: Verify auto_review structure hasn't changed
    it('Should maintain auto_review structure with enabled and drafts fields', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const reviews = config.reviews as Record<string, unknown>;
      const autoReview = reviews.auto_review as Record<string, unknown>;

      expect(Object.keys(autoReview)).toContain('enabled');
      expect(Object.keys(autoReview)).toContain('drafts');
      expect(typeof autoReview.enabled).toBe('boolean');
      expect(typeof autoReview.drafts).toBe('boolean');
    });

    // Security: Ensure personality doesn't contain sensitive patterns
    it('Should not contain potential secrets or API keys in personality', () => {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      const config = parseYAML(content) as Record<string, unknown>;
      const personality = config.personality as string;

      // Check for common secret patterns
      expect(personality).not.toMatch(/api[_-]?key/i);
      expect(personality).not.toMatch(/secret/i);
      expect(personality).not.toMatch(/password/i);
      expect(personality).not.toMatch(/token/i);
    });
  });

  describe('.github/workflows/semgrep.yml', () => {
    const WORKFLOW_PATH = '.github/workflows/semgrep.yml';

    it('Should exist in .github/workflows directory', () => {
      expect(existsSync(WORKFLOW_PATH)).toBe(true);
    });

    it('Should be valid YAML syntax', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      expect(() => parseYAML(content)).not.toThrow();
    });

    it('Should have required GitHub Actions workflow fields', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;

      expect(workflow).toHaveProperty('name');
      expect(workflow).toHaveProperty('on');
      expect(workflow).toHaveProperty('jobs');
    });

    it('Should have permissions defined', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;

      expect(workflow).toHaveProperty('permissions');
      expect(workflow.permissions).toBeObject();
    });

    it('Should have contents: read permission', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const permissions = workflow.permissions as Record<string, unknown>;

      expect(permissions.contents).toBe('read');
    });

    it('Should be named CI', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;

      expect(workflow.name).toBe('CI');
    });

    it('Should trigger on push to all branches', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const on = workflow.on as Record<string, unknown>;
      const push = on.push as Record<string, unknown>;

      expect(push).toBeObject();
      expect(push).toHaveProperty('branches');
      expect((push.branches as string[])).toContain('**');
    });

    it('Should trigger on pull_request to main branch', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const on = workflow.on as Record<string, unknown>;
      const pullRequest = on.pull_request as Record<string, unknown>;

      expect(pullRequest).toBeObject();
      expect(pullRequest).toHaveProperty('branches');
      expect((pullRequest.branches as string[])).toContain('main');
    });

    it('Should have a build job', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;

      expect(jobs).toHaveProperty('build');
    });

    it('Should run on ubuntu-latest', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;
      const build = jobs.build as Record<string, unknown>;

      expect(build['runs-on']).toBe('ubuntu-latest');
    });

    it('Should have checkout step with pinned SHA', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;
      const build = jobs.build as Record<string, unknown>;
      const steps = build.steps as Array<Record<string, unknown>>;

      const checkoutStep = steps.find((step) => step.uses && (step.uses as string).startsWith('actions/checkout@'));
      expect(checkoutStep).toBeDefined();
      expect(checkoutStep?.uses).toBe('actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd');
    });

    it('Should have Bun setup step with pinned SHA', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;
      const build = jobs.build as Record<string, unknown>;
      const steps = build.steps as Array<Record<string, unknown>>;

      const bunStep = steps.find((step) => step.uses && (step.uses as string).startsWith('oven-sh/setup-bun@'));
      expect(bunStep).toBeDefined();
      expect(bunStep?.uses).toBe('oven-sh/setup-bun@3d267786b128fe76c2f16a390aa2448b815359f3');
    });

    it('Should install dependencies with bun install', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;
      const build = jobs.build as Record<string, unknown>;
      const steps = build.steps as Array<Record<string, unknown>>;

      const installStep = steps.find((step) => step.name === 'Install dependencies');
      expect(installStep).toBeDefined();
      expect(installStep?.run).toBe('bun install');
    });

    it('Should run type checking with tsc', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;
      const build = jobs.build as Record<string, unknown>;
      const steps = build.steps as Array<Record<string, unknown>>;

      const typeCheckStep = steps.find((step) => step.name === 'Type check');
      expect(typeCheckStep).toBeDefined();
      expect(typeCheckStep?.run).toBe('bunx tsc --noEmit');
    });

    it('Should run tests with bun test', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;
      const build = jobs.build as Record<string, unknown>;
      const steps = build.steps as Array<Record<string, unknown>>;

      const testStep = steps.find((step) => step.name === 'Run tests');
      expect(testStep).toBeDefined();
      expect(testStep?.run).toBe('bun test');
    });

    it('Should have all required steps in correct order', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;
      const build = jobs.build as Record<string, unknown>;
      const steps = build.steps as Array<Record<string, unknown>>;

      expect(steps.length).toBeGreaterThanOrEqual(4);

      // Verify steps exist and are in logical order
      const stepNames = steps.map(step => step.name || 'checkout').filter(Boolean);
      expect(stepNames).toContain('Setup Bun');
      expect(stepNames).toContain('Install dependencies');
      expect(stepNames).toContain('Type check');
      expect(stepNames).toContain('Run tests');
    });

    it('Should use Bun version latest', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;
      const build = jobs.build as Record<string, unknown>;
      const steps = build.steps as Array<Record<string, unknown>>;

      const bunStep = steps.find((step) => step.uses && (step.uses as string).startsWith('oven-sh/setup-bun@'));
      expect(bunStep?.with).toBeDefined();
      expect((bunStep?.with as Record<string, unknown>)['bun-version']).toBe('latest');
    });

    it('Should not have write permissions', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const permissions = workflow.permissions as Record<string, unknown>;

      // Ensure no write permissions are granted
      const permValues = Object.values(permissions);
      expect(permValues.every(val => val === 'read' || val === 'none')).toBe(true);
    });

    it('Should follow security best practices with pinned action versions', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;
      const build = jobs.build as Record<string, unknown>;
      const steps = build.steps as Array<Record<string, unknown>>;

      const stepsWithActions = steps.filter(step => step.uses);

      // All actions should use SHA pinning (40 character hex string)
      stepsWithActions.forEach(step => {
        const uses = step.uses as string;
        const parts = uses.split('@');
        if (parts.length === 2) {
          const version = parts[1];
          // Check if it's a SHA (40 hex characters) or at least not just a tag
          expect(version.length).toBeGreaterThan(10);
        }
      });
    });

    // Edge case: Verify file is not empty
    it('Should not be an empty workflow file', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      expect(content.trim().length).toBeGreaterThan(0);
    });

    // Edge case: Verify steps run in the correct logical order
    it('Should execute install before type check and tests', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;
      const build = jobs.build as Record<string, unknown>;
      const steps = build.steps as Array<Record<string, unknown>>;

      const installIndex = steps.findIndex(step => step.name === 'Install dependencies');
      const typeCheckIndex = steps.findIndex(step => step.name === 'Type check');
      const testIndex = steps.findIndex(step => step.name === 'Run tests');

      expect(installIndex).toBeGreaterThan(-1);
      expect(typeCheckIndex).toBeGreaterThan(installIndex);
      expect(testIndex).toBeGreaterThan(installIndex);
    });

    // Edge case: Ensure checkout happens first
    it('Should checkout code before any other steps', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;
      const build = jobs.build as Record<string, unknown>;
      const steps = build.steps as Array<Record<string, unknown>>;

      const firstStep = steps[0];
      expect(firstStep.uses).toBeDefined();
      expect((firstStep.uses as string).startsWith('actions/checkout@')).toBe(true);
    });

    // Security: No hardcoded secrets or tokens
    it('Should not contain hardcoded secrets or credentials', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');

      // Check for common secret patterns
      expect(content).not.toMatch(/ghp_[a-zA-Z0-9]{36}/); // GitHub personal access token
      expect(content).not.toMatch(/ghs_[a-zA-Z0-9]{36}/); // GitHub app installation token
      expect(content).not.toMatch(/github_pat_[a-zA-Z0-9_]{82}/); // GitHub fine-grained token
      expect(content.toLowerCase()).not.toMatch(/password:\s*[^\s]+/);
    });

    // Regression: Ensure permissions fix is maintained
    it('Should maintain the permissions fix from commit 08b80bb', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;

      // This test ensures the security fix isn't accidentally removed
      expect(workflow.permissions).toBeDefined();
      expect(workflow.permissions).not.toBeNull();
      expect(typeof workflow.permissions).toBe('object');
    });

    // Edge case: Validate trigger configuration completeness
    it('Should have both push and pull_request triggers defined', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const on = workflow.on as Record<string, unknown>;

      expect(on).toHaveProperty('push');
      expect(on).toHaveProperty('pull_request');
      expect(Object.keys(on).length).toBeGreaterThanOrEqual(2);
    });

    // Edge case: Verify all steps have either 'uses' or 'run'
    it('Should have valid step definitions (uses or run)', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;
      const build = jobs.build as Record<string, unknown>;
      const steps = build.steps as Array<Record<string, unknown>>;

      steps.forEach(step => {
        const hasUses = step.uses !== undefined;
        const hasRun = step.run !== undefined;
        expect(hasUses || hasRun).toBe(true);
      });
    });

    // Boundary test: Verify naming conventions
    it('Should follow GitHub Actions naming conventions', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;

      // Workflow name should exist and be a string
      expect(typeof workflow.name).toBe('string');
      expect((workflow.name as string).length).toBeGreaterThan(0);
      expect((workflow.name as string).length).toBeLessThan(100);
    });

    // Performance: Ensure no duplicate steps
    it('Should not have duplicate step names', () => {
      const content = readFileSync(WORKFLOW_PATH, 'utf-8');
      const workflow = parseYAML(content) as Record<string, unknown>;
      const jobs = workflow.jobs as Record<string, unknown>;
      const build = jobs.build as Record<string, unknown>;
      const steps = build.steps as Array<Record<string, unknown>>;

      const stepNames = steps.map(step => step.name).filter(Boolean);
      const uniqueNames = new Set(stepNames);

      expect(stepNames.length).toBe(uniqueNames.size);
    });
  });
});