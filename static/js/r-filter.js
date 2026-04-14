(function () {
  var SESSION_KEY = 'resumeNum';
  var sectionMap = {
    '1': ['react', 'typescript'],
    '2': ['pharo'],
  };

  // Home intro variants keyed by r value (raw HTML, same format Hugo outputs)
  var introMap = {
    '1': 'I am <a href="/cv">Anshik Singh</a>, a Software Engineer Intern at '
       + '<a href="https://www.silverpush.co/">SilverPush</a>, currently based in India.<br><br>'
       + 'My interests span across <strong>web development</strong> and <strong>system design</strong>, '
       + 'with a focus on building modern React &amp; TypeScript applications.<br><br>'
       + 'JavaScript pays the bills — and I genuinely enjoy it.<br><br>'
       + '📩 Reach me at: <em><a href="mailto:anshikthind@gmail.com">anshikthind at gmail dot com</a></em>',

    '2': 'I am <a href="/cv">Anshik Singh</a>, a Software Engineer Intern at '
       + '<a href="https://www.silverpush.co/">SilverPush</a>, currently based in India.<br><br>'
       + 'My interests span across <strong>web development</strong> and <strong>system design</strong>, '
       + 'with a passion for exploring <strong>Pharo</strong> and object-oriented Smalltalk environments.<br><br>'
       + 'Go enthusiast, JavaScript pays the bills….<br><br>'
       + '📩 Reach me at: <em><a href="mailto:anshikthind@gmail.com">anshikthind at gmail dot com</a></em>',
  };

  // --- 1. Capture ?r= from URL and persist to sessionStorage ---
  var urlParams = new URLSearchParams(window.location.search);
  var rParam = urlParams.get('r');
  if (rParam) {
    sessionStorage.setItem(SESSION_KEY, rParam);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var r = sessionStorage.getItem(SESSION_KEY);

    // --- 2. Swap home page intro text ---
    var introEl = document.getElementById('home-intro-content');
    if (introEl && introMap[r]) {
      introEl.innerHTML = introMap[r];
    }

    // --- 3. Filter blog list entries on /blogs/ ---
    var entries = document.querySelectorAll('.post-line[data-section]');
    if (entries.length === 0) return;

    var allowed = sectionMap[r]; // undefined → show all
    var managedSections = ['react', 'typescript', 'pharo'];

    entries.forEach(function (el) {
      var section = el.getAttribute('data-section');
      
      // Only filter if the section is one of the managed ones.
      // Other sections (like 'data-structures') are always shown.
      if (managedSections.indexOf(section) !== -1) {
        if (allowed && allowed.indexOf(section) === -1) {
          el.style.display = 'none';
        } else {
          el.style.display = '';
        }
      } else {
        el.style.display = '';
      }
    });
  });
})();
