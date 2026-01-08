import Database from 'better-sqlite3';
import { homedir } from 'os';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { Project, Session } from '../types';

const OVEN_DIR = join(homedir(), '.oven');
const DB_PATH = join(OVEN_DIR, 'oven.db');

// Ensure .oven directory exists
if (!existsSync(OVEN_DIR)) {
  mkdirSync(OVEN_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Initialize database schema
export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      path TEXT NOT NULL,
      description TEXT,
      tags TEXT,
      archived INTEGER DEFAULT 0,
      git_org TEXT,
      git_repo TEXT,
      git_remote_url TEXT,
      created_at TEXT NOT NULL,
      last_active_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      paused_at TEXT,
      total_paused_time INTEGER DEFAULT 0,
      task TEXT,
      note TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at);
  `);
}

// Project operations
export function addProject(project: Omit<Project, 'id'>): number {
  const stmt = db.prepare(`
    INSERT INTO projects (name, path, description, tags, archived, git_org, git_repo, git_remote_url, created_at, last_active_at)
    VALUES (@name, @path, @description, @tags, @archived, @git_org, @git_repo, @git_remote_url, @created_at, @last_active_at)
  `);
  const result = stmt.run({
    name: project.name,
    path: project.path,
    description: project.description || null,
    tags: project.tags || null,
    archived: project.archived ? 1 : 0,
    git_org: project.git_org || null,
    git_repo: project.git_repo || null,
    git_remote_url: project.git_remote_url || null,
    created_at: project.created_at,
    last_active_at: project.last_active_at || null,
  });
  return result.lastInsertRowid as number;
}

export function getProjects(includeArchived = false): Project[] {
  const query = includeArchived
    ? 'SELECT * FROM projects ORDER BY last_active_at DESC, name'
    : 'SELECT * FROM projects WHERE archived = 0 ORDER BY last_active_at DESC, name';
  return db.prepare(query).all() as Project[];
}

export function getProjectByName(name: string): Project | undefined {
  return db.prepare('SELECT * FROM projects WHERE name = ?').get(name) as Project | undefined;
}

export function updateProject(name: string, updates: Partial<Project>): void {
  const fields = Object.keys(updates)
    .map(key => `${key} = @${key}`)
    .join(', ');
  const stmt = db.prepare(`UPDATE projects SET ${fields} WHERE name = @name`);
  stmt.run({ ...updates, name });
}

export function archiveProject(name: string): void {
  db.prepare('UPDATE projects SET archived = 1 WHERE name = ?').run(name);
}

export function unarchiveProject(name: string): void {
  db.prepare('UPDATE projects SET archived = 0 WHERE name = ?').run(name);
}

// Session operations
export function startSession(projectId: number, task?: string): number {
  // Pause any active session first
  const activeSession = getActiveSession();
  if (activeSession) {
    pauseSession(activeSession.id!);
  }

  const stmt = db.prepare(`
    INSERT INTO sessions (project_id, started_at, task)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(projectId, new Date().toISOString(), task || null);

  // Update project's last_active_at
  db.prepare('UPDATE projects SET last_active_at = ? WHERE id = ?')
    .run(new Date().toISOString(), projectId);

  return result.lastInsertRowid as number;
}

export function getActiveSession(): Session | undefined {
  return db.prepare('SELECT * FROM sessions WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1')
    .get() as Session | undefined;
}

export function pauseSession(sessionId: number): void {
  db.prepare('UPDATE sessions SET paused_at = ? WHERE id = ?')
    .run(new Date().toISOString(), sessionId);
}

export function resumeSession(sessionId: number): void {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as Session;
  if (session && session.paused_at) {
    const pausedTime = new Date().getTime() - new Date(session.paused_at).getTime();
    const totalPaused = session.total_paused_time + pausedTime;
    db.prepare('UPDATE sessions SET paused_at = NULL, total_paused_time = ? WHERE id = ?')
      .run(totalPaused, sessionId);
  }
}

export function endSession(sessionId: number, note?: string): void {
  db.prepare('UPDATE sessions SET ended_at = ?, note = ? WHERE id = ?')
    .run(new Date().toISOString(), note || null, sessionId);
}

export function getSessionsForProject(projectId: number, limit?: number): Session[] {
  const query = limit
    ? 'SELECT * FROM sessions WHERE project_id = ? ORDER BY started_at DESC LIMIT ?'
    : 'SELECT * FROM sessions WHERE project_id = ? ORDER BY started_at DESC';
  return (limit
    ? db.prepare(query).all(projectId, limit)
    : db.prepare(query).all(projectId)) as Session[];
}

// Initialize on import
initializeDatabase();

export default db;
