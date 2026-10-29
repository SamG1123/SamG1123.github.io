const events = [
  // Add photos to public/events/ and include each path, alt text, and caption.
  // {
  //   title: 'Your event title',
  //   category: 'attended', // or 'conducted'
  //   date: 'YYYY-MM-DD',
  //   location: 'City',
  //   summary: 'A short introduction.',
  //   story: 'What happened and what you took away.',
  //   images: [
  //     { src: 'public/events/event-photo-1.jpg', alt: 'Describe the photo', caption: 'What is happening in this moment.' },
  //     { src: 'public/events/event-photo-2.jpg', alt: 'Describe the second photo', caption: 'A different moment from the event.' },
  //   ],
  // },
  {
    title: 'HackSurgeX',
    category: 'conducted',
    date: '2026-04-17',
    location: 'NMIT Bengaluru',
    summary: 'A 36-hour hackathon organized by Augmentix Club at NMIT Bengaluru.',
    story: 'HackSurgeX was a 36-hour hackathon organized by Augmentix Club at NMIT Bengaluru. The event brought together students from various colleges to collaborate, innovate, and create impactful solutions. Participants had the opportunity to work on real-world problems, network with industry experts, and showcase their skills. The event concluded with a presentation of projects and awards for the best innovations.',
    images: [{
      src: 'public/events/hacksurge1.jpg',
      alt: 'Participants attending the inaugural session',
      caption: 'Participants attending the inaugural session of HackSurgeX.',
    },
    {
      src: 'public/events/hacksurge2.jpg',
      alt: 'Augmetix Club core team members',
      caption: 'Augmetix Club core team members at HackSurgeX.',
    },
    {
      src: 'public/events/hacksurge3.jpg',
      alt: 'Augmentix Club complete team',
      caption: 'The complete team of Augmentix Club at HackSurgeX.',
    }],
  },
  {
    title: 'NMIT Hacks 2024',
    category: 'attended',
    date: '2024-05-24',
    location: 'NMIT Bengaluru',
    summary: 'A 48 hour in person hackathon organized by CSE department of NMIT Bengaluru.',
    story: 'NMIT Hacks 2024 is a national-level in-person 48-hour hackathon conducted by the CSE department of NITTE Meenakshi Institute of Technology, where tech enthusiasts are provided a platform to showcase their creativity and innovation to solve real-world problems.',
    images: [{
      src: 'public/events/nmithacks1.jpg',
      alt: 'My hackathon team at NMIT Hacks 2024',
      caption: 'My hackathon team at NMIT Hacks 2024.',
    },
    { src: 'public/events/nmithacks2.jpg',
      alt: 'Mentoring session at NMIT Hacks 2024',
      caption: 'Mentoring session at NMIT Hacks 2024.',
    }],
  },
  {
    title: 'Diamante Devhub Hackathon',
    category: 'attended',
    date: '2024-10-15',
    location: 'NMIT Bengaluru',
    summary: 'A 2 day event organized by Diamante Devhub at NMIT Bengaluru.',
    story: 'The workshop introduced the fundamentals of Web3, explored the technical workflows behind blockchain systems, and covered how developers can begin building on the Diamante blockchain. It also highlighted opportunities within the ecosystem and the kinds of problems developers could work on. What we built was a KYC system using blockchain technology, which allows users to verify their identity in a secure and decentralized manner.',
    images: [{
      src: 'public/events/devhub1.jpg',
      alt: 'Diamante Devhub Hackathon team',
      caption: 'My hackathon team at Diamante Devhub Hackathon.',
    },
    {
      src: 'public/events/devhub2.jpg',
      alt: 'Diamante Devhub judges and participants',
      caption: 'Diamante Devhub judges and participants at the event.',
    },
    {
      src: 'public/events/devhub3.jpg',
      alt: 'Laptop screen with code',
      caption: 'Laptop screen showing the code we wrote for the KYC system during the Diamante Devhub Hackathon.',
    }],
  },
  {
    title: 'AI Unchained',
    category: 'attended',
    date: '2024-10-21',
    location: 'NMIT Bengaluru',
    summary: 'A 5-day seminar and workshop series hosted by Neural Nexus, the Artificial Intelligence and Machine Learning student club at NMIT ',
    story: 'Throughout the 5 day seminar and workshop series, I learned about the fundamentals of Generative AI and its core concepts, including the architecture by diving deep into neural networks and machine learning algorithms. I also practically implemented a Generative AI model using tools like LangSmith in RAG workflows.',
    images: [{
      src: 'public/events/aiunchained1.jpg',
      alt: 'Group selfie after concluding the AI Unchained seminar and workshop series',
      caption: 'Group selfie after concluding the AI Unchained seminar and workshop series.',
    },
    {
      src: 'public/events/aiunchained2.jpg',
      alt: 'A front view of participants attending the workshop',
      caption: 'A front view of participants attending the workshop during the AI Unchained seminar and workshop series.',
    },
    {
      src: 'public/events/aiunchained3.jpg',
      alt: 'Discussion with Deepak Chawla',
      caption: 'Deepak Chawla discussing about architecture of Generative AI models.',
    },
    {
      src: 'public/events/aiunchained4.jpg',
      alt: 'Geotag photo of workshop',
      caption: 'Geotag photo of the workshop during the AI Unchained seminar and workshop series.',
    }],
  }
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

const getEventImages = (event) => {
  if (Array.isArray(event.images)) {
    return event.images.filter((image) => image && typeof image.src === 'string' && image.src);
  }
  return event.image ? [{ src: event.image, alt: event.alt }] : [];
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

  const images = getEventImages(event);
  const dialogGallery = document.getElementById('dialogGallery');
  const imageCaption = document.getElementById('dialogImageCaption');
  const showCaption = (index) => {
    imageCaption.textContent = images[index]?.caption || '';
    imageCaption.hidden = !imageCaption.textContent;
  };
  dialogGallery.replaceChildren();
  imageCaption.hidden = true;
  if (images.length) {
    dialogGallery.append(createBounceCards(images, {
      className: 'dialog-bounce-cards',
      onSelect: showCaption,
      selectedIndex: 0,
    }));
    showCaption(0);
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
  const images = getEventImages(event);
  if (images.length) {
    visual.append(createBounceCards(images, { className: 'event-bounce-cards', preview: true }));
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
