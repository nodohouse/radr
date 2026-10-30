import type { Locator, Page } from "@playwright/test";

const TOLERANCE_PX = 2;

/** Bounding rect fully inside viewport (with tolerance). */
export async function assertFullyVisible(
  locator: Locator,
  opts?: { container?: Locator },
): Promise<void> {
  const box = await locator.boundingBox();
  if (!box || box.width <= 0 || box.height <= 0) {
    throw new Error("assertFullyVisible: zero-size or missing box");
  }

  if (opts?.container) {
    const cbox = await opts.container.boundingBox();
    if (!cbox) throw new Error("assertFullyVisible: container missing");
    if (box.x < cbox.x - TOLERANCE_PX || box.y < cbox.y - TOLERANCE_PX) {
      throw new Error("assertFullyVisible: clipped above/left of container");
    }
    if (
      box.x + box.width > cbox.x + cbox.width + TOLERANCE_PX ||
      box.y + box.height > cbox.y + cbox.height + TOLERANCE_PX
    ) {
      throw new Error("assertFullyVisible: clipped below/right of container");
    }
    return;
  }

  const viewport = locator.page().viewportSize();
  if (!viewport) throw new Error("assertFullyVisible: no viewport");
  if (box.y < -TOLERANCE_PX) {
    throw new Error("assertFullyVisible: above viewport");
  }
  if (box.y + box.height > viewport.height + TOLERANCE_PX) {
    throw new Error("assertFullyVisible: below viewport");
  }
  if (box.x < -TOLERANCE_PX || box.x + box.width > viewport.width + TOLERANCE_PX) {
    throw new Error("assertFullyVisible: horizontal clip");
  }
}

/** Critical text nodes must not overflow their box (unless scrollable). */
export async function assertTextFits(locator: Locator): Promise<void> {
  const overflow = await locator.evaluate((el) => {
    const scrollable =
      el.closest("[data-scrollable='true']") != null ||
      getComputedStyle(el).overflowX === "auto" ||
      getComputedStyle(el).overflowY === "auto";
    if (scrollable) return null;
    return {
      w: el.scrollWidth > el.clientWidth + 1,
      h: el.scrollHeight > el.clientHeight + 1,
    };
  });
  if (overflow?.w || overflow?.h) {
    throw new Error(
      `assertTextFits: overflow w=${overflow.w} h=${overflow.h}`,
    );
  }
}

export async function assertNoBodyHorizontalOverflow(page: Page): Promise<void> {
  const bad = await page.evaluate((tol) => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + tol;
  }, TOLERANCE_PX);
  if (bad) {
    throw new Error("assertNoBodyHorizontalOverflow: body scrollWidth exceeds clientWidth");
  }
}
