/**
 * CareerPilot — Views
 *
 * Each view renders into its pre-existing page div.
 * Views read from App.state and write results back.
 */

/* ============================================================
   LANDING PAGE VIEW
   ============================================================ */
App.registerView('landing', function renderLanding() {
  const page = document.getElementById('page-landing');
  if (!page) return;

  // Session restore banner — shown when a completed analysis is in localStorage
  const hasSession = App.state.analysisComplete;
  const sessionBanner = hasSession ? `
    <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.35);border-radius:10px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:1.25rem">
      <div>
        <div style="font-weight:600;color:var(--text)">↺ Previous session found</div>
        <div style="font-size:0.82rem;color:var(--text-muted)">Analysis for <strong>${App.state.selectedCareer || 'your profile'}</strong> is still available.</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" onclick="App.navigate('profile')">Resume →</button>
        <button class="btn btn-ghost" onclick="App.clearSession();App.navigate('landing')" style="font-size:0.82rem">Clear</button>
      </div>
    </div>` : '';

  page.innerHTML = `
    <div class="landing-hero">
      <div class="hero-badge">✦ AI Career Intelligence · Student Edition</div>
      <h1>Know where you stand.<br>Build what you're missing.</h1>
      <p style="margin-top:1rem;font-size:1.05rem;color:var(--text-muted)">
        CareerPilot analyzes your resume, skills and projects to show you exactly
        which career paths match you — and what you need to get there.
      </p>
    </div>

    <div class="landing-form-container">

      ${sessionBanner}

      <!-- Mode selector -->
      <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:1.25rem">
        <button id="btn-mode-demo" onclick="setAnalysisMode('demo')"
          style="flex:1;padding:14px;border:none;cursor:pointer;font-family:var(--font);font-size:0.9rem;font-weight:600;transition:0.2s;background:var(--accent);color:#fff">
          🎓 Demo Mode <span style="font-weight:400;font-size:0.8rem;display:block">No API key needed — local analysis</span>
        </button>
        <button id="btn-mode-openai" onclick="setAnalysisMode('openai')"
          style="flex:1;padding:14px;border:none;cursor:pointer;font-family:var(--font);font-size:0.9rem;font-weight:600;transition:0.2s;background:var(--bg-card);color:var(--text-muted)">
          ✦ OpenAI Mode <span style="font-weight:400;font-size:0.8rem;display:block">GPT-4o — requires paid API key</span>
        </button>
      </div>

      <!-- Demo mode banner -->
      <div id="demo-mode-banner" style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.3);border-radius:var(--radius-sm);padding:12px 16px;font-size:0.85rem;color:var(--success);margin-bottom:1.25rem">
        ✓ <strong>Demo Mode active.</strong> Analysis runs locally in your browser using keyword extraction and scoring rules. No API key or internet required. Results are clearly labelled as demo estimates.
      </div>

      <div class="disclaimer">
        ⚠️ <div><strong>Responsible AI:</strong> CareerPilot provides career readiness <em>estimates</em> based only on
        the information you provide. Scores are not hiring predictions. Skills without project evidence are marked
        as "claimed". Your data is sent only to OpenAI for analysis — it is not stored by CareerPilot.</div>
      </div>

      <!-- API Key (hidden in demo mode) -->
      <div class="form-section" id="apikey-section" style="display:none">
        <div class="form-section-title">
          <span class="num">🔑</span>
          OpenAI API Key
        </div>
        <div class="api-key-banner">
          🔒 Your key is used only in your browser to call OpenAI directly. It is never stored or transmitted to CareerPilot servers.
        </div>
        <div class="form-group">
          <label class="form-label">API Key</label>
          <input type="password" class="form-input" id="input-apikey" placeholder="sk-..." value="${AI.getApiKey() || ''}">
          <div class="form-hint">Required. Get yours at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a></div>
        </div>
        <div class="form-group">
          <label class="form-label">Model <span class="optional">(optional)</span></label>
          <select class="form-select" id="input-model">
            <option value="gpt-4o-mini">gpt-4o-mini (recommended — fast &amp; affordable)</option>
            <option value="gpt-4o">gpt-4o (best quality)</option>
            <option value="gpt-3.5-turbo">gpt-3.5-turbo (fastest)</option>
          </select>
        </div>
      </div>

      <!-- Section 1: Resume / Bio -->
      <div class="form-section">
        <div class="form-section-title">
          <span class="num">1</span>
          Resume / Bio
        </div>
        <div class="form-group">
          <label class="form-label">Paste your resume text or a brief bio</label>
          <textarea class="form-textarea" id="input-resume" style="min-height:180px"
            placeholder="e.g. Computer Science student at XYZ University, 3rd year. Internship at ABC Corp as a backend developer (6 months). Built 3 web applications. GPA 3.7...">${App.state.profile?.resume || ''}</textarea>
          <div class="form-hint">The more detail you provide, the better your analysis. Include education, experience, achievements.</div>
        </div>
      </div>

      <!-- Section 2: Skills -->
      <div class="form-section">
        <div class="form-section-title">
          <span class="num">2</span>
          Skills &amp; Technical Background
        </div>
        <div class="form-group">
          <label class="form-label">List your skills (languages, frameworks, tools, concepts)</label>
          <textarea class="form-textarea" id="input-skills"
            placeholder="e.g. Python, JavaScript, React, SQL, Git, REST APIs, Machine Learning basics, Docker (basic), AWS (familiar)...">${App.state.profile?.skills || ''}</textarea>
          <div class="form-hint">Be honest — overclaiming skills leads to inaccurate gap analysis.</div>
        </div>
      </div>

      <!-- Section 3: Projects -->
      <div class="form-section">
        <div class="form-section-title">
          <span class="num">3</span>
          Projects
        </div>
        <div class="form-group">
          <label class="form-label">Describe your projects (personal, academic, internship)</label>
          <textarea class="form-textarea" id="input-projects" style="min-height:160px"
            placeholder="e.g.&#10;1. E-commerce website — Built with React + Node.js + MongoDB. Implemented cart, auth, payment integration. (2 months)&#10;2. ML Sentiment Classifier — Python, scikit-learn, trained on Twitter data, 82% accuracy.&#10;3. Mobile To-Do App — Flutter, local SQLite storage.">${App.state.profile?.projects || ''}</textarea>
          <div class="form-hint">Projects are the strongest evidence of your skills. Include tech stack and outcomes.</div>
        </div>
      </div>

      <!-- Section 4: GitHub (optional) -->
      <div class="form-section">
        <div class="form-section-title">
          <span class="num">4</span>
          GitHub / Additional Info <span style="font-weight:400;color:var(--text-muted);font-size:0.85rem">&nbsp;(optional)</span>
        </div>
        <div class="form-group">
          <label class="form-label">GitHub username or any additional context</label>
          <input type="text" class="form-input" id="input-github"
            placeholder="e.g. github.com/yourusername or 'Active GitHub profile with 12 public repos, contributions to open source...'"
            value="${App.state.profile?.github || ''}">
          <div class="form-hint">Note: CareerPilot does not fetch live GitHub data. Describe your activity here.</div>
        </div>
      </div>

      <!-- Section 5: Target Career (optional) -->
      <div class="form-section">
        <div class="form-section-title">
          <span class="num">5</span>
          Target Career <span style="font-weight:400;color:var(--text-muted);font-size:0.85rem">&nbsp;(optional)</span>
        </div>
        <div class="form-group">
          <label class="form-label">What career path do you want to pursue?</label>
          <select class="form-select" id="input-career">
            <option value="">Let CareerPilot suggest the best matches</option>
            <option value="Software Developer">Software Developer</option>
            <option value="Full-Stack Developer">Full-Stack Developer</option>
            <option value="Backend Engineer">Backend Engineer</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="AI/ML Engineer">AI/ML Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Data Analyst">Data Analyst</option>
            <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
            <option value="Cloud/DevOps Engineer">Cloud/DevOps Engineer</option>
            <option value="Mobile Developer">Mobile Developer</option>
          </select>
          <div class="form-hint">Optional. If left blank, CareerPilot will rank the best fitting careers for you.</div>
        </div>
        ${App.state.profile?.targetCareer ? `<script>document.getElementById('input-career').value = '${App.state.profile.targetCareer}';</script>` : ''}
      </div>

      <!-- Submit -->
      <div style="text-align:center;padding-top:1rem">
        <button class="btn btn-primary btn-lg" id="btn-analyze" onclick="handleAnalyze()">
          ✦ Analyze My Profile
        </button>
        <div style="margin-top:1rem;display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap">
          <p style="font-size:0.82rem;margin:0">
            Analysis takes ~30 seconds · Uses ~6 AI calls · Requires an OpenAI API key
          </p>
          <button class="btn btn-ghost" style="font-size:0.82rem;padding:6px 14px" onclick="fillSampleProfile()">
            🎓 Try Sample Profile
          </button>
        </div>
      </div>

    </div>
  `;

  // Restore selected model
  const modelSel = document.getElementById('input-model');
  if (modelSel && App.state.profile?.model) modelSel.value = App.state.profile.model;
});

