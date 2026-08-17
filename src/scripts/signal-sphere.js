import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const canvases = document.querySelectorAll("[data-signal-canvas]");
const tetrahedronCanvases = document.querySelectorAll("[data-tetrahedron-canvas]");
const waveCanvases = document.querySelectorAll("[data-wave-canvas]");
const networkCanvases = document.querySelectorAll("[data-network-canvas]");
const chars  = "░▒▓█▀▄▌▐│─┤├┴┬╭╮╰╯";

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".mobile-menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const hero = document.querySelector(".hero");
const animatedWord = document.querySelector(".word-reveal");
const themeChoices = document.querySelectorAll("[data-theme-choice]");
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: light)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

gsap.registerPlugin(ScrollTrigger);

const getCanvasRgb = () => {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--canvas-rgb").trim();
  return value || "244, 244, 239";
};

const getCanvasStrongAlpha = () => {
  const value = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--canvas-strong-alpha")
  );
  return Number.isFinite(value) ? value : 0.48;
};

const getSystemTheme = () => systemThemeQuery.matches ? "light" : "dark";
const getThemePreference = () => {
  const preference = document.documentElement.dataset.themePreference;
  return preference === "light" || preference === "dark" || preference === "system" ? preference : "system";
};

const syncThemeToggle = () => {
  const preference = getThemePreference();
  themeChoices.forEach((choice) => {
    const isActive = choice.dataset.themeChoice === preference;
    choice.setAttribute("aria-checked", String(isActive));
  });
};

syncThemeToggle();

const applyThemePreference = (preference) => {
  const nextPreference = preference === "light" || preference === "dark" ? preference : "system";
  document.documentElement.dataset.themePreference = nextPreference;
  document.documentElement.dataset.theme = nextPreference === "system" ? getSystemTheme() : nextPreference;

  if (nextPreference === "system") {
    localStorage.removeItem("quatrons-theme");
  } else {
    localStorage.setItem("quatrons-theme", nextPreference);
  }

  syncThemeToggle();
};

themeChoices.forEach((choice) => {
  choice.addEventListener("click", () => {
    applyThemePreference(choice.dataset.themeChoice);
  });
});

systemThemeQuery.addEventListener("change", () => {
  if (getThemePreference() === "system") {
    document.documentElement.dataset.theme = getSystemTheme();
    syncThemeToggle();
  }
});

if (header) {
  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
  document.addEventListener("astro:before-swap", () => {
    window.removeEventListener("scroll", syncHeader);
  });
}

if (menuToggle && header && mobileMenu) {
  const setMenuOpen = (isOpen) => {
    header.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    document.documentElement.classList.toggle("menu-locked", isOpen);
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(!header.classList.contains("menu-open"));
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });
}

if (hero) {
  window.requestAnimationFrame(() => hero.classList.add("is-visible"));
}

if (animatedWord) {
  const text = animatedWord.textContent || "";
  animatedWord.textContent = "";
  Array.from(text).forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.style.animationDelay = `${index * 50}ms`;
    animatedWord.append(span);
  });
}

