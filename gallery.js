const events = [
  // Add events here with category "attended" or "conducted".
  // { title: 'Your event title', category: 'attended', date: 'YYYY-MM-DD', location: 'City',
  //   image: 'public/events/photo.jpg', alt: 'Describe the event photo',
  //   summary: 'A short introduction.', story: 'What happened and what you took away.' },
];

const galleryGrid = document.getElementById('galleryGrid');
const galleryCount = document.getElementById('galleryCount');
const galleryEmpty = document.getElementById('galleryEmpty');
const filterButtons = document.querySelectorAll('.gallery-filter');
const eventDialog = document.getElementById('eventDialog');
const galleryObserver = new IntersectionObserver((entries, revealObserver) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

const categoryLabels = {
  attended: 'Attended',
  conducted: 'Conducted',
};

const formatEventDate = (date) => {
  if (!date) return '';
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(parsedDate);
};

const openEvent = (event) => {
  document.getElementById('dialogCategory').textContent = categoryLabels[event.category];
  document.getElementById('dialogDate').textContent = formatEventDate(event.date);
  document.getElementById('dialogTitle').textContent = event.title;
  const location = document.getElementById('dialogLocation');
  location.textContent = event.location || '';
  location.hidden = !event.location;
  const story = document.getElementById('dialogStory');
  story.replaceChildren(...(event.story || '').split(/\n{2,}/).filter(Boolean).map((paragraph) => {
    const element = document.createElement('p');
    element.textContent = paragraph;
    return element;
  }));

  const image = document.getElementById('dialogImage');
  const visual = document.getElementById('dialogVisual');
  visual.hidden = !event.image;
  if (event.image) {
    image.src = event.image;
    image.alt = event.alt || `Photo from ${event.title}`;
  } else {
    image.removeAttribute('src');
    image.alt = '';
  }
  eventDialog.showModal();
};

const createEventCard = (event) => {
  const card = document.createElement('article');
  card.className = 'event-card reveal';
  const openButton = document.createElement('button');
  openButton.className = 'event-card-open';
  openButton.type = 'button';
  openButton.setAttribute('aria-label', `Read the story: ${event.title}`);

  const visual = document.createElement('div');
  visual.className = 'event-card-visual';
  if (event.image) {
    const image = document.createElement('img');
    image.src = event.image;
    image.alt = event.alt || `Photo from ${event.title}`;
    image.loading = 'lazy';
    image.addEventListener('error', () => {
      image.remove();
      visual.classList.add('event-card-visual-fallback');
    }, { once: true });
    visual.append(image);
  } else {
    visual.classList.add('event-card-visual-fallback');
    const fallback = document.createElement('span');
    fallback.textContent = 'Add an event photo';
    visual.append(fallback);
  }
  const details = document.createElement('div');
  details.className = 'event-card-details';
  const meta = document.createElement('div');
  meta.className = 'event-meta';
  const category = document.createElement('span');
  category.textContent = categoryLabels[event.category];
  const date = document.createElement('time');
  if (event.date) date.dateTime = event.date;
  date.textContent = formatEventDate(event.date);
  meta.append(category, date);
  const title = document.createElement('h2');
  title.textContent = event.title;
  const summary = document.createElement('p');
  summary.textContent = event.summary;
  const readMore = document.createElement('span');
  readMore.className = 'event-card-link';
  readMore.textContent = 'Read the story ↗';
  details.append(meta, title, summary, readMore);
  openButton.append(visual, details);
  card.append(openButton);
  openButton.addEventListener('click', () => openEvent(event));
  return card;
};

const renderEvents = (filter = 'all') => {
  const visibleEvents = events.filter((event) => filter === 'all' || event.category === filter);
  galleryGrid.replaceChildren(...visibleEvents.map(createEventCard));
  galleryEmpty.hidden = events.length !== 0;
  galleryCount.textContent = `${visibleEvents.length} ${visibleEvents.length === 1 ? 'story' : 'stories'}`;

  galleryGrid.querySelectorAll('.reveal').forEach((card) => galleryObserver.observe(card));
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((filterButton) => {
      const selected = filterButton === button;
      filterButton.classList.toggle('active', selected);
      filterButton.setAttribute('aria-pressed', selected);
    });
    renderEvents(button.dataset.filter);
  });
});

eventDialog.addEventListener('click', (event) => {
  if (event.target === eventDialog) eventDialog.close();
});

renderEvents();
