const STORAGE_KEY = 'aura_user_projects';

const projectData = {
    monolith: {
        title: 'The Concrete Monolith',
        cat: 'Residential Architecture',
        category: 'residential',
        location: 'Zürich, Switzerland',
        area: '6,200 sqft',
        energy: 'Passivhaus Standard',
        duration: '18 Months',
        img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        desc: 'The design strategy centered on excavating a brutalist structure directly from Swiss mountain rock layers. Built using self-consolidating raw concrete, the floor plates stack in offset sequences to guarantee expansive sunlight absorption ratios throughout winter.'
    },
    zen: {
        title: 'Minimalist Zen Lounge',
        cat: 'Interior Architecture',
        category: 'interior',
        location: 'Kyoto, Japan',
        area: '2,400 sqft',
        energy: 'Biophilic Certified',
        duration: '10 Months',
        img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1200&q=80',
        desc: 'A tranquil layout utilizing dark charcoal ceilings and raw shoji wood grids. Smoked cedar panels slide along flush floor rails to open up central meditation tatamis to a custom interior bamboo garden cascade.'
    },
    office: {
        title: 'Biophilic Glass Center',
        cat: 'Commercial Space',
        category: 'commercial',
        location: 'Berlin, Germany',
        area: '48,000 sqft',
        energy: 'LEED Platinum',
        duration: '24 Months',
        img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        desc: 'Designed as a biophilic office park loop in Berlin. A suspended steel staircase wraps around an internal forest biome that actively filters air conditioning, reducing building operational energy footprints by 42%.'
    },
    parametric: {
        title: 'The Parametric Wave',
        cat: 'Facade Design',
        category: 'facade',
        location: 'Dubai, UAE',
        area: '15,000 sqft facade',
        energy: 'BREEAM Outstanding',
        duration: '14 Months',
        img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        desc: 'This Dubai landmark leverages kinetic facade nodes. Thousands of marine-grade brushed bronze fins dynamically track solar angles throughout the afternoon, maintaining maximum transparency while minimizing inner heat absorption.'
    }
};

const CATEGORY_LABELS = {
    residential: 'Residential',
    commercial: 'Commercial',
    interior: 'Interior',
    facade: 'Facade'
};

function getUserProjects() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function getBuiltinProjects() {
    return Object.entries(projectData).map(([id, p]) => ({
        id,
        source: 'studio',
        ...p
    }));
}

function getAllProjects() {
    const user = getUserProjects().map(p => ({ ...p, source: 'user' }));
    return [...getBuiltinProjects(), ...user];
}

function getProjectById(id) {
    const builtin = projectData[id];
    if (builtin) {
        return { id, source: 'studio', ...builtin };
    }
    return getUserProjects().find(p => p.id === id) || null;
}

