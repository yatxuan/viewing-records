export const DEFAULT_CONFIG = {
  owner: "yatxuan",
  repo: "viewing-records",
  branch: "main",
  filepath: "data.json",
  dataSourceMode: "remote",
};

export const DEFAULT_HOUSE = {
  id: "",
  type: "personal",
  status: "unviewed",
  displayOrder: "",
  address: "",
  metroStation: "",
  commuteDurationMinutes: null,
  price: "",
  roomType: "",
  bedrooms: "",
  livingRooms: "0厅",
  balconies: "",
  balconySize: "",
  hasKitchen: "",
  kitchenType: "",
  sharedKitchenLocation: "",
  toilets: "一厕",
  cookingType: "",
  floor: "",
  direction: "未知",
  area: "",
  furniture: "",
  furnitureComplete: false,
  appliances: [],
  lighting: "未知",
  decor: "",
  lightingNote: "",
  elevator: "未知",
  waterElectric: "",
  utility: "民水民电",
  networkMode: "未知",
  networkFee: "",
  electricPrice: "",
  elecUsage: "425",
  waterPrice: "",
  waterUsage: "2",
  propFee: "",
  serviceFee: "",
  deposit: "",
  agentFee: "",
  leaseTerm: "",
  subsidyAmount: "",
  subsidyMonths: "",
  discountStrategy: "",
  score: "",
  viewTime: "",
  source: "",
  contacts: [],
  pros: "",
  cons: "",
  notes: "",
  satisfaction: "",
};

export const houseTypeOptions = [
  { label: "个人转租", value: "personal" },
  { label: "中介", value: "agent" },
];

export const statusOptions = [
  { label: "未看", value: "unviewed" },
  { label: "考虑中", value: "viewing" },
  { label: "意向中", value: "booked" },
  { label: "居住中", value: "living" },
  { label: "不考虑", value: "rejected" },
];

export const bedroomOptions = ["一房", "两房", "三房"].map(toOption);
export const livingRoomOptions = ["0厅", "一厅", "两厅"].map(toOption);
export const balconyOptions = ["无阳台", "一阳台", "二阳台"].map(toOption);
export const balconySizeOptions = ["未知", "小阳台", "中阳台", "大阳台"].map(toOption);
export const kitchenOptions = [
  { label: "有厨房", value: "yes" },
  { label: "无厨房", value: "no" },
];
export const kitchenTypeOptions = [
  { label: "独立厨房", value: "independent" },
  { label: "公用厨房", value: "shared" },
];
export const sharedKitchenLocationOptions = [
  { label: "和阳台共用", value: "和阳台共用" },
  { label: "门口玄关共用", value: "门口玄关共用" },
  { label: "挨着厕所", value: "挨着厕所" },
];
export const cookingOptions = ["天然气", "煤气", "电磁炉"].map((value) => ({
  label: value === "天然气" ? "天然气做饭" : value === "煤气" ? "煤气做饭" : value,
  value,
}));
export const directionOptions = ["未知", "南", "东南", "东", "西南", "西", "北"].map(toOption);
export const lightingOptions = ["未知", "无", "一般", "良好", "完美"].map(toOption);
export const applianceOptions = ["床", "冰箱", "空调", "洗衣机", "热水器"];
export const completeAppliances = ["床", "冰箱", "空调", "洗衣机", "热水器"];
export const decorOptions = ["毛坯", "简装", "精装", "豪装"].map(toOption);
export const elevatorOptions = ["未知", "有电梯", "无电梯"].map(toOption);
export const utilityOptions = ["民水民电", "商水商电", "民水商电", "未知"].map(toOption);
export const networkOptions = ["未知", "房东提供", "自己签网络"].map(toOption);
export const depositOptions = ["押一付一", "押二付一", "押一付三"].map(toOption);
export const leaseTermOptions = ["1年", "半年", "1年可续"].map(toOption);
export const sourceOptions = ["抖音", "咸鱼", "小红书", "58同城", "豆瓣", "朋友圈", "其他"].map(toOption);
export const contactTypeOptions = ["微信", "电话", "小红书", "咸鱼", "抖音", "其他"].map(toOption);

export function toOption(value) {
  return { label: value, value };
}
