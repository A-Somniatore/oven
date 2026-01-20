import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import prompts from 'prompts';
import { getProjects, getActiveSession } from '../lib/db';
import { formatRelativeTime } from '../lib/utils';
import { openProject } from './open';
import { cookProject } from './cook';
import { showProject } from './show';
import { archiveProjectAction, unarchiveProjectAction } from './archive';
import { removeProject } from './remove';

export const listCommand = new Command('list')
  .description('List all projects')
  .option('-a, --archived', 'Include archived projects')
  .option('-i, --interactive', 'Run in interactive mode')
  .action(async (options) => {
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
        chalk.bold('Tags'),
        chalk.bold('Last Active'),
        chalk.bold('Status'),
      ],
      style: { head: ['cyan'] },
      colWidths: [20, 40, 20, 15, 15],
      wordWrap: true,
    });

    projects.forEach((project) => {
      const isActive = project.id === activeProjectId;
      const status = isActive ? chalk.green('🍳 cooking') : '';
      const name = isActive ? chalk.green.bold(project.name) : project.name;
      const lastActive = project.last_active_at
        ? formatRelativeTime(project.last_active_at)
        : chalk.gray('never');
      const tags = project.tags && project.tags.trim()
        ? chalk.cyan(project.tags)
        : chalk.gray('-');

      table.push([
        name,
        chalk.gray(project.path),
        tags,
        lastActive,
        status,
      ]);
    });

    console.log(table.toString());
    console.log(chalk.gray(`\nTotal: ${projects.length} project(s)`));

    if (options.interactive) {
      const { project } = await prompts({
        type: 'select',
        name: 'project',
        message: 'Choose a project',
        choices: projects.map(p => ({ title: p.name, value: p })),
      });

      if (project) {
        const { action } = await prompts({
          type: 'select',
          name: 'action',
          message: `Choose an action for ${chalk.bold(project.name)}`,
          choices: [
            { title: 'Open in editor', value: 'open' },
            { title: 'Cook (start session)', value: 'cook' },
            { title: 'Show details', value: 'show' },
            project.archived
              ? { title: 'Unarchive', value: 'unarchive' }
              : { title: 'Archive', value: 'archive' },
            { title: 'Remove', value: 'remove' },
          ],
        });

        switch (action) {
          case 'open':
            openProject(project);
            break;
          case 'cook':
            cookProject(project);
            break;
          case 'show':
            showProject(project);
            break;
          case 'archive':
            archiveProjectAction(project);
            break;
          case 'unarchive':
            unarchiveProjectAction(project);
            break;
          case 'remove':
            await removeProject(project);
            break;
        }
      }
    }
  });
