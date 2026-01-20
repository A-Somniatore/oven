import omelette from 'omelette';
import { getProjects } from './db';

const completion = omelette('oven <command> <argument>');

completion.on('command', ({ reply }) => {
  reply([
    'add',
    'list',
    'show',
    'open',
    'remove',
    'archive',
    'unarchive',
    'cook',
    'now',
    'pause',
    'resume',
    'done',
    'log',
    'stats',
    'git',
    'setup-completion'
  ]);
});

completion.on('argument', ({ reply, line }) => {
  const args = line.split(/\s+/);
  const command = args[1];

  if (['open', 'cook', 'show', 'remove', 'archive'].includes(command)) {
    const projects = getProjects(false);
    reply(projects.map(p => p.name));
  } else if (command === 'unarchive') {
    const allProjects = getProjects(true);
    const archived = allProjects.filter(p => p.archived);
    reply(archived.map(p => p.name));
  }
});

export function initCompletion() {
  completion.init();
}

export function setupCompletion() {
  completion.setupShellInitFile();
}
