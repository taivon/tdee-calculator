# TDEE Calculator — Design Spec

**Date:** 2026-06-19  
**Status:** Approved  
**Hosting:** GitHub Pages  
**Monetization:** Google AdSense  

## Summary

A modern, editorial-style TDEE (Total Daily Energy Expenditure) calculator built with Vite + TypeScript + vanilla CSS. The site targets a calculator-only launch: one polished page with live results, educational content, FAQ, and a separate privacy policy page. Designed for GitHub Pages deployment and Google AdSense monetization.

## Decisions

| Decision | Choice |
|----------|--------|
| Product focus | Balanced default with optional Advanced panel |
| Visual direction | Editorial / Content-First (warm neutrals, serif accents) |
| Launch scope | Calculator-only (single page + privacy policy) |
| Tech stack | Vite + TypeScript + vanilla CSS |
| Architecture | Single-page editorial site + separate `privacy.html` |
| Default formula | Mifflin-St Jeor |
| Advanced formula | Katch-McArdle (when body fat % provided) |

## Architecture

```
tdee-calculator/
├── index.html              # Main page (calculator + content)
├── privacy.html            # Privacy policy (AdSense requirement)
├── src/
│   ├── main.ts             # App entry, wires calculator + UI
│   ├── calculator/
│   │   ├── formulas.ts     # BMR formula implementations
│   │   ├── activity.ts     # Activity multipliers + labels
│   │   ├── macros.ts       # Macro split logic
│   │   └── types.ts        # Input/output types
│   ├── ui/
│   │   ├── calculator.ts   # Form rendering + live updates
│   │   ├── results.ts      # TDEE + goal cards + macro display
│   │   └── advanced.ts     # Collapsible advanced panel
│   └── styles/
│       ├── tokens.css      # Editorial design tokens
│       ├── base.css        # Reset, typography
│       ├── calculator.css  # Form + result card styles
│       └── layout.css      # Page sections, ad slots, responsive grid
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── ads.txt             # Added after AdSense approval
├── vite.config.ts
└── .github/workflows/deploy.yml
```

### Tech decisions

- **Vite 6** + **TypeScript 5** (strict mode)
- **Vanilla CSS** with custom properties — no Tailwind or UI framework
- **No runtime framework** — calculator state managed in plain TypeScript modules
- **GitHub Actions** deploys `dist/` to `gh-pages` branch
- **Custom domain** via `CNAME` file in `/public` when ready

## Page Layout & UX

### Visual language

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#faf9f7` | Page background (warm off-white) |
| Text | `#2c2417` | Body copy (dark brown) |
| Border | `#e8e4df` | Subtle dividers |
| Accent | Muted terracotta or sage | CTAs, active states |
| Body font | Inter / system-ui | Sans-serif for UI and body |
| Heading font | Lora / Source Serif 4 | Serif for editorial headings |
| Mode | Light only | Dark mode deferred to v2 |

### Page structure (top → bottom)

1. **Header** — Logo/wordmark, nav links (Calculator · FAQ · Privacy)
2. **Hero** — "Calculate Your Daily Calorie Needs" + subtitle
3. **Calculator card** — Two-column desktop (inputs left, live results right); stacked mobile
4. **Ad slot #1** — Responsive horizontal banner below calculator
5. **Explainer** — "What is TDEE?" with BMR + activity + TEF breakdown
6. **Ad slot #2** — In-article ad between explainer and FAQ
7. **FAQ accordion** — 5–6 questions
8. **Footer** — Medical disclaimer, privacy link, copyright

### Calculator UX

- All inputs update results live (no submit button)
- **Default view:** sex, age, height, weight, activity level → TDEE + cut/maintain/bulk cards + macro bar
- **Advanced panel:** collapsible `<details>` element below inputs
- Results sticky on desktop while scrolling inputs
- Mobile: compact sticky bar showing TDEE when scrolled past results

### Default vs Advanced feature split

**Default (always visible):**

- Sex, age, height, weight
- Activity level (5 tiers)
- TDEE result
- Cut / maintain / bulk calorie targets
- Basic macro split (protein / carbs / fat)

**Advanced (collapsed panel):**

- Body fat % → auto-switches to Katch-McArdle formula
- Compare multiple BMR formulas side-by-side
- Custom deficit/surplus amount (slider ±100–1000 kcal)
- Adjustable macro ratios (must sum to 100%)
- Metric ↔ imperial unit toggle

## Calculator Logic

### Default formula: Mifflin-St Jeor

| Sex | Formula |
|-----|---------|
| Male | `(10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5` |
| Female | `(10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161` |

### Advanced formula: Katch-McArdle

Activated when body fat % is entered:

```
BMR = 370 + (21.6 × lean_mass_kg)
lean_mass_kg = weight_kg × (1 − body_fat_pct / 100)
```

