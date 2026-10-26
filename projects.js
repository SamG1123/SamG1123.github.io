const projectGrid = document.getElementById('projectGrid');
const projectsStatus = document.getElementById('projectsStatus');
const githubUsername = 'SamG1123';

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
};

const fetchPublicRepositories = async () => {
  const repositories = [];
  let page = 1;

  while (true) {
    const pageRepositories = await fetchJson(
      `https://api.github.com/users/${githubUsername}/repos?type=public&sort=updated&per_page=100&page=${page}`,
    );
    if (!Array.isArray(pageRepositories)) {
      throw new Error('GitHub returned an unexpected repository list.');
    }
    repositories.push(...pageRepositories);
    if (pageRepositories.length < 100) break;
    page += 1;
  }

  return repositories;
};

const createProjectCard = (repository, overrides) => {
  const override = overrides[repository.name.toLowerCase()] || {};
  const card = document.createElement('article');
  card.className = 'project-card reveal';

  const visual = document.createElement('div');
  visual.className = 'project-card-visual';
  const fallback = document.createElement('div');
  fallback.className = 'project-card-fallback';
  fallback.setAttribute('aria-hidden', 'true');
  fallback.textContent = repository.name;
  const image = document.createElement('img');
  image.alt = `${repository.name} project preview`;
  image.loading = 'lazy';
  image.src = override.image || `https://opengraph.githubassets.com/1/${repository.full_name}`;
  image.addEventListener('error', () => {
    image.hidden = true;
    visual.classList.add('has-fallback');
  }, { once: true });
  visual.append(fallback, image);

  const details = document.createElement('div');
  details.className = 'project-card-details';
  const metadata = document.createElement('div');
  metadata.className = 'project-card-meta';
  const language = document.createElement('span');
  language.textContent = repository.language || 'Repository';
  const updated = document.createElement('time');
  updated.dateTime = repository.updated_at;
  updated.textContent = `Updated ${new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(repository.updated_at))}`;
  metadata.append(language, updated);

  const title = document.createElement('h2');
  title.textContent = repository.name;
  const description = document.createElement('p');
  description.textContent = override.description || repository.description || 'A public GitHub project. Visit the repository for its source and documentation.';
  const link = document.createElement('a');
  link.className = 'project-card-link';
  link.href = repository.html_url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = 'View repository ↗';

  details.append(metadata, title, description, link);
  card.append(visual, details);
  return card;
};

const loadProjects = async () => {
  projectGrid.setAttribute('aria-busy', 'true');
  projectsStatus.textContent = 'Loading public repositories…';

  try {
    const [repositories, configuration] = await Promise.all([
      fetchPublicRepositories(),
      fetchJson('projects.json'),
    ]);
    if (!configuration || typeof configuration !== 'object' || Array.isArray(configuration)) {
      throw new Error('The project descriptions and image settings are not valid.');
    }

    const overrides = Object.fromEntries(Object.entries(configuration).map(([name, details]) => {
      if (!details || typeof details !== 'object' || Array.isArray(details)) {
        throw new Error(`Project settings for "${name}" must be an object.`);
      }
      if (details.description !== undefined && typeof details.description !== 'string') {
        throw new Error(`The description for "${name}" must be text.`);
      }
      if (details.image !== undefined && typeof details.image !== 'string') {
        throw new Error(`The image for "${name}" must be a URL or file path.`);
      }
      return [name.toLowerCase(), details];
    }));
    const fragment = document.createDocumentFragment();
    repositories.forEach((repository) => {
      fragment.append(createProjectCard(repository, overrides));
    });
    projectGrid.replaceChildren(fragment);
    projectGrid.setAttribute('aria-busy', 'false');
    projectsStatus.textContent = `${repositories.length} public ${repositories.length === 1 ? 'project' : 'projects'} · synced from GitHub`;

    const observer = new IntersectionObserver((entries, revealObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    projectGrid.querySelectorAll('.reveal').forEach((card) => observer.observe(card));
  } catch (error) {
    projectGrid.setAttribute('aria-busy', 'false');
    projectsStatus.textContent = `Could not load projects: ${error.message} Please try again or visit GitHub directly.`;
    const link = document.createElement('a');
    link.href = `https://github.com/${githubUsername}?tab=repositories`;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = 'Browse repositories ↗';
    projectsStatus.append(' ', link);
  }
};

loadProjects();