if (reducedMotionQuery.matches) {
  document.querySelector("[data-splash-screen]")?.remove();
  document.querySelectorAll(".scroll-reveal").forEach((item) => item.classList.add("is-visible"));
  const companyGame = document.querySelector("[data-company-game]");
  if (companyGame) {
    companyGame.style.setProperty("--company-arc-alpha", "0.42");
    companyGame.style.setProperty("--company-arc-scale", "1");
    companyGame.style.setProperty("--company-core-alpha", "1");
    companyGame.style.setProperty("--company-root-alpha", "1");
    companyGame.querySelectorAll(".root-line").forEach((line) => {
      line.style.strokeDashoffset = "0";
    });
    const proof = companyGame.querySelector(".company-game-proof");
    if (proof) {
      proof.style.opacity = "1";
      proof.style.transform = "translateY(0)";
    }
  }
} else {
  const gsapContext = gsap.context(() => {
    const splash = document.querySelector("[data-splash-screen]");
    if (splash) {
      const splashWord = splash.querySelector(".splash-word");
      const brandWord = document.querySelector(".site-header .brand span:first-child");
      const splashLetters = splash.querySelectorAll(".splash-letter");

      gsap.set(".site-header .brand", { autoAlpha: 0 });
      gsap.set(splashWord, { autoAlpha: 0 });
      gsap.set(splashLetters, { autoAlpha: 0, y: 18, filter: "blur(14px)" });
      gsap.set(".signal-stage", { autoAlpha: 0, xPercent: 34, scale: 0.92 });

      gsap.timeline({ delay: 0.12 })
        .fromTo(".splash-symbol", { autoAlpha: 0, scale: 0.82, filter: "blur(16px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.55, ease: "power3.out" })
        .to(".splash-loader i", { scaleX: 1, duration: 1.05, ease: "power2.inOut" }, "-=0.1")
        .to(".splash-symbol", { autoAlpha: 0, scale: 0.74, filter: "blur(12px)", duration: 0.34, ease: "power2.in" }, "-=0.18")
        .set(splashWord, { autoAlpha: 1 }, "-=0.08")
        .to(splashLetters, { autoAlpha: 1, y: 0, filter: "blur(0px)", stagger: 0.055, duration: 0.42, ease: "power3.out" }, "-=0.05")
        .to(".splash-loader", { autoAlpha: 0, y: 8, duration: 0.28, ease: "power2.out" }, "<")
        .to(splashWord, {
          x: () => {
            if (!brandWord || !splashWord) return 0;
            const from = splashWord.getBoundingClientRect();
            const to = brandWord.getBoundingClientRect();
            return to.left + to.width / 2 - (from.left + from.width / 2);
          },
          y: () => {
            if (!brandWord || !splashWord) return 0;
            const from = splashWord.getBoundingClientRect();
            const to = brandWord.getBoundingClientRect();
            return to.top + to.height / 2 - (from.top + from.height / 2);
          },
          scale: () => {
            if (!brandWord || !splashWord) return 0.28;
            return brandWord.getBoundingClientRect().width / splashWord.getBoundingClientRect().width;
          },
          duration: 0.9,
          ease: "power4.inOut"
        }, "+=0.2")
        .to(".site-header .brand", { autoAlpha: 1, duration: 0.12, ease: "none" }, "-=0.12")
        .to(splashWord, { autoAlpha: 0, duration: 0.12, ease: "none" }, "<")
        .to(splash, { autoAlpha: 0, duration: 0.36, ease: "power2.out" }, "<")
        .fromTo(".signal-stage", { autoAlpha: 0, xPercent: 34, scale: 0.92 }, { autoAlpha: 0.4, xPercent: 0, scale: 1, duration: 1.05, ease: "power4.out" }, "-=0.05")
        .set(splash, { display: "none" });
    }

    gsap.to("body", {
      "--smoke-x": 36,
      "--smoke-y": -28,
      ease: "none",
      scrollTrigger: {
        start: 0,
        end: "max",
        scrub: 1
      }
    });

    gsap.timeline({
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.9
      }
    })
      .to(".hero-copy h1", { yPercent: -12, autoAlpha: 0.16, ease: "none" }, 0)
      .to(".hero-row", { yPercent: -22, autoAlpha: 0, ease: "none" }, 0)
      .to(".signal-stage", { xPercent: 18, scale: 1.08, autoAlpha: 0.16, ease: "none" }, 0)
      .to(".hero-stats-marquee", { y: 70, autoAlpha: 0, ease: "none" }, 0);

    const companyGame = document.querySelector("[data-company-game]");
    if (companyGame) {
      const introTitle = companyGame.querySelector(".company-game-intro h2");
      const introPhrases = companyGame.querySelectorAll(".company-intro-phrase");
      const core = companyGame.querySelector(".company-core");
      const coreWord = companyGame.querySelector(".company-core-word");
      const rootLines = companyGame.querySelectorAll(".root-line");
      const roots = companyGame.querySelectorAll(".company-root");
      const proof = companyGame.querySelector(".company-game-proof");
      const proofItems = companyGame.querySelectorAll(".company-game-proof dt, .company-game-proof dd, .company-game-proof p");

      gsap.set(companyGame, {
        "--company-arc-alpha": 0,
        "--company-arc-scale": 0.84,
        "--company-core-alpha": 0,
        "--company-root-alpha": 0
      });
      gsap.set(introTitle, { autoAlpha: 1 });
      gsap.set(introPhrases, { autoAlpha: 0, yPercent: 54, filter: "blur(18px)" });
      gsap.set(introPhrases[0], { autoAlpha: 1, yPercent: 0, filter: "blur(0px)" });
      gsap.set(core, { autoAlpha: 0, scale: 0.94 });
      gsap.set(coreWord, { autoAlpha: 0, scale: 0.82, filter: "blur(18px)" });
      gsap.set(rootLines, { strokeDashoffset: 1 });
      gsap.set(roots, { autoAlpha: 0, y: 28, filter: "blur(14px)" });
      gsap.set(proof, { autoAlpha: 0, y: 40, scale: 0.98, filter: "blur(18px)" });
      gsap.set(proofItems, { autoAlpha: 0, y: 26 });

      gsap.timeline({
        scrollTrigger: {
          trigger: companyGame,
          start: "top top",
          end: () => `+=${window.innerHeight * 3.2}`,
          scrub: 0.9,
          pin: companyGame,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      })
        .addLabel("four")
        .to(introPhrases[0], { autoAlpha: 0, yPercent: -62, filter: "blur(18px)", duration: 0.16, ease: "none" }, "four+=0.14")
        .addLabel("engine")
        .to(introPhrases[1], { autoAlpha: 1, yPercent: 0, filter: "blur(0px)", duration: 0.16, ease: "none" }, "engine")
        .to(introPhrases[1], { autoAlpha: 0, yPercent: -62, filter: "blur(18px)", duration: 0.16, ease: "none" }, "engine+=0.2")
        .to(introTitle, { autoAlpha: 0, duration: 0.04, ease: "none" }, "engine+=0.34")
        .addLabel("brand")
        .to(companyGame, { "--company-arc-alpha": 0.42, "--company-arc-scale": 1, duration: 0.22, ease: "none" }, "brand-=0.08")
        .to(companyGame, { "--company-core-alpha": 1, duration: 0.12, ease: "none" }, "brand")
        .to(core, { autoAlpha: 1, scale: 1, duration: 0.18, ease: "none" }, "brand")
        .to(coreWord, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.18, ease: "none" }, "brand")
        .addLabel("roots", "+=0.08")
        .to(rootLines, { strokeDashoffset: 0, stagger: 0.04, duration: 0.28, ease: "none" }, "roots")
        .to(companyGame, { "--company-root-alpha": 1, duration: 0.18, ease: "none" }, "roots+=0.04")
        .to(roots, { autoAlpha: 1, y: 0, filter: "blur(0px)", stagger: 0.04, duration: 0.24, ease: "none" }, "roots+=0.04")
        .addLabel("proof", "+=0.16")
        .to(coreWord, { scale: 0.92, autoAlpha: 0.28, duration: 0.18, ease: "none" }, "proof")
        .to(rootLines, { autoAlpha: 0.12, duration: 0.16, ease: "none" }, "proof")
        .to(roots, { autoAlpha: 0, y: -24, filter: "blur(12px)", stagger: 0.02, duration: 0.16, ease: "none" }, "proof")
        .to(proof, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.2, ease: "none" }, "proof+=0.08")
        .to(proofItems, { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.18, ease: "none" }, "proof+=0.12")
        .to(companyGame, { "--company-arc-alpha": 0.16, "--company-arc-scale": 1.14, duration: 0.24, ease: "none" }, "proof+=0.14")
        .addLabel("out", "+=0.28")
        .to(proof, { autoAlpha: 0, y: -46, filter: "blur(16px)", duration: 0.16, ease: "none" }, "out");
    }

    gsap.utils.toArray(".scroll-reveal").forEach((section) => {
      section.classList.add("is-visible");
      const revealTargets = section.querySelectorAll(
        ":scope > :not(.cinematic-word):not(.product-service-list):not(.product-mega-title), .signal-timeline > div, .company-stat-grid > div, .company-note-grid article, .method-grid article, .proof-grid article, .faq-list details"
      );
      const productTitle = section.querySelector(".product-mega-title");
      const productRows = section.querySelectorAll(".product-service-row");
      const word = section.querySelector(".cinematic-word");
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 92%",
          end: "bottom 8%",
          scrub: 0.85,
          invalidateOnRefresh: true
        }
      });

      timeline
        .fromTo(section, { autoAlpha: 0.18, y: 90, scale: 0.982 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: "none" }, 0)
        .fromTo(revealTargets, { autoAlpha: 0, y: 64, filter: "blur(18px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", stagger: 0.025, duration: 0.28, ease: "none" }, 0.04)
        .fromTo(productTitle, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: "none" }, 0.02)
        .fromTo(productRows, { autoAlpha: 0, y: 58 }, { autoAlpha: 1, y: 0, stagger: 0.035, duration: 0.3, ease: "none" }, 0.06)
        .to(section, { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: "none" }, 0.34)
        .to(revealTargets, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.42, ease: "none" }, 0.34)
        .to(productTitle, { autoAlpha: 1, y: 0, duration: 0.42, ease: "none" }, 0.34)
        .to(productRows, { autoAlpha: 1, y: 0, duration: 0.42, ease: "none" }, 0.34)
        .to(revealTargets, { autoAlpha: 0, y: -70, filter: "blur(16px)", stagger: 0.012, duration: 0.24, ease: "none" }, 0.76)
        .to(productTitle, { autoAlpha: 0, y: -46, duration: 0.24, ease: "none" }, 0.76)
        .to(productRows, { autoAlpha: 0, y: -56, stagger: 0.01, duration: 0.24, ease: "none" }, 0.76)
        .to(section, { autoAlpha: 0.16, y: -86, scale: 0.986, duration: 0.22, ease: "none" }, 0.78);

      if (word) {
        timeline.fromTo(word, { xPercent: -6, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 0.7, duration: 0.32, ease: "none" }, 0)
          .to(word, { xPercent: 7, autoAlpha: 0, duration: 0.24, ease: "none" }, 0.76);
      }
    });

    ScrollTrigger.matchMedia({
      "(min-width: 1024px)": () => {
        const labVisual = document.querySelector(".signal-lab-visual");
        if (!labVisual) return undefined;
        const trigger = ScrollTrigger.create({
          trigger: ".signal-lab",
          start: "top 12%",
          end: "bottom 72%",
          pin: labVisual,
          pinSpacing: false,
          anticipatePin: 1
        });
        return () => trigger.kill();
      }
    });

    gsap.fromTo(".footer-mega-word",
      { autoAlpha: 0, xPercent: 10, yPercent: 10 },
      {
        autoAlpha: 1,
        xPercent: 0,
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".site-footer",
          start: "top 92%",
          end: "bottom bottom",
          scrub: 0.8
        }
      }
    );
  });

  document.addEventListener("astro:before-swap", () => {
    gsapContext.revert();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  });
}

