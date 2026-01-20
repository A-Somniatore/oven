import { Command } from 'commander';
import chalk from 'chalk';
import prompts from 'prompts';
import { getProjectByName, getProjects } from '../lib/db';
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
  .argument('[name]', 'Project name (optional)')
  .option('-f, --force', 'Skip confirmation')
  .action(async (name: string | undefined, options) => {
    let project: Project | undefined;

    if (name) {
      project = getProjectByName(name);
      if (project) {
        await removeProject(project, options.force);
        return;
      }
    }

    const projects = getProjects({ name });

    if (projects.length === 0) {
      console.log(chalk.red('✖ No projects found'));
      process.exit(1);
    }

    if (projects.length === 1) {
      project = projects[0];
    } else {
      const { selectedProject } = await prompts({
        type: 'autocomplete',
        name: 'selectedProject',
        message: 'Choose a project to remove',
        choices: projects.map(p => ({ title: p.name, value: p })),
        suggest: (input, choices) => {
          return Promise.resolve(choices.filter(c => c.title.toLowerCase().includes(input.toLowerCase())));
        }
      });
      project = selectedProject;
    }

    if (project) {
      await removeProject(project, options.force);
    }
  });
