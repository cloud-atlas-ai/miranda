# Miranda

Telegram bot for remote Claude orchestration. The ractor who gives voice to the Primer.

## Naming (Diamond Age by Neal Stephenson)

| Component | Name | Reference |
|-----------|------|-----------|
| This bot | **Miranda** | The ractor who voices the Primer for Nell |
| Task runner | **Mouse** | Small autonomous worker from the Mouse Army |
| Batch merge | **Drummer** | The collective that processes in rhythm |

## What Miranda Does

1. **Receives commands** via Telegram (`/mouse`, `/status`, `/drummer`)
2. **Spawns Claude sessions** in tmux on the server
3. **Notifies user** when Claude needs input (via hook)
4. **Relays responses** back to Claude via `tmux send-keys`

## Architecture

```
Phone ↔ Telegram ↔ Miranda ↔ tmux sessions (Claude /mouse)
                      ↑
                PreToolUse hook (notify-miranda.sh)
```

## Development

```bash
# Install dependencies
pnpm install

# Development (hot reload)
pnpm dev

# Build
pnpm build

# Production
pnpm start
```

## Environment Variables

```bash
# Required
TELEGRAM_BOT_TOKEN=xxx      # From @BotFather
ALLOWED_USER_IDS=123,456    # Telegram user IDs (comma-separated)

# Optional
MIRANDA_PORT=3847           # HTTP port for hook notifications (default: 3847)
SQLITE_PATH=./miranda.db    # SQLite database path
```

## Project Structure

```
src/
├── index.ts           # Entry point, bot setup
├── bot/
│   ├── commands.ts    # /mouse, /status, /drummer, etc.
│   └── callbacks.ts   # Inline keyboard handlers
├── tmux/
│   └── sessions.ts    # tmux session management
├── hooks/
│   └── server.ts      # HTTP server for hook notifications
├── state/
│   └── db.ts          # SQLite state management
└── types.ts           # Shared types
```

## Commands

| Command | Action |
|---------|--------|
| `/mouse <task>` | Start mouse skill for task |
| `/status` | Show all active sessions |
| `/drummer` | Run batch merge skill |
| `/logs <task>` | Show recent output |
| `/stop <task>` | Kill a session |
| `/ssh` | Get SSH command for manual access |

## Hook Integration

Claude Code on the server has a PreToolUse hook that POSTs to Miranda when `AskUserQuestion` is called:

```bash
# ~/.claude/hooks/notify-miranda.sh
#!/bin/bash
curl -X POST http://localhost:3847/notify \
  -H "Content-Type: application/json" \
  -d "{
    \"session\": \"$TMUX_SESSION\",
    \"tool\": \"$CLAUDE_TOOL_NAME\",
    \"input\": $CLAUDE_TOOL_INPUT
  }"
```

## Implementation Phases

### Phase 1: MVP
- [ ] Basic bot with `/mouse`, `/status`, `/stop`
- [ ] tmux session spawning
- [ ] HTTP endpoint for hook notifications
- [ ] Inline keyboard for question responses

### Phase 2: Full Features
- [ ] `/drummer` command
- [ ] `/logs` streaming
- [ ] SQLite state persistence
- [ ] Message editing (update in place)

### Phase 3: Polish
- [ ] Error recovery
- [ ] Session crash detection
- [ ] Typing indicators
- [ ] Rich status formatting
