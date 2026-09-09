# CareerPilot — TODO & Implementation Roadmap

## ✅ Skeleton Complete (Step 1)

The following has been created and is functional:

### Structure
- `index.html` — Entry point, page containers, script loading
- `src/styles/main.css` — Full design system (dark theme, cards, forms, sidebar, responsive)
- `src/js/app.js` — Application state, router, utility functions
- `src/js/ai.js` — AI service module (all 8 OpenAI calls, responsible AI prompts)
- `src/js/views.js` — All 7 section views (landing, profile, careers, gaps, roadmap, learning, interview, report)
- `src/js/controller.js` — Analysis pipeline, event handlers, career switching

The app opens in any browser with no build step required.

---

## 🔲 Next Steps (Priority Order)

### HIGH PRIORITY

- [ ] **Test full analysis pipeline end-to-end**
  - Open `index.html` in browser, enter an API key and sample profile
  - Verify all 6 AI calls complete and results render correctly
  - Check JSON parsing handles edge cases (malformed AI output)

- [ ] **Add JSON parse error resilience**
  - If AI returns malformed JSON, show a friendly retry message
  - Consider wrapping `_parseJSON` with a retry call

- [ ] **Polish the loading page**
  - Show which step is currently running with an animated indicator
  - Add step timing or progress percentage

- [ ] **Career match bar chart visualization**
  - Replace text progress bars with a proper SVG bar chart
  - Show all career matches side by side visually

- [ ] **Skill gap visualization**
  - Add a radar/spider chart showing skill coverage by category
  - Could use a simple SVG radar with 5-6 axes

### MEDIUM PRIORITY

- [ ] **Topbar nav improvements**
  - Show navigation tabs in topbar only when analysis is complete
  - Add current section breadcrumb

- [ ] **PDF / print export**
  - Add a "Download Report" button on the Final Report page
  - Use `window.print()` with a print stylesheet

- [ ] **Session persistence**
  - Save state to `localStorage` so refreshing doesn't lose analysis
  - Add "Resume last session" prompt on landing if saved state exists

- [ ] **Improve interview flow**
  - Add a "Submit All" button for batch evaluation
  - Show overall interview score summary before generating full report
  - Visual score breakdown (bar chart per question)

- [ ] **Mobile sidebar**
  - Add hamburger menu for mobile
  - Slide-in sidebar drawer on small screens

### LOW PRIORITY / ENHANCEMENTS

- [ ] **Dark/light theme toggle**
  - CSS variables are already set up — just needs a toggle button + class swap

- [ ] **Multiple career comparison**
  - Side-by-side gap comparison for two selected careers

- [ ] **IBM SkillsBuild deep links**
  - Research actual IBM SkillsBuild course URLs for common career paths
  - Replace `url_hint` with real verified links where possible

- [ ] **Onboarding sample data**
  - Add a "Try with sample profile" button on landing
  - Pre-fills a realistic student profile for demo purposes

- [ ] **Accessibility pass**
  - Add ARIA labels to sidebar items and form inputs
  - Ensure keyboard navigation works throughout

---

## Architecture Notes

```
index.html
├── src/styles/main.css       ← Design system (CSS variables, all components)
├── src/js/app.js             ← State + router + utilities
├── src/js/ai.js              ← All AI calls (OpenAI API, structured prompts)
├── src/js/views.js           ← View renderers (pure HTML string → innerHTML)
└── src/js/controller.js      ← Event handlers + analysis pipeline
```

### Adding a new view:
1. Add a `<div class="page" id="page-xyz">` to `index.html`
2. Call `App.registerView('xyz', function() { ... })` in `views.js`
3. Add it to `DASHBOARD_VIEWS` set in `app.js` if it uses the sidebar layout
4. Add a sidebar item in `index.html`

### Adding a new AI call:
1. Add the function to `src/js/ai.js`
2. Call it from the pipeline in `controller.js → runAnalysisPipeline()`
3. Store result in `App.state`
4. Read from `App.state` in the relevant view

---

## Running Locally

**Option 1 — Direct browser (simplest):**
```
Open index.html in Chrome, Firefox, or Edge
```
Note: Some browsers block `fetch()` on `file://` protocol.
If you see CORS errors, use Option 2.

**Option 2 — Python HTTP server (recommended):**
```bash
cd careerpilot
python -m http.server 8080
# Open http://localhost:8080
```

**Option 3 — VS Code Live Server:**
Right-click `index.html` → Open with Live Server

---

## Hackathon Demo Tips

1. Pre-enter an API key before the demo
2. Use the sample profile button (once implemented) for a clean demo flow
3. The full analysis pipeline takes ~30 seconds — show the loading steps
4. Highlight the "Claimed vs. Demonstrated" distinction as a responsible AI feature
5. The Final Report is the most impressive view — lead with that in the pitch
