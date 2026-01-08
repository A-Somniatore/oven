# 🍳 Oven

**Local Project & Work Session Manager**

Oven helps you track what you're working on, manage active focus, and bootstrap GitHub repositories without leaving the terminal.

Oven treats work like cooking:
- Projects are dishes
- Work sessions are cooking sessions
- Only one dish can be actively cooking at a time

## Installation

```bash
npm install -g oven-cli
```

Or install from source:

```bash
git clone https://github.com/A-Somniatore/oven.git
cd oven
npm install
npm run build
npm link
```

## Quick Start

```bash
# Add a project
oven add MyProject --path ~/projects/myproject --desc "My awesome project"

# Start working on it
oven cook MyProject --task "Building new feature"

# Check what you're cooking
oven now

# Pause for a break
oven pause

# Resume cooking
oven resume

# Finish up
oven done --note "Completed the feature"
```

## Commands

### Project Management

- `oven add <name> --path <dir>` - Register a new project
- `oven list` - List all projects
- `oven show <name>` - Show project details
- `oven open <name>` - Open project in your editor

### Work Sessions (Cooking!)

- `oven cook <project>` - Start a work session
- `oven now` - Show what's currently cooking
- `oven pause` - Pause the active session
- `oven resume` - Resume a paused session
- `oven done` - End the current session

### Analytics & History

- `oven log [project]` - View session history
  - `--today` - Show only today's sessions
  - `--week` - Show this week's sessions
  - `--since <date>` - Show sessions since date
- `oven stats [project]` - Time tracking statistics
  - `--week` - This week's stats
  - `--month` - This month's stats
  - `--all` - All-time stats (default)

### Archive Management

- `oven archive <name>` - Archive a project
- `oven unarchive <name>` - Restore an archived project

### GitHub Integration

- `oven git orgs` - List available GitHub organizations
- `oven git init <org>/<repo>` - Create and initialize a GitHub repository
  - `--public` / `--private` - Repository visibility
  - `--desc` - Repository description
  - `--path` - Local directory path
  - `--clone` - Clone instead of init
  - `--push-initial` - Create initial commit and push
  - `--readme` - Generate README.md
  - `--ssh` / `--https` - Protocol choice

## Features

- 🎨 Beautiful terminal UI with colors and boxes
- 💾 Local SQLite database (no cloud, your data stays yours)
- ⏱️ Automatic time tracking
- 🔥 Only one active session at a time (stay focused!)
- 🚀 Fast and lightweight

## Configuration

Config file: `~/.oven/config.json`

```json
{
  "default_project_root": "~/Documents/projects",
  "editor_command": "code",
  "github_provider": "gh",
  "git_protocol": "ssh"
}
```

## Data Storage

- Database: `~/.oven/oven.db`
- Config: `~/.oven/config.json`

All data is stored locally - no cloud sync, no tracking, just you and your projects.

## Why Oven?

Because "What are you cooking?" sounds way more fun than "What are you working on?" 🍳

## License

MIT

## Contributing

Contributions welcome! This is a personal productivity tool that might help others too.
