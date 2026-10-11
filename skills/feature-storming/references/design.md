# Design

The page uses one fixed visual system, implemented in `assets/template.html`. It began as the design language of the Synclete app ("dot": monochrome ink on black or warm off-white, with colour kept for meaning). This file states it so the look can be kept exact, and so the template can be repaired or extended without drifting.

You do not apply any of this by hand when writing a report: the template already does. Read it when you need to choose an `aura`, decide how to tone table cells, or change the template itself.

## Principles

1. **Monochrome first.** Ink on a black or alabaster ground and one neutral grey. Surfaces are separated by hairlines, not shadows.
2. **Colour means something.** It never decorates. Green is good or done, amber is caution, red is wrong or missed. A cool-to-hot ramp (azure, violet, flame) marks effort, here the size of a job.
3. **The dot is the motif.** A faint dot field covers the ground, the display face is dot-matrix, and size is shown as lit dots.
4. **One hero.** A single near-black card with one glow and light text in both themes. Nothing else on the page glows.
5. **Display type is rare.** Doto is for the wordmark, headings and key figures. Everything meant to be read is in the body face.

## Fonts

| Role | Face | Where |
|---|---|---|
| Display | Doto (Google Fonts), weights 600, 700, 900; fallback `ui-monospace, monospace` | Wordmark (900), hero heading (600), section headings and card titles (700), feature numbers and key table figures (900) |
| Body | `'Helvetica Neue', Helvetica, 'Inter Tight', Arial, sans-serif` | All running text, labels, buttons. Inter Tight (Google Fonts, 400 to 700) is the fallback where Helvetica Neue is not installed |
| Code | `ui-monospace, 'SF Mono', Menlo, Consolas, monospace` | Prompts, inline code, file paths |

Type scale: body 15px / 1.55; card and block text 13.5 to 14px; notes 13px; eyebrow labels 11px uppercase with 0.1em letter-spacing; section headings 26px; card titles 22px; hero heading `clamp(27px, 5.4vw, 42px)`; prompts 12.5px / 1.6.

## Colour tokens

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#000000` | `#f4f3ef` | Page ground |
| `--surface` | `#0c0c0d` | `#fcfbf9` | Cards and blocks |
| `--elevated` | `#161618` | `#edece7` | Inner tiles, code blocks |
| `--container` | `#1f1f22` | `#e4e2dc` | Code chips inside tiles |
| `--line` | `#1e1e21` | `#e2e0da` | Hairline borders |
| `--line-strong` | `#2a2a2e` | `#d3d1ca` | Borders on controls and code blocks |
| `--text` | `#f4f3ef` | `#0a0a0a` | Primary text |
| `--muted` | `#8e9195` | `#5f6266` | Secondary text, labels |
| `--neutral` | `#76797d` | `#76797d` | Bullet markers |
| `--ink` / `--on-ink` | `#f4f3ef` / `#000000` | `#0a0a0a` / `#f4f3ef` | Primary button fill and its text |
| `--dim` | `#232326` | `#dedcd5` | An unlit dot |
| `--positive` | `#32d583` | `#1b7f4b` | Good cells, the Built tick |
| `--warning` | `#ffb224` | `#a15c00` | Caution cells |
| `--danger` | `#ff5a4e` | `#c7281b` | Wrong or bad cells |
| `--e1`, `--e3`, `--e5` | `#4da8ff`, `#a56bff`, `#ff7a45` | same | Size dots: S, M, L |
| `--dot-field` | `rgba(244,243,239,0.055)` | `rgba(10,10,10,0.07)` | The dot grid on the ground |

The dot field is `radial-gradient(var(--dot-field) 1px, transparent 1.2px)` at `22px 22px`, offset `-11px -11px`.

Themes: dark values sit on `:root`. Light values apply under `prefers-color-scheme: light` unless the host sets `data-theme="dark"`, and again under `data-theme="light"`, so a host's explicit theme choice wins in both directions.

## Shape and spacing

- Radius: 14px tiles and code blocks, 22px cards and blocks, 26px hero, 999px pills and buttons.
- Reading column: 940px maximum, 20px side gutter (16px on phones).
- Section gap 40px; card gap 16px; grid gap 12px.
- Two-column grids collapse to one below 720px. The page body never scrolls sideways; tables scroll inside their own container.
- Layout uses logical properties, so `dir: "rtl"` mirrors it.

## Components

- **Bar**: sticky, translucent with blur, wordmark on the leading edge, section links on the trailing edge.
- **Hero (aura)**: near-black base, one radial glow, light text in both themes, four pill-shaped steps.
- **Block**: surface with hairline border; heading, optional muted line, bullets or a table, optional note.
- **Table**: uppercase 11px headers, tabular figures, hairline row rules.
- **Feature card**: number, source tags, size meter, Built tick; dot-matrix title; description; two inner tiles ("In the source" and "Better in <project>"); "Lands in" path chips; the prompt block.
- **Prompt block**: header with label, Expand and Copy; body capped at 300px tall until expanded.
- **Size meter**: three dots, one to three lit, coloured on the effort ramp.

## Aura choices

Pick the glow for what the page is about. Default is `violet`.

| Aura | Reads as |
|---|---|
| `violet` | A steady, long piece of work: a plan or roadmap |
| `azure` | Easy, low-risk material |
| `moss` | Things on track or done |
| `amber` | Caution: findings with caveats |
| `ember` | Risk: an audit that found serious problems |
| `flame` | Hard, intense work |
| `graphite` | Neutral; nothing to signal yet |

## Changing the template

Keep the tokens, the fonts and the five principles. Add tokens to `:root` and to both light blocks together. Never give a component a literal colour that only works in one theme. After any change, rebuild `assets/example.findings.json` and look at it in dark and light, wide and phone-width.
