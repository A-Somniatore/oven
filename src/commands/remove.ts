import { Command } from 'commander';
import chalk from 'chalk';
import prompts from 'prompts';
import { getProjectByName } from '../lib/db';
import db from '../lib/db';
import { Project } from '../types';

export async function removeProject(project: Project, force = false) {
  if (!force) {
    const response = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to remove "${project.name}" from Oven? (The files will NOT be deleted)`,
      initial: false,
    });

    if (!response.confirm) {
      console.log(chalk.gray('Cancelled.'));
      return;
    }
  }

  // Remove all sessions for this project
  db.prepare('DELETE FROM sessions WHERE project_id = ?').run(project.id);

  // Remove the project
  db.prepare('DELETE FROM projects WHERE id = ?').run(project.id);

  console.log(chalk.green(`✓ Removed project: ${chalk.bold(project.name)}`));
}

export const removeCommand = new Command('remove')
  .description('Remove a project from Oven')
  .argument('<name>', 'Project name')
  .option('-f, --force', 'Skip confirmation')
  .action(async (name: string, options) => {
    const project = getProjectByName(name);

    if (!project) {
      console.log(chalk.red(`✖ Project "${name}" not found`));
      process.exit(1);
    }

    await removeProject(project, options.force);
  });
