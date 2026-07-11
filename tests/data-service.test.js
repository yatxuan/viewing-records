import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import {
  loadAndSaveHouses,
  loadHouses,
  nextHouseId,
  normalizeDataConfig,
  refreshRemoteHouses,
  saveStoredConfig,
  submitLocalHousesToRemote,
} from "../src/shared/data-service.js";

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

test("submitLocalHousesToRemote pulls remote data and pushes local data as the full replacement", async () => {
  const localHouses = [
    { id: 2, address: "local override" },
    { id: 3, address: "local new" },
  ];
  const remoteHouses = [
    { id: 1, address: "remote only" },
    { id: 2, address: "remote stale" },
  ];
  let pushedHouses = null;
  let pushedSha = "";

  globalThis.fetch = async (url, options = {}) => {
    if (options.method === "PUT") {
      const body = JSON.parse(options.body);
      pushedHouses = decodeJsonContent(body.content);
      pushedSha = body.sha;
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

  assert.deepEqual(result, localHouses);
  assert.deepEqual(pushedHouses, localHouses);
  assert.equal(pushedSha, "remote-sha");
});

test("submitLocalHousesToRemote retries 409 with a freshly fetched remote sha", async () => {
  const localHouses = [{ id: 1, address: "local house" }];
  const requestedShas = [];
  let getCount = 0;

  globalThis.fetch = async (url, options = {}) => {
    if (options.method === "PUT") {
      const body = JSON.parse(options.body);
      requestedShas.push(body.sha);
      if (requestedShas.length === 1) {
        return new Response(
          JSON.stringify({
            message: "viewing-records/json.data does not match 82c6da777ef465d6e58cf3aaaddac8ddf2dd14e3",
          }),
          { status: 409 },
        );
      }
      return new Response(JSON.stringify({ content: { sha: "next-sha" } }), { status: 200 });
    }

    getCount += 1;
    return new Response(
      JSON.stringify({
        sha: getCount === 1 ? "stale-sha" : "fresh-sha",
        content: encodeJson([{ id: 1, address: "remote stale" }]),
      }),
      { status: 200 },
    );
  };

  await submitLocalHousesToRemote(localHouses);

  assert.deepEqual(requestedShas, ["stale-sha", "fresh-sha"]);
});

test("submitLocalHousesToRemote reuses an in-flight submit instead of sending duplicate PUTs", async () => {
  const localHouses = [{ id: 1, address: "local house" }];
  let putCalls = 0;
  let releasePut;
  const putStarted = new Promise((resolve) => {
    releasePut = resolve;
  });

  globalThis.fetch = async (url, options = {}) => {
    if (options.method === "PUT") {
      putCalls += 1;
      await putStarted;
      return new Response(JSON.stringify({ content: { sha: "next-sha" } }), { status: 200 });
    }

    return new Response(
      JSON.stringify({
        sha: "remote-sha",
        content: encodeJson([{ id: 1, address: "remote stale" }]),
      }),
      { status: 200 },
    );
  };

  const firstSubmit = submitLocalHousesToRemote(localHouses);
  const secondSubmit = submitLocalHousesToRemote(localHouses);
  releasePut();
  const results = await Promise.all([firstSubmit, secondSubmit]);

  assert.deepEqual(results, [localHouses, localHouses]);
  assert.equal(putCalls, 1);
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

test("refreshRemoteHouses keeps local records first by default", async () => {
  await loadAndSaveHouses([
    { id: 1, address: "local override" },
    { id: 2, address: "local only" },
  ]);
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        sha: "remote-sha",
        content: encodeJson([
          { id: 1, address: "remote stale" },
          { id: 3, address: "remote only" },
        ]),
      }),
      { status: 200 },
    );

  const result = await refreshRemoteHouses();

  assert.equal(result.strategy, "local");
  assert.deepEqual(result.houses, [
    { id: 1, address: "local override" },
    { id: 2, address: "local only" },
    { id: 3, address: "remote only" },
  ]);
});

test("refreshRemoteHouses can keep remote records first", async () => {
  await loadAndSaveHouses([
    { id: 1, address: "local stale" },
    { id: 2, address: "local only" },
  ]);
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        sha: "remote-sha",
        content: encodeJson([
          { id: 1, address: "remote override" },
          { id: 3, address: "remote only" },
        ]),
      }),
      { status: 200 },
    );

  const result = await refreshRemoteHouses("remote");

  assert.equal(result.strategy, "remote");
  assert.deepEqual(result.houses, [
    { id: 1, address: "remote override" },
    { id: 3, address: "remote only" },
    { id: 2, address: "local only" },
  ]);
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

test("nextHouseId returns a UUID for new houses", async () => {
  await loadAndSaveHouses([
    { id: 1, address: "house 1" },
    { id: 2, address: "house 2" },
    { id: 3, address: "house 3" },
    { id: 4, address: "house 4" },
    { id: 5, address: "house 5" },
    { id: 6, address: "house 6" },
  ]);
  const remainingHouses = [
    { id: 1, address: "house 1" },
    { id: 2, address: "house 2" },
    { id: 3, address: "house 3" },
    { id: 4, address: "house 4" },
    { id: 5, address: "house 5" },
  ];
  await loadAndSaveHouses(remainingHouses);

  const nextId = nextHouseId(remainingHouses);

  assert.equal(remainingHouses.some((house) => String(house.id) === String(nextId)), false);
  assert.match(nextId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});
