import { homedir } from 'os';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Config } from '../types';

const CONFIG_PATH = join(homedir(), '.oven', 'config.json');

const DEFAULT_CONFIG: Config = {
  default_project_root: join(homedir(), 'Documents', 'projects'),
  editor_command: 'code',
  github_provider: 'gh',
  git_protocol: 'ssh',
};

export function loadConfig(): Config {
  if (!existsSync(CONFIG_PATH)) {
    saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }

  try {
    const data = readFileSync(CONFIG_PATH, 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch (error) {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: Config): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function getConfig(): Config {
  return loadConfig();
}
