// Resolution-independent cleanup of the supplied traced logo.
// Keep originals under public/brand unchanged. The new paths preserve the
// trace's layout, cap height, bounding box, split A construction, and dot.
// Straight lines replace stair-step diagonals; cubic curves replace the
// stair-step bowls. No raster image, filter, or font substitution is used.
import fs from "node:fs";
const paths = {
  aRight:
    "M116 59C113.7 59 112 61.1 112 64C112 65.7 112.8 67.3 114 68.8L128 88H140L121 61.5C119.8 59.8 118.2 59 116 59Z",
  lastR:
    "M222.5 43H252C262.5 43 268 48.4 268 57.5C268 64.8 264 69.8 256 72L268 88H257L244 72H231V88H222.5ZM231 50V65H252C256.5 65 259 62.1 259 57.5S256.5 50 252 50Z",
  d: "M158 43H182.5C196.4 43 205 51.5 205 65.5S196.4 88 182.5 88H158ZM167 50V80H182C191.2 80 196 74.7 196 65S191.2 50 182 50Z",
  firstR:
    "M13 43H43.5C53.8 43 59 48.4 59 57.5C59 64.8 54.8 69.8 47 72L59 88H48L35 72H22V88H13ZM22 50V65H43.5C47.8 65 50 62.1 50 57.5S47.8 50 43.5 50Z",
  aLeft: "M109 37L115 49.2C115 50.1 114.6 50.8 114 51.5L86 88H73Z",
};
function build(color, mono = false, mark = false) {
  const names = mark
    ? ["aRight", "aLeft"]
    : ["aRight", "lastR", "d", "firstR", "aLeft"];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mark ? "72 33 69 60" : "9 33 264 60"}" role="img" aria-label="${mark ? "RADR mark" : "RADR"}">\n<title>${mark ? "RADR mark" : "RADR"}</title>\n${names.map((name) => `<path d="${paths[name]}" fill="${color}" fill-rule="evenodd"/>`).join("\n")}\n<circle cx="107" cy="81.5" r="6.1" fill="${mono ? color : "#00E676"}"/>\n</svg>\n`;
}
for (const [variant, color, mono] of [
  ["white", "#FFFFFF", false],
  ["black", "#0B1512", false],
  ["monochrome-white", "#FFFFFF", true],
  ["monochrome-black", "#000000", true],
]) {
  fs.writeFileSync(
    `public/brand/radr-wordmark-clean-${variant}.svg`,
    build(color, mono),
  );
  fs.writeFileSync(
    `public/brand/radr-mark-clean-${variant}.svg`,
    build(color, mono, true),
  );
}
