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

export interface ISearchParams {
  keyword: string
  checkInDate: string
  checkOutDate: string
}

export interface IHotelContextValue {
  hotels: IHotel[]
  searchParams: ISearchParams
  getApprovedOnlineHotels: () => IHotel[]
  getHotelById: (id: string) => IHotel | undefined
  searchHotels: (params: ISearchParams) => void
  addHotel: (hotel: Partial<IHotel>) => void
  updateHotel: (hotelId: string, updatedData: Partial<IHotel>) => void
  updateHotelStatus: (hotelId: string, status: IHotel['status'], rejectReason?: string) => void
  toggleHotelOnline: (hotelId: string) => void
}
