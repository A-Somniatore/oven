import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { addProject } from '../lib/db';
import { getConfig } from '../lib/config';

export const addCommand = new Command('add')
  .description('Register a new project')
  .argument('<name>', 'Project name')
  .option('-p, --path <dir>', 'Project directory path')
  .option('-d, --desc <description>', 'Project description')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .action((name: string, options) => {
    const config = getConfig();
    const projectPath = options.path
      ? resolve(options.path)
      : resolve(config.default_project_root, name);

    if (!existsSync(projectPath)) {
      console.log(chalk.red(`✖ Path does not exist: ${projectPath}`));
      console.log(chalk.gray(`  Create it first or specify a different --path`));
      process.exit(1);
    }

    try {
      addProject({
        name,
        path: projectPath,
        description: options.desc,
        tags: options.tags,
        archived: false,
        created_at: new Date().toISOString(),
      });

      console.log(chalk.green(`✓ Added project: ${chalk.bold(name)}`));
      console.log(chalk.gray(`  ${projectPath}`));
      if (options.desc) {
        console.log(chalk.gray(`  ${options.desc}`));
      }
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint')) {
        console.log(chalk.red(`✖ Project "${name}" already exists`));
      } else {
        console.log(chalk.red(`✖ Error: ${error.message}`));
      }
      process.exit(1);
    }
  });
