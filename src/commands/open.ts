import { Command } from 'commander';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { getProjectByName } from '../lib/db';
import { getConfig } from '../lib/config';

export const openCommand = new Command('open')
  .description('Open project in editor')
  .argument('<name>', 'Project name')
  .action((name: string) => {
    const project = getProjectByName(name);

    if (!project) {
      console.log(chalk.red(`✖ Project "${name}" not found`));
      process.exit(1);
    }

    const config = getConfig();
    console.log(chalk.gray(`Opening ${project.name} in ${config.editor_command}...`));

    const editor = spawn(config.editor_command, [project.path], {
      detached: true,
      stdio: 'ignore',
    });

    editor.unref();
    console.log(chalk.green(`✓ Opened ${project.name}`));
  });