document.querySelectorAll("[data-spotlight]").forEach((panel) => {
  panel.addEventListener("pointermove", (event) => {
    const rect = panel.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    panel.style.setProperty("--mx", `${x * 100}%`);
    panel.style.setProperty("--my", `${y * 100}%`);
    panel.style.setProperty("--tilt-x", `${(x - 0.5) * 4}`);
    panel.style.setProperty("--tilt-y", `${(y - 0.5) * 4}`);
  });

  panel.addEventListener("pointerleave", () => {
    panel.style.setProperty("--tilt-x", "0");
    panel.style.setProperty("--tilt-y", "0");
  });
});

const revealItems = document.querySelectorAll(".scroll-reveal");

const syncScrollMotion = () => {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  document.documentElement.style.setProperty("--scroll-progress", `${Math.min(1, window.scrollY / maxScroll)}`);

  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    const distance = Math.max(-1, Math.min(1, (center - viewportCenter) / window.innerHeight));
    item.style.setProperty("--section-drift", `${distance * 64}px`);
    item.style.setProperty("--section-visible", `${Math.max(0, 1 - Math.abs(distance))}`);
  });
};

syncScrollMotion();
window.addEventListener("scroll", syncScrollMotion, { passive: true });
window.addEventListener("resize", syncScrollMotion);
document.addEventListener("astro:before-swap", () => {
  window.removeEventListener("scroll", syncScrollMotion);
  window.removeEventListener("resize", syncScrollMotion);
});

