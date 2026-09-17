/* =========================================================
   PORTFOLIO — script.js
   Vanilla JS, no dependencies.
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     UTILITIES
     ======================================================= */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* =======================================================
     1. THEME TOGGLE (dark / light)
     ------------------------------------------------------
     Reads saved theme from localStorage, falls back to
     system preference.
     ======================================================= */
  const themeToggle = $("#theme-toggle");
  const root        = document.documentElement;

  function getPreferredTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;

    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.textContent = theme === "dark" ? "🌙" : "☀️";
      themeToggle.setAttribute(
        "aria-label",
        `Switch to ${theme === "dark" ? "light" : "dark"} theme`
      );
    }
  }

  // Initial theme
  applyTheme(getPreferredTheme());

  themeToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
  });

  // React to OS-level theme changes (only if user hasn't chosen)
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });

  /* =======================================================
     2. MOBILE NAVIGATION
     ======================================================= */
  const navToggle = $("#nav-toggle");
  const navMenu   = $("#nav-menu");
  const navLinks  = $$(".nav__link");

  function openMenu() {
    navMenu?.classList.add("is-open");
    navToggle?.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  }

  function closeMenu() {
    navMenu?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  function toggleMenu() {
    const isOpen = navToggle?.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  }

  navToggle?.addEventListener("click", toggleMenu);

  // Close menu when a link is clicked
  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close menu on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu?.classList.contains("is-open")) {
      closeMenu();
      navToggle?.focus();
    }
  });

  // Close menu when resizing up to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) closeMenu();
  });

  /* =======================================================
     3. HEADER SHADOW ON SCROLL
     ======================================================= */
  const header = $("#header");

  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* =======================================================
     4. ACTIVE NAV LINK (based on section in view)
     ======================================================= */
  const sections = $$("main section[id]");

  const setActiveLink = () => {
    const scrollPos = window.scrollY + 120; // offset for sticky header
    let currentId = sections[0]?.id;

    sections.forEach((section) => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("is-active", isActive);
      isActive
        ? link.setAttribute("aria-current", "page")
        : link.removeAttribute("aria-current");
    });
  };

  window.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();

  /* =======================================================
     5. SCROLL REVEAL ANIMATION
     ======================================================= */
  const revealElements = $$(".reveal");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show everything immediately
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  /* =======================================================
     6. PROJECTS — render cards from data array
     ------------------------------------------------------
     Edit this array to add / remove projects.
     ======================================================= */
  const projects = [
    {
      title: "Project One",
      description:
        "A short description of what this project does and the problem it solves.",
      tags: ["React", "TypeScript", "Tailwind"],
      image: "", // optional — path to an image
      demo: "https://example.com",
      repo: "https://github.com/",
    },
    {
      title: "Project Two",
      description:
        "Another project description. Keep it to one or two lines for a clean look.",
      tags: ["Vue", "Vite", "Sass"],
      image: "",
      demo: "https://example.com",
      repo: "https://github.com/",
    },
    {
      title: "Project Three",
      description:
        "A third project. Highlight the impact, tech stack, or a fun detail.",
      tags: ["Node.js", "Express", "MongoDB"],
      image: "",
      demo: "https://example.com",
      repo: "https://github.com/",
    },
  ];

  const projectsGrid = $("#projects-grid");

  function createProjectCard(project) {
    const card = document.createElement("article");
    card.className = "card project reveal";

    // Thumbnail: image or gradient with initials
    const thumb = project.image
      ? `<img src="${project.image}" alt="${project.title} preview" loading="lazy" />`
      : project.title
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

    const tagsHTML = (project.tags || [])
      .map((tag) => `<li class="pill">${tag}</li>`)
      .join("");

    const linksHTML = [
      project.demo
        ? `<a href="${project.demo}" target="_blank" rel="noopener">Live demo →</a>`
        : "",
      project.repo
        ? `<a href="${project.repo}" target="_blank" rel="noopener">Source →</a>`
        : "",
    ]
      .filter(Boolean)
      .join("");

    card.innerHTML = `
      <div class="project__thumb" aria-hidden="true">${thumb}</div>
      <div class="project__body">
        <h3 class="project__title">${project.title}</h3>
        <p class="project__desc">${project.description}</p>
        <ul class="pills">${tagsHTML}</ul>
        <div class="project__links">${linksHTML}</div>
      </div>
    `;

    return card;
  }

  if (projectsGrid) {
    const frag = document.createDocumentFragment();
    projects.forEach((p) => frag.appendChild(createProjectCard(p)));
    projectsGrid.appendChild(frag);

    // Observe newly added reveals
    if ("IntersectionObserver" in window && !prefersReducedMotion) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      $$(".projects__grid .reveal").forEach((el) => observer.observe(el));
    } else {
      $$(".projects__grid .reveal").forEach((el) =>
        el.classList.add("is-visible")
      );
    }
  }

  /* =======================================================
     7. CONTACT FORM VALIDATION
     ------------------------------------------------------
     Frontend-only validation. Hook the success branch
     to your backend (Formspree, Netlify, custom API, etc.).
     ======================================================= */
  const form       = $("#contact-form");
  const formStatus = $("#form-status");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(field, message) {
    const wrapper = field.closest(".field");
    wrapper?.classList.add("has-error");
    const errorEl = wrapper?.querySelector(".error");
    if (errorEl) errorEl.textContent = message;
    field.setAttribute("aria-invalid", "true");
  }

  function clearError(field) {
    const wrapper = field.closest(".field");
    wrapper?.classList.remove("has-error");
    const errorEl = wrapper?.querySelector(".error");
    if (errorEl) errorEl.textContent = "";
    field.removeAttribute("aria-invalid");
  }

  function validateField(field) {
    const value = field.value.trim();

    if (!value) {
      showError(field, "This field is required.");
      return false;
    }

    if (field.type === "email" && !emailRegex.test(value)) {
      showError(field, "Please enter a valid email address.");
      return false;
    }

    if (field.id === "message" && value.length < 10) {
      showError(field, "Message must be at least 10 characters.");
      return false;
    }

    clearError(field);
    return true;
  }

  // Live validation: clear error on input, validate on blur
  if (form) {
    const fields = $$("input, textarea", form);

    fields.forEach((field) => {
      field.addEventListener("input", () => {
        if (field.closest(".field")?.classList.contains("has-error")) {
          validateField(field);
        }
      });
      field.addEventListener("blur", () => validateField(field));
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const allValid = fields.map(validateField).every(Boolean);

      if (!allValid) {
        formStatus.textContent = "Please fix the errors above.";
        formStatus.style.color = "#ef4444";
        const firstError = $(".field.has-error input, .field.has-error textarea");
        firstError?.focus();
        return;
      }

      // --- Simulated send -------------------------------------
      // Replace this block with a real fetch() to your endpoint.
      formStatus.style.color = "";
      formStatus.textContent = "Sending…";

      setTimeout(() => {
        formStatus.textContent =
          "Thanks! Your message has been sent. I'll be in touch soon.";
        form.reset();
        fields.forEach(clearError);

        // Reset status after a few seconds
        setTimeout(() => (formStatus.textContent = ""), 6000);
      }, 800);
    });
  }

  /* =======================================================
     8. BACK TO TOP BUTTON
     ======================================================= */
  const toTopBtn = $("#to-top");

  const onScrollToTop = () => {
    toTopBtn?.classList.toggle("is-visible", window.scrollY > 500);
  };

  window.addEventListener("scroll", onScrollToTop, { passive: true });
  onScrollToTop();

  toTopBtn?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });

  /* =======================================================
     9. SMOOTH SCROLL FOR ANCHOR LINKS (with header offset)
     ------------------------------------------------------
     Native scroll-behavior handles most cases, but this
     accounts for the sticky header height.
     ======================================================= */
  const headerHeight = header?.offsetHeight || 68;

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top =
        target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;

      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });

      // Update URL without adding a history entry jump
      history.pushState(null, "", targetId);
    });
  });

  /* =======================================================
     10. FOOTER YEAR
     ======================================================= */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
