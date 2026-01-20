import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import { getProjectByName, getProjects, startSession, getActiveSession } from '../lib/db';
import { Project } from '../types';

export function cookProject(project: Project, task?: string) {
  const spinner = ora('Preheating the oven...').start();

  const active = getActiveSession();
  if (active) {
    spinner.info(chalk.yellow('Pausing current session...'));
  }

  startSession(project.id!, task);

  spinner.succeed(chalk.green(`🍳 Now cooking: ${chalk.bold(project.name)}`));
  if (task) {
    console.log(chalk.gray(`   Task: ${task}`));
  }
  console.log(chalk.gray(`\n   Use ${chalk.cyan('oven now')} to check status`));
}

export const cookCommand = new Command('cook')
  .description('Start cooking a project (start a work session)')
  .argument('[project]', 'Project name (optional)')
  .option('-t, --task <task>', 'Task description')
  .action(async (projectName: string | undefined, options) => {
    let project: Project | undefined;

    if (projectName) {
      project = getProjectByName(projectName);
      if (project) {
        cookProject(project, options.task);
        return;
      }
    }

    const projects = getProjects({ name: projectName });

    if (projects.length === 0) {
      console.log(chalk.red('✖ No projects found'));
      process.exit(1);
    }

    if (projects.length === 1) {
      project = projects[0];
    } else {
      const { selectedProject } = await prompts({
        type: 'select',
        name: 'selectedProject',
        message: 'Choose a project to cook',
        choices: projects.map(p => ({ title: p.name, value: p })),
      });
      project = selectedProject;
    }

    if (project) {
      cookProject(project, options.task);
    }
  });
