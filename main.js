const MODE_CONTENT = {
  chill: {
    title: "Slow burn, sharp finish",
    copy: "Ocean air first, then somewhere dim enough for private jokes and one drink that quietly changes the whole plot.",
    tags: ["good lighting", "private jokes", "pressure rising"],
  },
  flash: {
    title: "Main-character timing",
    copy: "Golden-hour mirror check, rooftop dinner, clean shoes, strong pours, and a whole room turning into background casting.",
    tags: ["fit check", "camera ready", "table for two"],
  },
  chaos: {
    title: "No curfew behavior",
    copy: "One stop while we still pretend to behave, one stop after we stop pretending, then a late food run that feels deserved.",
    tags: ["bad influence", "dance floor", "worth it"],
  },
};

const modeButtons = [...document.querySelectorAll("[data-mode]")];
const modeResult = document.querySelector("[data-mode-result]");
const copyButtons = [...document.querySelectorAll("[data-copy]")];
const sections = [...document.querySelectorAll("[data-scene]")];
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const notesField = document.querySelector("[data-notes]");
const saveNotesButton = document.querySelector("[data-notes-save]");
const notesStatus = document.querySelector("[data-notes-status]");
const lazyVideos = [...document.querySelectorAll("video[data-video-lazy]")];

const notesKey = "miami2026.notes";
const uiKey = "miami2026.ui";
const sceneToNavMap = {
  hero: "hero",
  intro: "hero",
  beach: "beach",
  nightlife: "nightlife",
  lounge: "lounge",
  cuts: "nightlife",
  moments: "moments",
  closing: "closing",
};

function stamp() {
  return new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function setMode(mode) {
  const config = MODE_CONTENT[mode];
  if (!config || !modeResult) {
    return;
  }

  modeButtons.forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });

  modeResult.innerHTML = `
    <h3>${config.title}</h3>
    <p>${config.copy}</p>
    <ul>${config.tags.map((tag) => `<li>${tag}</li>`).join("")}</ul>
  `;

  localStorage.setItem(uiKey, mode);
}

async function copyText(value, trigger) {
  if (!value || !trigger) {
    return;
  }

  const previous = trigger.textContent;
  try {
    await navigator.clipboard.writeText(value);
    trigger.textContent = "Copied.";
  } catch {
    trigger.textContent = "Copy blocked";
  }

  window.setTimeout(() => {
    trigger.textContent = previous;
  }, 1400);
}

function saveNotes() {
  if (!notesField) {
    return;
  }

  localStorage.setItem(notesKey, notesField.value.trim());
  if (notesStatus) {
    notesStatus.textContent = `Saved here • ${stamp()}`;
  }
}

function hydrateNotes() {
  if (!notesField) {
    return;
  }

  const value = localStorage.getItem(notesKey);
  if (value) {
    notesField.value = value;
    if (notesStatus) {
      notesStatus.textContent = "Pulled back up.";
    }
  }
}

function hydrateUiMode() {
  const mode = localStorage.getItem(uiKey);
  if (mode && MODE_CONTENT[mode]) {
    setMode(mode);
    return;
  }

  setMode("chill");
}

function updateActiveNav(sceneId) {
  const target = sceneToNavMap[sceneId] || sceneId;
  navLinks.forEach((link) => {
    const active = link.dataset.navLink === target;
    link.classList.toggle("is-active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setupSceneObserver() {
  if (!sections.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) {
        return;
      }

      updateActiveNav(visible.target.dataset.scene);
    },
    { threshold: [0.35, 0.6], rootMargin: "-24% 0px -36% 0px" },
  );

  sections.forEach((section) => observer.observe(section));
}

function setupVideoLazyLoad() {
  if (!lazyVideos.length) {
    return;
  }

  const loader = (video) => {
    video.querySelectorAll("source[data-src]").forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
    });
    video.load();
    video.removeAttribute("data-video-lazy");
  };

  if (!("IntersectionObserver" in window)) {
    lazyVideos.forEach(loader);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        loader(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: "220px 0px" },
  );

  lazyVideos.forEach((video) => observer.observe(video));
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

copyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    copyText(button.dataset.copy, button);
  });
});

if (saveNotesButton) {
  saveNotesButton.addEventListener("click", saveNotes);
}

if (notesField) {
  notesField.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveNotes();
    }
  });
}

hydrateUiMode();
hydrateNotes();
setupSceneObserver();
setupVideoLazyLoad();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
