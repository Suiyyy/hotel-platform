export interface IRoomType {
  id: string
  name: string
  price: number
  area: number
  bedType: string
}

export interface IHotel {
  id: string
  nameCn: string
  nameEn: string
  address: string
  star: number
  price: number
  openDate: string
  imageUrl: string
  phone: string
  description: string
  roomTypes: IRoomType[]
  rating: number
  distance: number
  facilities: string[]
  status: 'pending' | 'approved' | 'rejected'
  rejectReason: string
  isOnline: boolean
  createTime: string
  updateTime: string
  merchantId?: string
}

export type IHotelCreate = Omit<IHotel, 'id' | 'createTime' | 'updateTime' | 'status' | 'isOnline' | 'rejectReason'>

export interface IUser {
  id: string
  username: string
  password: string
  role: 'admin' | 'user'
}

export interface IUserDatabase {
  users: IUser[]
}

export interface IHotelDatabase {
  hotels: IHotel[]
}

export interface IAuthPayload {
  userId: string
  username: string
  role: 'admin' | 'user'
}
