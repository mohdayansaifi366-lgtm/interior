function initAuraApp(options = {}) {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        const sun = document.getElementById('sun-icon');
        const moon = document.getElementById('moon-icon');
        if (sun) sun.classList.remove('hidden');
        if (moon) moon.classList.add('hidden');
    } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    }

    if (options.hero !== false && document.querySelectorAll('.hero-slide').length) {
        startHeroSlideshow();
    }

    initScrollAnimations();
    initCustomCursor();
    initComparisonSlider();
    initNavbarScroll();

    if (window.location.hash === '#portal') {
        scrollToSection('portal');
    }

    if (options.renderProjects) {
        renderAllProjectCards(options.renderProjects, options.projectLimit);
    }

    if (options.projectDetail) {
        populateProjectDetailPage();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

window.onload = function () {
    const page = document.body.getAttribute('data-page');
    if (page === 'home') {
        initAuraApp({ renderProjects: '#projects-grid', projectLimit: 4 });
    } else if (page === 'projects') {
        initAuraApp({ renderProjects: '#projects-grid' });
    } else if (page === 'add-project') {
        initAuraApp();
    } else if (page === 'project-detail') {
        initAuraApp({ projectDetail: true, hero: false });
    } else {
        initAuraApp();
    }
};

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleTheme() {
    const html = document.documentElement;
    const sun = document.getElementById('sun-icon');
    const moon = document.getElementById('moon-icon');

    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        html.classList.add('light');
        if (sun) sun.classList.remove('hidden');
        if (moon) moon.classList.add('hidden');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.remove('light');
        html.classList.add('dark');
        if (sun) sun.classList.add('hidden');
        if (moon) moon.classList.remove('hidden');
        localStorage.setItem('theme', 'dark');
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('menu-btn-icon');
    if (!menu) return;

    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        icon.setAttribute('data-lucide', 'x');
    } else {
        menu.classList.add('hidden');
        icon.setAttribute('data-lucide', 'menu');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

let currentHeroSlide = 0;
let slideTimer;

function startHeroSlideshow() {
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (!heroSlides.length) return;
    slideTimer = setInterval(() => {
        const nextSlide = (currentHeroSlide + 1) % heroSlides.length;
        setHeroSlide(nextSlide);
    }, 7000);
}

function setHeroSlide(idx) {
    clearInterval(slideTimer);
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroDots = document.querySelectorAll('.hero-dot');

    heroSlides.forEach((slide, i) => {
        if (i === idx) {
            slide.classList.add('opacity-100');
            slide.classList.remove('opacity-0', 'scale-110');
            slide.classList.add('scale-100');
            if (heroDots[i]) {
                heroDots[i].classList.add('bg-bronze');
                heroDots[i].classList.remove('bg-white/20', 'light:bg-charcoal-300');
            }
        } else {
            slide.classList.remove('opacity-100', 'scale-100');
            slide.classList.add('opacity-0', 'scale-110');
            if (heroDots[i]) {
                heroDots[i].classList.remove('bg-bronze');
                heroDots[i].classList.add('bg-white/20', 'light:bg-charcoal-300');
            }
        }
    });
    currentHeroSlide = idx;
    startHeroSlideshow();
}

function initComparisonSlider() {
    const slider = document.getElementById('comparison-slider');
    const imageClip = document.getElementById('after-image-clip');
    const bar = document.getElementById('slider-bar');

    if (slider && imageClip && bar) {
        slider.addEventListener('input', function (e) {
            const val = e.target.value;
            imageClip.style.clipPath = `polygon(0 0, ${val}% 0, ${val}% 100%, 0 100%)`;
            bar.style.left = `${val}%`;
        });
    }
}

function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const dot = document.getElementById('custom-cursor-dot');
    if (!cursor || !dot) return;

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
    });

    document.querySelectorAll('a, button, select, input, textarea').forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.8) translate(-25%, -25%)';
        });
        item.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1) translate(-50%, -50%)';
        });
    });
}

function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        reveals.forEach(el => {
            const top = el.getBoundingClientRect().top;
            const triggerHeight = window.innerHeight * 0.85;

            if (top < triggerHeight) {
                el.classList.add('active');
                el.querySelectorAll('[id^="stat-"]').forEach(counter => {
                    if (!counter.classList.contains('counted')) runCounter(counter);
                });
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();
}

function runCounter(el) {
    el.classList.add('counted');
    const target = parseInt(el.getAttribute('data-target'), 10);
    let current = 0;
    const step = Math.ceil(target / 40);

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            el.innerText = target + '+';
            clearInterval(timer);
        } else {
            el.innerText = current;
        }
    }, 30);
}

function openLightbox(imgUrl, caption) {
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    const lightbox = document.getElementById('lightbox-modal');
    if (!img || !lightbox) return;
    img.src = imgUrl;
    if (cap) cap.innerText = caption;
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox-modal');
    if (!lightbox) return;
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    document.body.style.overflow = '';
}

