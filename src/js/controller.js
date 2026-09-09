/**
 * CareerPilot — Controller
 *
 * Handles all user interactions: form submission, analysis pipeline,
 * career selection, interview evaluation, and report generation.
 */

/* ============================================================
   SAMPLE PROFILE — Demo data for hackathon / quick testing
   ============================================================ */
const SAMPLE_PROFILE = {
  resume: `Priya Sharma — Computer Science Student, 3rd Year
University of Technology, Mumbai | GPA: 3.6 / 4.0
Expected graduation: May 2025

EXPERIENCE
• Internship — Backend Developer, FinTech Startup (June–Aug 2024, 3 months)
  Built REST APIs in Python/Flask for transaction processing.
  Worked with PostgreSQL, wrote unit tests with pytest.
  Deployed on AWS EC2, used basic Docker for containerisation.

• Teaching Assistant — Data Structures & Algorithms (Jan–May 2024)
  Helped 40+ students debug code, ran weekly lab sessions.

EDUCATION
• B.Tech Computer Science — expected 2025
• Relevant coursework: Data Structures, Algorithms, DBMS, OS, Linear Algebra, Statistics`,

  skills: `Languages: Python (strong), JavaScript (intermediate), SQL (intermediate), C++ (basic, university only)
Frameworks: Flask, React (basic, self-taught)
Tools: Git, GitHub, Docker (basic), AWS EC2 (basic), Postman
Databases: PostgreSQL, MongoDB (familiar)
Concepts: REST APIs, OOP, Basic ML (linear regression, classification — coursework only)
Soft skills: Communication, Teaching, Problem Solving`,

  projects: `1. Budget Tracker Web App (Personal Project, 2024)
   Stack: React frontend + Flask backend + PostgreSQL
   Features: expense categories, monthly charts, CSV export
   Deployed on Heroku (free tier)
   GitHub: 47 stars

2. Movie Recommendation System (Final Year Project, ongoing)
   Python, scikit-learn, collaborative filtering + content-based
   Dataset: MovieLens 100k
   Achieved 78% precision@10. Working on a simple Flask API wrapper.

3. Student Attendance System (University Project, 2023)
   Python + Tkinter GUI + SQLite
   Built for a real professor's class, used by ~120 students for one semester
   
4. Mini Compiler — Lexer & Parser (Systems Programming course, 2023)
   C++, handles arithmetic expressions and variable assignments`,

  github: `Active GitHub profile: github.com/priyasharma-dev
~12 public repos. Most active in Python and JavaScript.
Contributions: mostly personal projects, some open source issue fixes (NumPy docs, small Flask PRs).
Longest streak: 34 days.`,

  targetCareer: '',
};

function fillSampleProfile() {
  const fields = {
    'input-resume':    SAMPLE_PROFILE.resume,
    'input-skills':    SAMPLE_PROFILE.skills,
    'input-projects':  SAMPLE_PROFILE.projects,
    'input-github':    SAMPLE_PROFILE.github,
  };
  for (const [id, val] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }
  const careerEl = document.getElementById('input-career');
  if (careerEl) careerEl.value = '';
  App.toast('Sample profile loaded — click Analyze My Profile to continue.', 'success');
}

/* ============================================================
   ANALYSIS MODE — demo (local) or openai (paid API)
   ============================================================ */

// Active engine: starts as AI_LOCAL (demo mode)
let _activeEngine = AI_LOCAL;
let _currentMode  = 'demo';

function setAnalysisMode(mode) {
  _currentMode  = mode;
  _activeEngine = mode === 'openai' ? AI : AI_LOCAL;

  const demoBtn   = document.getElementById('btn-mode-demo');
  const openaiBtn = document.getElementById('btn-mode-openai');
  const apikeyEl  = document.getElementById('apikey-section');
  const bannerEl  = document.getElementById('demo-mode-banner');

  if (!demoBtn) return; // not on landing page yet

  const indicator = document.getElementById('mode-indicator');

  if (mode === 'demo') {
    demoBtn.style.background   = 'var(--accent)';
    demoBtn.style.color        = '#fff';
    openaiBtn.style.background = 'var(--bg-card)';
    openaiBtn.style.color      = 'var(--text-muted)';
    if (apikeyEl) apikeyEl.style.display = 'none';
    if (bannerEl) bannerEl.style.display = 'block';
    if (indicator) { indicator.textContent = '🎓 Demo Mode'; indicator.style.color = '#22c55e'; indicator.style.background = 'rgba(34,197,94,0.12)'; indicator.style.borderColor = 'rgba(34,197,94,0.3)'; }
  } else {
    openaiBtn.style.background = 'var(--accent)';
    openaiBtn.style.color      = '#fff';
    demoBtn.style.background   = 'var(--bg-card)';
    demoBtn.style.color        = 'var(--text-muted)';
    if (apikeyEl) apikeyEl.style.display = 'block';
    if (bannerEl) bannerEl.style.display = 'none';
    if (indicator) { indicator.textContent = '✦ OpenAI Mode'; indicator.style.color = 'var(--accent2)'; indicator.style.background = 'rgba(34,211,238,0.07)'; indicator.style.borderColor = 'rgba(34,211,238,0.25)'; }
  }
}