document.querySelectorAll(".pill-button, .ghost-button, .method-grid article, .company-note-grid article, .signal-chip").forEach((item) => {
  item.classList.add("magnetic");
  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 14;
    item.style.setProperty("--magnet-x", `${x}px`);
    item.style.setProperty("--magnet-y", `${y}px`);
  });
  item.addEventListener("pointerleave", () => {
    item.style.setProperty("--magnet-x", "0px");
    item.style.setProperty("--magnet-y", "0px");
  });
});

document.querySelectorAll("[data-product-showcase]").forEach((showcase) => {
  const rows = showcase.querySelectorAll("[data-product-row]");
  rows.forEach((row) => {
    let animationTimer = 0;
    const setActive = (event) => {
      const rect = row.getBoundingClientRect();
      const enterFromRight = event?.clientX > rect.left + rect.width / 2;
      row.style.setProperty("--title-enter-x", enterFromRight ? "0.62em" : "-0.62em");
      rows.forEach((item) => item.classList.toggle("is-active", item === row));
      row.classList.remove("is-animating");
      void row.offsetWidth;
      row.classList.add("is-animating");
      window.clearTimeout(animationTimer);
      animationTimer = window.setTimeout(() => {
        row.classList.remove("is-animating");
      }, 620 + row.querySelectorAll(".product-title-letter").length * 22 + 80);
    };

    row.addEventListener("pointerenter", setActive);
    row.addEventListener("focus", setActive);
    row.addEventListener("pointermove", (event) => {
      const rect = showcase.getBoundingClientRect();
      showcase.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      showcase.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });
  });
});

