import fs from "fs";
import lighthouse, { Flags } from "lighthouse"
import * as chromeLauncher from "chrome-launcher"

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

const options: Flags = { logLevel: "info", output: "csv", port: chrome.port, onlyCategories: ["performance"] };
const outputFile = "lighthouse.csv";

const result = await lighthouse("https://example.com", options);
const lhr = result?.lhr;
const output_array_title = ["requestedUrl", "category", "audit", "score", "displayValue", "description"];
let output_arrays: string[][] = []

const escape = value => `"${value.replace(/"/g, '""')}"`;
const rowFormatter = row => row.map(value => {
  if (value === null) return 'null';
  return value.toString();
}).map(escape);

for (const category of Object.values(lhr!.categories)) {
  for (const auditRef of category.auditRefs) {
    const audit = lhr?.audits[auditRef.id];
    if (!audit) continue;
    output_arrays.push(rowFormatter([
      lhr.requestedUrl,
      category.id,
      auditRef.id,
      audit.score,
      audit.displayValue || '',
      audit.description,
    ]));
  }
}

if (!fs.existsSync(outputFile)) {
  fs.writeFileSync(outputFile, output_array_title.join(",") + "\n")
}

output_arrays.forEach((output_array) => {
  fs.appendFileSync(outputFile, output_array.join(",") + "\n");
})


await chrome.kill();
