import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeHouse } from "../src/shared/house-normalizer.js";

test("normalizeHouse removes retired utility usage fields", () => {
  const house = normalizeHouse({
    address: "sample house",
    waterElectric: "old note",
    elecUsage: 425,
    waterUsage: 2,
    serviceFee: 100,
  });

  assert.equal("waterElectric" in house, false);
  assert.equal("elecUsage" in house, false);
  assert.equal("waterUsage" in house, false);
  assert.equal("serviceFee" in house, false);
});

test("normalizeHouse keeps metro station travel duration as minutes", () => {
  const house = normalizeHouse({
    address: "sample house",
    metroStationDurationMinutes: "8",
  });

  assert.equal(house.metroStationDurationMinutes, 8);
});

test("normalizeHouse keeps the house title", () => {
  const house = normalizeHouse({
    title: "大运锦秀花园",
    address: "sample house",
  });

  assert.equal(house.title, "大运锦秀花园");
});
