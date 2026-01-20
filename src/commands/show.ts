import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { getProjectByName, getSessionsForProject } from '../lib/db';
import { formatRelativeTime, formatDuration, getSessionDuration } from '../lib/utils';
import { Project } from '../types';

export function showProject(project: Project) {
  const sessions = getSessionsForProject(project.id!, 5);
  const totalTime = sessions.reduce((acc, s) => acc + getSessionDuration(s), 0);

  const descriptionLine = project.description && project.description.trim()
    ? `${chalk.cyan('Description:')} ${project.description}\n`
    : '';
  const tagsLine = project.tags && project.tags.trim()
    ? `${chalk.cyan('Tags:')} ${project.tags}\n`
    : '';
  const lastActiveLine = project.last_active_at
    ? `${chalk.cyan('Last Active:')} ${formatRelativeTime(project.last_active_at)}\n`
    : '';

  const details = `
${chalk.bold.cyan('Project:')} ${chalk.bold(project.name)}
${chalk.gray('─'.repeat(50))}
${chalk.cyan('Path:')} ${project.path}
${descriptionLine}${tagsLine}${chalk.cyan('Created:')} ${formatRelativeTime(project.created_at)}
${lastActiveLine}${chalk.cyan('Total Time:')} ${formatDuration(totalTime)}
${chalk.cyan('Sessions:')} ${sessions.length} recent

${sessions.length > 0 ? chalk.gray('Recent sessions:') : ''}
${sessions.map(s => {
  const duration = formatDuration(getSessionDuration(s));
  const task = s.task ? ` - ${s.task}` : '';
  return chalk.gray(`  • ${formatRelativeTime(s.started_at)} (${duration})${task}`);
}).join('\n')}
  `.trim();

  console.log(boxen(details, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
  }));
}

export const showCommand = new Command('show')
  .description('Show project details')
  .argument('<name>', 'Project name')
  .action((name: string) => {
    const project = getProjectByName(name);

    if (!project) {
      console.log(chalk.red(`✖ Project "${name}" not found`));
      process.exit(1);
    }

    showProject(project);
  });
