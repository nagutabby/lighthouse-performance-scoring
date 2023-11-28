import fs from "fs";
import lighthouse, { Flags } from "lighthouse"
import * as chromeLauncher from "chrome-launcher"

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

const options: Flags = {
  logLevel: "info",
  output: "csv",
  port: chrome.port,
  onlyCategories: ["performance"],
  formFactor: "mobile",
  screenEmulation: {
    mobile: true,
    disabled: false
  },
  throttlingMethod: "devtools",
  throttling: {
    requestLatencyMs: 0,
    downloadThroughputKbps: 0,
    uploadThroughputKbps: 0
  },
  clearStorageTypes: ["file_systems", "shader_cache"]
};

const outputFile = "lighthouse.csv";

const baseURLs = [
  "https://tourist-information-base-production.up.railway.app/locations/",
  "https://tourist-information-pwa-production.up.railway.app/locations/"
]

const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
]

for (const prefecture of prefectures) {
  await lighthouse("https://tourist-information-pwa-production.up.railway.app/locations/" + prefecture, options)
}


const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
const rowFormatter = (row: any) => row.map((value: any) => {
  if (value !== null) {
    return escape(value.toString());
  };
})

for (const baseURL of baseURLs) {
  for (const prefecture of prefectures) {
    const targetURL = baseURL + prefecture
    const result = await lighthouse(targetURL, options)
    const lhr = result?.lhr;
    const output_array_title = ["isPWAEnabled", "prefecture", "audit", "auditScore", "displayValue", "description", "categoryScore"];
    let output_arrays: string[][] = []

    for (const category of Object.values(lhr!.categories)) {
      output_arrays.push(rowFormatter([
        baseURL === "https://tourist-information-pwa-production.up.railway.app/locations/" ? "true" : "false",
        prefecture,
        ,
        ,
        ,
        ,
        category.score,
      ]));
    }

    for (const category of Object.values(lhr!.categories)) {
      for (const auditRef of category.auditRefs) {
        const audit = lhr?.audits[auditRef.id];
        if (!audit) continue;
        output_arrays.push(rowFormatter([
          baseURL === "https://tourist-information-pwa-production.up.railway.app/locations/" ? "true" : "false",
          prefecture,
          auditRef.id,
          audit.score,
          audit.displayValue || '',
          audit.description,
          ,
        ]));
      }
    }

    if (!fs.existsSync(outputFile)) {
      fs.writeFileSync(outputFile, output_array_title.join(",") + "\n")
    }

    output_arrays.forEach((output_array) => {
      fs.appendFileSync(outputFile, output_array.join(",") + "\n");
    })
  }
}

chrome.kill();
