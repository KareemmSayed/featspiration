# findings.json

One JSON object holds everything on the page. `assets/example.findings.json` is a complete, working file to copy from. `scripts/build.mjs` checks the file before building and explains each problem.

## Inline formatting

Strings marked *rich* below accept two marks and nothing else:

- `**bold**` for the lead words of a bullet
- `` `code` `` for file names, functions and values

Everything else is shown as plain text. There is no HTML and no other Markdown.

## Top level

| Field | Required | What it is |
|---|---|---|
| `project` | yes | The host project's name. Shown as the wordmark and in "Better in <project>". |
| `title` | yes | The page name for the browser tab: a short noun phrase, such as "Fieldnote Search Findings". Keep it stable; the reader's "Built" ticks are keyed to it. |
| `headline` | yes | The big heading in the hero, such as "What Fieldnote can take from lumen-search". |
| `eyebrow` | no | Small line above the headline: kind of page, date, sources. |
| `intro` | no | *Rich.* One or two sentences under the headline: how many features, how to use the page. |
| `aura` | no | Hero glow. One of `violet` (default), `graphite`, `ember`, `moss`, `amber`, `azure`, `flame`. See `design.md` for what each means. |
| `read` | yes | The short read. `{ "blocks": [ ... ] }`, see below. |
| `tiers` | yes | Feature groups, in order. Each `{ "id", "label", "note" }`; `note` is optional. |
| `features` | yes | The features, in build order. See below. |
| `groundRules` | recommended | Plain text appended to every prompt. See `writing-prompts.md`. |
| `footer` | no | *Rich.* A "sources read" line: what you read and what you checked it against. |
| `orderNote` | no | Replaces the sentence under "Build order" (use it when the user gave a session budget, to say what S, M and L mean for them). |
| `featuresNote` | no | Replaces the sentence under "Features". |
| `lang`, `dir` | no | Page language code and `"ltr"` or `"rtl"`. Layout mirrors for right-to-left. |
| `labels` | no | Overrides for the page's fixed strings. See the end of this file. |

## Short-read blocks

`read.blocks` is a list. Blocks sit in a two-column grid; `"wide": true` makes one span both columns.

| Field | Required | What it is |
|---|---|---|
| `title` | yes | Block heading. |
| `wide` | no | `true` to span the full width. Use for the main findings and for tables. |
| `text` | no | *Rich.* A short muted line above the bullets or table. |
| `bullets` | one of these | List of *rich* strings. |
| `table` | one of these | `{ "columns": [...], "rows": [[...], ...] }`. Each row has one cell per column. |
| `note` | no | *Rich.* A muted line under the block, such as how a table was produced. |

A table cell is either a string or `{ "text": "...", "tone": "..." }`. Tones: `num` (dot-matrix figure, for the row's key), `good` (green), `bad` (red), `warn` (amber), `muted`.

## Features

| Field | Required | What it is |
|---|---|---|
| `id` | yes | A string, unique, such as `"01"`. Keep ids stable across rebuilds. |
| `tier` | yes | One of the tier ids. List features tier by tier. |
| `size` | yes | `"S"`, `"M"` or `"L"`. |
| `title` | yes | A few words naming what the user gets. |
| `description` | yes | *Rich.* Two or three sentences: what it is and why it matters here. |
| `prompt` | yes | Plain text. The full implementation brief. Use `\n` for line breaks. |
| `sources` | no | List of source names this came from. Shown as tags and in the build-order table. |
| `inSource` | no | List of *rich* bullets: what the source does, including its mistakes. |
| `better` | recommended | List of *rich* bullets: how this is improved for the host project. |
| `landsIn` | recommended | List of file or folder paths in the host project. |
| `needs` | no | List of feature ids that must be merged first. Each must appear earlier in the list. |
| `helps` | no | List of feature ids that make this one better but are not required. |

## Labels

Every fixed string on the page can be replaced through `labels`, which is how a page is written in another language or adapted to a planning-only report. Unlisted keys keep their defaults.

| Key | Default |
|---|---|
| `navRead`, `navOrder`, `navFeatures` | Short read, Build order, Features |
| `readEyebrow`, `readTitle` | Part 1 · for you, The short read |
| `orderEyebrow`, `orderTitle`, `orderLede` | Sequence, Build order, the sizing sentence |
| `featuresEyebrow`, `featuresTitle`, `featuresLede` | Part 2 · for the implementing session, Features, the explainer sentence |
| `source`, `better`, `lands` | In the source, Better in <project>, Lands in |
| `needs`, `helps` | Needs first, Helped by |
| `all`, `built`, `builtCount` | All, Built, `{n} of {total} built` |
| `prompt`, `copy`, `copied`, `selected`, `expand`, `collapse` | `Prompt · feature {id}`, Copy prompt, Copied, Selected · press copy, Expand, Collapse |
| `colNo`, `colFeature`, `colFrom`, `colSize`, `colNeeds` | #, Feature, From, Size, Needs |
| `sizeS`, `sizeM`, `sizeL` | S · under half a session, M · one session, L · a full session or more |
| `steps` | A list of the four hero steps |

For a plan with no outside source, set `"source": "Today"` and `"better": "After"` and describe current behaviour in `inSource`.

## Minimal file

```json
{
  "project": "Fieldnote",
  "title": "Fieldnote Search Findings",
  "headline": "What Fieldnote can take from lumen-search",
  "read": { "blocks": [ { "title": "lumen-search", "bullets": ["**Good ideas:** typo matching."] } ] },
  "tiers": [ { "id": "a", "label": "Start here" } ],
  "features": [
    {
      "id": "01", "tier": "a", "size": "M",
      "title": "Typo-tolerant search",
      "description": "Search that still finds a note when one letter is wrong.",
      "better": ["Edit-distance check on top of trigram similarity."],
      "landsIn": ["src/search/trigram.ts"],
      "prompt": "Make note search tolerate typos.\n\nWhy: ..."
    }
  ],
  "groundRules": "Ground rules for this repo\n- ..."
}
```
