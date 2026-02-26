import { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useHotelStore } from '../../store/hotelContext';
import './index.scss';

const CitySelectPage = () => {
  const { updateSearchParams } = useHotelStore();
  const [cities, setCities] = useState([
    { id: 0, name: '不选择城市', pinyin: 'buxuanchengshi' },
    { id: 1, name: '北京', pinyin: 'beijing' },
    { id: 2, name: '上海', pinyin: 'shanghai' },
    { id: 3, name: '广州', pinyin: 'guangzhou' },
    { id: 4, name: '深圳', pinyin: 'shenzhen' },
    { id: 5, name: '南京', pinyin: 'nanjing' },
    { id: 6, name: '杭州', pinyin: 'hangzhou' },
    { id: 7, name: '成都', pinyin: 'chengdu' },
    { id: 8, name: '重庆', pinyin: 'chongqing' },
    { id: 9, name: '武汉', pinyin: 'wuhan' },
    { id: 10, name: '西安', pinyin: 'xian' },
    { id: 11, name: '苏州', pinyin: 'suzhou' },
    { id: 12, name: '天津', pinyin: 'tianjin' },
    { id: 13, name: '重庆', pinyin: 'chongqing' },
    { id: 14, name: '青岛', pinyin: 'qingdao' },
    { id: 15, name: '厦门', pinyin: 'xiamen' }
  ]);
  const [searchText, setSearchText] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);

  useEffect(() => {
    if (searchText) {
      const filtered = cities.filter(city => 
        city.name.includes(searchText) || 
        city.pinyin.includes(searchText.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [searchText, cities]);

  const handleCitySelect = (cityName) => {
    if (cityName === '不选择城市') {
      Taro.removeStorageSync('selectedCity');
      // 清除搜索参数中的location
      if (updateSearchParams) {
        updateSearchParams({ location: '' });
      }
    } else {
      Taro.setStorageSync('selectedCity', cityName);
      // 更新搜索参数中的location
      if (updateSearchParams) {
        updateSearchParams({ location: cityName });
      }
    }
    Taro.navigateBack();
  };

  return (
    <View className="city-select-page">
      <View className="search-bar">
        <Input
          className="search-input"
          placeholder="输入城市名称"
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
        />
      </View>
      <ScrollView className="city-list">
        {filteredCities.map(city => (
          <View 
            key={city.id} 
            className="city-item"
            onClick={() => handleCitySelect(city.name)}
            onTap={() => handleCitySelect(city.name)}
          >
            <Text className="city-name">{city.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CitySelectPage;