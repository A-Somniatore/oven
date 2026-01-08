import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { getActiveSession } from '../lib/db';
import db from '../lib/db';
import { formatDuration, getSessionDuration, formatSessionStatus } from '../lib/utils';

export const nowCommand = new Command('now')
  .description('Show what is currently cooking')
  .action(() => {
    const session = getActiveSession();

    if (!session) {
      console.log(boxen(chalk.gray('Nothing is cooking right now.\n\nStart a session with: oven cook <project>'), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'gray',
      }));
      return;
    }

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(session.project_id) as any;
    const duration = getSessionDuration(session);
    const status = formatSessionStatus(session);

    const output = `
${chalk.bold.green('🍳 What\'s Cooking?')}
${chalk.gray('─'.repeat(40))}
${chalk.cyan('Project:')} ${chalk.bold(project.name)}
${chalk.cyan('Status:')} ${status}
${chalk.cyan('Duration:')} ${formatDuration(duration)}
${session.task ? `${chalk.cyan('Task:')} ${session.task}` : ''}
${chalk.gray('─'.repeat(40))}
${chalk.gray('Started:')} ${new Date(session.started_at).toLocaleString()}
${session.paused_at ? chalk.yellow(`Paused at: ${new Date(session.paused_at).toLocaleString()}`) : ''}
    `.trim();

    console.log(boxen(output, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'green',
    }));

    if (!session.paused_at) {
      console.log(chalk.gray(`\n  Use ${chalk.cyan('oven pause')} to take a break`));
      console.log(chalk.gray(`  Use ${chalk.cyan('oven done')} when finished\n`));
    } else {
      console.log(chalk.gray(`\n  Use ${chalk.cyan('oven resume')} to continue cooking\n`));
    }
  });
