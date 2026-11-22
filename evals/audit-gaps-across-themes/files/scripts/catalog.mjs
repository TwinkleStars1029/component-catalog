#!/usr/bin/env node
// 元件總表產生器（component-catalog skill）。只用 Node 內建模組，不需安裝套件。
//
//   node catalog.mjs                 依設定檔產生總表
//   node catalog.mjs --check         只檢查總表是否過期（過期 exit 1，可放進測試或 CI）
//   node catalog.mjs --config <路徑>  指定設定檔（預設：目前目錄的 component-catalog.config.json）
//
// 判斷規則（只看檔案，不執行程式）：
//   某風格「專屬」＝ <variantsDir>/<風格 id>/<物件名><副檔名> 存在
//   某風格「用基本款」＝沒有自己的檔案，退回 baseVariant 的檔案
//   「不畫」＝該檔案內容符合 nullPattern（例如整個元件只回傳 null）
//   「使用處」＝ sourceDirs 裡出現 <物件名 、<物件-kebab 或 .物件名 的檔案（不含物件自己的檔案與總表本身）
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve, dirname, sep, basename, extname } from "node:path";

const args = process.argv.slice(2);
const configArg = args.includes("--config") ? args[args.indexOf("--config") + 1] : "component-catalog.config.json";
const configPath = resolve(configArg);
if (!existsSync(configPath)) {
  console.error(`找不到設定檔：${configPath}\n請先建立 component-catalog.config.json（範本見 skill 的 assets/）。`);
  process.exit(2);
}
const root = dirname(configPath);
const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const cfg = JSON.parse(read(configPath));

