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
}

export interface IUser {
  id: string
  username: string
  password: string
  role: 'admin' | 'user'
}

export interface ILoginResult {
  success: boolean
  user?: IUser
  message?: string
}

export interface IRegisterResult {
  success: boolean
  message?: string
}

export interface IHotelContextValue {
  hotels: IHotel[]
  users: IUser[]
  currentUser: IUser | null
  login: (username: string, password: string) => ILoginResult
  register: (username: string, password: string, role: IUser['role']) => IRegisterResult
  logout: () => void
  addHotel: (hotelData: Partial<IHotel>) => Promise<IHotel>
  updateHotel: (id: string, data: Partial<IHotel>) => Promise<IHotel>
  updateHotelStatus: (id: string, status: IHotel['status'], rejectReason?: string) => Promise<IHotel>
  toggleHotelOnline: (id: string) => Promise<IHotel>
}
