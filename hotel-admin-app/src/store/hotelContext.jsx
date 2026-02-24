import { createContext, useContext, useState, useEffect } from 'react';
import { mockHotels, mockUsers } from '../utils/mockData';
import { createHotel, fetchHotels, patchHotel } from '../services/hotelApi';

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
    let cancelled = false;
    (async () => {
      try {
        const remote = await fetchHotels();
        if (!cancelled && Array.isArray(remote)) setHotels(remote);
      } catch {
        // ignore: fallback to localStorage/mock
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const addHotel = async (hotel) => {
    const created = await createHotel(hotel);
    setHotels(prev => [...prev, created]);
    return created;
  };

  const updateHotel = async (hotelId, updatedData) => {
    const updated = await patchHotel(hotelId, updatedData);
    setHotels(prev => prev.map(h => (h.id === hotelId ? updated : h)));
    return updated;
  };

  const updateHotelStatus = async (hotelId, status, rejectReason = '') => {
    const updated = await patchHotel(hotelId, { status, rejectReason });
    setHotels(prev => prev.map(h => (h.id === hotelId ? updated : h)));
    return updated;
  };

  const toggleHotelOnline = async (hotelId) => {
    const current = hotels.find(h => h.id === hotelId);
    const updated = await patchHotel(hotelId, { isOnline: !current?.isOnline });
    setHotels(prev => prev.map(h => (h.id === hotelId ? updated : h)));
    return updated;
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
