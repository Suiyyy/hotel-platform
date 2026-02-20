import { createContext, useContext, useState, useEffect } from 'react';
import { mockHotels, mockUsers } from '../utils/mockData';

const HotelContext = createContext();

export const useHotelStore = () => useContext(HotelContext);

export const HotelProvider = ({ children }) => {
  const [hotels, setHotels] = useState(() => {
    const stored = localStorage.getItem('hotels');
    return stored ? JSON.parse(stored) : mockHotels;
  });

  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : mockUsers;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    localStorage.setItem('hotels', JSON.stringify(hotels));
  }, [hotels]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: '用户名或密码错误' };
  };

  const register = (username, password, role = 'user') => {
    const exists = users.find(u => u.username === username);
    if (exists) {
      return { success: false, message: '用户名已存在' };
    }
    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      role
    };
    setUsers([...users, newUser]);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
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

  const value = {
    hotels,
    users,
    currentUser,
    login,
    register,
    logout,
    addHotel,
    updateHotel,
    updateHotelStatus,
    toggleHotelOnline
  };

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  );
};
