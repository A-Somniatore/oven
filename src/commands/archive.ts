import { Command } from 'commander';
import chalk from 'chalk';
import prompts from 'prompts';
import { getProjectByName, getProjects, archiveProject, unarchiveProject } from '../lib/db';
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
  .argument('[name]', 'Project name (optional)')
  .action(async (name?: string) => {
    let project: Project | undefined;

    if (name) {
      project = getProjectByName(name);
      if (project) {
        archiveProjectAction(project);
        return;
      }
    }

    const projects = getProjects({ name, includeArchived: false });

    if (projects.length === 0) {
      console.log(chalk.red('✖ No projects found to archive'));
      process.exit(1);
    }

    if (projects.length === 1) {
      project = projects[0];
    } else {
      const { selectedProject } = await prompts({
        type: 'autocomplete',
        name: 'selectedProject',
        message: 'Choose a project to archive',
        choices: projects.map(p => ({ title: p.name, value: p })),
        suggest: (input, choices) => {
          return Promise.resolve(choices.filter(c => c.title.toLowerCase().includes(input.toLowerCase())));
        }
      });
      project = selectedProject;
    }

    if (project) {
      archiveProjectAction(project);
    }
  });

export const unarchiveCommand = new Command('unarchive')
  .description('Unarchive a project')
  .argument('[name]', 'Project name (optional)')
  .action(async (name?: string) => {
    let project: Project | undefined;

    if (name) {
      project = getProjectByName(name);
      if (project) {
        unarchiveProjectAction(project);
        return;
      }
    }

    const projects = getProjects({ name, includeArchived: true }).filter(p => p.archived);

    if (projects.length === 0) {
      console.log(chalk.red('✖ No projects found to unarchive'));
      process.exit(1);
    }

    if (projects.length === 1) {
      project = projects[0];
    } else {
      const { selectedProject } = await prompts({
        type: 'autocomplete',
        name: 'selectedProject',
        message: 'Choose a project to unarchive',
        choices: projects.map(p => ({ title: p.name, value: p })),
        suggest: (input, choices) => {
          return Promise.resolve(choices.filter(c => c.title.toLowerCase().includes(input.toLowerCase())));
        }
      });
      project = selectedProject;
    }

    if (project) {
      unarchiveProjectAction(project);
    }
  });
