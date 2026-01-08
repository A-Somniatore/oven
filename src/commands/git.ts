import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { addProject } from '../lib/db';
import { getConfig } from '../lib/config';

function runCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error: any) {
    throw new Error(error.stderr || error.message);
  }
}

export const gitOrgsCommand = new Command('orgs')
  .description('List available GitHub organizations')
  .action(() => {
    const spinner = ora('Fetching GitHub organizations...').start();

    try {
      const output = runCommand('gh api user/orgs --jq ".[].login"');
      const orgs = output.trim().split('\n').filter(Boolean);

      spinner.succeed(chalk.green('GitHub Organizations:'));
      orgs.forEach(org => console.log(chalk.cyan(`  • ${org}`)));

      // Also show user's personal repos
      const user = runCommand('gh api user --jq ".login"').trim();
      console.log(chalk.cyan(`  • ${user} ${chalk.gray('(personal)')}`));
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to fetch organizations'));
      console.log(chalk.gray(error.message));
      process.exit(1);
    }
  });

export const gitInitCommand = new Command('init')
  .description('Create and initialize a GitHub repository')
  .argument('<org>/<repo>', 'Organization/repository name (e.g., myorg/myrepo)')
  .option('--public', 'Create public repository')
  .option('--private', 'Create private repository (default)', true)
  .option('--desc <description>', 'Repository description')
  .option('--path <dir>', 'Local directory path')
  .option('--clone', 'Clone instead of git init')
  .option('--push-initial', 'Create and push initial commit')
  .option('--readme', 'Create README.md file')
  .option('--ssh', 'Use SSH protocol (default)', true)
  .option('--https', 'Use HTTPS protocol')
  .action((orgRepo: string, options) => {
    const [org, repo] = orgRepo.split('/');

    if (!org || !repo) {
      console.log(chalk.red('✖ Invalid format. Use: org/repo'));
      console.log(chalk.gray('  Example: oven git init myorg/myproject'));
      process.exit(1);
    }

    const config = getConfig();
    const projectPath = options.path
      ? resolve(options.path)
      : join(config.default_project_root, repo);

    const spinner = ora('Creating GitHub repository...').start();

    try {
      // Create GitHub repository
      const visibility = options.public ? 'public' : 'private';
      let ghCommand = `gh repo create ${org}/${repo} --${visibility}`;
      if (options.desc) {
        ghCommand += ` --description "${options.desc}"`;
      }

      if (options.clone) {
        ghCommand += ` --clone`;
        if (options.path) {
          ghCommand += ` --path "${projectPath}"`;
        }
      }

      runCommand(ghCommand);
      spinner.succeed(chalk.green(`✓ Created GitHub repository: ${org}/${repo}`));

      // Initialize locally if not cloning
      if (!options.clone) {
        spinner.start('Initializing local repository...');

        if (!existsSync(projectPath)) {
          mkdirSync(projectPath, { recursive: true });
        }

        process.chdir(projectPath);
        runCommand('git init');

        // Create README if requested
        if (options.readme) {
          const readmeContent = `# ${repo}\n\n${options.desc || 'Project description'}\n`;
          writeFileSync(join(projectPath, 'README.md'), readmeContent);
        }

        // Add remote
        const protocol = options.https ? 'https' : options.ssh !== false ? 'ssh' : config.git_protocol;
        const remoteUrl = protocol === 'ssh'
          ? `git@github.com:${org}/${repo}.git`
          : `https://github.com/${org}/${repo}.git`;

        runCommand(`git remote add origin ${remoteUrl}`);
        spinner.succeed(chalk.green('✓ Initialized local repository'));

        // Create initial commit if requested
        if (options.pushInitial) {
          spinner.start('Creating initial commit...');
          runCommand('git add .');
          runCommand('git commit -m "Initial commit"');
          runCommand('git branch -M main');
          runCommand('git push -u origin main');
          spinner.succeed(chalk.green('✓ Pushed initial commit'));
        }
      }

      // Register project in Oven
      spinner.start('Registering project in Oven...');
      addProject({
        name: repo,
        path: projectPath,
        description: options.desc,
        archived: false,
        git_org: org,
        git_repo: repo,
        git_remote_url: `https://github.com/${org}/${repo}`,
        created_at: new Date().toISOString(),
      });

      spinner.succeed(chalk.green(`✓ Registered project in Oven`));

      console.log(boxen(
        `
${chalk.bold.green('🎉 Repository Ready!')}
${chalk.gray('─'.repeat(40))}
${chalk.cyan('Repository:')} https://github.com/${org}/${repo}
${chalk.cyan('Local Path:')} ${projectPath}
${chalk.cyan('Project:')} ${repo}

${chalk.gray('Next steps:')}
  ${chalk.cyan('oven cook ' + repo)} - Start working
  ${chalk.cyan('oven open ' + repo)} - Open in editor
        `.trim(),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'green',
        }
      ));
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to create repository'));
      console.log(chalk.gray(error.message));
      process.exit(1);
    }
  });

// Create git command group
export const gitCommand = new Command('git')
  .description('GitHub integration commands')
  .addCommand(gitOrgsCommand)
  .addCommand(gitInitCommand);
