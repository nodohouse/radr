type Rect = { left: number; top: number; right: number; bottom: number };
const clamp = (value: number) => Math.max(0, Math.min(1, value));

function distance(a: Rect, b: Rect) {
  return Math.hypot(
    Math.max(b.left - a.right, a.left - b.right, 0),
    Math.max(b.top - a.bottom, a.top - b.bottom, 0),
  );
}

/** Fade a complete label before it reaches foreground content; never crop its letters. */
export function createSignalClearance(field: HTMLElement) {
  const stage = field.parentElement!;
  const labels = Array.from(field.querySelectorAll<SVGGElement>(".rvc-label"));
  const textRanges: Range[] = [];
  const copy = document.querySelector(".rm-hero-copy");
  if (copy) {
    const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      textRanges.push(range);
    }
  }
  let previousTime = 0;
  return (now: number) => {
    if (now - previousTime < 30) return;
    const elapsed = Math.min(64, now - previousTime);
    previousTime = now;
    const frame = field.getBoundingClientRect();
    const face = stage.getAttribute("data-face");
    const protectedRects = [
      ...Array.from(
        document.querySelectorAll(
          ".rx-nav, .rm-loop, .rsc-full-demo, .rm-slogan-mark",
        ),
      ).map((node) => ({
        rect: node.getBoundingClientRect(),
        pad: 8,
        ramp: 26,
      })),
      ...textRanges.flatMap((range) =>
        Array.from(range.getClientRects()).map((rect) => ({
          rect,
          pad: 8,
          ramp: 26,
        })),
      ),
      ...Array.from(stage.querySelectorAll(".rsc-operation-peek")).map(
        (node) => ({ rect: node.getBoundingClientRect(), pad: 20, ramp: 36 }),
      ),
      ...Array.from(
        stage.querySelectorAll(`.rsc-face-${face} .rsc-tablet`),
      ).map((node) => ({
        rect: node.getBoundingClientRect(),
        pad: 4,
        ramp: 8,
      })),
    ].filter((item) => item.rect.width > 0 && item.rect.height > 0);
    // Batch geometry reads before opacity writes, without React updates per frame.
    const rows = labels.map((label) => ({
      rect: label.getBoundingClientRect(),
      clearance: label.closest<SVGGElement>(".rvc-clearance")!,
      active:
        Number(getComputedStyle(label.querySelector(".rvc-value")!).opacity) >
          0.08 &&
        getComputedStyle(label.closest(".rvc-signal")!).display !== "none",
    }));
    const reserved: Rect[] = [];
    const next = rows.map((row) => {
      const { rect, active, clearance } = row;
      if (!active) return { clearance, opacity: 0 };
      const edge = Math.min(
        rect.top - Math.max(8, frame.top + 4),
        Math.min(innerHeight - 8, frame.bottom - 4) - rect.bottom,
      );
      const inside =
        rect.left >= Math.max(12, frame.left) &&
        rect.right <= Math.min(innerWidth - 12, frame.right);
      let target = inside ? clamp(edge / 22) : 0;
      for (const obstacle of protectedRects) {
        target = Math.min(
          target,
          clamp((distance(rect, obstacle.rect) - obstacle.pad) / obstacle.ramp),
        );
      }
      for (const other of reserved) {
        target = Math.min(target, clamp((distance(rect, other) - 16) / 28));
      }
      const current = Number(clearance.style.opacity || 0);
      const opacity = Math.min(target, current + elapsed / 340);
      if (opacity > 0.06) reserved.push(rect);
      return { clearance, opacity };
    });
    for (const row of next)
      row.clearance.style.opacity = row.opacity.toFixed(3);
  };
}
