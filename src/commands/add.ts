import { Command } from 'commander';
import chalk from 'chalk';
import prompts from 'prompts';
import { resolve, basename } from 'path';
import { existsSync } from 'fs';
import { addProject } from '../lib/db';
import { getConfig } from '../lib/config';

async function interactiveAdd(providedPath?: string) {
  const cwd = process.cwd();
  const defaultName = basename(cwd);
  const defaultPath = providedPath || cwd;

  console.log(chalk.cyan('\n🍳 Add a new project to Oven\n'));

  const response = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Project name:',
      initial: defaultName,
      validate: (value: string) => value.length > 0 ? true : 'Project name is required',
    },
    {
      type: 'text',
      name: 'path',
      message: 'Project path:',
      initial: defaultPath,
      validate: (value: string) => {
        const resolvedPath = resolve(value);
        return existsSync(resolvedPath) ? true : `Path does not exist: ${resolvedPath}`;
      },
    },
    {
      type: 'text',
      name: 'description',
      message: 'Description (optional):',
    },
    {
      type: 'text',
      name: 'tags',
      message: 'Tags (comma-separated, optional):',
      format: (value: string) => value.trim() || undefined,
    },
  ], {
    onCancel: () => {
      console.log(chalk.gray('\nCancelled'));
      process.exit(0);
    },
  });

  return response;
}

export const addCommand = new Command('add')
  .description('Register a new project')
  .argument('[name]', 'Project name (optional, will prompt if not provided)')
  .option('-p, --path <dir>', 'Project directory path (defaults to current directory)')
  .option('-d, --desc <description>', 'Project description')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .action(async (name?: string, options?) => {
    let projectData: any;
    let projectName: string;
    let projectOptions: any = options;

    // Interactive mode if no name provided
    if (!name) {
      projectData = await interactiveAdd(options?.path);
      projectName = projectData.name;
      projectOptions = {
        path: projectData.path,
        desc: projectData.description,
        tags: projectData.tags,
      };
    } else {
      projectName = name;
    }

    const config = getConfig();
    const projectPath = projectOptions?.path
      ? resolve(projectOptions.path)
      : process.cwd(); // Default to current directory

    if (!existsSync(projectPath)) {
      console.log(chalk.red(`✖ Path does not exist: ${projectPath}`));
      console.log(chalk.gray(`  Create it first or specify a different --path`));
      process.exit(1);
    }

    try {
      addProject({
        name: projectName,
        path: projectPath,
        description: projectOptions.desc,
        tags: projectOptions.tags,
        archived: false,
        created_at: new Date().toISOString(),
      });

      console.log(chalk.green(`\n✓ Added project: ${chalk.bold(projectName)}`));
      console.log(chalk.gray(`  📁 ${projectPath}`));
      if (projectOptions.desc) {
        console.log(chalk.gray(`  📝 ${projectOptions.desc}`));
      }
      if (projectOptions.tags) {
        console.log(chalk.gray(`  🏷️  ${projectOptions.tags}`));
      }
      console.log(chalk.gray(`\n  Start cooking: ${chalk.cyan('oven cook ' + projectName)}`));
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint')) {
        console.log(chalk.red(`\n✖ Project "${projectName}" already exists`));
        console.log(chalk.gray(`  Use ${chalk.cyan('oven remove ' + projectName + ' --force')} to remove it first`));
      } else {
        console.log(chalk.red(`✖ Error: ${error.message}`));
      }
      process.exit(1);
    }
  });
