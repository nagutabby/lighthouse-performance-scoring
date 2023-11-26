import fs from "fs";
import lighthouse, { Flags } from "lighthouse"
import * as chromeLauncher from "chrome-launcher"

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
const options: Flags = { logLevel: "info", output: "json", onlyCategories: ["performance"], port: chrome.port };
const result = await lighthouse("https://example.com", options);
const outputFile = "lighthouse_report.json"

if (!fs.existsSync(outputFile)) {
  fs.writeFileSync(outputFile, "[]");
}

const file = fs.readFileSync(outputFile);
let reports: JSON[] = JSON.parse(file.toString());
if (result !== undefined) {
  reports.push(JSON.parse(result.report as string));
  fs.writeFileSync(outputFile, JSON.stringify(reports, null, 4));
}

await chrome.kill();
