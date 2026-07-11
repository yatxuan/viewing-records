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

test("normalizeHouse defaults unknown utility to residential utility", () => {
  const house = normalizeHouse({
    address: "sample house",
    utility: "未知",
  });

  assert.equal(house.utility, "民水民电");
});

test("normalizeHouse converts legacy balcony values to yes or no", () => {
  assert.equal(normalizeHouse({ address: "sample house", balconies: "一阳台" }).balconies, "yes");
  assert.equal(normalizeHouse({ address: "sample house", balconies: "无阳台", balconySize: "中阳台" }).balconies, "no");
  assert.equal(normalizeHouse({ address: "sample house", balconies: "无阳台", balconySize: "中阳台" }).balconySize, "");
});

test("normalizeHouse defaults empty kitchen and balcony to no", () => {
  const house = normalizeHouse({ address: "sample house" });

  assert.equal(house.hasKitchen, "no");
  assert.equal(house.balconies, "no");
});