/* ============================================================
   ANALYSIS PIPELINE
   ============================================================ */

async function handleAnalyze() {
  const model = document.getElementById('input-model')?.value || 'gpt-4o-mini';

  // OpenAI mode requires an API key; demo mode does not
  if (_currentMode === 'openai') {
    const apiKey = document.getElementById('input-apikey')?.value?.trim();
    if (!apiKey || apiKey.length < 10) {
      App.toast('Please enter your OpenAI API key, or switch to Demo Mode.', 'error');
      return;
    }
    AI.setApiKey(apiKey);
    AI.setModel(model);
    sessionStorage.setItem('cp_apikey', apiKey);
  }

  const resume   = document.getElementById('input-resume')?.value?.trim();
  const skills   = document.getElementById('input-skills')?.value?.trim();
  const projects = document.getElementById('input-projects')?.value?.trim();

  if (!resume && !skills && !projects) {
    App.toast('Please fill in at least your resume/bio or skills.', 'error');
    return;
  }

  // Clear any old session BEFORE writing new profile (clearSession resets state)
  App.clearSession();

  App.state.profile = {
    resume,
    skills,
    projects,
    github: document.getElementById('input-github')?.value?.trim() || '',
    targetCareer: document.getElementById('input-career')?.value || '',
    model,
    demoMode: _currentMode === 'demo',
  };

  // Switch to loading page
  showLoadingPage();
}

// ---------------------------------------------------------------------------
// Loading page & sequential analysis pipeline
// ---------------------------------------------------------------------------
function showLoadingPage() {
  // Switch pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-loading').classList.add('active');

  // Render loading UI
  const steps = [
    { id: 'step-profile',   label: 'Analyzing your profile & skills'  },
    { id: 'step-careers',   label: 'Matching career paths'             },
    { id: 'step-gaps',      label: 'Identifying skill gaps'            },
    { id: 'step-roadmap',   label: 'Building your roadmap'             },
    { id: 'step-learning',  label: 'Finding learning resources'        },
    { id: 'step-interview', label: 'Generating interview questions'    },
  ];

  const loadingPage = document.getElementById('page-loading');
  loadingPage.innerHTML = `
    <div class="loading-page">
      <div>
        <div style="text-align:center;margin-bottom:2rem">
          <div class="spinner" style="margin:0 auto 1rem"></div>
          <h2>Analyzing your profile…</h2>
          <p style="margin-top:8px">This takes about 30 seconds</p>
        </div>
        <div class="loading-steps">
          ${steps.map(s => `<div class="loading-step" id="${s.id}"><span class="step-icon">○</span> ${s.label}</div>`).join('')}
        </div>
      </div>
    </div>
  `;

  // Run the pipeline
  runAnalysisPipeline(steps);
}

function setStepState(stepId, state) {
  const el = document.getElementById(stepId);
  if (!el) return;
  el.className = `loading-step ${state}`;
  if (state === 'active') el.querySelector('.step-icon').textContent = '⟳';
  if (state === 'done')   el.querySelector('.step-icon').textContent = '✓';
}