let activeTestimonial = 0;

function nextTestimonial() {
    const slides = document.querySelectorAll('.testimonial-slide');
    if (!slides.length) return;
    slides[activeTestimonial].classList.add('opacity-0', 'translate-x-[-12px]', 'pointer-events-none');
    slides[activeTestimonial].classList.remove('opacity-100', 'translate-x-0');
    activeTestimonial = (activeTestimonial + 1) % slides.length;
    slides[activeTestimonial].classList.remove('opacity-0', 'translate-x-[12px]', 'pointer-events-none');
    slides[activeTestimonial].classList.add('opacity-100', 'translate-x-0');
}

function prevTestimonial() {
    const slides = document.querySelectorAll('.testimonial-slide');
    if (!slides.length) return;
    slides[activeTestimonial].classList.add('opacity-0', 'translate-x-[12px]', 'pointer-events-none');
    slides[activeTestimonial].classList.remove('opacity-100', 'translate-x-0');
    activeTestimonial = (activeTestimonial - 1 + slides.length) % slides.length;
    slides[activeTestimonial].classList.remove('opacity-0', 'translate-x-[-12px]', 'pointer-events-none');
    slides[activeTestimonial].classList.add('opacity-100', 'translate-x-0');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;
    toastText.innerText = msg;
    toast.classList.remove('translate-y-12', 'opacity-0', 'pointer-events-none');
    setTimeout(() => {
        toast.classList.add('translate-y-12', 'opacity-0', 'pointer-events-none');
    }, 4000);
}

function handleInquirySubmit(e) {
    e.preventDefault();
    const successOverlay = document.getElementById('form-success-overlay');
    if (successOverlay) {
        successOverlay.classList.remove('opacity-0', 'pointer-events-none');
        successOverlay.classList.add('opacity-100');
    }
    showToast('Inquiry successfully delivered to studio!');
}

function resetContactForm() {
    const form = document.getElementById('contactForm');
    if (form) form.reset();
    const successOverlay = document.getElementById('form-success-overlay');
    if (successOverlay) {
        successOverlay.classList.remove('opacity-100');
        successOverlay.classList.add('opacity-0', 'pointer-events-none');
    }
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    showToast('Mailing list subscription completed!');
    e.target.reset();
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('authPassword');
    const eyeIcon = document.getElementById('eye-icon');
    const eyeOffIcon = document.getElementById('eye-off-icon');
    if (!passwordInput) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        if (eyeIcon) eyeIcon.classList.add('hidden');
        if (eyeOffIcon) eyeOffIcon.classList.remove('hidden');
    } else {
        passwordInput.type = 'password';
        if (eyeIcon) eyeIcon.classList.remove('hidden');
        if (eyeOffIcon) eyeOffIcon.classList.add('hidden');
    }
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const statusBox = document.getElementById('auth-status');
    const email = document.getElementById('authEmail').value;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Verifying Node Integrity...</span><span class="animate-spin text-bronze border-2 border-t-transparent border-bronze rounded-full w-4 h-4"></span>';

    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Authorize Entry</span><i data-lucide="key-round" class="w-3.5 h-3.5"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();

        statusBox.classList.remove('hidden', 'bg-red-500/10', 'border-red-500/30', 'text-red-400', 'bg-emerald-500/10', 'border-emerald-500/30', 'text-emerald-400');

        if (email.includes('@aurastudio.com') || email === 'client@aura.com') {
            statusBox.classList.add('bg-emerald-500/10', 'border-emerald-500/30', 'text-emerald-400');
            statusBox.innerHTML = '<span class="font-bold flex items-center gap-2"><i data-lucide="check-circle" class="w-4 h-4"></i> Access Approved. Opening project grid...</span>';
            showToast('Authentication successful. Secure portal ready.');
            setTimeout(() => { window.location.href = 'projects.html'; }, 1500);
        } else {
            statusBox.classList.add('bg-red-500/10', 'border-red-500/30', 'text-red-400');
            statusBox.innerHTML = '<span class="font-bold flex items-center gap-2"><i data-lucide="alert-octagon" class="w-4 h-4"></i> Unverified Node. Key mismatch detected.</span>';
            showToast('Failed verification. Try checking key formats.');
        }
        statusBox.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 1800);
}

function triggerForgotPassword(e) {
    e.preventDefault();
    const emailInput = document.getElementById('authEmail').value;
    if (!emailInput) {
        showToast('Enter your email address to reset key coordinates.');
    } else {
        showToast(`Dynamic reset link dispatched to: ${emailInput}`);
    }
}

function initNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        if (window.scrollY > 80) {
            navbar.classList.add('glass', 'py-4', 'border-white/10');
            navbar.classList.remove('py-6', 'border-transparent');
        } else {
            navbar.classList.remove('glass', 'py-4', 'border-white/10');
            navbar.classList.add('py-6', 'border-transparent');
        }
    });
}
