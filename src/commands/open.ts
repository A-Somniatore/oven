import { Command } from 'commander';
import chalk from 'chalk';
import { spawn } from 'child_process';
import prompts from 'prompts';
import { getProjectByName, getProjects } from '../lib/db';
import { getConfig } from '../lib/config';
import { Project } from '../types';

export function openProject(project: Project) {
  const config = getConfig();
  console.log(chalk.gray(`Opening ${project.name} in ${config.editor_command}...`));

  const editor = spawn(config.editor_command, [project.path], {
    detached: true,
    stdio: 'ignore',
  });

  editor.unref();
  console.log(chalk.green(`✓ Opened ${project.name}`));
}

export const openCommand = new Command('open')
  .description('Open project in editor')
  .argument('[name]', 'Project name (optional)')
  .action(async (name?: string) => {
    let project: Project | undefined;

    if (name) {
      project = getProjectByName(name);
      if (project) {
        openProject(project);
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
        message: 'Choose a project to open',
        choices: projects.map(p => ({ title: p.name, value: p })),
        suggest: (input, choices) => {
          return Promise.resolve(choices.filter(c => c.title.toLowerCase().includes(input.toLowerCase())));
        }
      });
      project = selectedProject;
    }

    if (project) {
      openProject(project);
    }
  });
