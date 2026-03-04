const mockHotels = [
  {
    id: "1",
    nameCn: "上海陆家嘴金融中心酒店",
    nameEn: "Shanghai Lujiazui Financial Center Hotel",
    address: "上海市浦东新区陆家嘴环路1000号",
    star: 5,
    price: 888,
    openDate: "2020-01-01",
    imageUrl: "https://picsum.photos/seed/hotel1/400/300",
    phone: "021-12345678",
    description: "位于陆家嘴核心商圈的五星级酒店，俯瞰黄浦江美景",
    roomTypes: [
      { id: "1-1", name: "豪华大床房", price: 888, area: 40, bedType: "1.8米大床" },
      { id: "1-2", name: "豪华双床房", price: 988, area: 45, bedType: "2张1.2米床" },
      { id: "1-3", name: "行政套房", price: 1588, area: 65, bedType: "2.0米大床" }
    ],
    rating: 4.8,
    distance: 1.2,
    facilities: ["免费WiFi", "停车场", "健身房", "游泳池", "餐厅"],
    status: "approved",
    rejectReason: "",
    isOnline: true,
    createTime: "2024-01-01",
    updateTime: "2024-01-01"
  },
  {
    id: "2",
    nameCn: "北京王府井希尔顿酒店",
    nameEn: "Beijing Wangfujing Hilton Hotel",
    address: "北京市东城区王府井大街88号",
    star: 5,
    price: 958,
    openDate: "2019-05-20",
    imageUrl: "https://picsum.photos/seed/hotel2/400/300",
    phone: "010-87654321",
    description: "位于北京王府井商业中心，交通便利，设施齐全",
    roomTypes: [
      { id: "2-1", name: "标准大床房", price: 958, area: 35, bedType: "1.8米大床" },
      { id: "2-2", name: "豪华套房", price: 1888, area: 70, bedType: "2.0米大床" }
    ],
    rating: 4.9,
    distance: 2.5,
    facilities: ["免费WiFi", "停车场", "健身房", "游泳池", "餐厅", "商务中心"],
    status: "approved",
    rejectReason: "",
    isOnline: true,
    createTime: "2024-01-02",
    updateTime: "2024-01-02"
  },
  {
    id: "3",
    nameCn: "杭州西湖假日酒店",
    nameEn: "Hangzhou West Lake Holiday Inn",
    address: "浙江省杭州市西湖区龙井路1号",
    star: 4,
    price: 458,
    openDate: "2021-03-15",
    imageUrl: "https://picsum.photos/seed/hotel3/400/300",
    phone: "0571-88888888",
    description: "紧邻西湖景区，环境优美，性价比高",
    roomTypes: [
      { id: "3-1", name: "湖景大床房", price: 458, area: 30, bedType: "1.5米大床" },
      { id: "3-2", name: "标准双床房", price: 488, area: 32, bedType: "2张1.2米床" }
    ],
    rating: 4.5,
    distance: 0.8,
    facilities: ["免费WiFi", "停车场", "餐厅"],
    status: "approved",
    rejectReason: "",
    isOnline: true,
    createTime: "2024-01-03",
    updateTime: "2024-01-03"
  },
  {
    id: "4",
    nameCn: "成都锦里客栈",
    nameEn: "Chengdu Jinli Inn",
    address: "四川省成都市武侯区锦里古街1号",
    star: 3,
    price: 288,
    openDate: "2022-08-01",
    imageUrl: "https://picsum.photos/seed/hotel4/400/300",
    phone: "028-12345678",
    description: "古色古香的客栈，体验成都慢生活",
    roomTypes: [
      { id: "4-1", name: "标准大床房", price: 288, area: 25, bedType: "1.5米大床" },
      { id: "4-2", name: "特色房", price: 358, area: 28, bedType: "1.5米大床" }
    ],
    rating: 4.2,
    distance: 1.5,
    facilities: ["免费WiFi", "餐厅"],
    status: "pending",
    rejectReason: "",
    isOnline: false,
    createTime: "2024-01-04",
    updateTime: "2024-01-04"
  },
  {
    id: "5",
    nameCn: "深圳南山科技园酒店",
    nameEn: "Shenzhen Nanshan Science Park Hotel",
    address: "广东省深圳市南山区科技园南区科苑路10号",
    star: 4,
    price: 688,
    openDate: "2023-01-10",
    imageUrl: "https://picsum.photos/seed/hotel5/400/300",
    phone: "0755-87654321",
    description: "位于南山科技园，商务出行首选",
    roomTypes: [
      { id: "5-1", name: "商务大床房", price: 688, area: 38, bedType: "1.8米大床" },
      { id: "5-2", name: "商务双床房", price: 728, area: 40, bedType: "2张1.2米床" }
    ],
    rating: 4.6,
    distance: 3.2,
    facilities: ["免费WiFi", "停车场", "商务中心", "健身房"],
    status: "rejected",
    rejectReason: "地址信息不完整",
    isOnline: false,
    createTime: "2024-01-05",
    updateTime: "2024-01-05"
  }
];

const mockUsers = [
  {
    id: "1",
    username: "admin",
    password: "123456",
    role: "admin"
  },
  {
    id: "2",
    username: "user",
    password: "123456",
    role: "user"
  },
  {
    id: "3",
    username: "test1",
    password: "123456",
    role: "user"
  }
];

export { mockHotels, mockUsers };
