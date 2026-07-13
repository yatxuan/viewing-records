import { statusOptions } from "./options.js";

export function formatHouseType(value) {
  return value === "agent" ? "中介" : "个人转租";
}

export function viewStatus(house) {
  return statusOptions.find((option) => option.value === house?.status)?.label || "未看";
}

export function hasDisplayOrder(house) {
  return house?.displayOrder !== undefined && house.displayOrder !== null && house.displayOrder !== "";
}

export function formatRoomType(house) {
  if (!house) return "";
  const kitchen =
    house.hasKitchen === "yes" ? "有厨房" : house.hasKitchen === "no" ? "无厨房" : "";
  const balconyStatus = normalizeBalconyStatus(house.balconies);
  const balcony =
    balconyStatus === "yes"
      ? ["有阳台", house.balconySize].filter(Boolean).join(" ")
      : balconyStatus === "no"
        ? "无阳台"
        : "";
  const parts = [house.bedrooms, house.livingRooms, balcony, kitchen].filter(Boolean);
  return removeToiletText(parts.length ? parts.join("") : house.roomType || "");
}

function normalizeBalconyStatus(value) {
  if (value === "yes" || value === "有阳台" || value === "一阳台" || value === "二阳台") return "yes";
  if (!value || value === "no" || value === "无阳台") return "no";
  return "";
}

function removeToiletText(value) {
  return String(value || "").replace(/一厕|二厕|厕所/g, "");
}

export function formatFurniture(house) {
  if (!house) return "";
  if (house.furnitureComplete) return "家电齐全";
  if (Array.isArray(house.appliances) && house.appliances.length) return house.appliances.join("、");
  return house.furniture || "";
}

export function formatKitchen(house) {
  if (!house || house.hasKitchen !== "yes") return house?.hasKitchen === "no" ? "无厨房" : "";
  const type = house.kitchenType === "shared" ? "公用厨房" : house.kitchenType === "independent" ? "独立厨房" : "有厨房";
  const sharedLocation = removeToiletText(house.sharedKitchenLocation);
  if (house.kitchenType === "shared" && sharedLocation) return `${type} · ${sharedLocation}`;
  return type;
}

export function formatContacts(house) {
  if (!Array.isArray(house?.contacts) || !house.contacts.length) return "";
  return house.contacts
    .filter((item) => item?.type && item?.value)
    .map((item) => `${item.type}: ${item.value}`)
    .join(" / ");
}

export function formatNetwork(house) {
  if (!house?.networkMode) return "";
  if (house.networkMode === "房东提供") {
    return house.networkFee ? `房东提供 · ¥${house.networkFee}/月` : "房东提供";
  }
  return house.networkMode;
}

export function formatPrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? `¥${price.toLocaleString()}` : "待定";
}

export function formatCommuteDuration(house) {
  const minutes = Number(house?.commuteDurationMinutes);
  if (!Number.isFinite(minutes) || minutes <= 0) return "";
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}小时${rest}分钟` : `${hours}小时`;
}

export function formatMetroStationDuration(house) {
  const minutes = Number(house?.metroStationDurationMinutes);
  if (!Number.isFinite(minutes) || minutes <= 0) return "";
  return `${minutes}分钟`;
}

export function subsidyAmount(house) {
  const amount = Number(house?.subsidyAmount);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function effectiveRent(house) {
  const rent = Number(house?.price) || 0;
  return Math.max(0, rent - subsidyAmount(house));
}

export function formatSubsidy(house) {
  const amount = subsidyAmount(house);
  if (!amount) return "";
  const months = Number(house?.subsidyMonths);
  return months > 0 ? `每月补贴 ¥${amount.toLocaleString()} · ${months}个月` : `每月补贴 ¥${amount.toLocaleString()}`;
}

export function formatScore(value) {
  const score = Number(value) || 0;
  return score > 0 ? "★".repeat(Math.min(score, 5)) : "";
}

export function isDateTimeValue(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value || "");
}

export function formatViewTime(value) {
  if (!value) return "";
  if (!isDateTimeValue(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function sortableTime(value) {
  if (!isDateTimeValue(value)) return Number.MAX_SAFE_INTEGER;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

export function sortablePrice(house, direction = 1) {
  const price = Number(house?.price);
  if (!Number.isFinite(price) || price <= 0) {
    return direction > 0 ? Number.MAX_SAFE_INTEGER : -1;
  }
  return price;
}

export function sortableDisplayOrder(house) {
  const value = Number(house?.displayOrder);
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

export function calcTotal(house) {
  if (!house) return { total: 0, detail: "-" };
  const rent = effectiveRent(house);
  const propFee = Math.round((Number(house.propFee) || 0) * (Number(house.area) || 0));
  const networkFee = house.networkMode === "房东提供" ? Number(house.networkFee) || 0 : 0;
  const total = rent + propFee + networkFee;
  const detail = [
    networkFee ? `网${networkFee}` : "",
    propFee ? `物${propFee}` : "",
  ]
    .filter(Boolean)
    .join("+");
  return { total, detail: detail || "-" };
}

export function shortAddress(house) {
  return (house?.address || "地址未填写").split("/").slice(-2).join("/");
}

export function displayTitle(house) {
  return house?.title || shortAddress(house);
}