/* ============================================================
   ANALYSIS / LOADING VIEW
   ============================================================ */
App.registerView('loading', function renderLoading() {
  const page = document.getElementById('page-loading');
  if (!page) return;
  // Rendered dynamically by handleAnalyze()
});

/* ============================================================
   PROFILE DECONSTRUCTION VIEW
   ============================================================ */
App.registerView('profile', function renderProfile() {
  const page = document.getElementById('page-dashboard');
  const data = App.state.profileData;
  if (!page) return;

  if (!data) {
    page.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><h3>No profile analysis yet</h3><p>Go back to the landing page and submit your profile.</p></div>`;
    return;
  }

  const expColor = { beginner: 'tag-partial', intermediate: 'tag-strong', advanced: 'tag-strong' };

  page.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Profile Deconstruction</div>
        <div class="section-subtitle">What CareerPilot found in your profile — with evidence</div>
      </div>
      <span class="tag ${expColor[data.experience_level] || 'tag-neutral'}">${data.experience_level || 'unknown'} level</span>
    </div>

    <div class="disclaimer">
      ⚠️ Skills are marked <strong>Demonstrated</strong> (found in project/experience context)
      or <strong>Claimed</strong> (listed but not evidenced in a project). Claimed skills receive lower confidence.
    </div>

    <!-- Summary -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><span class="icon">👤</span> Profile Summary</div>
      </div>
      <p style="color:var(--text)">${data.summary || 'No summary available.'}</p>
      ${data.education_signals?.length ? `<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">${App.renderSkillTags(data.education_signals, 'tag-neutral')}</div>` : ''}
    </div>

    <!-- Skills with evidence -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><span class="icon">🛠️</span> Technical Skills</div>
        <span class="tag tag-neutral">${(data.technical_skills || []).length} detected</span>
      </div>
      ${(data.technical_skills || []).length === 0
        ? '<p>No technical skills detected. Try adding more detail to your resume and skills.</p>'
        : `<div>${(data.technical_skills || []).map(s => `
          <div class="evidence-row">
            <div>
              <div class="evidence-skill">${s.skill}</div>
              <div class="evidence-source">${s.evidence || 'no evidence noted'}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <span class="tag tag-neutral" style="font-size:0.72rem">${s.type || 'skill'}</span>
              <span class="evidence-conf ${s.confidence === 'high' ? 'conf-high' : s.confidence === 'medium' ? 'conf-medium' : s.evidence?.includes('claimed') ? 'conf-claimed' : 'conf-low'}">${s.confidence || 'low'}</span>
            </div>
          </div>`).join('')}
        </div>`
      }
    </div>

    <!-- Projects -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><span class="icon">📂</span> Projects Identified</div>
      </div>
      ${(data.projects || []).length === 0
        ? '<p>No projects detected. Add project descriptions to improve analysis accuracy.</p>'
        : `<div class="grid-2">${(data.projects || []).map(p => `
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:1rem">
            <div style="font-weight:600;margin-bottom:6px">📁 ${p.title}</div>
            <p style="font-size:0.85rem;margin-bottom:10px">${p.description || ''}</p>
            <div style="display:flex;flex-wrap:wrap;gap:4px">${App.renderSkillTags(p.skills_demonstrated || [])}</div>
          </div>`).join('')}
        </div>`
      }
    </div>

    <!-- Strengths & Weaknesses -->
    <div class="grid-2">
      <div class="card">
        <div class="card-title" style="margin-bottom:1rem"><span class="icon">💪</span> Strengths</div>
        ${(data.strengths || []).map(s => `<div style="display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-bottom:1px solid var(--border)"><span style="color:var(--success)">✓</span><span style="font-size:0.9rem">${s}</span></div>`).join('') || '<p>None identified yet.</p>'}
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:1rem"><span class="icon">📈</span> Areas to Develop</div>
        ${(data.weak_areas || []).map(s => `<div style="display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-bottom:1px solid var(--border)"><span style="color:var(--warning)">△</span><span style="font-size:0.9rem">${s}</span></div>`).join('') || '<p>None identified yet.</p>'}
      </div>
    </div>
  `;
});

/* ============================================================
   CAREER MATCH VIEW
   ============================================================ */
App.registerView('careers', function renderCareers() {
  const page = document.getElementById('page-dashboard');
  const data = App.state.careerMatches;
  if (!page) return;

  if (!data) {
    page.innerHTML = `<div class="empty-state"><div class="empty-icon">🎯</div><h3>Career matches not available</h3><p>Complete the profile analysis first.</p></div>`;
    return;
  }

  page.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Career Match Engine</div>
        <div class="section-subtitle">Careers ranked by how well your profile aligns</div>
      </div>
      <button class="btn btn-secondary" onclick="handleCareerSelect('${App.state.selectedCareer || data.recommended_primary}')">
        Analyze gaps for selected ▶
      </button>
    </div>

    <div class="card" style="background:var(--accent-soft);border-color:var(--accent)">
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:2rem">🎯</span>
        <div>
          <div style="font-size:0.8rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Recommended Path</div>
          <div style="font-size:1.3rem;font-weight:700">${data.recommended_primary}</div>
          <p style="font-size:0.88rem;margin-top:4px">${data.recommendation_reason}</p>
        </div>
      </div>
    </div>

    <div id="career-list">
      ${(data.top_matches || []).map(m => {
        const isSelected = (App.state.selectedCareer || data.recommended_primary) === m.career;
        const fillClass = m.match_score >= 70 ? 'fill-success' : m.match_score >= 45 ? 'fill-warning' : 'fill-danger';
        return `
        <div class="career-match-card ${isSelected ? 'selected' : ''}" onclick="handleCareerSelect('${m.career}')">
          <div class="career-match-info">
            <div class="career-match-title">${m.career}
              ${isSelected ? '<span class="tag tag-skill" style="margin-left:8px;font-size:0.7rem">Selected</span>' : ''}
            </div>
            <div class="career-match-why">${m.rationale}</div>
            <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
              ${(m.key_evidence || []).map(e => `<span class="tag tag-strong" style="font-size:0.72rem">${e}</span>`).join('')}
              ${(m.main_gaps || []).map(g => `<span class="tag tag-missing" style="font-size:0.72rem">gap: ${g}</span>`).join('')}
            </div>
            <div style="margin-top:10px">${App.progressBar(m.match_score, fillClass)}</div>
          </div>
          <div class="match-score-badge">${m.match_score}%</div>
        </div>`;
      }).join('')}
    </div>
  `;
});

/* ============================================================
   SKILL GAP VIEW
   ============================================================ */
App.registerView('gaps', function renderGaps() {
  const page = document.getElementById('page-dashboard');
  const data = App.state.gapData;
  if (!page) return;

  if (!data) {
    page.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><h3>Skill gap analysis not available</h3><p>Select a career from the Career Match page first.</p></div>`;
    return;
  }

  const importanceOrder = { critical: 0, important: 1, 'nice-to-have': 2 };
  const sorted = [...(data.required_skills || [])].sort((a, b) =>
    (importanceOrder[a.importance] ?? 3) - (importanceOrder[b.importance] ?? 3)
  );

  const totalSkills = sorted.length;
  const strongCount  = sorted.filter(s => s.student_status === 'strong').length;
  const partialCount = sorted.filter(s => s.student_status === 'partial').length;
  const missingCount = sorted.filter(s => s.student_status === 'missing').length;
  const coveragePct  = totalSkills ? Math.round(((strongCount + partialCount * 0.5) / totalSkills) * 100) : 0;

  page.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Skill Gap Analysis</div>
        <div class="section-subtitle">Coverage for: <strong>${data.career}</strong></div>
      </div>
      ${App.scoreRing(coveragePct, 80, 7, 'coverage')}
    </div>

    <div class="grid-3" style="margin-bottom:1.5rem">
      <div class="stat-box">
        <div class="stat-label">Strong</div>
        <div class="stat-value" style="color:var(--success)">${strongCount}</div>
        <div class="stat-sub">Demonstrated skills</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Partial</div>
        <div class="stat-value" style="color:var(--warning)">${partialCount}</div>
        <div class="stat-sub">Limited evidence</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Missing</div>
        <div class="stat-value" style="color:var(--danger)">${missingCount}</div>
        <div class="stat-sub">Gaps to address</div>
      </div>
    </div>

    ${data.gap_summary ? `<div class="card"><p style="color:var(--text)">${data.gap_summary}</p></div>` : ''}

    ${App.gapChart(data)}

    ${data.top_gaps?.length ? `
    <div class="card" style="border-color:rgba(239,68,68,0.4);background:rgba(239,68,68,0.04)">
      <div class="card-title" style="margin-bottom:1rem;color:var(--danger)"><span>🚨</span> Top Priority Gaps</div>
      ${data.top_gaps.map((g, i) => `<div style="display:flex;gap:10px;align-items:center;padding:6px 0"><span style="color:var(--danger);font-weight:700">#${i+1}</span><span>${g}</span></div>`).join('')}
    </div>` : ''}

    <div class="card">
      <div class="card-header">
        <div class="card-title"><span class="icon">📋</span> All Required Skills</div>
        <div style="display:flex;gap:6px">
          <span class="tag tag-strong">✓ Strong</span>
          <span class="tag tag-partial">~ Partial</span>
          <span class="tag tag-missing">✗ Missing</span>
        </div>
      </div>
      ${sorted.map(s => {
        const statusCls = s.student_status === 'strong' ? 'tag-strong' : s.student_status === 'partial' ? 'tag-partial' : 'tag-missing';
        const statusSym = s.student_status === 'strong' ? '✓' : s.student_status === 'partial' ? '~' : '✗';
        const impBadge  = s.importance === 'critical' ? 'tag-missing' : s.importance === 'important' ? 'tag-partial' : 'tag-neutral';
        return `
        <div style="padding:12px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap">
            <div style="flex:1">
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <span class="tag ${statusCls}">${statusSym} ${s.skill}</span>
                <span class="tag ${impBadge}" style="font-size:0.7rem">${s.importance}</span>
              </div>
              <div style="font-size:0.82rem;color:var(--text-muted);margin-top:4px">${s.why_it_matters || ''}</div>
              <div style="font-size:0.78rem;color:var(--text-dim);margin-top:2px;font-style:italic">${s.evidence || ''}</div>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
});

/* ============================================================
   ROADMAP VIEW
   ============================================================ */
App.registerView('roadmap', function renderRoadmap() {
  const page = document.getElementById('page-dashboard');
  const data = App.state.roadmapData;
  if (!page) return;

  if (!data) {
    page.innerHTML = `<div class="empty-state"><div class="empty-icon">🗺️</div><h3>Roadmap not available</h3><p>Complete the skill gap analysis first.</p></div>`;
    return;
  }

  page.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Career Roadmap</div>
        <div class="section-subtitle">Personalized path to ${data.career} · Est. ${data.timeline_estimate || 'varies'}</div>
      </div>
    </div>

    ${data.quick_wins?.length ? `
    <div class="card" style="background:rgba(34,197,94,0.06);border-color:rgba(34,197,94,0.3)">
      <div class="card-title" style="margin-bottom:1rem;color:var(--success)">⚡ Quick Wins — Start This Week</div>
      ${data.quick_wins.map(w => `<div style="display:flex;gap:10px;padding:5px 0"><span style="color:var(--success)">→</span><span style="font-size:0.9rem">${w}</span></div>`).join('')}
    </div>` : ''}

    ${(data.phases || []).map((phase, i) => `
    <div class="roadmap-phase">
      <div class="phase-number">${phase.phase || i+1}</div>
      <div class="phase-content">
        <div class="phase-title">${phase.title} <span style="font-size:0.8rem;color:var(--text-muted);font-weight:400">· ${phase.duration || ''}</span></div>
        <div class="phase-body" style="margin-bottom:10px">${phase.focus || ''}</div>
        ${phase.actions?.length ? `
        <ul style="padding-left:1.25rem;margin-bottom:10px">
          ${phase.actions.map(a => `<li style="font-size:0.88rem;color:var(--text-muted);margin-bottom:4px">${a}</li>`).join('')}
        </ul>` : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          ${phase.milestone ? `<span style="font-size:0.8rem;color:var(--success)">🏁 ${phase.milestone}</span>` : ''}
          ${(phase.addresses_gaps || []).map(g => `<span class="tag tag-missing" style="font-size:0.72rem">${g}</span>`).join('')}
        </div>
      </div>
    </div>`).join('')}

    ${data.portfolio_advice ? `
    <div class="card">
      <div class="card-title" style="margin-bottom:0.75rem">💼 Portfolio Advice</div>
      <p style="color:var(--text)">${data.portfolio_advice}</p>
    </div>` : ''}
  `;
});

/* ============================================================
   LEARNING RECOMMENDATIONS VIEW
   ============================================================ */
App.registerView('learning', function renderLearning() {
  const page = document.getElementById('page-dashboard');
  const data = App.state.learningData;
  if (!page) return;

  if (!data) {
    page.innerHTML = `<div class="empty-state"><div class="empty-icon">📚</div><h3>Learning recommendations not available</h3><p>Complete the skill gap analysis first.</p></div>`;
    return;
  }

  const providerIcon = {
    'IBM SkillsBuild': '🔷',
    'Coursera':        '🎓',
    'edX':             '📘',
    'freeCodeCamp':    '💻',
    'YouTube':         '▶️',
    'Official Docs':   '📄',
  };

  const priorityCls = { high: 'tag-missing', medium: 'tag-partial', low: 'tag-neutral' };

  page.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Learning Recommendations</div>
        <div class="section-subtitle">Curated resources to close your specific skill gaps</div>
      </div>
    </div>

    ${data.ibm_skillsbuild_note ? `
    <div class="api-key-banner">
      🔷 <strong>IBM SkillsBuild:</strong> ${data.ibm_skillsbuild_note}
    </div>` : ''}

    <div class="grid-2">
      ${(data.recommendations || []).map(r => `
      <div class="card" style="${r.provider === 'IBM SkillsBuild' ? 'border-color:rgba(34,211,238,0.35);' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:10px">
          <div style="font-weight:600;font-size:0.95rem">${providerIcon[r.provider] || '🔗'} ${r.title}</div>
          <span class="tag ${priorityCls[r.priority] || 'tag-neutral'}">${r.priority}</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          <span class="tag tag-neutral" style="font-size:0.72rem">${r.provider}</span>
          <span class="tag tag-neutral" style="font-size:0.72rem">${r.type}</span>
          ${r.estimated_time ? `<span class="tag tag-neutral" style="font-size:0.72rem">⏱ ${r.estimated_time}</span>` : ''}
        </div>
        <p style="font-size:0.85rem;margin-bottom:8px">${r.why_relevant}</p>
        <div style="font-size:0.8rem;color:var(--accent2)">Addresses: <strong>${r.addresses_gap}</strong></div>
        <div style="margin-top:10px;font-size:0.78rem;color:var(--text-dim)">🔗 ${r.url_hint || 'Search on the provider platform'}</div>
      </div>`).join('')}
    </div>

    <div class="disclaimer" style="margin-top:1rem">
      ⚠️ Resource URLs are indicative only. Verify availability and current pricing directly on each platform. CareerPilot does not guarantee course availability or endorsement.
    </div>
  `;
});

/* ============================================================
   INTERVIEW VIEW
   ============================================================ */
App.registerView('interview', function renderInterview() {
  const page = document.getElementById('page-dashboard');
  const questions = App.state.interviewQ?.questions;
  if (!page) return;

  if (!questions?.length) {
    page.innerHTML = `<div class="empty-state"><div class="empty-icon">🎤</div><h3>Interview questions not available</h3><p>Complete the skill gap analysis first.</p></div>`;
    return;
  }

  const results = App.state.interviewResults;
  const allAnswered = results.length >= questions.length;

  page.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Career Stress Test</div>
        <div class="section-subtitle">Mock interview for ${App.state.selectedCareer} — answer each question honestly</div>
      </div>
      ${allAnswered
        ? `<div style="color:var(--success);font-weight:600">✓ All answered</div>`
        : `<div style="color:var(--text-muted);font-size:0.88rem">${results.length}/${questions.length} answered</div>`
      }
    </div>

    <div class="disclaimer">
      ⚠️ This is a practice exercise. Answers are evaluated by AI and scores are estimates. Treat feedback as learning guidance, not an objective assessment.
    </div>

    ${questions.map((q, i) => {
      const answer = App.state.interviewAnswers[i] || '';
      const result = results[i];
      const catCls = { technical: 'tag-skill', behavioral: 'tag-neutral', 'gap-probe': 'tag-missing', project: 'tag-partial', conceptual: 'tag-neutral' };

      return `
      <div class="interview-question">
        <div class="question-meta">
          <span class="tag ${catCls[q.category] || 'tag-neutral'}">${q.category}</span>
          <span class="tag tag-neutral">${q.difficulty}</span>
          <span class="tag tag-neutral">${q.based_on}</span>
          ${result ? `<span class="tag ${result.score >= 70 ? 'tag-strong' : result.score >= 45 ? 'tag-partial' : 'tag-missing'}">${result.score}/100</span>` : ''}
        </div>
        <div style="font-weight:600;margin-bottom:12px;font-size:1rem">Q${i+1}. ${q.question}</div>
        <div style="font-size:0.78rem;color:var(--text-dim);margin-bottom:10px;font-style:italic">What we're testing: ${q.what_we_test}</div>
        <textarea class="interview-answer" id="answer-${i}" placeholder="Type your answer here...">${answer}</textarea>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-secondary" onclick="handleSubmitAnswer(${i})">
            ${result ? '↺ Re-evaluate' : '✓ Submit Answer'}
          </button>
          ${result ? `<button class="btn btn-ghost" onclick="toggleFeedback(${i})">View Feedback</button>` : ''}
        </div>

        ${result ? `
        <div id="feedback-${i}" style="margin-top:12px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:1rem;display:none">
          <div style="font-weight:600;margin-bottom:8px;color:${result.score >= 70 ? 'var(--success)' : result.score >= 45 ? 'var(--warning)' : 'var(--danger)'}">${result.grade} · ${result.score}/100</div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:10px">
            <div><div style="font-size:0.75rem;color:var(--text-dim);font-weight:600;text-transform:uppercase">Conceptual</div><div style="font-size:0.85rem">${result.conceptual}</div></div>
            <div><div style="font-size:0.75rem;color:var(--text-dim);font-weight:600;text-transform:uppercase">Depth</div><div style="font-size:0.85rem">${result.depth}</div></div>
            <div><div style="font-size:0.75rem;color:var(--text-dim);font-weight:600;text-transform:uppercase">Practical</div><div style="font-size:0.85rem">${result.practical}</div></div>
            <div><div style="font-size:0.75rem;color:var(--text-dim);font-weight:600;text-transform:uppercase">Communication</div><div style="font-size:0.85rem">${result.communication}</div></div>
          </div>
          <div style="border-top:1px solid var(--border);padding-top:10px">
            <div style="font-size:0.75rem;color:var(--text-dim);font-weight:600;text-transform:uppercase;margin-bottom:4px">Improvement</div>
            <div style="font-size:0.88rem;color:var(--text)">${result.improvement}</div>
          </div>
        </div>` : ''}
      </div>`;
    }).join('')}

    ${allAnswered ? `
    <div style="text-align:center;padding:1.5rem">
      <button class="btn btn-primary btn-lg" onclick="handleGenerateReport()">
        📊 Generate Final Readiness Report
      </button>
    </div>` : ''}
  `;
});

/* ============================================================
   FINAL REPORT VIEW
   ============================================================ */
App.registerView('report', function renderReport() {
  const page = document.getElementById('page-dashboard');
  const data = App.state.finalReport;
  if (!page) return;

  if (!data) {
    page.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><h3>Final report not available</h3><p>Complete the mock interview to generate your readiness report.</p></div>`;
    return;
  }

  const levelColor = {
    'Early Stage': 'var(--danger)',
    'Developing':  'var(--warning)',
    'Nearly Ready':'var(--accent)',
    'Job-Ready':   'var(--success)',
  };

  page.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Career Readiness Report</div>
        <div class="section-subtitle">Final assessment for ${App.state.selectedCareer}</div>
      </div>
      <div style="text-align:center">
        ${App.scoreRing(data.overall_readiness_score, 100, 9, data.readiness_level)}
      </div>
    </div>

    <div class="disclaimer">
      ⚠️ ${data.disclaimer || 'This readiness score is an AI estimate based solely on the information you provided. It is not an objective hiring probability or guarantee of employment.'}
    </div>

    <!-- Readiness Level Banner -->
    <div class="card" style="border-color:${levelColor[data.readiness_level]||'var(--border)'};background:rgba(0,0,0,0.2)">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div style="font-size:2.5rem">${data.readiness_level === 'Job-Ready' ? '🏆' : data.readiness_level === 'Nearly Ready' ? '🎯' : data.readiness_level === 'Developing' ? '📈' : '🌱'}</div>
        <div>
          <div style="font-size:1.4rem;font-weight:700;color:${levelColor[data.readiness_level]||'var(--text)'}">${data.readiness_level}</div>
          <p style="max-width:560px;margin-top:4px">${data.score_explanation}</p>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Strengths -->
      <div class="card">
        <div class="card-title" style="margin-bottom:1rem;color:var(--success)">💪 Top Strengths</div>
        ${(data.top_strengths || []).map(s => `<div style="display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-bottom:1px solid var(--border)"><span style="color:var(--success)">✓</span><span style="font-size:0.9rem">${s}</span></div>`).join('')}
      </div>

      <!-- Weaknesses -->
      <div class="card">
        <div class="card-title" style="margin-bottom:1rem;color:var(--warning)">📈 Top Weaknesses</div>
        ${(data.top_weaknesses || []).map(w => `<div style="display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-bottom:1px solid var(--border)"><span style="color:var(--warning)">△</span><span style="font-size:0.9rem">${w}</span></div>`).join('')}
      </div>
    </div>

    <!-- Priority Gap + Interview + Next Action -->
    <div class="grid-3">
      <div class="stat-box">
        <div class="stat-label">Top Priority Gap</div>
        <div style="font-size:1rem;font-weight:700;color:var(--danger);margin:6px 0">${data.highest_priority_gap || 'N/A'}</div>
        <div class="stat-sub">Address this first</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Interview Performance</div>
        <div class="stat-value">${data.interview_performance || 'N/A'}</div>
        <div class="stat-sub">Mock interview score</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Best Career Match</div>
        <div style="font-size:0.95rem;font-weight:700;color:var(--accent2);margin:6px 0">${data.strongest_career_path || App.state.selectedCareer}</div>
        <div class="stat-sub">Based on your profile</div>
      </div>
    </div>

    <!-- Next Action -->
    <div class="card" style="background:var(--accent-soft);border-color:var(--accent)">
      <div class="card-title" style="margin-bottom:0.75rem">⚡ Your #1 Next Action</div>
      <p style="color:var(--text);font-size:1rem">${data.recommended_next_action}</p>
    </div>

    <!-- Encouragement -->
    <div class="card">
      <p style="color:var(--text);font-size:1rem;font-style:italic">${data.encouragement}</p>
    </div>

    <!-- Actions -->
    <div style="display:flex;gap:1rem;flex-wrap:wrap;padding-bottom:2rem" class="no-print">
      <button class="btn btn-secondary" onclick="App.navigate('roadmap')">← Back to Roadmap</button>
      <button class="btn btn-primary" onclick="handlePrintReport()">🖨️ Download / Print Report</button>
      <button class="btn btn-ghost" onclick="App.clearSession();App.navigate('landing')">✦ Start New Analysis</button>
    </div>
  `;
});
