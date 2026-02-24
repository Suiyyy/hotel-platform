import { useState } from 'react';
import { View, Text, Input, Button, Swiper, SwiperItem, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useHotelStore } from '../../store/hotelContext';
import Calendar from '../../components/Calendar';
import './index.scss';

const SearchPage = () => {
  const [keyword, setKeyword] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const { searchHotels } = useHotelStore();

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
      checkInDate,
      checkOutDate 
    });
    Taro.navigateTo({
      url: '/pages/list/index'
    });
  };

  const handleDateSelect = (startDate, endDate) => {
    setCheckInDate(startDate);
    setCheckOutDate(endDate);
  };

  const bannerImages = [
    'https://picsum.photos/seed/banner1/750/300',
    'https://picsum.photos/seed/banner2/750/300',
    'https://picsum.photos/seed/banner3/750/300'
  ];

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
            onClick={() => setCalendarVisible(true)}
            onTap={() => setCalendarVisible(true)}
          >
            <Text className={checkInDate ? 'date-text' : 'date-placeholder'}>
              {checkInDate || '选择入住日期'}
            </Text>
          </View>
        </View>

        <View className="form-item">
          <Text className="form-label">离店日期</Text>
          <View 
            className="date-selector"
            onClick={() => setCalendarVisible(true)}
            onTap={() => setCalendarVisible(true)}
          >
            <Text className={checkOutDate ? 'date-text' : 'date-placeholder'}>
              {checkOutDate || '选择离店日期'}
            </Text>
          </View>
        </View>

        <Button className="search-btn" onClick={handleSearch} onTap={handleSearch}>
          搜索酒店
        </Button>
      </View>

      <Calendar
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        onDateSelect={handleDateSelect}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
      />
    </View>
  );
};

export default SearchPage;


