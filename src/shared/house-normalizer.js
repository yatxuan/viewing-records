import { completeAppliances, DEFAULT_HOUSE } from "./options.js";

export function createHouseDraft(house = {}) {
  const draft = {
    ...DEFAULT_HOUSE,
    ...house,
    appliances: Array.isArray(house.appliances) ? [...house.appliances] : [],
    contacts: Array.isArray(house.contacts) ? house.contacts.map((item) => ({ ...item })) : [],
  };
  applyDefaults(draft);
  if (!draft.contacts.length) draft.contacts.push({ type: "微信", value: "" });
  return draft;
}

export function normalizeHouse(form) {
  if (form.furnitureComplete) form.appliances = [...completeAppliances];
  const house = {
    ...form,
    appliances: Array.isArray(form.appliances) ? [...form.appliances] : [],
    contacts: Array.isArray(form.contacts)
      ? form.contacts.filter((item) => item.type && item.value).map((item) => ({ type: item.type, value: item.value }))
      : [],
  };
  delete house.toilets;
  house.roomType = roomSummary(house);
  house.furniture = house.furnitureComplete ? "家电齐全" : house.appliances.join("、");
  house.commuteDurationMinutes = normalizePositiveNumber(house.commuteDurationMinutes);
  if (house.hasKitchen !== "yes") {
    house.cookingType = "";
    house.kitchenType = "";
    house.sharedKitchenLocation = "";
  }
  if (house.kitchenType !== "shared") house.sharedKitchenLocation = "";
  if (house.networkMode !== "房东提供") house.networkFee = "";
  return house;
}

function normalizePositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function applyDefaults(form) {
  if (!form.status) form.status = "unviewed";
  if (!form.utility) form.utility = "民水民电";
  if (!form.elevator) form.elevator = "未知";
  if (!form.networkMode) form.networkMode = "未知";
  if (!form.lighting) form.lighting = "未知";
  if (!form.direction) form.direction = "未知";
  if (!form.livingRooms) form.livingRooms = "0厅";
  delete form.toilets;
}

function roomSummary(house) {
  const kitchen = house.hasKitchen === "yes" ? "有厨房" : house.hasKitchen === "no" ? "无厨房" : "";
  const balcony = [house.balconies, house.balconySize && house.balconies !== "无阳台" ? house.balconySize : ""]
    .filter(Boolean)
    .join(" ");
  return [house.bedrooms, house.livingRooms, balcony, kitchen].filter(Boolean).join("");
}
