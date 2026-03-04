import { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useHotelStore } from '../../store/hotelContext';
import './index.scss';

const GuestsSelectPage = () => {
  const { updateSearchParams } = useHotelStore();
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const handleRoomChange = (delta) => {
    const newRooms = rooms + delta;
    if (newRooms >= 1 && newRooms <= 10) {
      setRooms(newRooms);
    }
  };

  const handleAdultChange = (delta) => {
    const newAdults = adults + delta;
    if (newAdults >= 1 && newAdults <= 20) {
      setAdults(newAdults);
    }
  };

  const handleChildChange = (delta) => {
    const newChildren = children + delta;
    if (newChildren >= 0 && newChildren <= 10) {
      setChildren(newChildren);
    }
  };

  const handleConfirm = () => {
    Taro.setStorageSync('selectedGuests', { rooms, adults, children });
    
    // 更新searchParams中的间数信息
    if (updateSearchParams) {
      updateSearchParams({
        rooms,
        adults,
        children
      });
    }
    
    Taro.navigateBack();
  };

  return (
    <View className="guests-select-page">
      <View className="guests-section">
        <Text className="section-title">房间</Text>
        <View className="count-control">
          <Button 
            className="count-button" 
            onClick={() => handleRoomChange(-1)}
            onTap={() => handleRoomChange(-1)}
            disabled={rooms <= 1}
          >
            -
          </Button>
          <Text className="count-value">{rooms}</Text>
          <Button 
            className="count-button" 
            onClick={() => handleRoomChange(1)}
            onTap={() => handleRoomChange(1)}
            disabled={rooms >= 10}
          >
            +
          </Button>
        </View>
      </View>

      <View className="guests-section">
        <Text className="section-title">成人</Text>
        <View className="count-control">
          <Button 
            className="count-button" 
            onClick={() => handleAdultChange(-1)}
            onTap={() => handleAdultChange(-1)}
            disabled={adults <= 1}
          >
            -
          </Button>
          <Text className="count-value">{adults}</Text>
          <Button 
            className="count-button" 
            onClick={() => handleAdultChange(1)}
            onTap={() => handleAdultChange(1)}
            disabled={adults >= 20}
          >
            +
          </Button>
        </View>
      </View>

      <View className="guests-section">
        <Text className="section-title">儿童</Text>
        <View className="count-control">
          <Button 
            className="count-button" 
            onClick={() => handleChildChange(-1)}
            onTap={() => handleChildChange(-1)}
            disabled={children <= 0}
          >
            -
          </Button>
          <Text className="count-value">{children}</Text>
          <Button 
            className="count-button" 
            onClick={() => handleChildChange(1)}
            onTap={() => handleChildChange(1)}
            disabled={children >= 10}
          >
            +
          </Button>
        </View>
      </View>

      <View className="confirm-button">
        <Button 
          className="confirm-btn" 
          onClick={handleConfirm}
          onTap={handleConfirm}
        >
          确认
        </Button>
      </View>
    </View>
  );
};

export default GuestsSelectPage;