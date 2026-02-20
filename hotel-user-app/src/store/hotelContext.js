import { createContext, useContext, useState, useEffect } from 'react';
import { mockHotels } from '../utils/mockData';

const HotelContext = createContext();

export const useHotelStore = () => useContext(HotelContext);

export const HotelProvider = ({ children }) => {
  const [hotels, setHotels] = useState(() => {
    const stored = localStorage.getItem('hotels');
    return stored ? JSON.parse(stored) : mockHotels;
  });

  const [searchParams, setSearchParams] = useState({
    keyword: '',
    checkInDate: '',
    checkOutDate: ''
  });

  useEffect(() => {
    localStorage.setItem('hotels', JSON.stringify(hotels));
  }, [hotels]);

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

  const value = {
    hotels,
    searchParams,
    getApprovedOnlineHotels,
    getHotelById,
    addHotel,
    updateHotel,
    updateHotelStatus,
    toggleHotelOnline,
    searchHotels
  };

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  );
};
