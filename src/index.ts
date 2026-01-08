#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { addCommand } from './commands/add';
import { listCommand } from './commands/list';
import { showCommand } from './commands/show';
import { openCommand } from './commands/open';
import { cookCommand } from './commands/cook';
import { nowCommand } from './commands/now';
import { pauseCommand, resumeCommand, doneCommand } from './commands/session';

const program = new Command();

program
  .name('oven')
  .description(chalk.bold('🍳 Oven - Local Project & Work Session Manager'))
  .version('0.1.0');

// Project management
program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(showCommand);
program.addCommand(openCommand);

// Work sessions
program.addCommand(cookCommand);
program.addCommand(nowCommand);
program.addCommand(pauseCommand);
program.addCommand(resumeCommand);
program.addCommand(doneCommand);

program.parse();
