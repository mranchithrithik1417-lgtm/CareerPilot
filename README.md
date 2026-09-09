# CareerPilot ✦

> AI Career Intelligence & Readiness System for Students

**CareerPilot** analyzes your resume, skills, and projects to show you where you stand, which careers match your profile, what skills you're missing, and exactly what to do next.

Built for the **IBM Student AI Track — "AI Career Copilot"** hackathon.

---

## What it does

| Feature | Description |
|---|---|
| **Profile Deconstruction** | Extracts skills with evidence/confidence indicators — distinguishes demonstrated vs. claimed skills |
| **Career Match Engine** | Scores 5+ career paths against your profile with percentage match and rationale |
| **Skill Gap Analysis** | Shows strong/partial/missing skills for your target career |
| **Personalized Roadmap** | Phase-by-phase action plan based on your specific gaps |
| **Learning Recommendations** | Curated resources including IBM SkillsBuild, Coursera, edX |
| **Mock Interview** | Career-targeted questions with AI evaluation (conceptual, depth, practical, communication) |
| **Final Readiness Report** | Overall readiness score with explanation, top strengths/weaknesses, and #1 next action |

---

## Tech Stack

- **Pure HTML/CSS/JavaScript** — no build step, opens directly in browser
- **OpenAI API** (gpt-4o-mini by default) — real AI, no mocking
- **No backend** — all AI calls made directly from the browser
- **No dependencies** — no npm, no frameworks, no installation required

---

## Running Locally

```bash
cd careerpilot

# Option 1: Python (recommended)
python -m http.server 8080
# Then open http://localhost:8080

# Option 2: Just open index.html in Chrome/Firefox/Edge
# (may need to disable CORS restrictions for fetch() to work)
```

You will need an **OpenAI API key** — enter it on the landing page. Your key is never stored outside your browser.

---

## Project Structure

```
careerpilot/
├── index.html              ← Entry point & page containers
├── src/
│   ├── styles/
│   │   └── main.css        ← Complete design system
│   └── js/
│       ├── app.js          ← State management & router
│       ├── ai.js           ← All AI calls (OpenAI API)
│       ├── views.js        ← View renderers for all 7 sections
│       └── controller.js   ← Event handlers & analysis pipeline
└── TODO.md                 ← Implementation roadmap
```

---

## Responsible AI

- Readiness scores are **estimates**, not hiring predictions
- Skills are explicitly labelled **Demonstrated** or **Claimed**
- No personal data is stored by CareerPilot
- The system never invents skills or projects
- All AI disclaimers are visible in the UI

---

## Hackathon Track

IBM Student AI Track — "AI Career Copilot" problem statement.

Built with **IBM Bob** as the primary development tool.