const DEFAULTS = {
  extensions: [".tsx", ".jsx", ".ts", ".js", ".vue", ".svelte"],
  sourceDirs: ["src"],
  ignoreDirs: ["node_modules", "dist", "build", ".git", ".next", ".nuxt", "coverage"],
  nullPattern: null,
  shared: [],
};
const c = { ...DEFAULTS, ...cfg };
for (const key of ["output", "variantsDir", "baseVariant", "variants", "objects"]) {
  if (c[key] === undefined) {
    console.error(`設定檔缺少「${key}」`);
    process.exit(2);
  }
}
const variantsDir = join(root, c.variantsDir);
const outputPath = join(root, c.output);
const nullRe = c.nullPattern ? new RegExp(c.nullPattern) : null;
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toPosix = (p) => p.split(sep).join("/");
const linkFrom = (target) => toPosix(relative(dirname(outputPath), target)) || ".";

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => {
    if (c.ignoreDirs.includes(f)) return [];
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/** 某風格資料夾裡的某物件檔案（依 extensions 順序找第一個）。 */
function objectFile(variantId, obj) {
  for (const ext of c.extensions) {
    const p = join(variantsDir, variantId, obj + ext);
    if (existsSync(p)) return p;
  }
  return null;
}

const problems = [];
const warnings = [];
const objects = Object.keys(c.objects);
const ids = c.variants.map((v) => v.id);
if (!ids.includes(c.baseVariant)) problems.push(`baseVariant「${c.baseVariant}」不在 variants 裡`);
for (const obj of objects) {
  if (!objectFile(c.baseVariant, obj)) problems.push(`基本款缺少物件「${obj}」：${toPosix(join(c.variantsDir, c.baseVariant, obj))}.*`);
}
// 風格資料夾裡有、設定檔沒登記的物件（素材做了卻沒列進總表）
for (const v of ids) {
  const dir = join(variantsDir, v);
  if (!existsSync(dir)) {
    problems.push(`找不到風格資料夾：${toPosix(join(c.variantsDir, v))}`);
    continue;
  }
  for (const f of readdirSync(dir)) {
    const ext = extname(f);
    const name = basename(f, ext);
    if (c.extensions.includes(ext) && /^[A-Z]/.test(name) && !objects.includes(name)) {
      warnings.push(`${toPosix(join(c.variantsDir, v, f))} 看起來是物件，但設定檔沒登記`);
    }
  }
}
for (const d of fsDirs(variantsDir)) if (!ids.includes(d)) warnings.push(`風格資料夾「${d}」沒有列在 variants`);
function fsDirs(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((f) => statSync(join(dir, f)).isDirectory()) : [];
}

if (problems.length) {
  console.error(`設定或檔案有問題：\n- ${problems.join("\n- ")}`);
  process.exit(1);
}

// 每格狀態
const isNull = (p) => !!(nullRe && p && nullRe.test(read(p)));
const cells = {};
for (const obj of objects) {
  cells[obj] = {};
  const baseFile = objectFile(c.baseVariant, obj);
  for (const v of ids) {
    const own = objectFile(v, obj);
    if (own) cells[obj][v] = { state: isNull(own) ? "none" : "own", file: own };
    else cells[obj][v] = { state: isNull(baseFile) ? "none" : "fallback", file: baseFile };
  }
}

// 使用處
const sources = c.sourceDirs
  .flatMap((d) => walk(join(root, d)))
  .filter((p) => c.extensions.includes(extname(p)) && resolve(p) !== outputPath)
  .map((p) => ({ path: p, src: read(p) }));
const usage = {};
for (const obj of objects) {
  const re = new RegExp(`<${esc(obj)}[\\s/>]|<${esc(kebab(obj))}[\\s/>]|\\.${esc(obj)}\\b`);
  usage[obj] = sources
    .filter((f) => !(f.path.startsWith(variantsDir + sep) && basename(f.path, extname(f.path)) === obj))
    .filter((f) => re.test(f.src))
    .map((f) => f.path)
    .sort();
}

// 產生 Markdown
const LABEL = { own: "專屬", fallback: "用基本款", none: "不畫" };
const baseName = c.variants.find((v) => v.id === c.baseVariant).name;
const multi = c.variants.length > 1;
const L = [];
L.push(`# ${c.title ?? "元件總表"}`, "");
L.push("> 這份檔案由 component-catalog 的 catalog.mjs 自動產生，請勿手改。說明文字改設定檔，程式改了重新產生；過期時檢查會失敗。", "");
L.push("做畫面前先查這張表：要用的物件已經有了就直接用，不要在頁面裡另畫一份。找不到合適的，先問負責人，不要自己新增。", "");
L.push("## 一覽", "");
if (multi) L.push(`「專屬」＝這個風格有自己的版本；「用基本款」＝沒有專屬，自動用${baseName}；「不畫」＝這個風格刻意不畫。`, "");
L.push(`| 物件 | ${multi ? c.variants.map((v) => v.name).join(" | ") + " | " : ""}使用處 |`);
L.push(`|---|${multi ? c.variants.map(() => "---|").join("") : ""}---|`);
for (const obj of objects) {
  const used = usage[obj].length ? `${usage[obj].length} 處` : "**還沒有地方使用**";
  const cols = multi ? ids.map((v) => LABEL[cells[obj][v].state]).join(" | ") + " | " : "";
  L.push(`| [${c.objects[obj].name}](#${obj.toLowerCase()}) \`${obj}\` | ${cols}${used} |`);
}
L.push("", "## 各物件");
for (const obj of objects) {
  const info = c.objects[obj];
  L.push("", `<a id="${obj.toLowerCase()}"></a>`, `### ${info.name} \`${obj}\``, "");
  if (info.use) L.push(`用途：${info.use}`, "");
  if (info.example) L.push("```", info.example, "```", "");
  L.push("| 風格 | 程式 |", "|---|---|");
  for (const v of c.variants) {
    const cell = cells[obj][v.id];
    const note = cell.state === "fallback" ? `（沒有專屬，用${baseName}）` : cell.state === "none" ? "（不畫）" : "";
    L.push(`| ${v.name} | [${toPosix(relative(root, cell.file))}](${linkFrom(cell.file)})${note} |`);
  }
  L.push("");
  L.push(
    usage[obj].length
      ? `使用處：${usage[obj].map((p) => `[${toPosix(relative(root, p))}](${linkFrom(p)})`).join("、")}`
      : "使用處：**還沒有地方使用**",
  );
}
if (c.shared.length) {
  L.push("", "## 不是物件的共用設定", "", "這些每個風格只換數值，不換程式。", "", "| 項目 | 怎麼用 |", "|---|---|");
  for (const s of c.shared) L.push(`| ${s.name} | ${s.how} |`);
}
L.push("");
const text = L.join("\n");

for (const w of warnings) console.warn(`提醒：${w}`);
if (args.includes("--check")) {
  const current = existsSync(outputPath) ? read(outputPath) : "";
  if (current !== text) {
    console.error(`${toPosix(relative(root, outputPath))} 過期了，請重新產生（node catalog.mjs）`);
    process.exit(1);
  }
  console.log("元件總表是最新的");
} else {
  writeFileSync(outputPath, text);
  console.log(`已產生 ${toPosix(relative(root, outputPath))}`);
}
