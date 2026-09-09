/**
 * CareerPilot — AI Service Module
 *
 * All AI calls go through this module.
 * Uses the OpenAI Chat Completions API (GPT-4o / GPT-3.5-turbo).
 * The user supplies their own API key — no key is stored server-side.
 *
 * Each function returns parsed structured data.
 * Responsible AI principles are enforced at the prompt level.
 */

const AI = (() => {
  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------
  const DEFAULT_MODEL = 'gpt-4o-mini'; // affordable, fast, good quality
  const API_URL = 'https://api.openai.com/v1/chat/completions';

  let _apiKey = '';
  let _model  = DEFAULT_MODEL;

  function setApiKey(key) { _apiKey = key.trim(); }
  function setModel(model) { _model = model; }
  function getApiKey() { return _apiKey; }
  function isConfigured() { return _apiKey.length > 10; }

  // ---------------------------------------------------------------------------
  // Core fetch wrapper
  // ---------------------------------------------------------------------------
  async function _chat(messages, { temperature = 0.4, max_tokens = 2000 } = {}) {
    if (!isConfigured()) throw new Error('OpenAI API key not set. Please enter your key on the landing page.');

    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${_apiKey}`,
      },
      body: JSON.stringify({ model: _model, messages, temperature, max_tokens }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error?.message || `OpenAI API error: ${resp.status}`);
    }

    const data = await resp.json();
    return data.choices[0].message.content;
  }

  // Parse JSON from AI response (handles markdown code fences)
  function _parseJSON(raw) {
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    return JSON.parse(cleaned);
  }

  // ---------------------------------------------------------------------------
  // System prompt (shared responsible AI preamble)
  // ---------------------------------------------------------------------------
  const SYSTEM = `You are CareerPilot, an AI career intelligence assistant for students.

IMPORTANT PRINCIPLES:
1. Only reference skills, projects and experience that appear in the student's provided information.
2. Clearly distinguish between DEMONSTRATED skills (evidenced in projects/experience) and CLAIMED skills (only mentioned).
3. Never guarantee employment, hiring probability, or specific salary outcomes.
4. Be honest about limitations and uncertainty.
5. Provide actionable, constructive feedback.
6. All readiness scores are estimates based on available information, not objective hiring predictions.

Always respond with valid JSON only (no markdown prose outside the JSON).`;

  // ---------------------------------------------------------------------------
  // 1. Profile Deconstruction
  // ---------------------------------------------------------------------------
  async function analyzeProfile(profile) {
    const userMsg = `Analyze this student profile and return a structured profile deconstruction.

STUDENT PROFILE:
Resume / Bio:
${profile.resume || '(not provided)'}

Skills listed:
${profile.skills || '(not provided)'}

Projects:
${profile.projects || '(not provided)'}

GitHub / Additional info:
${profile.github || '(not provided)'}

Target Career:
${profile.targetCareer || '(not specified)'}

Return this exact JSON structure:
{
  "name": "student name or 'Student' if not found",
  "summary": "2-sentence profile summary",
  "technical_skills": [
    { "skill": "name", "confidence": "high|medium|low", "evidence": "where this was demonstrated or 'claimed only'", "type": "language|framework|tool|concept|domain" }
  ],
  "projects": [
    { "title": "project name", "description": "brief description", "skills_demonstrated": ["skill1"] }
  ],
  "strengths": ["strength 1", "strength 2"],
  "weak_areas": ["area 1", "area 2"],
  "experience_level": "beginner|intermediate|advanced",
  "education_signals": ["any degree/course signals found"]
}`;

    const raw = await _chat([
      { role: 'system', content: SYSTEM },
      { role: 'user',   content: userMsg },
    ], { max_tokens: 1500 });

    return _parseJSON(raw);
  }

  // ---------------------------------------------------------------------------
  // 2. Career Match Engine
  // ---------------------------------------------------------------------------
  async function matchCareers(profile, profileData) {
    const userMsg = `Given this student's analyzed profile, evaluate career path matches.

PROFILE SUMMARY:
${JSON.stringify(profileData, null, 2)}

TARGET CAREER (if specified): ${profile.targetCareer || 'none — suggest top matches'}

Consider these career paths: Software Developer, AI/ML Engineer, Data Analyst, Data Scientist, Cybersecurity Analyst, Cloud/DevOps Engineer, Full-Stack Developer, Mobile Developer, Backend Engineer.

Return this exact JSON:
{
  "top_matches": [
    {
      "career": "career title",
      "match_score": 72,
      "match_level": "strong|moderate|weak",
      "rationale": "2-3 sentence explanation of why this score",
      "key_evidence": ["evidence point 1", "evidence point 2"],
      "main_gaps": ["gap 1", "gap 2"]
    }
  ],
  "recommended_primary": "best career title",
  "recommendation_reason": "1-2 sentence explanation"
}

Include 3-5 careers. If a target career was specified, include it and mark it clearly in rationale.`;

    const raw = await _chat([
      { role: 'system', content: SYSTEM },
      { role: 'user',   content: userMsg },
    ], { max_tokens: 1200 });

    return _parseJSON(raw);
  }

  // ---------------------------------------------------------------------------
  // 3. Skill Gap Analysis
  // ---------------------------------------------------------------------------
  async function analyzeSkillGaps(career, profileData) {
    const userMsg = `Perform a detailed skill gap analysis for this student targeting the career: "${career}".

STUDENT PROFILE:
${JSON.stringify(profileData, null, 2)}

Return this exact JSON:
{
  "career": "${career}",
  "required_skills": [
    {
      "skill": "skill name",
      "importance": "critical|important|nice-to-have",
      "student_status": "strong|partial|missing",
      "evidence": "what the student has shown or 'not demonstrated'",
      "gap_priority": 1,
      "why_it_matters": "1 sentence explanation"
    }
  ],
  "skills_owned": ["skill names where status is strong"],
  "skills_partial": ["skill names where status is partial"],
  "skills_missing": ["skill names where status is missing"],
  "top_gaps": ["the 3 most important missing skills"],
  "gap_summary": "2-sentence overall assessment"
}`;

    const raw = await _chat([
      { role: 'system', content: SYSTEM },
      { role: 'user',   content: userMsg },
    ], { max_tokens: 1400 });

    return _parseJSON(raw);
  }

  // ---------------------------------------------------------------------------
  // 4. Personalized Career Roadmap
  // ---------------------------------------------------------------------------
  async function generateRoadmap(career, profileData, gapData) {
    const userMsg = `Create a personalized career roadmap for a student targeting "${career}".

PROFILE:
${JSON.stringify(profileData, null, 2)}

SKILL GAPS:
${JSON.stringify(gapData, null, 2)}

Generate a PERSONALIZED roadmap (not generic). Address the student's specific gaps.

Return this exact JSON:
{
  "career": "${career}",
  "timeline_estimate": "e.g. 4-6 months",
  "phases": [
    {
      "phase": 1,
      "title": "Phase title",
      "duration": "e.g. 2-3 weeks",
      "focus": "what to focus on",
      "actions": ["specific action 1", "specific action 2"],
      "milestone": "what success looks like",
      "addresses_gaps": ["which specific gaps this phase targets"]
    }
  ],
  "quick_wins": ["things the student can do this week"],
  "portfolio_advice": "specific advice for their portfolio based on their current projects"
}`;

    const raw = await _chat([
      { role: 'system', content: SYSTEM },
      { role: 'user',   content: userMsg },
    ], { max_tokens: 1600 });

    return _parseJSON(raw);
  }

  // ---------------------------------------------------------------------------
  // 5. Learning Recommendations
  // ---------------------------------------------------------------------------
  async function getLearningRecommendations(career, gapData) {
    const userMsg = `Recommend learning resources for a student targeting "${career}" with these skill gaps: ${gapData.top_gaps?.join(', ') || 'various gaps'}.

IMPORTANT: For IBM SkillsBuild, only recommend resources that genuinely exist or are plausible on that platform. Do not fabricate specific course IDs or URLs.

Return this exact JSON:
{
  "recommendations": [
    {
      "title": "resource title",
      "provider": "IBM SkillsBuild|Coursera|edX|freeCodeCamp|YouTube|Official Docs|other",
      "type": "course|tutorial|documentation|practice|project",
      "url_hint": "e.g. skillsbuild.org or coursera.org (do not fabricate exact URLs)",
      "addresses_gap": "which skill gap this covers",
      "why_relevant": "1-2 sentence explanation",
      "estimated_time": "e.g. 4 hours",
      "priority": "high|medium|low"
    }
  ],
  "ibm_skillsbuild_note": "honest note about IBM SkillsBuild relevance for this career path"
}

Include 6-8 resources. Prioritize IBM SkillsBuild where genuinely relevant.`;

    const raw = await _chat([
      { role: 'system', content: SYSTEM },
      { role: 'user',   content: userMsg },
    ], { max_tokens: 1200 });

    return _parseJSON(raw);
  }

  // ---------------------------------------------------------------------------
  // 6a. Generate Interview Questions
  // ---------------------------------------------------------------------------
  async function generateInterviewQuestions(career, profileData, gapData) {
    const userMsg = `Generate interview questions for a student applying for "${career}".

STUDENT SKILLS: ${profileData.technical_skills?.map(s => s.skill).join(', ') || 'various'}
STUDENT PROJECTS: ${profileData.projects?.map(p => p.title).join(', ') || 'not specified'}
KEY GAPS: ${gapData.top_gaps?.join(', ') || 'various'}

Generate questions that test BOTH their claimed strengths AND probe their known gaps.

Return this exact JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "interview question text",
      "category": "technical|behavioral|project|gap-probe|conceptual",
      "difficulty": "easy|medium|hard",
      "what_we_test": "brief note on what good answer shows",
      "based_on": "claimed skill|gap|project|experience"
    }
  ]
}

