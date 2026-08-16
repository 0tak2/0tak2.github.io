import { getTvTransform } from "./tv-motion.js";
import { setupContactCard } from "./contact-card.js";

const container = document.querySelector("#hero-tv");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

setupContactCard(document.querySelector("[data-contact-card]"));

async function setupTv() {
  if (!container) return;

  try {
    const { createTvScene } = await import("./tv-scene.js");
    const scene = createTvScene(container, { reducedMotion });
    const hero = container.closest(".hero");
    const pointer = { x: 0, y: 0 };
    let introProgress = reducedMotion ? 1 : 0;
    let introFrame = 0;
    const introStartedAt = performance.now();

    document.body.classList.add("is-webgl");

    const update = () => {
      const rect = hero.getBoundingClientRect();
      const scrollProgress = -rect.top / Math.max(rect.height, 1);
      scene.update(getTvTransform({
        introProgress,
        scrollProgress,
        pointerX: pointer.x,
        pointerY: pointer.y,
        reducedMotion,
      }));
    };

    const animateIntro = (time) => {
      const linearProgress = Math.min((time - introStartedAt) / 950, 1);
      introProgress = 1 - (1 - linearProgress) ** 3;
      update();
      if (linearProgress < 1) introFrame = requestAnimationFrame(animateIntro);
    };

    const onPointerMove = (event) => {
      pointer.x = (event.clientX / innerWidth) * 2 - 1;
      pointer.y = (event.clientY / innerHeight) * 2 - 1;
      update();
    };
    const onScroll = () => update();

    addEventListener("pointermove", onPointerMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      scene.resize();
      update();
    });
    resizeObserver.observe(container);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => scene.setActive(entry.isIntersecting),
      { rootMargin: "20%" },
    );
    visibilityObserver.observe(container);

    if (reducedMotion) update();
    else introFrame = requestAnimationFrame(animateIntro);

    addEventListener("pagehide", () => {
      cancelAnimationFrame(introFrame);
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      scene.destroy();
    }, { once: true });
  } catch (error) {
    console.warn("3D 브라운관을 표시하지 못해 정적 화면으로 대체합니다.", error);
  }
}

setupTv();
