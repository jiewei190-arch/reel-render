# Prompt for Claude Code on the owner's computer: install two add-ons (Oct 29)

Run this in **Claude Code on the PC** (Claude desktop app → Code, or `claude` in a terminal). Claude in Chrome can't do it: it has no terminal.
The main session already read both repos on Oct 29: YouTube Agent Skill is at commit a2feb21 and ECC at commit 25278e7 (v2.2.3). YouTube Agent Skill's six Python tools use only the standard library: no network calls, no file writes.

---

Install two Claude Code add-ons on this computer. Inspect before you run anything, back up before you change anything, and preserve my existing settings, skills and CLAUDE.md files. Don't enable paid services or extra integrations.

0. **Inventory:** OS, `claude --version` (needs 2.1+), `node --version` (18+), `git --version`, `python3 --version`. Also list `/plugin` (installed plugins and marketplaces), `~/.claude/skills/`, `~/.claude/settings.json`, any MCP config, and `~/.claude/CLAUDE.md`. Back up `~/.claude/settings.json`, `~/.claude/CLAUDE.md` and `~/.claude/skills/` to `~/.claude/backup-<date>/` first.

1. **YouTube Agent Skill** (https://github.com/Jakeschincariol/youtube-agent-skill, MIT).
   - Install as a plugin, its supported method:
     `/plugin marketplace add Jakeschincariol/youtube-agent-skill`
     then `/plugin install youtube-agent`.
   - Skip this if `~/.claude/skills/yt-*` already exists (no duplicates).
   - There are no dependencies: the tools need only Python 3.
   - Verify that `/plugin` lists it. Then run `/yt-script` with: "a 70-second vertical How It Really Works explainer: why do planes actually stay in the air? Hook: the textbook reason is wrong."
   - Run its hook scorer on that hook: `python3 <plugin dir>/skills/yt-script/hookscore.py --hook "The textbook reason planes fly is wrong."`
   - Optionally copy `templates/voice.md` to `~/.claude/youtube/voice.md`.
   - **It never edits or uploads video.** `/yt-edit` writes an edit decision list (timecodes) from a transcript; the cutting is done by hand. Everything else writes text: scripts, titles, plans, analysis.

2. **ECC** (https://github.com/affaan-m/ECC, MIT, plugin `ecc@ecc` v2.2.3).
   - Use ONE method, the native plugin:
     `/plugin marketplace add https://github.com/affaan-m/ECC`
     then `/plugin install ecc@ecc`.
   - Don't also run `npx ecc-universal setup` or the manual `install.sh`. The README says stacking installs causes duplicates.
   - Don't copy its hooks into settings.json, because Claude Code 2.1+ loads plugin hooks itself.
   - Set its hook profile to **minimal** at first (plugin option `hook_profile`), or `hooks_enabled=false` if hooks cause trouble.
   - Leave the ECC Pro GitHub App, sponsors, MCP configs and other harness targets alone.
   - Keep any ECC rules project-scoped, not in `~/.claude/CLAUDE.md`.
   - Verify that `/plugin` lists `ecc@ecc`, then run one planning command and one review command on a tiny test repo.

3. **Restart Claude Code** after installing, then re-check `/plugin` and `/help` for the new commands.

4. **Report back** in `handoff/ADDONS_REPORT.md`, committed and pushed to `claude/reel-studio-handoff-f70dcj`:
   - what got installed where;
   - the exact commands;
   - the smoke-test output;
   - anything that failed.

**Uninstall / undo:**
- YouTube Agent Skill: `/plugin uninstall youtube-agent`, then `/plugin marketplace remove youtube-agent-skill`.
- ECC: `/plugin uninstall ecc@ecc` (or `npx ecc-universal@2.2.3 uninstall --dry-run`, then without `--dry-run`), then `/plugin marketplace remove ecc`.
- Restore: copy the files from `~/.claude/backup-<date>/` back.