async function runAnalysisPipeline(steps) {
  const profile = App.state.profile;
  const engine  = _activeEngine; // AI_LOCAL or AI depending on selected mode

  try {
    // Step 1 — Profile
    setStepState('step-profile', 'active');
    App.state.profileData = await engine.analyzeProfile(profile);
    setStepState('step-profile', 'done');
    App._autosave();

    // Step 2 — Career Matches
    setStepState('step-careers', 'active');
    App.state.careerMatches = await engine.matchCareers(profile, App.state.profileData);
    App.state.selectedCareer = profile.targetCareer || App.state.careerMatches.recommended_primary;
    setStepState('step-careers', 'done');
    App._autosave();

    // Step 3 — Skill Gaps
    setStepState('step-gaps', 'active');
    App.state.gapData = await engine.analyzeSkillGaps(App.state.selectedCareer, App.state.profileData);
    setStepState('step-gaps', 'done');
    App._autosave();

    // Step 4 — Roadmap
    setStepState('step-roadmap', 'active');
    App.state.roadmapData = await engine.generateRoadmap(App.state.selectedCareer, App.state.profileData, App.state.gapData);
    setStepState('step-roadmap', 'done');
    App._autosave();

    // Step 5 — Learning
    setStepState('step-learning', 'active');
    App.state.learningData = await engine.getLearningRecommendations(App.state.selectedCareer, App.state.gapData);
    setStepState('step-learning', 'done');
    App._autosave();

    // Step 6 — Interview Questions
    setStepState('step-interview', 'active');
    App.state.interviewQ = await engine.generateInterviewQuestions(App.state.selectedCareer, App.state.profileData, App.state.gapData);
    App.state.interviewAnswers = [];
    App.state.interviewResults = [];
    setStepState('step-interview', 'done');

    App.state.analysisComplete = true;
    App.saveSession();

    // Update spinner to success
    const spinnerEl = document.querySelector('.spinner');
    if (spinnerEl) spinnerEl.style.borderTopColor = 'var(--success)';

    // Short pause then navigate to profile view (inside dashboard shell)
    await sleep(800);
    App.navigate('profile');

  } catch (err) {
    console.error('Analysis error:', err);
    App.state.analysisError = err.message;

    const loadingPage = document.getElementById('page-loading');
    if (loadingPage) {
      loadingPage.innerHTML = `
        <div class="loading-page">
          <div style="text-align:center;max-width:480px">
            <div style="font-size:3rem;margin-bottom:1rem">❌</div>
            <h2 style="margin-bottom:0.75rem">Analysis failed</h2>
            <p style="margin-bottom:1.5rem">${err.message}</p>
            <button class="btn btn-primary" onclick="App.navigate('landing')">← Back to Profile</button>
          </div>
        </div>
      `;
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ============================================================
   CAREER SELECTION
   ============================================================ */
async function handleCareerSelect(career) {
  if (App.state.selectedCareer === career) {
    // Already selected — just navigate to gaps
    App.navigate('gaps');
    return;
  }

  App.state.selectedCareer = career;
  App.toast(`Analyzing gaps for: ${career}…`, 'info');

  // Re-run gap analysis for new career
  try {
    App.state.gapData     = await _activeEngine.analyzeSkillGaps(career, App.state.profileData);
    App.state.roadmapData = await _activeEngine.generateRoadmap(career, App.state.profileData, App.state.gapData);
    App.state.learningData = await _activeEngine.getLearningRecommendations(career, App.state.gapData);
    App.state.interviewQ  = await _activeEngine.generateInterviewQuestions(career, App.state.profileData, App.state.gapData);
    App.state.interviewAnswers = [];
    App.state.interviewResults = [];
    App.state.finalReport = null;

    App.toast(`Career switched to: ${career}`, 'success');
    App.navigate('gaps');
  } catch (err) {
    App.toast(`Error: ${err.message}`, 'error');
  }
}

/* ============================================================
   INTERVIEW ANSWER SUBMISSION
   ============================================================ */
async function handleSubmitAnswer(index) {
  const answer = document.getElementById(`answer-${index}`)?.value || '';
  const question = App.state.interviewQ?.questions?.[index];
  if (!question) return;

  const btn = document.querySelector(`#answer-${index} ~ * .btn`);

  App.toast('Evaluating answer…', 'info');

  try {
    const result = await _activeEngine.evaluateAnswer(question, answer, App.state.selectedCareer);
    App.state.interviewAnswers[index] = answer;
    App.state.interviewResults[index] = result;

    // Re-render interview view
    App.navigate('interview');

    // Auto-show feedback for this question
    setTimeout(() => {
      const fb = document.getElementById(`feedback-${index}`);
      if (fb) fb.style.display = 'block';
      // Scroll to the question
      document.querySelectorAll('.interview-question')[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

  } catch (err) {
    App.toast(`Evaluation error: ${err.message}`, 'error');
  }
}

function toggleFeedback(index) {
  const fb = document.getElementById(`feedback-${index}`);
  if (fb) fb.style.display = fb.style.display === 'none' ? 'block' : 'none';
}

/* ============================================================
   FINAL REPORT
   ============================================================ */
async function handleGenerateReport() {
  App.toast('Generating your final report…', 'info');
  try {
    App.state.finalReport = await _activeEngine.generateFinalReport(
      App.state.selectedCareer,
      App.state.profileData,
      App.state.gapData,
      App.state.roadmapData,
      App.state.interviewResults
    );
    App.saveSession();
    App.navigate('report');
  } catch (err) {
    App.toast(`Report error: ${err.message}`, 'error');
  }
}

/* ============================================================
   PRINT / PDF EXPORT
   ============================================================ */
function handlePrintReport() {
  // Switch main-content to show-all mode so print captures full page
  document.querySelector('.main-content')?.classList.add('print-expand');
  window.print();
  document.querySelector('.main-content')?.classList.remove('print-expand');
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Try to restore a previous session
  const hasSession = App.loadSession();
  if (hasSession) {
    // Show a restore banner on the landing page, then navigate landing
    App.navigate('landing');
    // Banner is injected by renderLanding() when state.analysisComplete is true
  } else {
    App.navigate('landing');
  }
});
