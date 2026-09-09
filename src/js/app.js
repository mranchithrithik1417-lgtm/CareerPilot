/**
 * CareerPilot — Application State & Router
 *
 * Single source of truth for all analysis data.
 * Simple hash-based routing.
 */

const App = (() => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const state = {
    // Input
    profile: null,          // Raw profile input from landing form

    // Analysis results (populated progressively)
    profileData:    null,   // From AI.analyzeProfile()
    careerMatches:  null,   // From AI.matchCareers()
    selectedCareer: null,   // User-selected or recommended career
    gapData:        null,   // From AI.analyzeSkillGaps()
    roadmapData:    null,   // From AI.generateRoadmap()
    learningData:   null,   // From AI.getLearningRecommendations()
    interviewQ:     null,   // From AI.generateInterviewQuestions()
    interviewAnswers: [],   // User's answers (array of strings)
    interviewResults: [],   // Evaluated results (array from AI.evaluateAnswer)
    finalReport:    null,   // From AI.generateFinalReport()

    // UI state
    currentView: 'landing',
    analysisComplete: false,
    analysisError: null,
  };

  // ---------------------------------------------------------------------------
  // Views registry  (populated by each view module)
  // ---------------------------------------------------------------------------
  const views = {};

  function registerView(name, renderFn) {
    views[name] = renderFn;
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  // Views that live inside the dashboard shell (sidebar layout)
  const DASHBOARD_VIEWS = new Set(['profile', 'careers', 'gaps', 'roadmap', 'learning', 'interview', 'report']);

  function navigate(view) {
    if (!views[view]) { console.warn('Unknown view:', view); return; }
    state.currentView = view;

    if (DASHBOARD_VIEWS.has(view)) {
      // Show dashboard shell; content rendered into #page-dashboard
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('page-dashboard-shell')?.classList.add('active');
    } else {
      // Full-page views (landing, loading)
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById(`page-${view}`)?.classList.add('active');
    }

    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === view);
    });

    // Render the view (dashboard views render into #page-dashboard)
    views[view]();

    // Scroll to top
    const mc = document.querySelector('.main-content');
    if (mc) mc.scrollTop = 0;
  }

  // ---------------------------------------------------------------------------
  // Toast notifications
  // ---------------------------------------------------------------------------
  function toast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span style="font-size:1.1rem">${icons[type]||'ℹ️'}</span><span>${message}</span>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  // ---------------------------------------------------------------------------
  // Utility: render a score ring SVG
  // ---------------------------------------------------------------------------
  function scoreRing(score, size = 90, strokeWidth = 8, label = '') {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const pct  = Math.min(100, Math.max(0, score)) / 100;
    const dash  = pct * circ;
    const color = score >= 70 ? '#22c55e' : score >= 45 ? '#f59e0b' : '#ef4444';

    return `<svg width="${size}" height="${size}" class="score-ring-svg" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#2d3148" stroke-width="${strokeWidth}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"
        stroke-dasharray="${dash} ${circ}" stroke-linecap="round"/>
      <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="middle"
        font-size="${size * 0.22}px" font-weight="700" fill="${color}" transform="rotate(90 ${size/2} ${size/2})">${score}%</text>
      ${label ? `<text x="${size/2}" y="${size/2 + size*0.2}" text-anchor="middle" dominant-baseline="middle"
        font-size="${size * 0.11}px" fill="#7b82a0" transform="rotate(90 ${size/2} ${size/2})">${label}</text>` : ''}
    </svg>`;
  }

  // ---------------------------------------------------------------------------
  // Utility: render skill tags from array
  // ---------------------------------------------------------------------------
  function renderSkillTags(skills, cls = 'tag-skill') {
    return (skills || []).map(s => `<span class="tag ${cls}">${s}</span>`).join(' ');
  }

  // ---------------------------------------------------------------------------
  // Utility: progress bar
  // ---------------------------------------------------------------------------
  function progressBar(pct, cls = 'fill-accent') {
    return `<div class="progress-bar-wrap">
      <div class="progress-bar-fill ${cls}" style="width:${pct}%"></div>
    </div>`;
  }

  // ---------------------------------------------------------------------------
  // localStorage persistence
  // API key is kept in sessionStorage only (clears when tab closes).
  // All other analysis results go to localStorage under 'cp_session'.
  // ---------------------------------------------------------------------------
  const STORAGE_KEY = 'cp_session';

  function saveSession() {
    try {
      // Never persist the API key to localStorage
      const toSave = {
        profile:         state.profile,
        profileData:     state.profileData,
        careerMatches:   state.careerMatches,
        selectedCareer:  state.selectedCareer,
        gapData:         state.gapData,
        roadmapData:     state.roadmapData,
        learningData:    state.learningData,
        interviewQ:      state.interviewQ,
        interviewAnswers:state.interviewAnswers,
        interviewResults:state.interviewResults,
        finalReport:     state.finalReport,
        analysisComplete:state.analysisComplete,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) { /* storage full or private mode */ }
  }

  function loadSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      Object.assign(state, saved);
      // Restore API key from sessionStorage (not localStorage)
      const sk = sessionStorage.getItem('cp_apikey');
      if (sk) AI.setApiKey(sk);
      return !!state.analysisComplete;
    } catch (e) { return false; }
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('cp_apikey');
    // Reset state fields
    Object.assign(state, {
      profile: null, profileData: null, careerMatches: null,
      selectedCareer: null, gapData: null, roadmapData: null,
      learningData: null, interviewQ: null, interviewAnswers: [],
      interviewResults: [], finalReport: null,
      analysisComplete: false, analysisError: null,
    });
  }

  // Call after every pipeline step to keep session fresh
  function _autosave() { if (state.analysisComplete || state.profileData) saveSession(); }

  // ---------------------------------------------------------------------------
  // SVG Gap Bar Chart
  // Renders a horizontal stacked bar chart from gapData.required_skills.
  // Pure SVG, no external deps.
  // ---------------------------------------------------------------------------
  function gapChart(gapData) {
    const skills = (gapData?.required_skills || [])
      .filter(s => s.importance === 'critical' || s.importance === 'important')
      .slice(0, 10); // cap at 10 for readability

    if (!skills.length) return '';

    const BAR_H    = 26;
    const GAP      = 10;
    const LABEL_W  = 160;
    const BAR_W    = 260;
    const TOTAL_W  = LABEL_W + BAR_W + 60;
    const HEIGHT   = skills.length * (BAR_H + GAP) + 40;

    const colorMap = { strong: '#22c55e', partial: '#f59e0b', missing: '#ef4444' };
    const widthMap = { strong: BAR_W, partial: BAR_W * 0.45, missing: 0 };

    const bars = skills.map((s, i) => {
      const y       = 30 + i * (BAR_H + GAP);
      const color   = colorMap[s.student_status] || '#4a5068';
      const barW    = widthMap[s.student_status] ?? 0;
      const bgColor = '#1a1d27';
      const label   = s.skill.length > 20 ? s.skill.slice(0, 19) + '…' : s.skill;
      const impDot  = s.importance === 'critical' ? '●' : '○';

      return `
        <text x="${LABEL_W - 8}" y="${y + BAR_H / 2 + 5}" text-anchor="end"
          font-size="12" fill="#7b82a0" font-family="system-ui,sans-serif">
          <tspan fill="${s.importance === 'critical' ? '#ef4444' : '#7b82a0'}">${impDot} </tspan>${label}
        </text>
        <rect x="${LABEL_W}" y="${y}" width="${BAR_W}" height="${BAR_H}" rx="4" fill="${bgColor}"/>
        ${barW > 0 ? `<rect x="${LABEL_W}" y="${y}" width="${barW}" height="${BAR_H}" rx="4" fill="${color}" opacity="0.85"/>` : ''}
        <text x="${LABEL_W + barW + 6}" y="${y + BAR_H / 2 + 5}"
          font-size="11" fill="${color}" font-family="system-ui,sans-serif" font-weight="600">
          ${s.student_status}
        </text>`;
    }).join('');

    return `
      <div class="card" style="overflow-x:auto">
        <div class="card-header">
          <div class="card-title"><span class="icon">📊</span> Critical &amp; Important Skills — Visual Coverage</div>
          <div style="display:flex;gap:10px;font-size:0.78rem">
            <span style="color:#22c55e">● strong</span>
            <span style="color:#f59e0b">● partial</span>
            <span style="color:#ef4444">● missing</span>
          </div>
        </div>
        <svg viewBox="0 0 ${TOTAL_W} ${HEIGHT}" width="100%" style="max-width:${TOTAL_W}px;display:block;overflow:visible" aria-label="Skill coverage chart">
          <text x="${LABEL_W}" y="16" font-size="10" fill="#4a5068" font-family="system-ui,sans-serif">0%</text>
          <text x="${LABEL_W + BAR_W / 2 - 4}" y="16" font-size="10" fill="#4a5068" font-family="system-ui,sans-serif">50%</text>
          <text x="${LABEL_W + BAR_W - 12}" y="16" font-size="10" fill="#4a5068" font-family="system-ui,sans-serif">100%</text>
          <line x1="${LABEL_W + BAR_W / 2}" y1="20" x2="${LABEL_W + BAR_W / 2}" y2="${HEIGHT}"
            stroke="#2d3148" stroke-width="1" stroke-dasharray="4,3"/>
          ${bars}
        </svg>
        <div style="font-size:0.75rem;color:var(--text-dim);margin-top:8px">
          ● Critical skills shown in red label. Bar length = approximate evidence strength.
        </div>
      </div>`;
  }

  // ---------------------------------------------------------------------------
  // Public
  // ---------------------------------------------------------------------------
  return {
    state, views,
    registerView, navigate,
    toast,
    scoreRing, renderSkillTags, progressBar,
    gapChart,
    saveSession, loadSession, clearSession, _autosave,
  };
})();
