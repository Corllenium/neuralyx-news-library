const form = document.querySelector('.filters');
const cards = [...document.querySelectorAll('.card')];
const query = document.querySelector('#search');
const topic = document.querySelector('#topic');
const results = document.querySelector('.results');
const empty = document.querySelector('.empty');
const more = document.querySelector('#more');
const pageSize = 24;
let visibleCount = pageSize;

function render() {
  const terms = query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  let matching = 0;
  for (const card of cards) {
    const matches = (!topic.value || card.dataset.topic === topic.value)
      && terms.every((term) => card.dataset.search.includes(term));
    if (matches) matching++;
    card.hidden = !matches || matching > visibleCount;
  }
  results.textContent = matching > visibleCount
    ? 'Showing ' + visibleCount + ' of ' + matching + ' references'
    : matching + (matching === 1 ? ' reference' : ' references');
  empty.hidden = matching !== 0;
  more.hidden = matching <= visibleCount;
}

function updateFilters() {
  visibleCount = pageSize;
  const url = new URL(location.href);
  if (query.value.trim()) url.searchParams.set('q', query.value.trim());
  else url.searchParams.delete('q');
  if (topic.value) url.searchParams.set('topic', topic.value);
  else url.searchParams.delete('topic');
  history.replaceState(null, '', url);
  render();
}

const filters = new URLSearchParams(location.search);
query.value = filters.get('q') || '';
const selectedTopic = filters.get('topic');
if ([...topic.options].some((option) => option.value === selectedTopic)) topic.value = selectedTopic;
form.hidden = false;
form.addEventListener('submit', (event) => { event.preventDefault(); updateFilters(); });
query.addEventListener('input', updateFilters);
topic.addEventListener('change', updateFilters);
more.addEventListener('click', () => {
  const hiddenBefore = new Set(cards.filter((card) => card.hidden));
  visibleCount += pageSize;
  render();
  const firstNew = cards.find((card) => !card.hidden && hiddenBefore.has(card));
  firstNew?.querySelector('a')?.focus();
});
render();
