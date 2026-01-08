import { Command } from 'commander';
import chalk from 'chalk';
import { getActiveSession, pauseSession, resumeSession, endSession } from '../lib/db';
import db from '../lib/db';

export const pauseCommand = new Command('pause')
  .description('Pause the active cooking session')
  .action(() => {
    const session = getActiveSession();

    if (!session) {
      console.log(chalk.gray('No active session to pause'));
      return;
    }

    if (session.paused_at) {
      console.log(chalk.yellow('⏸️  Session is already paused'));
      console.log(chalk.gray(`   Use ${chalk.cyan('oven resume')} to continue`));
      return;
    }

    pauseSession(session.id!);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(session.project_id) as any;
    console.log(chalk.yellow(`⏸️  Paused: ${chalk.bold(project.name)}`));
    console.log(chalk.gray(`   Use ${chalk.cyan('oven resume')} to continue cooking`));
  });

export const resumeCommand = new Command('resume')
  .description('Resume a paused session')
  .action(() => {
    const session = getActiveSession();

    if (!session) {
      console.log(chalk.gray('No session to resume'));
      return;
    }

    if (!session.paused_at) {
      console.log(chalk.yellow('Session is not paused'));
      return;
    }

    resumeSession(session.id!);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(session.project_id) as any;
    console.log(chalk.green(`▶️  Resumed: ${chalk.bold(project.name)}`));
    console.log(chalk.gray(`   Use ${chalk.cyan('oven now')} to check status`));
  });

export const doneCommand = new Command('done')
  .description('End the current cooking session')
  .option('-n, --note <note>', 'Add a completion note')
  .action((options) => {
    const session = getActiveSession();

    if (!session) {
      console.log(chalk.gray('No active session to end'));
      return;
    }

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(session.project_id) as any;
    endSession(session.id!, options.note);

    console.log(chalk.green(`✓ Done cooking: ${chalk.bold(project.name)}`));
    if (options.note) {
      console.log(chalk.gray(`  Note: ${options.note}`));
    }
    console.log(chalk.gray(`\n  Start another with: ${chalk.cyan('oven cook <project>')}`));
  });