Generate 6 questions: 2 technical, 1 behavioral, 1 project-based, 1 gap-probe, 1 conceptual.`;

    const raw = await _chat([
      { role: 'system', content: SYSTEM },
      { role: 'user',   content: userMsg },
    ], { max_tokens: 900 });

    return _parseJSON(raw);
  }

  // ---------------------------------------------------------------------------
  // 6b. Evaluate Interview Answer
  // ---------------------------------------------------------------------------
  async function evaluateAnswer(question, answer, career) {
    if (!answer || answer.trim().length < 10) {
      return {
        score: 0, grade: 'Not answered',
        conceptual: 'No answer provided.',
        depth: 'N/A', practical: 'N/A', communication: 'N/A',
        improvement: 'Please provide a substantive answer.',
        overall: 'Unanswered.',
      };
    }

    const userMsg = `Evaluate this interview answer for a "${career}" role.

QUESTION: ${question.question}
WHAT WE TEST: ${question.what_we_test}
ANSWER: ${answer}

Return this exact JSON:
{
  "score": 75,
  "grade": "Good|Excellent|Needs Work|Poor",
  "conceptual": "assessment of conceptual understanding",
  "depth": "assessment of answer depth",
  "practical": "assessment of practical reasoning",
  "communication": "assessment of clarity and communication",
  "improvement": "1-2 specific, actionable improvement suggestions",
  "overall": "1-sentence overall verdict"
}

