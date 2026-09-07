import fs from 'node:fs';
// Public link previews must be present in HTML before JavaScript runs.
const out='dist/web';
const shareOrigin='https://akilii.fullspektrum.ai';
const shareTags=[
 '<link rel="canonical" href="'+shareOrigin+'/">',
 '<meta property="og:type" content="website">',
 '<meta property="og:site_name" content="akilii by FullSpektrum">',
 '<meta property="og:title" content="akilii — A space to think. A way forward.">',
 '<meta property="og:description" content="Explore akilii, a conversational AI workspace for making sense of ideas, finding your next step and keeping useful work.">',
 '<meta property="og:url" content="'+shareOrigin+'/">',
 '<meta property="og:image" content="'+shareOrigin+'/icons/icon-dark-512.png">',
 '<meta property="og:image:secure_url" content="'+shareOrigin+'/icons/icon-dark-512.png">',
 '<meta property="og:image:type" content="image/png">',
 '<meta property="og:image:width" content="512">',
 '<meta property="og:image:height" content="512">',
 '<meta property="og:image:alt" content="akilii brandmark on a dark background">',
 '<meta name="twitter:card" content="summary">',
 '<meta name="twitter:title" content="akilii — A space to think. A way forward.">',
 '<meta name="twitter:description" content="A conversational AI workspace by FullSpektrum.">',
 '<meta name="twitter:image" content="'+shareOrigin+'/icons/icon-dark-512.png">'
].join('');
const shareHtml=fs.readFileSync(out+'/index.html','utf8').replace('</head>',shareTags+'</head>');
fs.writeFileSync(out+'/index.html',shareHtml);
