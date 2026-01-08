export interface Project {
  id?: number;
  name: string;
  path: string;
  description?: string;
  tags?: string;
  archived: boolean;
  git_org?: string;
  git_repo?: string;
  git_remote_url?: string;
  created_at: string;
  last_active_at?: string;
}

export interface Session {
  id?: number;
  project_id: number;
  started_at: string;
  ended_at?: string;
  paused_at?: string;
  total_paused_time: number;
  task?: string;
  note?: string;
}

export interface Config {
  default_project_root: string;
  editor_command: string;
  github_provider: 'gh' | 'api';
  git_protocol: 'ssh' | 'https';
}
