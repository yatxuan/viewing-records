import assert from "node:assert/strict";
import { test } from "node:test";

import { calcTotal, viewStatus } from "../src/shared/formatters.js";

test("calcTotal ignores retired usage and service fields", () => {
  const result = calcTotal({
    price: 1500,
    propFee: 2,
    area: 30,
    electricPrice: 1,
    elecUsage: 425,
    waterPrice: 8,
    waterUsage: 2,
    serviceFee: 100,
  });

  assert.deepEqual(result, {
    total: 1560,
    detail: "物60",
  });
});

test("viewStatus displays each status option label", () => {
  assert.equal(viewStatus({ status: "unviewed" }), "未看");
  assert.equal(viewStatus({ status: "viewing" }), "考虑中");
  assert.equal(viewStatus({ status: "booked" }), "意向中");
  assert.equal(viewStatus({ status: "living" }), "居住中");
  assert.equal(viewStatus({ status: "rejected" }), "不考虑");
});
