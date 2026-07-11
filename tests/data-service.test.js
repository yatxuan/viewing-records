import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import { loadHouses, normalizeDataConfig, saveStoredConfig, submitLocalHousesToRemote } from "../src/shared/data-service.js";

function createLocalStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    clear() {
      store.clear();
    },
  };
}

function encodeJson(data) {
  return btoa(JSON.stringify(data));
}

function decodeJsonContent(content) {
  return JSON.parse(atob(content));
}

beforeEach(() => {
  globalThis.localStorage = createLocalStorage();
  saveStoredConfig({
    owner: "owner",
    repo: "repo",
    branch: "main",
    filepath: "data.json",
    token: "token",
  });
});

test("submitLocalHousesToRemote pulls remote data and pushes the merged data", async () => {
  const localHouses = [{ id: 1, address: "local house" }];
  const remoteHouses = [
    { id: 1, address: "older local house" },
    { id: 2, address: "remote house" },
  ];
  let pushedHouses = null;

  globalThis.fetch = async (url, options = {}) => {
    if (options.method === "PUT") {
      const body = JSON.parse(options.body);
      pushedHouses = decodeJsonContent(body.content);
      return new Response(JSON.stringify({ content: { sha: "next-sha" } }), { status: 200 });
    }

    return new Response(
      JSON.stringify({
        sha: "remote-sha",
        content: encodeJson(remoteHouses),
      }),
      { status: 200 },
    );
  };

  const result = await submitLocalHousesToRemote(localHouses);

  assert.deepEqual(result, [
    { id: 1, address: "local house" },
    { id: 2, address: "remote house" },
  ]);
  assert.deepEqual(pushedHouses, result);
});

test("normalizeDataConfig defaults to the shared json.data file", () => {
  assert.deepEqual(normalizeDataConfig({}), {
    owner: "yatxuan",
    repo: "jsonData",
    branch: "main",
    filepath: "viewing-records/json.data",
    githubFileUrl: "https://github.com/yatxuan/jsonData/blob/main/viewing-records/json.data",
    token: "",
  });
});

test("loadHouses does not fall back to local data files when cache is empty", async () => {
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response(JSON.stringify([{ id: 99, address: "local file house" }]), { status: 200 });
  };

  const houses = await loadHouses();

  assert.deepEqual(houses, []);
  assert.equal(fetchCalls, 0);
});
