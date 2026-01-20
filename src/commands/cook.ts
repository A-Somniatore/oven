import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getProjectByName, startSession, getActiveSession } from '../lib/db';
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
  .argument('<project>', 'Project name')
  .option('-t, --task <task>', 'Task description')
  .action((projectName: string, options) => {
    const project = getProjectByName(projectName);
    if (!project) {
      console.log(chalk.red(`Project "${projectName}" not found`));
      process.exit(1);
    }
    cookProject(project, options.task);
  });
