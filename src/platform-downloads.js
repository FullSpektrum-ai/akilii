// Only configured, built artifacts receive a link. No placeholder App Store URLs.
const platformReleases = RELEASE_DOWNLOADS;
const downloadList = document.getElementById('platform-downloads');
for (const [id, label, pending] of [
  ['macIntel', 'Mac · Intel', 'Build pending'],
  ['macArm', 'Mac · Apple silicon', 'Build pending'],
  ['ios', 'iPhone / iPad', 'TestFlight pending'],
  ['android', 'Android', 'Build pending'],
]) {
  const url = window.akiliiMobileDemo ? null : platformReleases[id];
  const item = document.createElement(url ? 'a' : 'span');
  item.className = 'platform-download';
  item.textContent =
    label +
    ' · ' +
    (url ? (id === 'ios' ? 'Join beta' : 'Download review build') : pending);
  if (url) {
    item.href = url;
    if (id !== 'ios') item.setAttribute('download', '');
  } else item.setAttribute('aria-disabled', 'true');
  downloadList.append(item);
}
document.getElementById('download-status').textContent =
  'Desktop archives are unsigned internal review builds. Mobile links become available after platform build and signing checks. Demo data stays separate from your live workspace.';

const buildStamp = document.createElement('small');
buildStamp.id = 'build-version';
buildStamp.textContent = 'Build ' + platformReleases.version;
document.querySelector('.sidebar-footer')?.append(buildStamp);
if (window.akiliiDesktop || window.akiliiMobileDemo)
  document.querySelector('.desktop-download').hidden = true;