### Additional formulas (Advanced comparison table only)

- Harris-Benedict (revised)
- Cunningham: `500 + (22 × lean_mass_kg)` — shown only when body fat % is provided

### Activity multipliers

| Level | Multiplier | Description |
|-------|-----------|-------------|
| Sedentary | 1.2 | Desk job, little/no exercise |
| Light | 1.375 | Light exercise 1–3 days/week |
| Moderate | 1.55 | Moderate exercise 3–5 days/week |
| Active | 1.725 | Hard exercise 6–7 days/week |
| Very Active | 1.9 | Very hard exercise + physical job |

**TDEE** = BMR × activity multiplier

### Goal targets

| Goal | Default offset |
|------|---------------|
| Cut | TDEE − 500 kcal (~1 lb/week) |
| Maintain | TDEE |
| Bulk | TDEE + 300 kcal (lean gain) |

Advanced panel slider (±100–1000 kcal) overrides default offsets.

### Macro calculation

**Defaults:**

- Protein: 1.8 g/kg body weight (capped at 40% of calories for display)
- Fat: 25% of calories
- Carbs: remainder

**Advanced:** User-adjustable protein / fat / carb percentages (must sum to 100%).

### Validation rules

| Field | Range |
|-------|-------|
| Age | 15–80 |
| Height | 120–250 cm (or 4'0"–8'2") |
| Weight | 30–300 kg (or 66–660 lbs) |
| Body fat | 3–60% |

Invalid inputs show inline hints. Results display "—" until all required fields are valid.

### Unit handling

All internal math uses metric. Imperial inputs convert on entry. Unit toggle lives in the Advanced panel; **default display unit: metric** (cm / kg).

## AdSense & Monetization

### Ad placement

| Slot | Location | Format |
|------|----------|--------|
| Ad #1 | Below calculator card | Responsive horizontal banner |
| Ad #2 | Between explainer and FAQ | In-article rectangle |

### AdSense compliance

- `privacy.html` covering cookies, Google AdSense, and data collection
- `ads.txt` in `/public` after AdSense account approval
- Footer disclaimer: *"This calculator provides estimates only. Consult a healthcare professional before making dietary changes."*
- Explainer (~300 words) + FAQ (5–6 Q&As) for content policy compliance
- No ads inside the calculator form

### Implementation

- Ad slots are empty `<div>` placeholders with `data-ad-slot` attributes
- AdSense script loaded async in `<head>`, commented out during development
- Ads never block calculator interaction

### Revenue path

1. Launch on GitHub Pages (optionally with custom domain)
2. Apply for AdSense (requires live site + privacy policy)
3. Enable ad script and `ads.txt`
4. Expand to content hub if traffic warrants (future scope B)

## Deployment

### GitHub Pages

- Repo: `tdee-calculator`
- Deploy source: GitHub Actions → `dist/` to `gh-pages` branch
- Custom domain: `CNAME` file in `/public`
- HTTPS enforced via GitHub Pages settings

### CI/CD

```yaml
# .github/workflows/deploy.yml
on: push to main
steps: checkout → npm ci → npm run build → deploy dist/ to gh-pages
```

### Launch checklist

- [ ] Calculator computes correctly (manual test cases)
- [ ] Responsive on mobile / tablet / desktop
- [ ] Lighthouse: Performance > 90, Accessibility > 95
- [ ] Privacy policy page live
- [ ] Footer disclaimer present
- [ ] Meta tags + Open Graph for social sharing
- [ ] `robots.txt` + basic sitemap
- [ ] Custom domain configured (optional at launch)
- [ ] AdSense application submitted

## Out of Scope (v1)

- User accounts / saved calculations
- Backend / API
- Dark mode
- Additional pages / blog
- PWA / offline support
- Analytics (add post-launch alongside AdSense if desired)

## FAQ Content (planned)

1. What is TDEE and how is it calculated?
2. How accurate is this calculator?
3. Which formula should I use?
4. How do I pick the right activity level?
5. How many calories should I eat to lose weight?
6. What are macros and why do they matter?

## Error Handling

- Inline validation messages on invalid inputs
- Graceful degradation if AdSense script fails to load
- Calculator always functional regardless of ad state

## Testing Strategy

- Unit tests for formula modules (`formulas.ts`, `macros.ts`, `activity.ts`)
- Manual test cases for known BMR/TDEE values
- Lighthouse CI in GitHub Actions (optional, post-launch)
- Cross-browser check: Chrome, Safari, Firefox mobile + desktop

## Accessibility

- Semantic HTML (`<form>`, `<fieldset>`, `<label>`)
- Keyboard-navigable inputs and FAQ accordion
- `aria-expanded` on advanced panel and FAQ items
- Color contrast meets WCAG AA on editorial palette
- `prefers-reduced-motion` respected for animations
