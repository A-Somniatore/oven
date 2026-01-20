import { Command } from 'commander';
import { setupCompletion } from '../lib/completion';

export const completionCommand = new Command('setup-completion')
  .description('Setup shell completion')
  .action(() => {
    setupCompletion();
  });
