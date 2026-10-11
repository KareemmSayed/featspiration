# featspiration

An agent skill that answers "here is another project, what can mine take from it?" with one page you can build from for weeks.

Point your coding agent at an outside codebase, library, paper or list of ideas. It reads the source and your project, checks what it is about to recommend, and produces a designed HTML page with:

- **A short read for you**: a verdict on each source, the few things to know before building, what is broken in the source, and what to skip.
- **A build order**: features in dependency order, sized in agent sessions.
- **One prompt per feature**: self-contained and copy-ready. Paste it into a fresh session and that session can build the feature without any of the original conversation.

It is made for people who build one feature per session because their sessions are time- or usage-limited.

Open [`examples/fieldnote.html`](examples/fieldnote.html) in a browser to see a page (a made-up project, built from [`example.findings.json`](skills/featspiration/assets/example.findings.json)).

## Install

With the [skills CLI](https://github.com/vercel-labs/skills), which installs into Claude Code, Cursor, Antigravity, Codex, Gemini CLI and many other agents:

```bash
npx skills add KareemmSayed/featspiration
```

Pick agents explicitly, or install for your user account instead of the current project:

```bash
npx skills add KareemmSayed/featspiration -a claude-code -a cursor -a antigravity
npx skills add KareemmSayed/featspiration -g
```

**By hand.** Copy the `skills/featspiration` folder into your tool's skills directory. For Claude Code that is `~/.claude/skills/` (all projects) or `.claude/skills/` (one project).

**Claude desktop and claude.ai.** Zip the skill folder and upload the zip where the app manages skills:

```bash
cd skills && zip -r ../featspiration.zip featspiration
```

## Use

Invoke it by name, with what to review:

```
/featspiration ../some-other-repo
```

Or just ask:

> Check ../some-other-repo and the paper in docs/method.pdf and tell me what is useful for this project.

> Plan these six ideas as prompts I can build one session at a time. My sessions are 5 hours.

The agent saves `findings.json` and the built page in your project under `docs/featspiration/`, and shows or publishes the page if its environment can.

## How it works

The agent writes content only, as a `findings.json` file. A bundled script validates it and renders it into a fixed template, so every page looks the same and nothing is hand-written HTML.

```bash
node skills/featspiration/scripts/build.mjs findings.json -o findings.html
```

| Option | Does |
|---|---|
| `-o <file>` | Output path. Default: next to the JSON. |
| `--check` | Validate only. |
| `--fragment` | Omit the document shell, for hosts that add their own (such as Claude's Artifact tool). |

The script needs Node 18 or newer and has no dependencies. It refuses to build when the data would produce a bad page (a feature that needs one listed after it, a missing prompt, a table row of the wrong width) and warns about habits that weaken one (thin prompts, no file paths, an overlong summary).

What is in the skill:

```
skills/featspiration/
  SKILL.md                      the process the agent follows
  assets/template.html          the page design and behaviour
  assets/example.findings.json  a complete example to copy from
  scripts/build.mjs             validate and build
  references/data-format.md     every field of findings.json
  references/writing-prompts.md how to write prompts that stand alone
  references/design.md          fonts, colour tokens and the rules behind them
```

## The page

- Works as a single self-contained file. The only network request is for two Google Fonts, with system fallbacks.
- Dark and light, following the system or the host's theme. Phone-width friendly. Right-to-left ready.
- A filter by tier, a copy button on every prompt, and a "Built" tick per feature that is remembered in your browser.
- Every fixed string can be replaced through `labels`, so a page can be written in any language.

## Design

The look is fixed on purpose and documented in [`references/design.md`](skills/featspiration/references/design.md): monochrome ink on black or warm off-white, a faint dot field, the Doto dot-matrix face for headings and numbers, hairlines in place of shadows, and colour only where it means something.

## Licence

MIT. See [LICENSE](LICENSE). Fonts are loaded from Google Fonts under their own licences (Doto and Inter Tight are both SIL Open Font License).
