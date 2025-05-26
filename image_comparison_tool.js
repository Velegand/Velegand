const params = new URLSearchParams(window.location.search);
const subtitleText = params.get('title');
if (subtitleText) document.getElementById('subtitle').textContent = subtitleText;

const pairs = [];
for (let idx = 1; idx <= 50; idx++) {
  const before = params.get(`img${idx * 2 - 1}`);
  const after = params.get(`img${idx * 2}`);
  if (!before || !after) break;
  pairs.push({ before, after });
}

function getFilename(url) {
  try {
    return decodeURIComponent(url.split('/').pop().split('?')[0]);
  } catch {
    return url;
  }
}

const container = document.getElementById('comparisons');
if (pairs.length === 0) {
  container.innerHTML = '<p style="text-align:center;">No valid image pairs provided in URL.</p>';
} else {
  pairs.forEach((cmp, i) => {
    const compId = `slider${i + 1}`;
    const beforeName = getFilename(cmp.before);
    const afterName = getFilename(cmp.after);

    const compDiv = document.createElement('div');
    compDiv.className = 'comparison-container';
    compDiv.innerHTML = `
      <div id="${compId}" class="slider"></div>
      <div class="filenames">
        <div>Before: ${beforeName}</div>
        <div>After: ${afterName}</div>
      </div>`;
    container.appendChild(compDiv);

    new juxtapose.JXSlider(`#${compId}`, [
      { src: cmp.before, label: beforeName },
      { src: cmp.after, label: afterName }
    ], {
      animate: true,
      showLabels: true,
      showCredits: false,
      makeResponsive: true
    });
  });
}

function populateFieldsFromUrl() {
  const imageUrls = [];
  for (let idx = 1; idx <= 100; idx++) {
    const val = params.get(`img${idx}`);
    if (!val) break;
    imageUrls.push(val);
  }
  document.getElementById('imageUrls').value = imageUrls.join('\n');
  document.getElementById('titles').value = params.get('title') || '';
}

function updateGeneratedUrl() {
  const baseUrl = window.location.origin + window.location.pathname;
  const imageLines = document.getElementById('imageUrls').value.trim().split('\n').filter(Boolean);
  const title = document.getElementById('titles').value.trim();
  const searchParams = new URLSearchParams();

  if (title) searchParams.set('title', title);
  imageLines.forEach((line, i) => searchParams.set(`img${i + 1}`, line.trim()));
  document.getElementById('generatedUrl').value = `${baseUrl}?${searchParams.toString()}`;
}

['imageUrls', 'titles'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateGeneratedUrl);
});

window.addEventListener('DOMContentLoaded', () => {
  populateFieldsFromUrl();
  updateGeneratedUrl();
});

document.getElementById('copyButton').addEventListener('click', () => {
  const urlField = document.getElementById('generatedUrl');
  const copyText = document.querySelector('.copy-text');
  urlField.select();
  navigator.clipboard.writeText(urlField.value).then(() => {
    copyText.classList.add('active');
    setTimeout(() => copyText.classList.remove('active'), 2000);
  }).catch(err => console.error('Failed to copy: ', err));
});