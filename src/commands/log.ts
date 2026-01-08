import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import dayjs from 'dayjs';
import { getProjectByName, getSessionsForProject, getProjects } from '../lib/db';
import db from '../lib/db';
import { formatDuration, getSessionDuration, formatRelativeTime } from '../lib/utils';

export const logCommand = new Command('log')
  .description('Show session history')
  .argument('[project]', 'Project name (optional)')
  .option('--today', 'Show only today\'s sessions')
  .option('--week', 'Show this week\'s sessions')
  .option('--since <date>', 'Show sessions since date (YYYY-MM-DD)')
  .action((projectName: string | undefined, options) => {
    let sessions: any[] = [];

    if (projectName) {
      // Show sessions for specific project
      const project = getProjectByName(projectName);
      if (!project) {
        console.log(chalk.red(`✖ Project "${projectName}" not found`));
        process.exit(1);
      }
      sessions = getSessionsForProject(project.id!);
    } else {
      // Show all sessions
      sessions = db.prepare('SELECT * FROM sessions ORDER BY started_at DESC').all();
    }

    // Filter by date if options provided
    const now = dayjs();
    if (options.today) {
      const todayStart = now.startOf('day').toISOString();
      sessions = sessions.filter(s => s.started_at >= todayStart);
    } else if (options.week) {
      const weekStart = now.startOf('week').toISOString();
      sessions = sessions.filter(s => s.started_at >= weekStart);
    } else if (options.since) {
      const sinceDate = dayjs(options.since).toISOString();
      sessions = sessions.filter(s => s.started_at >= sinceDate);
    }

    if (sessions.length === 0) {
      console.log(chalk.gray('No sessions found'));
      return;
    }

    const table = new Table({
      head: [
        chalk.bold('Project'),
        chalk.bold('Started'),
        chalk.bold('Duration'),
        chalk.bold('Task'),
        chalk.bold('Status'),
      ],
      style: { head: ['cyan'] },
      colWidths: [20, 20, 15, 35, 12],
      wordWrap: true,
    });

    sessions.forEach((session) => {
      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(session.project_id) as any;
      const duration = formatDuration(getSessionDuration(session));
      const started = formatRelativeTime(session.started_at);
      const task = session.task || chalk.gray('-');
      const status = session.ended_at
        ? chalk.green('✓')
        : session.paused_at
        ? chalk.yellow('⏸')
        : chalk.green('🍳');

      table.push([
        project.name,
        started,
        duration,
        task,
        status,
      ]);
    });

    console.log(table.toString());
    console.log(chalk.gray(`\nTotal: ${sessions.length} session(s)`));

    // Show total time
    const totalTime = sessions.reduce((acc, s) => acc + getSessionDuration(s), 0);
    console.log(chalk.cyan(`Total time: ${formatDuration(totalTime)}`));
  });