const railLinks = Array.from(document.querySelectorAll("[data-scroll-link]"));
if (railLinks.length) {
  const syncRail = () => {
    const current = railLinks
      .map((link) => {
        const id = link.getAttribute("href")?.slice(1);
        const section = id ? document.getElementById(id) : null;
        return section ? { link, top: Math.abs(section.getBoundingClientRect().top - 120) } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.top - b.top)[0];

    railLinks.forEach((link) => link.classList.toggle("is-active", link === current?.link));
  };

  syncRail();
  window.addEventListener("scroll", syncRail, { passive: true });
  window.addEventListener("resize", syncRail);
  document.addEventListener("astro:before-swap", () => {
    window.removeEventListener("scroll", syncRail);
    window.removeEventListener("resize", syncRail);
  });
}

const rotate = (point, time) => {
  const yAngle = time * 0.3;
  const xAngle = time * 0.2;

  let x = point.x * Math.cos(yAngle) - point.z * Math.sin(yAngle);
  let z = point.x * Math.sin(yAngle) + point.z * Math.cos(yAngle);
  let y = point.y;

  const nextY = y * Math.cos(xAngle) - z * Math.sin(xAngle);
  z = y * Math.sin(xAngle) + z * Math.cos(xAngle);
  y = nextY;

  return { x, y, z };
};

canvases.forEach((canvas) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let frame = 0;
  let time = 0;
  let dpr = 1;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    pointer.active = true;
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  const render = () => {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width * 0.5;
    const centerY = rect.height * 0.5;
    const radius = Math.min(rect.width, rect.height) * 0.525;
    const points = [];

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.font = `${Math.max(9, Math.min(13, rect.width / 55))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    pointer.x += ((pointer.active ? pointer.tx : 0) - pointer.x) * 0.08;
    pointer.y += ((pointer.active ? pointer.ty : 0) - pointer.y) * 0.08;

    for (let phi = 0; phi < Math.PI * 2; phi += 0.15) {
      for (let theta = 0; theta < Math.PI; theta += 0.15) {
        const wave = Math.sin(phi * 3 + time * 1.2) * 0.01;
        const raw = {
          x: Math.sin(theta) * Math.cos(phi + time * 0.5) * (1 + wave),
          y: Math.sin(theta) * Math.sin(phi + time * 0.5) * (1 + wave),
          z: Math.cos(theta)
        };
        const point = rotate(raw, time + pointer.x * 1.6 + pointer.y * 0.7);
        point.x += pointer.x * point.z * 0.18;
        point.y += pointer.y * point.z * 0.18;
        const depth = (point.z + 1) / 2;
        const rim = Math.abs(Math.sin(theta));
        const charIndex = Math.max(
          0,
          Math.min(chars.length - 1, Math.floor(depth * (chars.length - 1)))
        );

        points.push({
          x: centerX + point.x * radius,
          y: centerY + point.y * radius,
          z: point.z,
          char: chars[charIndex],
          alpha: 0.05 + depth * 0.34 + rim * 0.08
        });
      }
    }

    for (let phi = 0; phi < Math.PI * 2; phi += 0.14) {
      const theta = Math.PI / 2 + Math.sin(phi * 2 + time) * 0.08;
      const raw = {
        x: Math.sin(theta) * Math.cos(phi + time * 0.42),
        y: Math.sin(theta) * Math.sin(phi + time * 0.42),
        z: Math.cos(theta)
      };
      const point = rotate(raw, time + pointer.x * 1.6 + pointer.y * 0.7);
      point.x += pointer.x * point.z * 0.18;
      point.y += pointer.y * point.z * 0.18;
      const depth = (point.z + 1) / 2;

      points.push({
        x: centerX + point.x * radius * 1.02,
        y: centerY + point.y * radius * 1.02,
        z: point.z + 0.02,
        char: "·",
        alpha: 0.1 + depth * 0.22
      });
    }

    points.sort((a, b) => a.z - b.z);
    points.forEach((point) => {
      if (point.alpha < 0.04 && point.z < -0.3) return;
      ctx.fillStyle = `rgba(${getCanvasRgb()}, ${Math.min(getCanvasStrongAlpha(), point.alpha)})`;
      ctx.fillText(point.char, point.x, point.y);
    });

    const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.3);
    glow.addColorStop(0, `rgba(${getCanvasRgb()}, 0.05)`);
    glow.addColorStop(0.5, `rgba(${getCanvasRgb()}, 0.02)`);
    glow.addColorStop(1, `rgba(${getCanvasRgb()}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    time += 0.02;
    frame = window.requestAnimationFrame(render);
  };

  resize();
  render();
  window.addEventListener("resize", resize);
  document.addEventListener("astro:before-swap", () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
  });
});

