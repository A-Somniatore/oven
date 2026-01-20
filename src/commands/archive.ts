import { Command } from 'commander';
import chalk from 'chalk';
import { getProjectByName, archiveProject, unarchiveProject } from '../lib/db';
import { Project } from '../types';

export function archiveProjectAction(project: Project) {
  if (project.archived) {
    console.log(chalk.yellow(`Project "${project.name}" is already archived`));
    return;
  }

  archiveProject(project.name);
  console.log(chalk.green(`✓ Archived project: ${chalk.bold(project.name)}`));
  console.log(chalk.gray(`  Use ${chalk.cyan('oven unarchive ' + project.name)} to restore it`));
}

export function unarchiveProjectAction(project: Project) {
  if (!project.archived) {
    console.log(chalk.yellow(`Project "${project.name}" is not archived`));
    return;
  }

  unarchiveProject(project.name);
  console.log(chalk.green(`✓ Unarchived project: ${chalk.bold(project.name)}`));
  console.log(chalk.gray(`  Project is now active`));
}

export const archiveCommand = new Command('archive')
  .description('Archive a project')
  .argument('<name>', 'Project name')
  .action((name: string) => {
    const project = getProjectByName(name);
    if (!project) {
      console.log(chalk.red(`✖ Project "${name}" not found`));
      process.exit(1);
    }
    archiveProjectAction(project);
  });

export const unarchiveCommand = new Command('unarchive')
  .description('Unarchive a project')
  .argument('<name>', 'Project name')
  .action((name: string) => {
    const project = getProjectByName(name);
    if (!project) {
      console.log(chalk.red(`✖ Project "${name}" not found`));
      process.exit(1);
    }
    unarchiveProjectAction(project);
  });
