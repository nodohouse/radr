"use client";

/**
 * Compatibility shim: Ask RADR replaced the command palette UI.
 * Prefer importing AskRadr from ./ask/AskRadr.
 */
export { AskRadr as CommandPalette, AskRadr } from "./ask/AskRadr";
