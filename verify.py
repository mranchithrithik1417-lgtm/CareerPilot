import sys, http.server, threading, urllib.request, time
sys.stdout.reconfigure(encoding='utf-8')

port = 8080
server = http.server.HTTPServer(('localhost', port), http.server.SimpleHTTPRequestHandler)
t = threading.Thread(target=server.serve_forever)
t.daemon = True
t.start()
time.sleep(0.4)

def fetch(path):
    r = urllib.request.urlopen('http://localhost:' + str(port) + path)
    return r.getcode(), r.read().decode('utf-8', errors='replace')

code, html    = fetch('/')
_,    css     = fetch('/src/styles/main.css')
_,    app_js  = fetch('/src/js/app.js')
_,    ai_js   = fetch('/src/js/ai.js')
_,    local   = fetch('/src/js/ai-local.js')
_,    views   = fetch('/src/js/views.js')
_,    ctrl    = fetch('/src/js/controller.js')
server.shutdown()

checks = [
    # Files present and served
    (code == 200,                          'index.html                HTTP 200'),
    ('ai-local.js' in html,               'index.html                ai-local.js loaded'),
    ('mode-indicator' in html,            'index.html                mode-indicator in topbar'),

    # ai-local.js completeness
    ('AI_LOCAL' in local,                 'ai-local.js               AI_LOCAL module defined'),
    ('analyzeProfile' in local,           'ai-local.js               analyzeProfile()'),
    ('matchCareers' in local,             'ai-local.js               matchCareers()'),
    ('analyzeSkillGaps' in local,         'ai-local.js               analyzeSkillGaps()'),
    ('generateRoadmap' in local,          'ai-local.js               generateRoadmap()'),
    ('getLearningRecommendations' in local,'ai-local.js              getLearningRecommendations()'),
    ('generateInterviewQuestions' in local,'ai-local.js              generateInterviewQuestions()'),
    ('evaluateAnswer' in local,           'ai-local.js               evaluateAnswer()'),
    ('generateFinalReport' in local,      'ai-local.js               generateFinalReport()'),
    ('isConfigured: () => true' in local, 'ai-local.js               isConfigured always true (no key needed)'),
    ('CAREER_SKILLS' in local,            'ai-local.js               CAREER_SKILLS knowledge base'),
    ('LEARNING_DB' in local,              'ai-local.js               LEARNING_DB resource table'),
    ('IBM SkillsBuild' in local,          'ai-local.js               IBM SkillsBuild resources'),
    ('_demo_mode: true' in local,         'ai-local.js               demo mode flag on output'),

    # controller.js wiring
    ('_activeEngine' in ctrl,             'controller.js             _activeEngine variable'),
    ('_currentMode' in ctrl,              'controller.js             _currentMode variable'),
    ('setAnalysisMode' in ctrl,           'controller.js             setAnalysisMode()'),
    ('AI_LOCAL' in ctrl,                  'controller.js             AI_LOCAL referenced'),
    ('engine.analyzeProfile' in ctrl,     'controller.js             pipeline uses engine not AI'),
    ('engine.matchCareers' in ctrl,       'controller.js             matchCareers via engine'),
    ('_activeEngine.analyzeSkillGaps' in ctrl,'controller.js         career switch uses _activeEngine'),
    ('_activeEngine.evaluateAnswer' in ctrl,  'controller.js         interview eval uses _activeEngine'),
    ('_activeEngine.generateFinalReport' in ctrl,'controller.js      final report uses _activeEngine'),

    # views.js
    ('setAnalysisMode' in views,          'views.js                  setAnalysisMode called from toggle'),
    ('Demo Mode' in views,                'views.js                  Demo Mode label in toggle'),
    ('demo-mode-banner' in views,         'views.js                  demo mode banner element'),
    ('apikey-section' in views,           'views.js                  apikey section hides in demo mode'),
    ('btn-mode-demo' in views,            'views.js                  demo mode button'),
]

passed = sum(1 for ok, _ in checks if ok)
total  = len(checks)

print('CareerPilot Phase 3 -- Demo Mode Verification')
print('=' * 55)
for ok, label in checks:
    print(('  OK    ' if ok else '  FAIL  ') + label)
print()
print(str(passed) + '/' + str(total) + ' checks passed')
print('Result: ' + ('ALL PASSED' if passed == total else str(total - passed) + ' FAILED'))
