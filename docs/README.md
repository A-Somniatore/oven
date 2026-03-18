# Oven

Local project and work session manager CLI tool.

## What It Does

Oven helps you track what you're working on, manage active focus, and bootstrap GitHub repositories without leaving the terminal. It uses a cooking metaphor: projects are dishes, work sessions are cooking sessions, and only one dish can be actively cooking at a time.

## Key Commands

- `oven add` - Register a project
- `oven cook` - Start a work session
- `oven now` - See what's currently active
- `oven pause` / `oven resume` - Pause and resume sessions
- `oven done` - Finish a session

## Tech Stack

- TypeScript + Node.js
- SQLite (via better-sqlite3) for local storage
- Chalk + Boxen for terminal UI
