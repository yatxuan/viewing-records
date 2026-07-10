import { DEFAULT_CONFIG } from "./options.js";

const CONFIG_KEY = "vr_config";
const LOCAL_DATA_KEY = "vr_local_data";

export function getStoredConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveStoredConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function getRemoteConfig() {
  const config = getStoredConfig();
  return {
    owner: config.owner || DEFAULT_CONFIG.owner,
    repo: config.repo || DEFAULT_CONFIG.repo,
    branch: config.branch || DEFAULT_CONFIG.branch,
    filepath: config.filepath || config.filePath || DEFAULT_CONFIG.filepath,
    dataSourceMode: config.dataSourceMode || DEFAULT_CONFIG.dataSourceMode,
    tokenType: config.tokenType || "fine-grained",
    token: config.token || "",
  };
}

export async function loadHouses() {
  const config = getRemoteConfig();
  if (config.dataSourceMode === "local") return fetchLocalData({ preferCache: true });

  try {
    return await fetchRemoteData();
  } catch (error) {
    console.warn("GitHub 加载失败，使用本地数据:", error.message);
    return fetchLocalData({ preferCache: false });
  }
}

export async function saveHouses(houses) {
  const config = getRemoteConfig();
  if (config.dataSourceMode === "local" || !config.token) {
    localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(houses));
    return;
  }

  let sha = await fetchRemoteSha(config);
  let response = await putRemoteFile(config, houses, sha);
  if (response.status === 409) {
    sha = await fetchRemoteSha(config);
    response = await putRemoteFile(config, houses, sha);
  }
  if (!response.ok) throw new Error(await readGithubError(response));
}

export async function loadAndSaveHouses(houses) {
  await saveHouses(houses);
  const config = getRemoteConfig();
  if (config.dataSourceMode === "local" || !config.token) return houses;
  return loadHouses();
}

export function nextHouseId(houses) {
  return houses.length ? Math.max(...houses.map((house) => Number(house.id) || 0)) + 1 : 1;
}

async function fetchRemoteData() {
  const config = getRemoteConfig();
  const headers = config.token ? githubHeaders(config) : {};
  const url = githubContentUrl(config);
  const response = await fetchWithTimeout(url, { headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  return JSON.parse(base64Decode(json.content).replace(/\n$/, ""));
}

async function fetchLocalData({ preferCache } = { preferCache: false }) {
  const config = getRemoteConfig();
  if (preferCache) {
    const cachedData = readLocalCache();
    if (cachedData) return cachedData;
  }

  const localFileData = await fetchLocalFileData(config.filepath);
  if (localFileData) return localFileData;

  if (!preferCache) {
    const cachedData = readLocalCache();
    if (cachedData) return cachedData;
  }
  return [];
}

function readLocalCache() {
  const raw = localStorage.getItem(LOCAL_DATA_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("浏览器本地缓存不是有效 JSON:", error.message);
    return null;
  }
}

function localDataPaths(filepath) {
  const configuredPath = filepath || DEFAULT_CONFIG.filepath;
  const configuredFile = configuredPath.split("/").pop();
  return [
    ...new Set(
      [
        configuredFile ? `./${configuredFile}` : "",
        configuredPath ? `./${configuredPath}` : "",
        `./${DEFAULT_CONFIG.filepath}`,
      ].filter(Boolean),
    ),
  ];
}

async function fetchLocalFileData(filepath) {
  for (const path of localDataPaths(filepath)) {
    try {
      const response = await fetch(path);
      if (!response.ok) continue;
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (error) {
        console.warn("本地数据文件不是有效 JSON:", path, error.message);
      }
    } catch (error) {
      console.warn("本地数据加载失败:", path, error.message);
    }
  }
  return null;
}

async function fetchRemoteSha(config) {
  const response = await fetchWithTimeout(githubContentUrl(config), {
    headers: githubHeaders(config),
  });
  if (response.status === 404) return "";
  if (!response.ok) throw new Error(await readGithubError(response));
  const json = await response.json();
  return json.sha || "";
}

async function putRemoteFile(config, houses, sha) {
  const body = {
    message: `update: ${houses.length} properties`,
    content: base64Encode(JSON.stringify(houses, null, 2)),
    branch: config.branch,
  };
  if (sha) body.sha = sha;
  return fetchWithTimeout(githubContentUrl(config, false), {
    method: "PUT",
    headers: githubHeaders(config, { "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
}

function githubContentUrl(config, includeRef = true) {
  const base = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filepath}`;
  return includeRef ? `${base}?ref=${config.branch}` : base;
}

function githubHeaders(config, extra = {}) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${config.token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    ...extra,
  };
}

async function readGithubError(response) {
  try {
    const json = await response.json();
    return json.message ? `HTTP ${response.status}: ${json.message}` : `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function base64Decode(value) {
  const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function base64Encode(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}
