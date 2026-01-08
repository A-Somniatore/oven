import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import boxen from 'boxen';
import dayjs from 'dayjs';
import { getProjectByName } from '../lib/db';
import db from '../lib/db';
import { formatDuration, getSessionDuration } from '../lib/utils';

export const statsCommand = new Command('stats')
  .description('Show time tracking statistics')
  .argument('[project]', 'Project name (optional)')
  .option('--week', 'Show this week\'s stats')
  .option('--month', 'Show this month\'s stats')
  .option('--all', 'Show all-time stats (default)')
  .action((projectName: string | undefined, options) => {
    let sessions: any[] = [];
    let project: any = null;

    if (projectName) {
      project = getProjectByName(projectName);
      if (!project) {
        console.log(chalk.red(`✖ Project "${projectName}" not found`));
        process.exit(1);
      }
      sessions = db.prepare('SELECT * FROM sessions WHERE project_id = ?').all(project.id);
    } else {
      sessions = db.prepare('SELECT * FROM sessions').all();
    }

    // Filter by time period
    const now = dayjs();
    if (options.week) {
      const weekStart = now.startOf('week').toISOString();
      sessions = sessions.filter(s => s.started_at >= weekStart);
    } else if (options.month) {
      const monthStart = now.startOf('month').toISOString();
      sessions = sessions.filter(s => s.started_at >= monthStart);
    }

    if (sessions.length === 0) {
      console.log(chalk.gray('No sessions found'));
      return;
    }

    const totalTime = sessions.reduce((acc, s) => acc + getSessionDuration(s), 0);
    const completedSessions = sessions.filter(s => s.ended_at).length;
    const activeSessions = sessions.filter(s => !s.ended_at).length;

    // If showing stats for all projects, group by project
    if (!projectName) {
      const projectStats = new Map<number, { name: string; time: number; sessions: number }>();

      sessions.forEach((session) => {
        const proj = db.prepare('SELECT * FROM projects WHERE id = ?').get(session.project_id) as any;
        const existing = projectStats.get(proj.id) || { name: proj.name, time: 0, sessions: 0 };
        projectStats.set(proj.id, {
          name: proj.name,
          time: existing.time + getSessionDuration(session),
          sessions: existing.sessions + 1,
        });
      });

      const table = new Table({
        head: [
          chalk.bold('Project'),
          chalk.bold('Sessions'),
          chalk.bold('Total Time'),
          chalk.bold('% of Total'),
        ],
        style: { head: ['cyan'] },
        colWidths: [30, 12, 15, 12],
      });

      Array.from(projectStats.values())
        .sort((a, b) => b.time - a.time)
        .forEach((stat) => {
          const percentage = ((stat.time / totalTime) * 100).toFixed(1);
          table.push([
            stat.name,
            stat.sessions.toString(),
            formatDuration(stat.time),
            `${percentage}%`,
          ]);
        });

      const period = options.week ? 'This Week' : options.month ? 'This Month' : 'All Time';
      const summary = `
${chalk.bold.cyan('📊 Time Tracking Stats - ' + period)}
${chalk.gray('─'.repeat(50))}
${chalk.cyan('Total Time:')} ${formatDuration(totalTime)}
${chalk.cyan('Total Sessions:')} ${sessions.length}
${chalk.cyan('Completed:')} ${completedSessions}
${chalk.cyan('Active:')} ${activeSessions}
${chalk.cyan('Average Session:')} ${formatDuration(totalTime / sessions.length)}
      `.trim();

      console.log(boxen(summary, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
      }));

      console.log('\n' + table.toString());
    } else {
      // Show stats for specific project
      const avgSessionTime = totalTime / sessions.length;
      const summary = `
${chalk.bold.cyan('📊 ' + project.name + ' Stats')}
${chalk.gray('─'.repeat(50))}
${chalk.cyan('Total Time:')} ${formatDuration(totalTime)}
${chalk.cyan('Total Sessions:')} ${sessions.length}
${chalk.cyan('Completed:')} ${completedSessions}
${chalk.cyan('Active:')} ${activeSessions}
${chalk.cyan('Average Session:')} ${formatDuration(avgSessionTime)}
${chalk.cyan('Longest Session:')} ${formatDuration(Math.max(...sessions.map(getSessionDuration)))}
${chalk.cyan('Shortest Session:')} ${formatDuration(Math.min(...sessions.map(s => s.ended_at ? getSessionDuration(s) : Infinity)))}
      `.trim();

      console.log(boxen(summary, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
      }));
    }
  });
