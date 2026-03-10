/**
 * 玲依四格 / 多场景 Replicate 出图脚本
 * 用法：配置 REPLICATE_API_TOKEN，修改下方 referenceImagePath、yamlDir 后执行 node gen.js [场景编号...]
 * 场景编号从 1 开始，不传则处理全部 YAML。
 */
import Replicate from "replicate";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN 未配置，无法调用 Replicate 接口");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 公共参考图（角色设定），请按本地路径修改
const referenceImagePath = path.join(__dirname, "rule", "maoniang.png");
const referenceImage = await readFile(referenceImagePath);

// YAML 目录：按文件名顺序处理，请按本地路径修改
const yamlDir = path.join(__dirname, "3.10", "video1-ai-scenes");

const allFiles = await readdir(yamlDir);
const yamlFiles = allFiles
  .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
  .sort();

if (yamlFiles.length === 0) {
  throw new Error(`目录中没有找到 YAML 文件：${yamlDir}`);
}

// 可选：通过命令行参数指定要重新生成的场景编号（从 1 开始）
// 用法示例：
//   node gen.js 1       只生成第 1 个场景
//   node gen.js 2 3     只生成第 2、3 个场景
const cliSceneArgs = process.argv.slice(2);
let allowedIndexSet = null;

if (cliSceneArgs.length > 0) {
  const indices = cliSceneArgs
    .map((v) => Number.parseInt(v, 10))
    .filter(
      (n) => Number.isFinite(n) && n >= 1 && n <= yamlFiles.length,
    );

  if (indices.length === 0) {
    console.warn(
      `命令行参数中没有合法的场景编号（1-${yamlFiles.length}），将处理全部场景`,
    );
  } else {
    const seen = new Set();
    const normalized = indices
      .filter((idx) => {
        if (seen.has(idx)) return false;
        seen.add(idx);
        return true;
      })
      .map((idx) => idx - 1);

    allowedIndexSet = new Set(normalized);

    console.log(
      `只处理指定场景：${[...seen].sort((a, b) => a - b).join(", ")}`,
    );
  }
}

const outputBaseDir = path.join(yamlDir, "output");

await mkdir(outputBaseDir, { recursive: true });

for (let i = 0; i < yamlFiles.length; i++) {
  if (allowedIndexSet && !allowedIndexSet.has(i)) continue;

  const fileName = yamlFiles[i];
  const promptPath = path.join(yamlDir, fileName);
  const promptText = await readFile(promptPath, "utf8");

  const imageInputs = [];

  // 如果有前一帧已生成的图，优先放在第一个
  if (i > 0) {
    const prevFileName = yamlFiles[i - 1];
    const prevBaseName = prevFileName.replace(/\.ya?ml$/i, "");
    const prevOutputPath = path.join(outputBaseDir, `${prevBaseName}.png`);
    try {
      const prevImage = await readFile(prevOutputPath);
      imageInputs.push(prevImage);
    } catch (err) {
      console.warn(
        `前一帧图片不存在或读取失败，跳过：${prevOutputPath}`,
      );
    }
  }

  // 然后是角色参考图
  imageInputs.push(referenceImage);

  const output = await replicate.run("google/nano-banana-2", {
    input: {
      prompt: promptText,
      image_input: imageInputs,
      resolution: "1K",
      aspect_ratio: "1:1",
      image_search: false,
      google_search: false,
      output_format: "jpg",
    },
  });

  const baseName = fileName.replace(/\.ya?ml$/i, "");
  const outputPath = path.join(outputBaseDir, `${baseName}.png`);

  await writeFile(outputPath, output);

  console.log(`已生成：${outputPath}（源 YAML：${fileName}）`);
}
