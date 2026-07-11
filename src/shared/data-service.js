import { DEFAULT_CONFIG } from "./options.js";

const CONFIG_KEY = "vr_config";
const LOCAL_DATA_KEY = "vr_local_data";
let activeSubmitPromise = null;

function getStoredConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveStoredConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(normalizeDataConfig(config)));
}

export function getRemoteConfig() {
  return normalizeDataConfig(getStoredConfig());
}

export function normalizeDataConfig(config = {}) {
  const parsed = parseGitHubFileUrl(config.githubFileUrl);
  const next = { ...config, ...(parsed || {}) };
  const normalized = {
    owner: next.owner || DEFAULT_CONFIG.owner,
    repo: next.repo || DEFAULT_CONFIG.repo,
    branch: next.branch || DEFAULT_CONFIG.branch,
    filepath: next.filepath || next.filePath || DEFAULT_CONFIG.filepath,
    githubFileUrl: next.githubFileUrl || "",
    token: next.token || "",
  };
  normalized.githubFileUrl = normalized.githubFileUrl || buildGitHubFileUrl(normalized);
  return normalized;
}

export function buildGitHubFileUrl(config = {}) {
  const owner = config.owner || DEFAULT_CONFIG.owner;
  const repo = config.repo || DEFAULT_CONFIG.repo;
  const branch = config.branch || DEFAULT_CONFIG.branch;
  const filepath = config.filepath || config.filePath || DEFAULT_CONFIG.filepath;
  return `https://github.com/${owner}/${repo}/blob/${branch}/${filepath}`;
}

export function parseGitHubFileUrl(value) {
  const raw = (value || "").trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);

    if (url.hostname === "github.com" && parts.length >= 5 && parts[2] === "blob") {
      return {
        owner: parts[0],
        repo: parts[1],
        branch: parts[3],
        filepath: decodeURIComponent(parts.slice(4).join("/")),
        githubFileUrl: raw,
      };
    }

    if (url.hostname === "raw.githubusercontent.com" && parts.length >= 4) {
      return {
        owner: parts[0],
        repo: parts[1],
        branch: parts[2],
        filepath: decodeURIComponent(parts.slice(3).join("/")),
        githubFileUrl: raw,
      };
    }

    if (url.hostname === "api.github.com" && parts.length >= 5 && parts[0] === "repos" && parts[3] === "contents") {
      return {
        owner: parts[1],
        repo: parts[2],
        branch: url.searchParams.get("ref") || DEFAULT_CONFIG.branch,
        filepath: decodeURIComponent(parts.slice(4).join("/")),
        githubFileUrl: raw,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export async function loadHouses() {
  return fetchLocalData({ preferCache: true });
}

function saveHousesToLocal(houses) {
  localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(houses));
}

export async function testDataConnection(config) {
  const nextConfig = normalizeDataConfig(config);
  const response = await fetchWithTimeout(githubContentUrl(nextConfig), {
    headers: nextConfig.token ? githubHeaders(nextConfig) : {},
  });
  if (!response.ok) throw new Error(await readGithubError(response));
  const json = await response.json();
  const data = JSON.parse(base64Decode(json.content).replace(/\n$/, ""));
  return { ok: true, count: Array.isArray(data) ? data.length : 0, source: "github" };
}

export async function loadAndSaveHouses(houses) {
  saveHousesToLocal(houses);
  return houses;
}

export async function refreshRemoteHouses(strategy = "local") {
  const localHouses = await loadHouses();
  const remoteHouses = await fetchRemoteData();
  const localFirst = strategy !== "remote";
  const houses = localFirst ? mergeHouses(localHouses, remoteHouses) : mergeHouses(remoteHouses, localHouses);
  saveHousesToLocal(houses);
  return {
    houses,
    strategy: localFirst ? "local" : "remote",
    localCount: localHouses.length,
    remoteCount: remoteHouses.length,
    addedCount: houses.length - (localFirst ? localHouses.length : remoteHouses.length),
  };
}

export async function submitLocalHousesToRemote(houses) {
  if (activeSubmitPromise) return activeSubmitPromise;
  activeSubmitPromise = submitLocalHousesToRemoteOnce(houses);
  try {
    return await activeSubmitPromise;
  } finally {
    activeSubmitPromise = null;
  }
}

async function submitLocalHousesToRemoteOnce(houses) {
  const localHouses = Array.isArray(houses) ? houses : await loadHouses();
  const remoteFile = await fetchRemoteFile();
  saveHousesToLocal(localHouses);
  await saveRemoteHouses(localHouses, remoteFile.sha);
  return localHouses;
}

export function nextHouseId(houses) {
  const id = typeof globalThis.crypto?.randomUUID === "function" ? globalThis.crypto.randomUUID() : fallbackUuid();
  const existingIds = new Set((Array.isArray(houses) ? houses : []).map((house) => String(house?.id || "")));
  return existingIds.has(id) ? nextHouseId(houses) : id;
}

function fallbackUuid() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (Number(char) ^ (Math.random() * 16) >> (Number(char) / 4)).toString(16),
  );
}

function mergeHouses(localHouses, remoteHouses) {
  const result = Array.isArray(localHouses) ? localHouses.slice() : [];
  const seen = new Set(result.map(houseIdentity).filter(Boolean));
  (Array.isArray(remoteHouses) ? remoteHouses : []).forEach((house) => {
    const identity = houseIdentity(house);
    if (identity && seen.has(identity)) return;
    result.push(house);
    if (identity) seen.add(identity);
  });
  return result;
}

function houseIdentity(house) {
  if (!house) return "";
  if (house.id !== undefined && house.id !== null && house.id !== "") return `id:${house.id}`;
  const address = String(house.address || "").trim();
  return address ? `address:${address}` : "";
}

async function saveRemoteHouses(houses, latestSha = "") {
  const config = getRemoteConfig();
  if (!config.token) throw new Error("请先在设置中填写 Personal Access Token，才能提交到远程");
  let sha = latestSha || (await fetchRemoteSha(config));
  let response = await putRemoteFile(config, houses, sha);
  if (response.status === 409) {
    sha = await fetchRemoteSha(config);
    response = await putRemoteFile(config, houses, sha);
  }
  if (!response.ok) throw new Error(await readGithubError(response));
}

async function fetchRemoteData() {
  const remoteFile = await fetchRemoteFile();
  return remoteFile.data;
}

async function fetchRemoteFile() {
  const config = getRemoteConfig();
  const headers = config.token ? githubHeaders(config) : {};
  const url = githubContentUrl(config);
  const response = await fetchWithTimeout(url, { headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  return {
    data: JSON.parse(base64Decode(json.content).replace(/\n$/, "")),
    sha: json.sha || "",
  };
}

async function fetchLocalData({ preferCache } = { preferCache: false }) {
  if (preferCache) {
    const cachedData = readLocalCache();
    if (cachedData) return cachedData;
  }

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
  const filepath = String(config.filepath || DEFAULT_CONFIG.filepath)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const base = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filepath}`;
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