Score 0-100. Be honest and constructive. Do not be harsh without reason.`;

    const raw = await _chat([
      { role: 'system', content: SYSTEM },
      { role: 'user',   content: userMsg },
    ], { max_tokens: 600 });

    return _parseJSON(raw);
  }

  // ---------------------------------------------------------------------------
  // 7. Final Readiness Report
  // ---------------------------------------------------------------------------
  async function generateFinalReport(career, profileData, gapData, roadmapData, interviewResults) {
    const avgInterviewScore = interviewResults?.length
      ? Math.round(interviewResults.reduce((s, r) => s + (r?.score || 0), 0) / interviewResults.length)
      : null;

    const userMsg = `Generate a final career readiness report for a student targeting "${career}".

PROFILE: ${JSON.stringify(profileData, null, 2)}
GAPS: ${JSON.stringify(gapData?.gap_summary || '')}
TOP GAPS: ${JSON.stringify(gapData?.top_gaps || [])}
SKILLS OWNED: ${JSON.stringify(gapData?.skills_owned || [])}
AVG INTERVIEW SCORE: ${avgInterviewScore !== null ? avgInterviewScore + '/100' : 'not completed'}

Return this exact JSON:
{
  "overall_readiness_score": 68,
  "score_explanation": "2-3 sentence plain-language explanation of how this score was determined",
  "readiness_level": "Early Stage|Developing|Nearly Ready|Job-Ready",
  "strongest_career_path": "career title",
  "top_strengths": ["strength 1", "strength 2", "strength 3"],
  "top_weaknesses": ["weakness 1", "weakness 2"],
  "highest_priority_gap": "the single most important skill to address",
  "interview_performance": "${avgInterviewScore !== null ? 'score: ' + avgInterviewScore + '/100' : 'not completed'}",
  "recommended_next_action": "single most impactful thing the student should do this week",
  "encouragement": "1-2 sentence honest, encouraging closing statement",
  "disclaimer": "brief responsible AI disclaimer about the score"
}`;

    const raw = await _chat([
      { role: 'system', content: SYSTEM },
      { role: 'user',   content: userMsg },
    ], { max_tokens: 900 });

    return _parseJSON(raw);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return {
    setApiKey, setModel, getApiKey, isConfigured,
    analyzeProfile,
    matchCareers,
    analyzeSkillGaps,
    generateRoadmap,
    getLearningRecommendations,
    generateInterviewQuestions,
    evaluateAnswer,
    generateFinalReport,
  };
})();
