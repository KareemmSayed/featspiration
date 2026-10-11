# Writing the feature prompts and ground rules

Each feature's `prompt` will be pasted into a new coding-agent session that has never seen this conversation, the source project, or the other features. Whatever is not in the prompt does not exist for that session. Write it the way you would brief a capable contractor who is starting cold.

## Anatomy of a prompt

Use this order. Plain text only (the prompt is shown in a code block and copied as-is), so no Markdown headings or backticks.

1. **Opening line.** What to build, in one sentence. If it depends on another feature, say so here and name the file that must already exist: "This depends on src/search/trigram.ts being merged."

2. **Why.** Two or three sentences: what is wrong or missing today and who benefits. An agent that knows the purpose makes better small decisions than one following steps.

3. **What exists.** The real files, functions, types and data it will work with, by path and name. This is where your reading of the host project pays off. Include the data that is available and anything that looks available but is not.

4. **Build.** A numbered list. For each step give:
   - where the code goes;
   - the exact logic: formulas written out, constants with their values, thresholds, units;
   - the source of each formula (paper, author, year) when it has one;
   - check values the session can turn into tests ("input X gives Y"), ideally ones you computed in step 4 of the process.
   Mark every constant that is a tuning choice: "this cap is a heuristic: name it as a constant."

5. **Improve on the source.** What the source project does, what is wrong with it for this project, and what to do differently. Be specific: "it averages lap heart rates without weighting, so a 200 m rep counts as much as a 1 km rep" teaches the session what to avoid; "the source is low quality" teaches nothing. If code must not be copied for licence reasons, the ground rules say so; here you describe the idea to rebuild.

6. **Out of scope.** The neighbouring work this prompt should not start. Without it, an eager session builds three features badly.

The page appends `groundRules` after this, so do not repeat repo-wide rules in each prompt.

## What makes a prompt fail

- **It leans on context.** "As discussed", "the function we looked at", "the same approach as feature 2". Name the file and restate the rule.
- **It names no files.** Usually a sign the host project was not read.
- **It gives a formula without numbers to check.** The session cannot tell a correct implementation from a plausible one. Give two or three input and output pairs.
- **It bundles features.** If the Build list has two independent halves, it is two prompts.
- **It hides uncertainty.** If you recalled a value and did not confirm it, write "confirm this against <the paper or site> before relying on it".
- **It is too big for one session.** Migrations, native rebuilds and UI on two platforms each cost more than they look. Size honestly and split.
- **It tells without explaining.** A rule with its reason ("never overwrite a saved threshold silently: every load number depends on it") is followed more reliably, and applied to cases you did not foresee, than a bare command.

Length: most good prompts land between 250 and 500 words before the ground rules. Shorter usually means missing detail; longer usually means two features.

## Ground rules

`groundRules` is one block of plain text added to the end of every prompt. Write it from what you learned reading the host project. Cover:

- **Layout**: what lives where (packages, apps, where logic, schemas, migrations, tests and strings go), in two or three sentences.
- **Read first**: tell the session to read the files named in the prompt before designing, and that when the prompt and the code disagree the code wins and it should say what differed. Your reading can go stale.
- **Where new logic belongs** and the conventions it must follow (pure functions, named constants, comments citing sources, error handling style).
- **Honesty in the product**: for example, return nothing instead of a made-up number when data is thin.
- **Standing constraints**: privacy and sharing rules, supported languages, offline support, accessibility, platforms.
- **Licence limits** on the sources, if any: what must not be copied.
- **Style**: match surrounding code.
- **How to finish**: the exact checks to run (type check, lint, tests, and looking at the UI when the change is visible), and to report what was run and what passed.
- **Scope**: stay inside it and list follow-ups instead of building them.

Start it with a heading line such as "Ground rules for this repo" so it reads as a separate section when pasted.

## A complete example

This is feature 01 from `assets/example.findings.json` (a fictional project). Note the fixtures, the labelled heuristic and the explicit "must NOT match" cases.

```
Make note search tolerate typos.

Why: search today is a case-insensitive substring scan (src/search/scan.ts), so one wrong letter returns nothing. It is the most common complaint on the feedback board.

Build:
1. src/search/trigram.ts: trigrams(word) pads the lower-cased word with two leading spaces and one trailing space and returns its set of 3-character chunks. similarity(a, b) = shared chunks / all distinct chunks (Jaccard).
2. editDistance(a, b): optimal string alignment distance, where swapping two neighbouring letters counts as one edit.
3. Matching: for each query word, candidates are indexed words with similarity of 0.30 or more. Accept a candidate only if editDistance is 1 or less. Exact and substring matches are always accepted and rank above typo matches.
4. Tests with these fixtures (similarity, edits): recieve/receive 0.33, 1; meetign/meeting 0.45, 1; budgets/budget 0.67, 1; invoke/invoice 0.36, 2 (must NOT match); chicken/kitchen 0.07, 4 (must NOT match).
5. Wire it into the search screen and mark typo matches with a subtle 'similar' label.

Improve on the source: lumen-search accepts on similarity alone, which lets 'invoke' match 'invoice' while scoring it higher than the real typo 'recieve'. The edit-distance gate is the fix. The 0.30 threshold is lumen-search's own tuning, not a published value: name it as a constant.

Out of scope: ranking by recency, stemming, searching inside attachments.
```
