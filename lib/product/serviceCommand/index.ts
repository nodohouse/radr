import { berlinServiceCommand } from "./berlinData";
import type { ServiceCommandModel } from "./types";

export * from "./types";

export function getServiceCommand(): ServiceCommandModel {
  return berlinServiceCommand;
}
