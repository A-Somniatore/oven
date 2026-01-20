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
import { archiveCommand, unarchiveCommand } from './commands/archive';
import { removeCommand } from './commands/remove';
import { logCommand } from './commands/log';
import { statsCommand } from './commands/stats';
import { gitCommand } from './commands/git';
import { initCompletion } from './lib/completion';
import { completionCommand } from './commands/completion';

// Initialize completion
initCompletion();

const program = new Command();

program
  .name('oven')
  .description(chalk.bold('🍳 Oven - Local Project & Work Session Manager'))
  .version('0.2.0');

// Project management
program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(showCommand);
program.addCommand(openCommand);
program.addCommand(removeCommand);
program.addCommand(archiveCommand);
program.addCommand(unarchiveCommand);
program.addCommand(completionCommand);

// Work sessions
program.addCommand(cookCommand);
program.addCommand(nowCommand);
program.addCommand(pauseCommand);
program.addCommand(resumeCommand);
program.addCommand(doneCommand);

// Analytics
program.addCommand(logCommand);
program.addCommand(statsCommand);

// GitHub integration
program.addCommand(gitCommand);

program.parse();