tetrahedronCanvases.forEach((canvas) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let frame = 0;
  let time = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };

  const vertices = [
    { x: 0, y: 1, z: 0 },
    { x: -0.943, y: -0.333, z: -0.5 },
    { x: 0.943, y: -0.333, z: -0.5 },
    { x: 0, y: -0.333, z: 1 }
  ];

  const edges = [
    [0, 1], [0, 2], [0, 3],
    [1, 2], [2, 3], [3, 1]
  ];

  const faces = [
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 1],
    [1, 3, 2]
  ];

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const rotateY = (point, angle) => ({
    x: point.x * Math.cos(angle) - point.z * Math.sin(angle),
    y: point.y,
    z: point.x * Math.sin(angle) + point.z * Math.cos(angle)
  });

  const rotateX = (point, angle) => ({
    x: point.x,
    y: point.y * Math.cos(angle) - point.z * Math.sin(angle),
    z: point.y * Math.sin(angle) + point.z * Math.cos(angle)
  });

  const rotateZ = (point, angle) => ({
    x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
    y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
    z: point.z
  });

  const rotateTetraPoint = (point) => {
    let next = rotateY(point, time * 0.4 + pointer.x * 1.4);
    next = rotateX(next, time * 0.3 - pointer.y * 1.2);
    return rotateZ(next, time * 0.2 + (pointer.x - pointer.y) * 0.35);
  };

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    pointer.active = true;
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  const render = () => {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const scale = Math.min(rect.width, rect.height) * 0.7;
    const points = [];

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.font = "18px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    pointer.x += ((pointer.active ? pointer.tx : 0) - pointer.x) * 0.09;
    pointer.y += ((pointer.active ? pointer.ty : 0) - pointer.y) * 0.09;

    edges.forEach(([i, j]) => {
      const v1 = vertices[i];
      const v2 = vertices[j];

      for (let t = 0; t <= 1; t += 0.05) {
        const point = rotateTetraPoint({
          x: v1.x + (v2.x - v1.x) * t,
          y: v1.y + (v2.y - v1.y) * t,
          z: v1.z + (v2.z - v1.z) * t
        });
        const depth = (point.z + 1.5) / 3;
        const charIndex = Math.floor(depth * (chars.length - 1));

        points.push({
          x: centerX + point.x * scale,
          y: centerY - point.y * scale,
          z: point.z,
          char: chars[Math.min(charIndex, chars.length - 1)]
        });
      }
    });

    faces.forEach(([i, j, k]) => {
      const v1 = vertices[i];
      const v2 = vertices[j];
      const v3 = vertices[k];

      for (let u = 0; u <= 1; u += 0.12) {
        for (let v = 0; v <= 1 - u; v += 0.12) {
          const w = 1 - u - v;
          const point = rotateTetraPoint({
            x: v1.x * u + v2.x * v + v3.x * w,
            y: v1.y * u + v2.y * v + v3.y * w,
            z: v1.z * u + v2.z * v + v3.z * w
          });
          const depth = (point.z + 1.5) / 3;
          const charIndex = Math.floor(depth * (chars.length - 1));

          points.push({
            x: centerX + point.x * scale,
            y: centerY - point.y * scale,
            z: point.z,
            char: chars[Math.min(charIndex, chars.length - 1)]
          });
        }
      }
    });

    points.sort((a, b) => a.z - b.z);
    points.forEach((point) => {
      const alpha = 0.12 + (point.z + 1.5) * 0.2;
      ctx.fillStyle = `rgba(${getCanvasRgb()}, ${Math.min(alpha, getCanvasStrongAlpha())})`;
      ctx.fillText(point.char, point.x, point.y);
    });

    time += 0.015;
    frame = window.requestAnimationFrame(render);
  };

  resize();
  render();
  window.addEventListener("resize", resize);
  document.addEventListener("astro:before-swap", () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
  });
});

