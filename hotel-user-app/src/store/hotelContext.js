import { createContext, useContext, useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { mockHotels } from '../utils/mockData';

const HotelContext = createContext();

export const useHotelStore = () => useContext(HotelContext);

// 平台兼容的存储方法
const getStorage = (key) => {
  try {
    if (process.env.TARO_ENV === 'weapp') {
      return Taro.getStorageSync(key);
    } else if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch (error) {
    console.error('获取存储失败:', error);
  }
  return null;
};

const setStorage = (key, value) => {
  try {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.setStorageSync(key, value);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    console.error('设置存储失败:', error);
  }
};

export const HotelProvider = ({ children }) => {
  const [hotels, setHotels] = useState(() => {
    // 始终使用最新的mockHotels数据，不使用本地存储
    return mockHotels;
  });

  const [searchParams, setSearchParams] = useState({
    keyword: '',
    checkInDate: '',
    checkOutDate: '',
    location: '',
    priceRange: '1',
    starRating: '1',
    brand: '',
    quickTags: [],
    recommendedTags: []
  });

  // 注释掉自动存储，确保始终使用最新的mockHotels数据
  // useEffect(() => {
  //   setStorage('hotels', JSON.stringify(hotels));
  // }, [hotels]);

  const getApprovedOnlineHotels = () => {
    return hotels.filter(h => h.status === 'approved' && h.isOnline);
  };

  const getHotelById = (id) => {
    return hotels.find(h => h.id === id);
  };

  const addHotel = (hotel) => {
    const newHotel = {
      ...hotel,
      id: Date.now().toString(),
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      status: 'pending',
      isOnline: false,
      rejectReason: ''
    };
    setHotels([...hotels, newHotel]);
  };

  const updateHotel = (hotelId, updatedData) => {
    setHotels(hotels.map(hotel => 
      hotel.id === hotelId 
        ? { ...hotel, ...updatedData, updateTime: new Date().toISOString() } 
        : hotel
    ));
  };

  const updateHotelStatus = (hotelId, status, rejectReason = '') => {
    setHotels(hotels.map(hotel => 
      hotel.id === hotelId 
        ? { ...hotel, status, rejectReason, updateTime: new Date().toISOString() } 
        : hotel
    ));
  };

  const toggleHotelOnline = (hotelId) => {
    setHotels(hotels.map(hotel => 
      hotel.id === hotelId 
        ? { ...hotel, isOnline: !hotel.isOnline, updateTime: new Date().toISOString() } 
        : hotel
    ));
  };

  const searchHotels = (params) => {
    setSearchParams(params);
  };

  const updateSearchParams = (params) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      ...params
    }));
  };

  const value = {
    hotels,
    searchParams,
    getApprovedOnlineHotels,
    getHotelById,
    addHotel,
    updateHotel,
    updateHotelStatus,
    toggleHotelOnline,
    searchHotels,
    updateSearchParams
  };

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  );
};
