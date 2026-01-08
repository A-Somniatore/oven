import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getProjects, getActiveSession } from '../lib/db';
import { formatRelativeTime } from '../lib/utils';

export const listCommand = new Command('list')
  .description('List all projects')
  .option('-a, --archived', 'Include archived projects')
  .action((options) => {
    const projects = getProjects(options.archived);
    const activeSession = getActiveSession();
    const activeProjectId = activeSession?.project_id;

    if (projects.length === 0) {
      console.log(chalk.gray('No projects yet. Add one with: oven add <name>'));
      return;
    }

    const table = new Table({
      head: [
        chalk.bold('Project'),
        chalk.bold('Path'),
        chalk.bold('Last Active'),
        chalk.bold('Status'),
      ],
      style: { head: ['cyan'] },
      colWidths: [25, 50, 20, 15],
      wordWrap: true,
    });

    projects.forEach((project) => {
      const isActive = project.id === activeProjectId;
      const status = isActive ? chalk.green('🍳 cooking') : '';
      const name = isActive ? chalk.green.bold(project.name) : project.name;
      const lastActive = project.last_active_at
        ? formatRelativeTime(project.last_active_at)
        : chalk.gray('never');

      table.push([
        name,
        chalk.gray(project.path),
        lastActive,
        status,
      ]);
    });

    console.log(table.toString());
    console.log(chalk.gray(`\nTotal: ${projects.length} project(s)`));
  });