waveCanvases.forEach((canvas) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const waveChars = "·∘○◯◌●◉";
  let frame = 0;
  let time = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const render = () => {
    const rect = canvas.getBoundingClientRect();
    const cols = Math.floor(rect.width / 20);
    const rows = Math.floor(rect.height / 20);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const px = (x + 0.5) * (rect.width / cols);
        const py = (y + 0.5) * (rect.height / rows);
        const wave1 = Math.sin(x * 0.2 + time * 2) * Math.cos(y * 0.15 + time);
        const wave2 = Math.sin((x + y) * 0.1 + time * 1.5);
        const wave3 = Math.cos(x * 0.1 - y * 0.1 + time * 0.8);
        const normalized = ((wave1 + wave2 + wave3) / 3 + 1) / 2;
        const charIndex = Math.floor(normalized * (waveChars.length - 1));
        const alpha = 0.1 + normalized * 0.42;

        ctx.fillStyle = `rgba(${getCanvasRgb()}, ${Math.min(alpha, getCanvasStrongAlpha())})`;
        ctx.fillText(waveChars[charIndex], px, py);
      }
    }

    time += 0.03;
    frame = window.requestAnimationFrame(render);
  };

  resize();
  render();
  window.addEventListener("resize", resize);
  document.addEventListener("astro:before-swap", () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
  });
});

