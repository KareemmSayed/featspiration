---
name: feature-findings
description: Review outside codebases, libraries, docs, papers, competitors or a list of ideas against the project you are working in, and produce one designed HTML findings page - a short bullet read for the human, a build order, and one self-contained, copy-ready implementation prompt per feature. Use this whenever the user asks what their project can take, borrow, port or learn from another repo or source; asks to mine or audit a codebase for features worth having; wants a feature plan or roadmap split into prompts they can hand to a coding agent one session at a time; or says "feature findings", "findings page", "findings artifact" or "feature prompts". Use it even when they only say "check this project and tell me what is useful for mine".
license: MIT
metadata:
  author: Kareem Sayed
  version: "1.0.0"
---

# Feature findings

Turn "here is another project, what can mine take from it?" into one page the user can act on for weeks.

The page has two readers. The **human** reads a short bullet summary and decides what to build. A **fresh coding-agent session** reads one prompt and builds one feature, with no memory of this conversation. Most people build one feature per session because their sessions are time- or usage-limited, so each prompt has to stand completely on its own and fit in one sitting.

You write the content as a `findings.json` file. A bundled script checks it and renders it into a fixed, designed template, so every page looks the same and you never hand-write HTML.

## What you need from the user

- **Sources**: paths, URLs, pasted text or a list of ideas. If none were given, ask once.
- **The host project**: the current working directory, unless they say otherwise.
- **Session budget**, if they mention one (for example "my sessions are 5 hours"). It sets what S, M and L mean.

If there is no outside source and they only want their own ideas planned, the same page works: describe today's behaviour where a source would be (see `labels` in `references/data-format.md`).

## Process

Work through these in order. The quality of the page comes from steps 1 to 4, not from the writing.

1. **Read the sources properly.** Start with their docs, then read the code that carries the logic you might recommend. Note exact file paths, constants and formulas. Summaries and READMEs overstate; the code is what is true.

2. **Read the host project.** Its README and agent instruction files (AGENTS.md, CLAUDE.md, .cursor rules), its layout, the modules a candidate feature would touch, how it tests and lints, and its standing constraints (privacy, permissions, languages, platforms). Two things depend on this: you must not propose something that already exists, and every prompt must name real files and functions. A prompt that says "add it to the analytics module" when you never opened that module will send the next session hunting.

3. **Check each source's licence.** Say in plain words what it allows in the host project, especially if the host is a paid product. Formulas and published methods can usually be rebuilt from their papers even when code cannot be copied; say which applies. You are not a lawyer: present it as your reading.

4. **Verify before you recommend.** If you are about to pass on a formula, table, constant or claim ("the source's lookup table is wrong", "this formula matches the published values"), run it in a scratch script first and put the result in the page as a small table. This is the single most valuable habit in the whole process: sources contain confident mistakes, and one caught mistake is worth more than ten features. Be exact about what you did:
   - computed by you in this session: say so;
   - recalled from memory: say so, and tell the implementing prompt to confirm it;
   - a tuning value someone picked rather than a published result: call it a heuristic.
   Never write that something was verified when it was not.

5. **Judge each candidate with three questions.**
   - Can it work with the data and platform the host project actually has?
   - What does the source get wrong or hard-code for its own situation?
   - How would it be better here?
   Anything that fails the first question goes on the skip list with a one-line reason. A good skip list saves the user as much time as the features do.

6. **Order and size.** Put features in dependency order: the list is the build order. Group them into two to four tiers (for example "Start here", "After that", "Needs new data"). Size each S, M or L against one working session with a coding agent: S is under half, M is one, L is a full session that may spill. Split anything larger than L into two features. Use the user's own budget if they gave one.

7. **Write `findings.json`.** Copy `assets/example.findings.json` as a starting shape and read `references/data-format.md` for every field. Read `references/writing-prompts.md` before writing the feature prompts and ground rules: those are the part of the page that gets used most.

8. **Build.** Run the bundled script (paths are relative to this skill's folder):

   ```bash
   node scripts/build.mjs path/to/findings.json -o path/to/findings.html
   ```

   Fix every error. Read the warnings: each one names a habit that makes pages worse (thin prompts, missing file paths, an overlong short read). If Node is not available, see "Building by hand" below.

9. **Deliver.** See "Delivery" below.

## What goes on the page

**Hero.** One headline, one or two sentences saying how many features there are and how to use the page.

**The short read (for the human).** Bullets only, around 350 to 500 words in total. Use these blocks, dropping any that have nothing to say:
- one verdict block per source: what it is, what is worth taking, what is not, whether its code can be reused;
- "things to know before building": the handful of findings that change decisions, most important first;
- the evidence table from step 4, when you verified something;
- what is broken or weak in the source;
- the skip list.

**Build order.** Generated from the features: number, title, source, size, what it needs first.

**Feature cards.** One per feature:
- `title`: what the user gets, in a few words;
- `description`: two or three sentences on what it is and why it matters to this project;
- `inSource`: what the source does, including what it gets wrong;
- `better`: how this version is improved for the host project;
- `landsIn`: the real files or folders it touches;
- `prompt`: the full implementation brief.

**Ground rules.** Written once in `groundRules`; the page appends them to every prompt so each copied block is complete.

## Design

The look is fixed and lives in `assets/template.html`: a near-black or warm off-white ground with a faint dot field, hairline-bordered surfaces, Doto (a dot-matrix face) for headings and numbers, Helvetica Neue with Inter Tight as fallback for body text, one glowing hero card, and colour used only where it carries meaning (a cool-to-hot ramp marks job size; green and red mark good and bad cells). `references/design.md` has the full token list and the rules behind it.

Do not edit the template's CSS or script for a single report, and do not restyle through the data. A consistent page is the point: the user recognises it and knows where everything is. If a report needs something the data format cannot express, put it in a short-read block as bullets or a table.

## Writing

- Plain words and short sentences. Write for someone smart who has not read the source.
- Lead with the finding, not the method.
- Use the host project's own names for things.
- Say when a number is a heuristic and when it is published.
- No hype, no filler, no praise of the source or the project.

## Delivery

1. Save `findings.json` and the built HTML together inside the host project, in `docs/feature-findings/<short-slug>.html` unless the project keeps documents somewhere else. Keeping the JSON lets the page be rebuilt when plans change.
2. If your environment can show or publish HTML, do that too:
   - **Claude with the Artifact tool**: build a second copy with `--fragment` (the tool adds its own document shell) and publish that file.
   - **A preview pane or browser tool**: open the built file.
   - **Otherwise**: tell the user the path and that it opens in any browser.
3. Look at the rendered page once if you can, to catch anything broken, before you tell the user it is ready. If you could not look, say so.
4. Reply in chat with the link or path and at most five lines: the two or three findings that matter most, which features to start with, and anything you could not verify.

## Building by hand

If you cannot run Node: copy `assets/template.html`, replace `__TITLE__` with the page title, replace `__DATA__` with the contents of `findings.json` (write every `<` inside it as `<`), and wrap the result in a normal HTML document (`<!doctype html>`, `<head>` with a UTF-8 charset and a viewport meta, `<body>`), moving everything above the `<!--BODY-->` marker into the head. Check the fields against `references/data-format.md` yourself, since the script's checks did not run.

## Updating a page later

Edit `findings.json` and rebuild to the same output path. The "Built" ticks are stored in each reader's browser and survive a rebuild as long as the title and feature ids stay the same, so keep ids stable and add new features with new ids.
