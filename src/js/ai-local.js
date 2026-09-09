/**
 * CareerPilot — Local Analysis Engine (Demo / Offline Mode)
 *
 * Implements the same public API as ai.js but runs entirely in the browser
 * with no network calls and no API key.
 *
 * All analysis is deterministic: keyword extraction + scoring tables.
 * Results are genuinely personalised to the student's input text.
 *
 * Responsible AI: output is labelled "Demo Mode — offline analysis"
 * so students know this is not an LLM response.
 */

const AI_LOCAL = (() => {

  // ---------------------------------------------------------------------------
  // Knowledge base — career requirements
  // ---------------------------------------------------------------------------
  const CAREER_SKILLS = {
    'Software Developer': {
      critical:      ['Python','JavaScript','Java','C++','C#','Git','Data Structures','Algorithms','OOP','REST APIs'],
      important:     ['SQL','Testing','Docker','CI/CD','Linux','React','Node.js','System Design'],
      nice_to_have:  ['Kubernetes','AWS','TypeScript','Redis','GraphQL'],
    },
    'Full-Stack Developer': {
      critical:      ['JavaScript','HTML','CSS','React','Node.js','SQL','Git','REST APIs'],
      important:     ['TypeScript','MongoDB','Docker','Testing','Authentication','Deployment'],
      nice_to_have:  ['Redis','GraphQL','AWS','Next.js','CI/CD'],
    },
    'Backend Engineer': {
      critical:      ['Python','Java','Node.js','SQL','REST APIs','Git','OOP','Data Structures'],
      important:     ['PostgreSQL','MongoDB','Docker','Testing','System Design','Linux','CI/CD'],
      nice_to_have:  ['Kubernetes','Redis','Message Queues','AWS','gRPC'],
    },
    'AI/ML Engineer': {
      critical:      ['Python','Machine Learning','scikit-learn','NumPy','Pandas','Linear Algebra','Statistics'],
      important:     ['TensorFlow','PyTorch','Deep Learning','SQL','Data Cleaning','Git','Model Evaluation'],
      nice_to_have:  ['MLflow','Docker','AWS SageMaker','NLP','Computer Vision','Spark'],
    },
    'Data Scientist': {
      critical:      ['Python','Statistics','Machine Learning','Pandas','NumPy','SQL','Data Visualisation'],
      important:     ['scikit-learn','Jupyter','A/B Testing','Feature Engineering','Communication','Git'],
      nice_to_have:  ['R','Spark','Deep Learning','Tableau','Power BI','Airflow'],
    },
    'Data Analyst': {
      critical:      ['SQL','Excel','Data Visualisation','Statistics','Python','Communication'],
      important:     ['Pandas','Tableau','Power BI','A/B Testing','Git','Storytelling with Data'],
      nice_to_have:  ['R','Machine Learning','Looker','dbt','Airflow'],
    },
    'Cybersecurity Analyst': {
      critical:      ['Networking','Linux','Security Concepts','OWASP','Incident Response','Risk Assessment'],
      important:     ['Python','Penetration Testing','SIEM','Firewalls','Encryption','Git'],
      nice_to_have:  ['CEH','CompTIA Security+','Cloud Security','Forensics','SOAR'],
    },
    'Cloud/DevOps Engineer': {
      critical:      ['Linux','Docker','Kubernetes','CI/CD','AWS','Git','Bash/Shell Scripting'],
      important:     ['Terraform','Monitoring','Networking','Python','Ansible','Security'],
      nice_to_have:  ['Azure','GCP','Service Mesh','FinOps','Helm'],
    },
    'Mobile Developer': {
      critical:      ['Flutter','React Native','Swift','Kotlin','Git','REST APIs','OOP'],
      important:     ['State Management','Testing','SQLite','UI/UX Basics','Deployment'],
      nice_to_have:  ['Firebase','Push Notifications','In-App Purchases','CI/CD'],
    },
    'Frontend Developer': {
      critical:      ['HTML','CSS','JavaScript','React','Git','Responsive Design','REST APIs'],
      important:     ['TypeScript','Testing','Accessibility','Performance','Figma','Next.js'],
      nice_to_have:  ['GraphQL','Animation','Web Components','CI/CD','PWA'],
    },
  };

  const CAREER_ROADMAPS = {
    'Software Developer':      ['Master algorithms & data structures','Build 2-3 full projects in your main language','Learn testing and Git workflows','Deploy a project (Heroku/Railway/Render)','Solve 50+ LeetCode problems','Prepare system design basics'],
    'Full-Stack Developer':    ['Solidify JavaScript fundamentals','Build a React frontend project','Add a Node.js/Express backend','Connect to a database (PostgreSQL/MongoDB)','Deploy full-stack (Vercel + Railway)','Add auth and testing'],
    'Backend Engineer':        ['Deepen Python/Java/Node.js skills','Build REST APIs with proper structure','Learn database design and SQL queries','Add Docker and basic CI/CD','Study system design patterns','Contribute to an open-source backend project'],
    'AI/ML Engineer':          ['Strengthen linear algebra and statistics','Complete a supervised learning project end-to-end','Learn PyTorch or TensorFlow basics','Build and deploy a simple ML API','Study model evaluation and overfitting','Work on a deep learning mini-project'],
    'Data Scientist':          ['Practice SQL on real datasets','Complete an EDA project with visualisations','Build a predictive model with scikit-learn','Learn experiment design (A/B testing)','Create a portfolio notebook on Kaggle','Learn to communicate findings clearly'],
    'Data Analyst':            ['Master SQL (window functions, CTEs)','Build a dashboard in Tableau or Power BI','Complete a data cleaning project','Learn statistical hypothesis testing','Create a portfolio with 2-3 business analysis cases','Present findings as a story'],
    'Cybersecurity Analyst':   ['Learn networking fundamentals (TCP/IP, DNS)','Set up a home lab with Kali Linux','Complete TryHackMe beginner path','Study OWASP Top 10','Get CompTIA Security+ study material','Practice log analysis and incident response'],
    'Cloud/DevOps Engineer':   ['Get comfortable with Linux command line','Learn Docker fundamentals','Deploy an app on AWS free tier','Write a CI/CD pipeline (GitHub Actions)','Learn Terraform basics','Study Kubernetes core concepts'],
    'Mobile Developer':        ['Pick one platform (Flutter recommended for cross-platform)','Build a complete app with navigation and state','Add a backend (Firebase or REST API)','Publish to Play Store or TestFlight','Add local storage and offline support','Study mobile UI/UX patterns'],
    'Frontend Developer':      ['Master CSS layout (Flexbox, Grid)','Build a component library in React','Add TypeScript to a project','Write unit tests with Jest/React Testing Library','Improve accessibility and performance','Deploy with Vercel and add a custom domain'],
  };

  const LEARNING_DB = {
    'Python':              { provider: 'IBM SkillsBuild', title: 'Python for Data Science', url_hint: 'skillsbuild.org', time: '8 hours' },
    'Machine Learning':    { provider: 'IBM SkillsBuild', title: 'Machine Learning with Python', url_hint: 'skillsbuild.org', time: '12 hours' },
    'SQL':                 { provider: 'IBM SkillsBuild', title: 'Databases and SQL for Data Science', url_hint: 'skillsbuild.org', time: '6 hours' },
    'Data Visualisation':  { provider: 'IBM SkillsBuild', title: 'Data Visualisation and Dashboards', url_hint: 'skillsbuild.org', time: '5 hours' },
    'Deep Learning':       { provider: 'IBM SkillsBuild', title: 'Deep Learning Fundamentals', url_hint: 'skillsbuild.org', time: '10 hours' },
    'Docker':              { provider: 'freeCodeCamp',    title: 'Docker for Beginners', url_hint: 'freecodecamp.org', time: '4 hours' },
    'Git':                 { provider: 'Official Docs',   title: 'Pro Git Book (free)', url_hint: 'git-scm.com/book', time: '3 hours' },
    'React':               { provider: 'Official Docs',   title: 'React Official Tutorial', url_hint: 'react.dev/learn', time: '6 hours' },
    'TypeScript':          { provider: 'Official Docs',   title: 'TypeScript Handbook', url_hint: 'typescriptlang.org/docs', time: '5 hours' },
    'Kubernetes':          { provider: 'edX',             title: 'Introduction to Kubernetes (LFS158)', url_hint: 'edx.org', time: '14 hours' },
    'AWS':                 { provider: 'Official Docs',   title: 'AWS Free Tier + Getting Started Labs', url_hint: 'aws.amazon.com/free', time: 'self-paced' },
    'Data Structures':     { provider: 'Coursera',        title: 'Algorithms & Data Structures (Stanford)', url_hint: 'coursera.org', time: '20 hours' },
    'Networking':          { provider: 'freeCodeCamp',    title: 'Computer Networking Full Course', url_hint: 'youtube.com/freeCodeCamp', time: '8 hours' },
    'Statistics':          { provider: 'Coursera',        title: 'Statistics with Python (Michigan)', url_hint: 'coursera.org', time: '10 hours' },
    'System Design':       { provider: 'YouTube',         title: 'System Design Primer (Gaurav Sen)', url_hint: 'youtube.com', time: '6 hours' },
  };

  const IBM_SKILLSBUILD_NOTE = {
    'AI/ML Engineer':     'IBM SkillsBuild has strong AI/ML content including Python for Data Science, ML with Python, and Deep Learning — directly relevant.',
    'Data Scientist':     'IBM SkillsBuild covers SQL, Python, data analysis, and machine learning — well aligned with this path.',
    'Data Analyst':       'IBM SkillsBuild offers SQL, data visualisation, and Python courses — highly recommended for this path.',
    'Software Developer': 'IBM SkillsBuild has foundational Python and web development content. Supplement with official docs for frameworks.',
    'Cloud/DevOps Engineer': 'IBM SkillsBuild covers cloud fundamentals and has IBM Cloud content. AWS/Docker skills are better covered by their official docs.',
    '_default':           'IBM SkillsBuild (skillsbuild.org) offers free courses in Python, data science, AI, and cloud computing that may support this career path.',
  };

  // ---------------------------------------------------------------------------
  // Text parsing utilities
  // ---------------------------------------------------------------------------

  /** Extract a flat list of skills mentioned anywhere in the profile text */
  function _extractMentionedSkills(profile) {
    const text = [profile.resume, profile.skills, profile.projects, profile.github]
      .filter(Boolean).join(' ').toLowerCase();

    // Master skill vocabulary — checked against the profile text
    const vocab = [
      'python','javascript','typescript','java','c++','c#','go','rust','ruby','php','swift','kotlin','dart','r',
      'react','vue','angular','next.js','svelte','jquery',
      'node.js','express','flask','django','fastapi','spring','rails','laravel',
      'html','css','sass','tailwind',
      'sql','postgresql','mysql','sqlite','mongodb','redis','elasticsearch','firebase',
      'git','github','docker','kubernetes','linux','bash','powershell',
      'aws','azure','gcp','heroku','vercel','netlify',
      'machine learning','deep learning','neural network','tensorflow','pytorch','scikit-learn','keras',
      'pandas','numpy','matplotlib','seaborn','jupyter','spark','airflow',
      'rest api','graphql','grpc','websocket',
      'testing','jest','pytest','unit test','selenium','cypress',
      'ci/cd','jenkins','github actions','terraform','ansible',
      'oop','data structures','algorithms','system design','design patterns',
      'nlp','computer vision','a/b testing','statistics','linear algebra',
      'flutter','react native','android','ios',
      'tableau','power bi','looker','excel',
      'networking','security','owasp','penetration testing','encryption',
      'figma','ui/ux','responsive design','accessibility',
      'communication','problem solving','teaching','agile','scrum',
    ];

    const found = vocab.filter(skill => {
      // Whole-word-ish match (avoid 'r' matching 'react')
      const re = new RegExp('\\b' + skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      return re.test(text);
    });
    return found;
  }

  /** Check if a skill is mentioned in the projects/experience sections (demonstrated) */
  function _isDemonstrated(skill, profile) {
    const evidence = [profile.projects, profile.resume].filter(Boolean).join(' ').toLowerCase();
    const re = new RegExp('\\b' + skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    return re.test(evidence);
  }

  /** Normalize skill name for matching (handles case, dots) */
  function _norm(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

  /** Check if a required skill appears in the student's extracted skills */
  function _studentHasSkill(reqSkill, mentionedSkills) {
    const nr = _norm(reqSkill);
    return mentionedSkills.some(s => {
      const ns = _norm(s);
      return ns === nr || ns.includes(nr) || nr.includes(ns);
    });
  }

  /** Extract student name from resume text */
  function _extractName(resume) {
    if (!resume) return 'Student';
    const firstLine = resume.trim().split('\n')[0].trim();
    // If first line is short (likely a name) and has no colons/bullet points
    if (firstLine.length < 60 && !firstLine.includes(':') && !firstLine.startsWith('•')) {
      // Strip common prefixes like "Name:" or "RESUME:"
      return firstLine.replace(/^(name|resume|cv)[:\s-]*/i, '').trim() || 'Student';
    }
    return 'Student';
  }

  /** Infer experience level from resume text */
  function _inferLevel(profile) {
    const text = [profile.resume, profile.projects].filter(Boolean).join(' ').toLowerCase();
    const hasInternship  = /internship|intern\b/.test(text);
    const hasJob         = /\b(developer|engineer|analyst|scientist)\s+at\b|\byears? (of )?experience\b/.test(text);
    const projectCount   = (text.match(/\b(project|built|developed|created)\b/g) || []).length;
    if (hasJob || projectCount >= 6) return 'advanced';
    if (hasInternship || projectCount >= 3) return 'intermediate';
    return 'beginner';
  }

  // ---------------------------------------------------------------------------
  // 1. analyzeProfile
  // ---------------------------------------------------------------------------
  async function analyzeProfile(profile) {
    await _delay(600);

    const mentioned   = _extractMentionedSkills(profile);
    const name        = _extractName(profile.resume);
    const level       = _inferLevel(profile);

    // Build technical_skills with evidence and confidence
    const technical_skills = mentioned.map(skill => {
      const demonstrated = _isDemonstrated(skill, profile);
      return {
        skill: _titleCase(skill),
        confidence: demonstrated ? 'high' : 'medium',
        evidence:   demonstrated
          ? `Found in projects/experience section`
          : `Listed in skills — not evidenced in a project`,
        type: _classifySkillType(skill),
      };
    });

    // Extract projects
    const projects = _parseProjects(profile.projects);

    // Strengths = high-confidence skills with project evidence
    const strengths = technical_skills
      .filter(s => s.confidence === 'high')
      .slice(0, 4)
      .map(s => `${s.skill} — demonstrated in projects/experience`);
    if (strengths.length === 0) strengths.push('Willingness to learn and build projects');

    // Weak areas = skills only listed but not demonstrated, OR common gaps
    const weak_areas = technical_skills
      .filter(s => s.confidence === 'medium')
      .slice(0, 3)
      .map(s => `${s.skill} — claimed but limited project evidence`);
    if (weak_areas.length < 2) weak_areas.push('Depth in production-grade system design');

    // Education signals
    const edu_text = profile.resume || '';
    const education_signals = [];
    if (/b\.?tech|bachelor|b\.?sc|b\.?eng/i.test(edu_text))   education_signals.push('Bachelor\'s degree (detected)');
    if (/computer science|cs\b|software engineering/i.test(edu_text)) education_signals.push('Computer Science field');
    if (/gpa|cgpa/i.test(edu_text))  education_signals.push('GPA mentioned');
    if (/internship|intern\b/i.test(edu_text)) education_signals.push('Internship experience');

    const summary = `${name} is a${level === 'advanced' ? 'n experienced' : level === 'intermediate' ? ' developing' : ' beginner'} student `
      + `with hands-on skills in ${mentioned.slice(0, 3).map(_titleCase).join(', ') || 'various technologies'}. `
      + `${projects.length} project(s) identified with demonstrable technical skills.`;

    return {
      name,
      summary,
      technical_skills,
      projects,
      strengths,
      weak_areas,
      experience_level: level,
      education_signals,
      _demo_mode: true,
    };
  }

  // ---------------------------------------------------------------------------
  // 2. matchCareers
  // ---------------------------------------------------------------------------
  async function matchCareers(profile, profileData) {
    await _delay(500);

    const mentioned = (profileData.technical_skills || []).map(s => s.skill);
    const target    = profile.targetCareer || '';

    const careers = Object.keys(CAREER_SKILLS);
    const scores  = careers.map(career => {
      const reqs   = CAREER_SKILLS[career];
      const all    = [...reqs.critical, ...reqs.important, ...reqs.nice_to_have];
      const total  = reqs.critical.length * 3 + reqs.important.length * 2 + reqs.nice_to_have.length;
      let earned   = 0;
      const evidence = [], gaps = [];

      for (const sk of reqs.critical) {
        if (_studentHasSkill(sk, mentioned)) { earned += 3; evidence.push(sk); }
        else gaps.push(sk);
      }
      for (const sk of reqs.important) {
        if (_studentHasSkill(sk, mentioned)) { earned += 2; evidence.push(sk); }
        else if (gaps.length < 3) gaps.push(sk);
      }
      for (const sk of reqs.nice_to_have) {
        if (_studentHasSkill(sk, mentioned)) earned += 1;
      }

      const raw = Math.round((earned / total) * 100);
      const score = Math.min(95, Math.max(8, raw));
      const level = score >= 65 ? 'strong' : score >= 40 ? 'moderate' : 'weak';

      return {
        career,
        match_score: score,
        match_level: level,
        rationale: _careerRationale(career, score, evidence, gaps, target),
        key_evidence: evidence.slice(0, 3).map(_titleCase),
        main_gaps: gaps.slice(0, 2).map(_titleCase),
      };
    });

    // Sort by score
    scores.sort((a, b) => b.match_score - a.match_score);

    // If target specified, ensure it's included and boosted slightly
    let topMatches = scores.slice(0, 5);
    if (target && !topMatches.find(m => m.career === target)) {
      const targetMatch = scores.find(m => m.career === target);
      if (targetMatch) topMatches = [targetMatch, ...topMatches.slice(0, 4)];
    }

    const best = target || topMatches[0].career;
    return {
      top_matches: topMatches,
      recommended_primary: best,
      recommendation_reason: `Based on your demonstrated skills (${mentioned.slice(0,3).join(', ')}), ${best} is the strongest match for your current profile.`,
    };
  }

  // ---------------------------------------------------------------------------
  // 3. analyzeSkillGaps
  // ---------------------------------------------------------------------------
  async function analyzeSkillGaps(career, profileData) {
    await _delay(550);

    const reqs     = CAREER_SKILLS[career] || CAREER_SKILLS['Software Developer'];
    const mentioned = (profileData.technical_skills || []).map(s => s.skill);
    const demonstrated = (profileData.technical_skills || [])
      .filter(s => s.confidence === 'high').map(s => s.skill);

    const required_skills = [];
    const skills_owned    = [];
    const skills_partial  = [];
    const skills_missing  = [];

    const _process = (list, importance) => list.forEach((sk, i) => {
      const has     = _studentHasSkill(sk, mentioned);
      const proven  = _studentHasSkill(sk, demonstrated);
      const status  = proven ? 'strong' : has ? 'partial' : 'missing';

      required_skills.push({
        skill:          sk,
        importance,
        student_status: status,
        evidence:       proven ? 'Evidenced in projects/experience'
                       : has   ? 'Listed as a skill — no clear project evidence'
                               : 'Not demonstrated',
        gap_priority:   importance === 'critical' ? i + 1 : importance === 'important' ? i + 10 : i + 20,
        why_it_matters: _whyItMatters(sk, career),
      });

      if (status === 'strong')   skills_owned.push(sk);
      else if (status === 'partial') skills_partial.push(sk);
      else                       skills_missing.push(sk);
    });

    _process(reqs.critical,     'critical');
    _process(reqs.important,    'important');
    _process(reqs.nice_to_have, 'nice-to-have');

    const top_gaps = skills_missing
      .filter(s => reqs.critical.includes(s) || reqs.important.slice(0,3).includes(s))
      .slice(0, 3);

    const ownedPct = skills_owned.length / required_skills.length * 100;
    const gap_summary = `You have strong evidence for ${skills_owned.length} of ${required_skills.length} required skills for ${career} (${Math.round(ownedPct)}% coverage). `
      + (top_gaps.length ? `Priority gaps to address: ${top_gaps.join(', ')}.` : 'Your profile is well-aligned with this career path.');

    return { career, required_skills, skills_owned, skills_partial, skills_missing, top_gaps, gap_summary, _demo_mode: true };
  }

  // ---------------------------------------------------------------------------
  // 4. generateRoadmap
  // ---------------------------------------------------------------------------
  async function generateRoadmap(career, profileData, gapData) {
    await _delay(500);

    const gaps      = gapData.top_gaps || [];
    const steps     = CAREER_ROADMAPS[career] || CAREER_ROADMAPS['Software Developer'];
    const ownedSkills = gapData.skills_owned || [];
    const level     = profileData.experience_level || 'beginner';

    const phases = steps.slice(0, 5).map((step, i) => ({
      phase:   i + 1,
      title:   `Phase ${i + 1}: ${step.split(' ')[0]} ${step.split(' ')[1] || ''}`.trim(),
      duration: i === 0 ? '1–2 weeks' : i < 3 ? '2–4 weeks' : '3–5 weeks',
      focus:   step,
      actions: _phaseActions(step, career, gaps, ownedSkills),
      milestone: `Able to demonstrate ${step.toLowerCase().includes('build') ? 'a working project' : 'applied knowledge'} in this area`,
      addresses_gaps: gaps.filter(g => step.toLowerCase().includes(g.toLowerCase().split(' ')[0])).slice(0, 2),
    }));

    const quick_wins = [
      ownedSkills.length ? `Showcase your existing ${ownedSkills.slice(0,2).join(' and ')} skills in a polished GitHub README` : 'Create a GitHub profile README listing your skills and projects',
      gaps[0] ? `Start the ${gaps[0]} tutorial on YouTube or freeCodeCamp this week` : 'Complete one small coding challenge today',
      'Update your LinkedIn/portfolio with your most recent project',
    ];

    return {
      career,
      timeline_estimate: level === 'advanced' ? '2–3 months' : level === 'intermediate' ? '3–5 months' : '5–8 months',
      phases,
      quick_wins,
      portfolio_advice: _portfolioAdvice(profileData, gaps, career),
      _demo_mode: true,
    };
  }

  // ---------------------------------------------------------------------------
  // 5. getLearningRecommendations
  // ---------------------------------------------------------------------------
  async function getLearningRecommendations(career, gapData) {
    await _delay(400);

    const gaps = [...(gapData.top_gaps || []), ...(gapData.skills_missing || [])].slice(0, 8);
    const recommendations = [];
    const seen = new Set();

    for (const gap of gaps) {
      const norm = _titleCase(gap);
      if (seen.has(norm)) continue;
      seen.add(norm);

      // Find a match in LEARNING_DB
      const key = Object.keys(LEARNING_DB).find(k =>
        _norm(k) === _norm(gap) || _norm(gap).includes(_norm(k)) || _norm(k).includes(_norm(gap))
      );
      const db = key ? LEARNING_DB[key] : null;

      recommendations.push({
        title:          db ? db.title : `${norm} — Getting Started Guide`,
        provider:       db ? db.provider : 'YouTube',
        type:           'course',
        url_hint:       db ? db.url_hint : `Search "${norm} tutorial" on youtube.com or freeCodeCamp`,
        addresses_gap:  norm,
        why_relevant:   `${norm} is a ${(gapData.top_gaps||[]).includes(gap) ? 'top-priority' : 'required'} skill for ${career} that your profile does not yet demonstrate.`,
        estimated_time: db ? db.time : '3–6 hours',
        priority:       (gapData.top_gaps||[]).includes(gap) ? 'high' : 'medium',
      });

      if (recommendations.length >= 7) break;
    }

    // Always add at least one IBM SkillsBuild entry if not already present
    if (!recommendations.find(r => r.provider === 'IBM SkillsBuild')) {
      recommendations.unshift({
        title:         'IBM SkillsBuild — Free Courses for Students',
        provider:      'IBM SkillsBuild',
        type:          'course',
        url_hint:      'skillsbuild.org',
        addresses_gap: 'General career skills',
        why_relevant:  'IBM SkillsBuild offers free courses in Python, AI, cloud, data science and professional skills — directly relevant to tech careers.',
        estimated_time:'Self-paced',
        priority:      'high',
      });
    }

    return {
      recommendations: recommendations.slice(0, 7),
      ibm_skillsbuild_note: IBM_SKILLSBUILD_NOTE[career] || IBM_SKILLSBUILD_NOTE['_default'],
      _demo_mode: true,
    };
  }

  // ---------------------------------------------------------------------------
  // 6a. generateInterviewQuestions
  // ---------------------------------------------------------------------------
  async function generateInterviewQuestions(career, profileData, gapData) {
    await _delay(400);

    const skills   = (profileData.technical_skills||[]).filter(s => s.confidence === 'high').map(s => s.skill);
    const projects = (profileData.projects||[]).map(p => p.title);
    const gaps     = gapData.top_gaps || [];

    const QUESTION_BANKS = {
      technical: [
        ['Explain the difference between a stack and a queue, and when you would use each.',                   'Data Structures',  'Data Structures & Algorithms'],
        ['What is the time complexity of your favourite sorting algorithm? Why did you choose it?',            'Algorithms',       'Algorithms'],
        ['How would you design a REST API for a to-do list app? What endpoints would you create?',             'REST APIs',        'REST APIs & System Design'],
        ['What is the difference between SQL and NoSQL databases? When would you choose each?',                'Databases',        'Database Design'],
        ['Explain what Docker is and why a developer would use it.',                                           'Docker',           'Containerisation'],
        ['What is Git branching and how does your team use it to avoid merge conflicts?',                      'Git',              'Version Control'],
        ['How does HTTP differ from HTTPS, and why does it matter for web applications?',                      'Networking',       'Web Fundamentals'],
        ['What is the difference between supervised and unsupervised machine learning?',                       'Machine Learning', 'Machine Learning Concepts'],
      ],
      behavioral: [
        ['Tell me about a time you debugged a difficult bug. How did you approach it?',                        'Problem Solving',  'General'],
        ['Describe a project where you had to learn a new technology quickly. What did you do?',               'Learning Agility', 'General'],
        ['Tell me about a project you are most proud of. What did you build and why does it matter?',          'Communication',    'General'],
        ['How do you manage your time when working on multiple tasks or assignments?',                         'Time Management',  'General'],
      ],
      project: [
        ['Walk me through the architecture of one of your projects. Why did you make those technical choices?', 'Architecture',    'Project'],
        ['What was the hardest part of building your most recent project? How did you solve it?',              'Problem Solving',  'Project'],
        ['If you had to extend one of your projects to handle 10x more users, what would you change?',         'Scalability',      'Project'],
      ],
      gap_probe: [
        ['You listed [GAP] as a gap area. What is your current understanding of it, and what have you done to learn it?', 'Self-awareness', 'Gap'],
        ['How would you approach learning [GAP] if you were given two weeks to prepare for a role that requires it?',      'Learning Plan', 'Gap'],
      ],
      conceptual: [
        ['What is the difference between authentication and authorisation? Give an example of each.',          'Security',         'Conceptual'],
        ['Explain what CI/CD means and why teams use it.',                                                     'DevOps',           'Conceptual'],
        ['What does "Big O notation" mean, and why do engineers care about it?',                               'Algorithms',       'Conceptual'],
        ['What is the difference between concurrency and parallelism?',                                        'Systems',          'Conceptual'],
      ],
    };

    const qs = [];

    // 2 technical — pick ones most relevant to career
    const techPool = QUESTION_BANKS.technical;
    const techPicked = _pickRelevant(techPool, career, skills, 2);
    techPicked.forEach((q, i) => qs.push({
      id: qs.length + 1, question: q[0],
      category: 'technical', difficulty: i === 0 ? 'medium' : 'hard',
      what_we_test: q[1], based_on: `${career} fundamentals`,
    }));

    // 1 behavioral
    const beh = QUESTION_BANKS.behavioral[Math.floor(Math.random() * QUESTION_BANKS.behavioral.length)];
    qs.push({ id: qs.length + 1, question: beh[0], category: 'behavioral', difficulty: 'medium', what_we_test: beh[1], based_on: 'experience' });

    // 1 project
    const proj = projects.length
      ? { id: qs.length + 1, question: `Walk me through the architecture of your "${projects[0]}" project. What technical decisions did you make?`, category: 'project', difficulty: 'medium', what_we_test: 'Technical depth, communication', based_on: `project: ${projects[0]}` }
      : { id: qs.length + 1, question: QUESTION_BANKS.project[0][0], category: 'project', difficulty: 'medium', what_we_test: QUESTION_BANKS.project[0][1], based_on: 'project experience' };
    qs.push(proj);

    // 1 gap-probe
    const gap = gaps[0] || 'System Design';
    qs.push({
      id: qs.length + 1,
      question: QUESTION_BANKS.gap_probe[0][0].replace('[GAP]', gap),
      category: 'gap-probe', difficulty: 'easy',
      what_we_test: 'Honesty, self-awareness, learning mindset',
      based_on: `identified gap: ${gap}`,
    });

    // 1 conceptual
    const con = QUESTION_BANKS.conceptual[Math.floor(Math.random() * QUESTION_BANKS.conceptual.length)];
    qs.push({ id: qs.length + 1, question: con[0], category: 'conceptual', difficulty: 'medium', what_we_test: con[1], based_on: 'conceptual knowledge' });

    return { questions: qs, _demo_mode: true };
  }

  // ---------------------------------------------------------------------------
  // 6b. evaluateAnswer
  // ---------------------------------------------------------------------------
  async function evaluateAnswer(question, answer, career) {
    if (!answer || answer.trim().length < 10) {
      return { score: 0, grade: 'Not answered', conceptual: 'No answer provided.', depth: 'N/A', practical: 'N/A', communication: 'N/A', improvement: 'Please provide a substantive answer.', overall: 'Unanswered.' };
    }
    await _delay(300);

    const words     = answer.trim().split(/\s+/).length;
    const sentences = answer.split(/[.!?]+/).filter(Boolean).length;

    // Length-based baseline
    let base = 40;
    if (words > 30)  base += 10;
    if (words > 80)  base += 10;
    if (words > 150) base += 5;

    // Keyword signals
    const lc = answer.toLowerCase();
    const techTerms    = (lc.match(/\b(algorithm|complexity|database|api|function|class|variable|async|cache|index|query|deploy|test|debug|scale|memory|performance)\b/g) || []).length;
    const exampleTerms = (lc.match(/\b(for example|such as|like|when i|i built|i used|in my project|for instance)\b/g) || []).length;
    const structureTerms = (lc.match(/\b(first|second|third|finally|however|because|therefore|the reason)\b/g) || []).length;

    base += Math.min(20, techTerms * 3);
    base += Math.min(10, exampleTerms * 4);
    base += Math.min(8,  structureTerms * 2);

    const score = Math.min(96, Math.max(10, base));
    const grade = score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 45 ? 'Needs Work' : 'Poor';

    return {
      score,
      grade,
      conceptual:   techTerms >= 2 ? 'Good use of technical terminology.' : 'Could incorporate more domain-specific terms.',
      depth:        words > 80 ? 'Answer has good depth.' : 'Consider expanding with more detail or examples.',
      practical:    exampleTerms > 0 ? 'Good — you included a concrete example.' : 'Try to include a real example from your experience.',
      communication: sentences >= 3 ? 'Clear and structured response.' : 'Structure your answer with more sentences or steps.',
      improvement:  _improvementHint(question.category, score),
      overall:      `${grade} response — ${score >= 65 ? 'demonstrates solid understanding' : 'shows basic awareness but needs more depth'}.`,
      _demo_mode: true,
    };
  }

  // ---------------------------------------------------------------------------
  // 7. generateFinalReport
  // ---------------------------------------------------------------------------
  async function generateFinalReport(career, profileData, gapData, roadmapData, interviewResults) {
    await _delay(500);

    const avgInterview = interviewResults?.filter(Boolean).length
      ? Math.round(interviewResults.filter(Boolean).reduce((s, r) => s + (r?.score || 0), 0) / interviewResults.filter(Boolean).length)
      : null;

    const owned   = (gapData?.skills_owned || []).length;
    const total   = (gapData?.required_skills || []).length || 1;
    const coverage = Math.round((owned / total) * 100);

    // Weighted readiness score
    let score = Math.round(
      coverage * 0.5 +
      (avgInterview ?? 50) * 0.3 +
      (profileData.projects?.length >= 3 ? 20 : profileData.projects?.length >= 1 ? 12 : 5) * 1
    );
    score = Math.min(95, Math.max(12, score));

    const level = score >= 75 ? 'Job-Ready' : score >= 55 ? 'Nearly Ready' : score >= 35 ? 'Developing' : 'Early Stage';

    return {
      overall_readiness_score: score,
      score_explanation: `Score is based on skill coverage (${coverage}% of required ${career} skills demonstrated), `
        + `${avgInterview !== null ? `mock interview performance (${avgInterview}/100), ` : ''}`
        + `and portfolio depth (${profileData.projects?.length || 0} project(s) identified). `
        + `This is a demo-mode estimate, not an AI model prediction.`,
      readiness_level: level,
      strongest_career_path: career,
      top_strengths: (gapData?.skills_owned || []).slice(0, 3).map(s => `${s} — demonstrated with evidence`),
      top_weaknesses: (gapData?.top_gaps || []).slice(0, 2).map(g => `${g} — needs development`),
      highest_priority_gap: gapData?.top_gaps?.[0] || 'None identified',
      interview_performance: avgInterview !== null ? `${avgInterview}/100` : 'not completed',
      recommended_next_action: roadmapData?.quick_wins?.[0] || `Focus on ${gapData?.top_gaps?.[0] || 'your top skill gap'} this week`,
      encouragement: `You have a solid foundation with ${owned} demonstrated skill(s). Keep building projects — each one compounds your evidence and confidence.`,
      disclaimer: 'This score is a demo-mode estimate based on keyword analysis of your profile text. It is not an objective hiring prediction or LLM assessment.',
      _demo_mode: true,
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------
  function _delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function _titleCase(str) {
    const specials = { 'sql':'SQL','html':'HTML','css':'CSS','rest api':'REST API','rest apis':'REST APIs',
      'oop':'OOP','aws':'AWS','gcp':'GCP','ci/cd':'CI/CD','nlp':'NLP','ui/ux':'UI/UX',
      'owasp':'OWASP','a/b testing':'A/B Testing','node.js':'Node.js','next.js':'Next.js',
      'react native':'React Native','scikit-learn':'scikit-learn' };
    const lc = str.toLowerCase();
    if (specials[lc]) return specials[lc];
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function _classifySkillType(skill) {
    const lc = skill.toLowerCase();
    if (/python|javascript|typescript|java|c\+\+|c#|go|rust|ruby|php|swift|kotlin|dart|r\b/.test(lc)) return 'language';
    if (/react|vue|angular|flask|django|spring|express|node\.js|next\.js|flutter/.test(lc)) return 'framework';
    if (/git|docker|kubernetes|jenkins|tableau|power bi|figma|postman|jupyter/.test(lc)) return 'tool';
    if (/machine learning|deep learning|oop|algorithms|data structures|system design|statistics/.test(lc)) return 'concept';
    return 'domain';
  }

  function _parseProjects(text) {
    if (!text) return [];
    const lines = text.split('\n').filter(l => l.trim());
    const projects = [];
    let current = null;
    for (const line of lines) {
      const isTitle = /^\d+[\.\)]\s/.test(line.trim()) || /^[-•]\s*[A-Z]/.test(line.trim());
      if (isTitle && line.length < 100) {
        if (current) projects.push(current);
        current = { title: line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•]\s*/, '').split('(')[0].trim(), description: '', skills_demonstrated: [] };
      } else if (current) {
        current.description += line.trim() + ' ';
        // Extract skills from this project line
        const skills = _extractMentionedSkills({ skills: '', resume: '', projects: line, github: '' });
        current.skills_demonstrated.push(...skills.map(_titleCase).filter(s => !current.skills_demonstrated.includes(_titleCase(s))));
      }
    }
    if (current) projects.push(current);
    return projects.slice(0, 5).map(p => ({ ...p, description: p.description.trim().slice(0, 150) }));
  }

  function _careerRationale(career, score, evidence, gaps, target) {
    const evidenceStr = evidence.length ? `Your ${evidence.slice(0,2).join(' and ')} skills are directly relevant. ` : '';
    const gapStr      = gaps.length ? `Key gaps include ${gaps.slice(0,2).join(' and ')}. ` : '';
    const targetNote  = target === career ? '(Your target career.) ' : '';
    return `${targetNote}${evidenceStr}${gapStr}Match score of ${score}% reflects your current demonstrated skills vs. what this role typically requires.`;
  }

  function _whyItMatters(skill, career) {
    const reasons = {
      'Python':           'Python is the primary language for most data, AI, and backend roles.',
      'SQL':              'SQL is used daily for querying, reporting, and data work across all technical roles.',
      'Git':              'Git is the universal standard for code versioning and team collaboration.',
      'Docker':           'Docker enables consistent deployment and is required in most modern engineering teams.',
      'Machine Learning': 'Core knowledge area for any AI/ML or data science role.',
      'Data Structures':  'Required for coding interviews and building efficient software.',
      'System Design':    'Senior and mid-level engineering roles expect system design knowledge.',
      'Testing':          'Testing ensures code quality and is expected in professional engineering roles.',
      'React':            'React dominates frontend development and is required by most frontend/full-stack roles.',
      'REST APIs':        'REST APIs are how almost all modern services communicate.',
    };
    return reasons[skill] || `${skill} is a standard requirement for ${career} roles.`;
  }

  function _phaseActions(step, career, gaps, owned) {
    const generic = [
      `Study core concepts: find a well-reviewed tutorial or course on ${step.split(' ').slice(0,3).join(' ')}`,
      `Build a small practice project demonstrating this skill`,
      `Write a short GitHub README explaining what you built and what you learned`,
    ];
    if (gaps.length) generic.push(`Connect this to your gap in ${gaps[0]}`);
    return generic.slice(0, 3);
  }

  function _portfolioAdvice(profileData, gaps, career) {
    const projects = profileData.projects || [];
    if (projects.length === 0) return `Start a GitHub portfolio now. Build one project that uses ${career} core skills — even a small one demonstrates initiative.`;
    const names = projects.map(p => p.title).join(', ');
    const topGap = gaps[0];
    return `You have ${projects.length} project(s) (${names}). To strengthen your ${career} portfolio, build one more project that specifically addresses your gap in ${topGap || 'your missing critical skill'}. Add a clear README, live demo link, and screenshots.`;
  }

  function _improvementHint(category, score) {
    if (score >= 80) return 'Strong answer. In an interview, try to quantify outcomes where possible (e.g. "reduced load time by 30%").';
    if (category === 'technical') return 'Include a concrete code example or real-world scenario to strengthen the answer.';
    if (category === 'behavioral') return 'Use the STAR method (Situation, Task, Action, Result) to structure behavioral answers.';
    if (category === 'gap-probe') return 'Be specific about what you have done to close this gap — even small steps count.';
    return 'Add more detail and a specific example from your own experience or projects.';
  }

  function _pickRelevant(pool, career, skills, n) {
    // Prefer questions whose topic appears in the career's required skills
    const careerSkills = Object.values(CAREER_SKILLS[career] || {}).flat().map(s => s.toLowerCase());
    const scored = pool.map(q => {
      const relevance = careerSkills.filter(s => q[2].toLowerCase().includes(s) || s.includes(q[2].toLowerCase())).length;
      return { q, relevance };
    });
    scored.sort((a, b) => b.relevance - a.relevance);
    return scored.slice(0, n).map(s => s.q);
  }

  // ---------------------------------------------------------------------------
  // Public API — mirrors ai.js exactly
  // ---------------------------------------------------------------------------
  return {
    setApiKey: () => {},        // no-op in local mode
    setModel:  () => {},        // no-op in local mode
    getApiKey: () => 'demo',
    isConfigured: () => true,   // always ready
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
