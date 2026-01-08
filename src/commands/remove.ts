import { Command } from 'commander';
import chalk from 'chalk';
import { getProjectByName } from '../lib/db';
import db from '../lib/db';

export const removeCommand = new Command('remove')
  .description('Remove a project from Oven')
  .argument('<name>', 'Project name')
  .option('-f, --force', 'Skip confirmation')
  .action((name: string, options) => {
    const project = getProjectByName(name);

    if (!project) {
      console.log(chalk.red(`✖ Project "${name}" not found`));
      process.exit(1);
    }

    if (!options.force) {
      console.log(chalk.yellow(`⚠️  This will remove "${name}" from Oven`));
      console.log(chalk.gray('   (The files will NOT be deleted, only the project reference)'));
      console.log(chalk.gray('\n   Use --force to skip this warning\n'));
      process.exit(1);
    }

    // Remove all sessions for this project
    db.prepare('DELETE FROM sessions WHERE project_id = ?').run(project.id);

    // Remove the project
    db.prepare('DELETE FROM projects WHERE id = ?').run(project.id);

    console.log(chalk.green(`✓ Removed project: ${chalk.bold(name)}`));
    console.log(chalk.gray(`  You can now re-add it with the correct path`));
  });
