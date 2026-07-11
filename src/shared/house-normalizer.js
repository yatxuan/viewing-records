import { completeAppliances, DEFAULT_HOUSE } from "./options.js";

const OPTIONAL_NUMBER_FIELDS = [
  "displayOrder",
  "price",
  "area",
  "networkFee",
  "electricPrice",
  "waterPrice",
  "propFee",
  "subsidyAmount",
  "subsidyMonths",
  "score",
];

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
  applyDefaults(house);
  delete house.toilets;
  delete house.waterElectric;
  delete house.elecUsage;
  delete house.waterUsage;
  delete house.serviceFee;
  house.roomType = roomSummary(house);
  house.furniture = house.furnitureComplete ? "家电齐全" : house.appliances.join("、");
  house.metroStationDurationMinutes = normalizePositiveNumber(house.metroStationDurationMinutes);
  house.commuteDurationMinutes = normalizePositiveNumber(house.commuteDurationMinutes);
  if (house.hasKitchen !== "yes") {
    house.cookingType = "";
    house.kitchenType = "";
    house.sharedKitchenLocation = "";
  }
  if (house.kitchenType !== "shared") house.sharedKitchenLocation = "";
  house.balconies = normalizeBalconyStatus(house.balconies);
  if (house.balconies !== "yes") house.balconySize = "";
  if (house.networkMode !== "房东提供") house.networkFee = "";
  return house;
}

function normalizePositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function applyDefaults(form) {
  if (!form.status) form.status = "unviewed";
  if (!form.utility || form.utility === "未知") form.utility = "民水民电";
  if (!form.elevator) form.elevator = "未知";
  if (!form.networkMode) form.networkMode = "未知";
  if (!form.lighting) form.lighting = "未知";
  if (!form.direction) form.direction = "未知";
  if (!form.livingRooms) form.livingRooms = "0厅";
  if (!form.hasKitchen) form.hasKitchen = "no";
  form.balconies = normalizeBalconyStatus(form.balconies);
  if (form.balconies !== "yes") form.balconySize = "";
  for (const field of OPTIONAL_NUMBER_FIELDS) {
    if (form[field] === "") form[field] = null;
  }
  delete form.toilets;
  delete form.waterElectric;
  delete form.elecUsage;
  delete form.waterUsage;
  delete form.serviceFee;
}

function roomSummary(house) {
  const kitchen = house.hasKitchen === "yes" ? "有厨房" : house.hasKitchen === "no" ? "无厨房" : "";
  const balconyStatus = normalizeBalconyStatus(house.balconies);
  const balcony =
    balconyStatus === "yes"
      ? ["有阳台", house.balconySize].filter(Boolean).join(" ")
      : balconyStatus === "no"
        ? "无阳台"
        : "";
  return [house.bedrooms, house.livingRooms, balcony, kitchen].filter(Boolean).join("");
}

function normalizeBalconyStatus(value) {
  if (value === "yes" || value === "有阳台" || value === "一阳台" || value === "二阳台") return "yes";
  return "no";
}