function generateProjectId() {
    return 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function saveUserProject(project) {
    const list = getUserProjects();
    const entry = {
        id: generateProjectId(),
        source: 'user',
        title: project.title,
        category: project.category,
        cat: CATEGORY_LABELS[project.category] || project.category,
        location: project.location,
        desc: project.description,
        img: project.image,
        area: project.area || '—',
        energy: project.energy || '—',
        duration: project.duration || '—',
        modelUrl: project.modelUrl || ''
    };
    list.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return entry.id;
}

function getProjectDetailUrl(id) {
    return 'project.html?id=' + encodeURIComponent(id);
}

function renderProjectCard(project) {
    const catLabel = CATEGORY_LABELS[project.category] || project.cat || project.category;
    const location = project.location || '';
    const badge = project.source === 'user'
        ? '<span class="glass text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 text-white/80 rounded-full">Community</span>'
        : '';
    const shortDesc = (project.desc || '').slice(0, 120) + ((project.desc || '').length > 120 ? '…' : '');

    const card = document.createElement('div');
    card.className = 'project-card reveal group relative';
    card.setAttribute('data-category', project.category || 'residential');
    card.innerHTML = `
        <a href="${getProjectDetailUrl(project.id)}" class="block">
            <div class="zoom-img-container aspect-[4/3] w-full overflow-hidden rounded-md relative shadow-lg">
                <img src="${project.img}" alt="${project.title}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500"></div>
                <div class="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span class="glass text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 text-bronze rounded-full">${catLabel}</span>
                    ${location ? `<span class="glass text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 text-white/80 rounded-full">${location}</span>` : ''}
                    ${badge}
                </div>
            </div>
            <div class="mt-6 flex justify-between items-start">
                <div>
                    <h3 class="font-display text-xl lg:text-2xl font-bold tracking-tight mb-2 group-hover:text-bronze transition-colors">${project.title}</h3>
                    <p class="text-xs text-warm-400 dark:text-warm-400 light:text-charcoal-500 font-light max-w-sm">${shortDesc}</p>
                </div>
                <span class="inline-flex p-3 rounded-full border border-bronze/30 group-hover:border-bronze group-hover:bg-bronze group-hover:text-charcoal-950 transition-all duration-300">
                    <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
                </span>
            </div>
        </a>`;
    return card;
}

function renderAllProjectCards(containerSelector, limit) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = '';
    let projects = getAllProjects();
    if (limit) projects = projects.slice(0, limit);

    projects.forEach(p => {
        container.appendChild(renderProjectCard(p));
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (typeof initScrollAnimations === 'function') initScrollAnimations();
}

function filterProjects(cat) {
    const cards = document.querySelectorAll('.project-card');
    const buttons = document.querySelectorAll('.project-filter-btn');

    buttons.forEach(btn => {
        btn.classList.remove('text-bronze', 'border-bronze');
        btn.classList.add('text-warm-400', 'border-transparent');
    });

    const activeBtn = Array.from(buttons).find(btn => btn.getAttribute('data-filter') === cat);
    if (activeBtn) {
        activeBtn.classList.add('text-bronze', 'border-bronze');
        activeBtn.classList.remove('text-warm-400', 'border-transparent');
    }

    cards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-category') === cat) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 50);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 400);
        }
    });
}

function populateProjectDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        window.location.href = 'projects.html';
        return;
    }

    const data = getProjectById(id);
    if (!data) {
        window.location.href = 'projects.html';
        return;
    }

    const setText = (elId, text) => {
        const el = document.getElementById(elId);
        if (el) el.textContent = text;
    };
    const setSrc = (elId, src) => {
        const el = document.getElementById(elId);
        if (el) el.src = src;
    };

    setSrc('detail-hero-img', data.img);
    setText('detail-title', data.title);
    setText('detail-cat', data.cat || CATEGORY_LABELS[data.category]);
    setText('detail-desc', data.desc);
    setText('detail-spec-area', data.area);
    setText('detail-spec-energy', data.energy);
    setText('detail-spec-duration', data.duration);
    setText('detail-location', data.location || '');

    const badge = document.getElementById('detail-badge');
    if (badge) {
        if (data.source === 'user') {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    document.title = data.title + ' | AURA Studio';
}

function handleAddProjectSubmit(e) {
    e.preventDefault();
    const statusBox = document.getElementById('form-status');
    const title = document.getElementById('proj-title').value.trim();
    const category = document.getElementById('proj-category').value;
    const location = document.getElementById('proj-location').value.trim();
    const description = document.getElementById('proj-desc').value.trim();
    const image = document.getElementById('proj-image').value.trim();
    const area = document.getElementById('proj-area').value.trim();
    const energy = document.getElementById('proj-energy').value.trim();
    const duration = document.getElementById('proj-duration').value.trim();
    const modelUrl = document.getElementById('proj-model').value.trim();

    if (!title || !category || !location || !description || !image) {
        if (statusBox) {
            statusBox.classList.remove('hidden', 'bg-emerald-500/10', 'border-emerald-500/30', 'text-emerald-400');
            statusBox.classList.add('bg-red-500/10', 'border-red-500/30', 'text-red-400');
            statusBox.textContent = 'Please fill all required fields.';
        }
        return;
    }

    try {
        new URL(image);
    } catch {
        if (statusBox) {
            statusBox.classList.remove('hidden', 'bg-emerald-500/10', 'border-emerald-500/30', 'text-emerald-400');
            statusBox.classList.add('bg-red-500/10', 'border-red-500/30', 'text-red-400');
            statusBox.textContent = 'Cover image must be a valid URL.';
        }
        return;
    }

    const newId = saveUserProject({
        title,
        category,
        location,
        description,
        image,
        area,
        energy,
        duration,
        modelUrl
    });

    if (typeof showToast === 'function') {
        showToast('Project saved to your portfolio.');
    }

    window.location.href = getProjectDetailUrl(newId);
}
