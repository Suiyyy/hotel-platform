import { useState } from 'react';
import { View, Text, Input, Button, Swiper, SwiperItem, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { DatePicker } from 'antd-mobile';
import { useHotelStore } from '../../store/hotelContext';
import './index.scss';

const SearchPage = () => {
  const [keyword, setKeyword] = useState('');
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const { searchHotels } = useHotelStore();

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSearch = () => {
    if (!checkInDate || !checkOutDate) {
      Taro.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return;
    }
    
    searchHotels({ 
      keyword, 
      checkInDate: formatDate(checkInDate), 
      checkOutDate: formatDate(checkOutDate) 
    });
    Taro.navigateTo({
      url: '/pages/list/index'
    });
  };

  const handleCheckInConfirm = (date) => {
    setCheckInDate(date);
    setShowCheckInPicker(false);
    
    if (!checkOutDate || new Date(date) >= new Date(checkOutDate)) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay);
    }
  };

  const handleCheckOutConfirm = (date) => {
    if (checkInDate && new Date(date) <= new Date(checkInDate)) {
      Taro.showToast({
        title: '离店日期必须晚于入住日期',
        icon: 'none'
      });
      return;
    }
    setCheckOutDate(date);
    setShowCheckOutPicker(false);
  };

  const bannerImages = [
    'https://picsum.photos/seed/banner1/750/300',
    'https://picsum.photos/seed/banner2/750/300',
    'https://picsum.photos/seed/banner3/750/300'
  ];

  const getMinCheckOutDate = () => {
    if (checkInDate) {
      const minDate = new Date(checkInDate);
      minDate.setDate(minDate.getDate() + 1);
      return minDate;
    }
    return null;
  };

  return (
    <View className="search-page">
      <Swiper className="banner-swiper" indicatorDots autoplay circular>
        {bannerImages.map((img, index) => (
          <SwiperItem key={index}>
            <Image className="banner-image" src={img} mode="aspectFill" />
          </SwiperItem>
        ))}
      </Swiper>

      <View className="search-form">
        <View className="form-item">
          <Text className="form-label">目的地</Text>
          <Input
            className="form-input"
            placeholder="请输入酒店名称或地址"
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
          />
        </View>

        <View className="form-item">
          <Text className="form-label">入住日期</Text>
          <View 
            className="date-selector"
            onClick={() => setShowCheckInPicker(true)}
          >
            <Text className={checkInDate ? 'date-text' : 'date-placeholder'}>
              {checkInDate ? formatDate(checkInDate) : '选择入住日期'}
            </Text>
          </View>
        </View>

        <View className="form-item">
          <Text className="form-label">离店日期</Text>
          <View 
            className="date-selector"
            onClick={() => setShowCheckOutPicker(true)}
          >
            <Text className={checkOutDate ? 'date-text' : 'date-placeholder'}>
              {checkOutDate ? formatDate(checkOutDate) : '选择离店日期'}
            </Text>
          </View>
        </View>

        <Button className="search-btn" onClick={handleSearch}>
          搜索酒店
        </Button>
      </View>

      <DatePicker
        title="选择入住日期"
        visible={showCheckInPicker}
        onConfirm={handleCheckInConfirm}
        onCancel={() => setShowCheckInPicker(false)}
        min={new Date()}
      />

      <DatePicker
        title="选择离店日期"
        visible={showCheckOutPicker}
        onConfirm={handleCheckOutConfirm}
        onCancel={() => setShowCheckOutPicker(false)}
        min={getMinCheckOutDate() || new Date()}
      />
    </View>
  );
};

export default SearchPage;
