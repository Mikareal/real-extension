import { createModuleRunner } from "../../shared/module-runner.js";
import * as locatorDot from "./locator-dot.js";
import * as externalLinks from "./external-links.js";
import * as hytaleName from "./hytale-name.js";
import * as nameHistory from "./name-history.js";

export function createNameMCModule() {
  return createModuleRunner("namemc", [locatorDot, externalLinks, hytaleName, nameHistory]);
}
