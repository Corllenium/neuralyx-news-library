const form = document.querySelector('.filters');
const cards = [...document.querySelectorAll('.card')];
const query = document.querySelector('#search');
const topic = document.querySelector('#topic');
const results = document.querySelector('.results');
const empty = document.querySelector('.empty');
const pagination = document.querySelector('#pagination');
const pageSize = 20;
const pageGroupSize = 10;

function pageUrl(page) {
  const url = new URL(location.href);
  if (query.value.trim()) url.searchParams.set('q', query.value.trim());
  else url.searchParams.delete('q');
  if (topic.value) url.searchParams.set('topic', topic.value);
  else url.searchParams.delete('topic');
  if (page > 1) url.searchParams.set('page', page);
  else url.searchParams.delete('page');
  return url;
}

function pageLink(page, label, current = false) {
  const link = document.createElement('a');
  link.href = pageUrl(page);
  link.dataset.page = String(page);
  link.textContent = label;
  if (current) link.setAttribute('aria-current', 'page');
  if (label === String(page)) link.setAttribute('aria-label', 'Page ' + page);
  return link;
}

function render(requestedPage = 1) {
  const terms = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matching = cards.filter((card) => (!topic.value || card.dataset.topic === topic.value)
    && terms.every((term) => card.dataset.search.includes(term)));
  const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, matching.length);
  const visible = new Set(matching.slice(start, end));
  for (const card of cards) card.hidden = !visible.has(card);
  results.textContent = pageCount > 1
    ? 'Showing ' + (start + 1) + '–' + end + ' of ' + matching.length + ' references'
    : matching.length + (matching.length === 1 ? ' reference' : ' references');
  empty.hidden = matching.length !== 0;
  pagination.hidden = pageCount === 1;
  pagination.replaceChildren();
  if (pagination.hidden) return;
  if (page > 1) pagination.append(pageLink(page - 1, 'Previous'));
  const first = Math.floor((page - 1) / pageGroupSize) * pageGroupSize + 1;
  for (let number = first; number <= Math.min(first + pageGroupSize - 1, pageCount); number++) {
    pagination.append(pageLink(number, String(number), number === page));
  }
  if (page < pageCount) pagination.append(pageLink(page + 1, 'Next'));
}

function updateFilters() {
  history.replaceState(null, '', pageUrl(1));
  render();
}

function readLocation() {
  const filters = new URLSearchParams(location.search);
  query.value = (filters.get('q') || '').slice(0, 120);
  const selectedTopic = filters.get('topic');
  topic.value = [...topic.options].some((option) => option.value === selectedTopic) ? selectedTopic : '';
  const page = Number(filters.get('page'));
  render(Number.isSafeInteger(page) && page > 0 ? page : 1);
}

form.hidden = false;
form.addEventListener('submit', (event) => { event.preventDefault(); updateFilters(); });
query.addEventListener('input', updateFilters);
topic.addEventListener('change', updateFilters);
pagination.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-page]');
  if (!link || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  history.pushState(null, '', link.href);
  render(Number(link.dataset.page));
  results.focus();
});
window.addEventListener('popstate', readLocation);
readLocation();