networkCanvases.forEach((canvas) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const score = document.querySelector("[data-network-score]");
  const chips = document.querySelectorAll("[data-network-mode]");
  const modeSettings = {
    style: { bias: 0.18, speed: 0.55, label: 84 },
    markets: { bias: 0.42, speed: 0.8, label: 91 },
    growth: { bias: 0.68, speed: 1.05, label: 96 }
  };
  const nodes = Array.from({ length: 34 }, (_, index) => ({
    x: (Math.sin(index * 17.3) * 0.5 + 0.5) * 0.82 + 0.09,
    y: (Math.cos(index * 9.7) * 0.5 + 0.5) * 0.76 + 0.12,
    size: 2 + (index % 5),
    phase: index * 0.37,
    group: index % 3
  }));

  let frame = 0;
  let time = 0;
  let mode = "style";
  const pointer = { x: 0.5, y: 0.5, active: false };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const setMode = (nextMode) => {
    mode = modeSettings[nextMode] ? nextMode : "style";
    chips.forEach((chip) => chip.classList.toggle("is-active", chip.dataset.networkMode === mode));
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => setMode(chip.dataset.networkMode));
  });

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width;
    pointer.y = (event.clientY - rect.top) / rect.height;
    pointer.active = true;
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  const render = () => {
    const rect = canvas.getBoundingClientRect();
    const rgb = getCanvasRgb();
    const setting = modeSettings[mode];
    const rendered = nodes.map((node) => {
      const wave = Math.sin(time * setting.speed + node.phase) * 0.024;
      const modePull = (node.group - 1) * setting.bias * 0.04;
      const dx = pointer.x - node.x;
      const dy = pointer.y - node.y;
      const distance = Math.max(0.001, Math.hypot(dx, dy));
      const pull = pointer.active ? Math.max(0, 0.18 - distance) * 0.55 : 0;

      return {
        x: (node.x + wave + modePull + dx * pull) * rect.width,
        y: (node.y + Math.cos(time * 0.75 + node.phase) * 0.018 + dy * pull) * rect.height,
        size: node.size,
        group: node.group,
        distance
      };
    });

    ctx.clearRect(0, 0, rect.width, rect.height);

    rendered.forEach((a, i) => {
      rendered.slice(i + 1).forEach((b) => {
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > 155) return;
        const alpha = (1 - distance / 155) * 0.18;
        ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });
    });

    rendered.forEach((node, index) => {
      const near = pointer.active ? Math.max(0, 1 - node.distance / 0.24) : 0;
      const char = chars[(index + Math.floor(time * 10)) % chars.length];
      ctx.fillStyle = `rgba(${rgb}, ${0.22 + near * 0.42})`;
      ctx.font = `${12 + node.size + near * 7}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(char, node.x, node.y);
    });

    const nextScore = Math.round(setting.label + (pointer.active ? Math.sin(pointer.x * Math.PI) * 3 : 0));
    if (score) score.textContent = `${nextScore}%`;

    time += reducedMotionQuery.matches ? 0.004 : 0.018;
    frame = window.requestAnimationFrame(render);
  };

  resize();
  setMode(mode);
  render();
  window.addEventListener("resize", resize);
  document.addEventListener("astro:before-swap", () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
  });
});
