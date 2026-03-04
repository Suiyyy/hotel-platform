import { useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

const PriceFilterPage = () => {
  const [priceRange, setPriceRange] = useState('all');
  const [starRating, setStarRating] = useState('all');

  const priceOptions = [
    { value: 'all', label: '全部价格' },
    { value: '0-200', label: '¥0-200' },
    { value: '200-400', label: '¥200-400' },
    { value: '400-600', label: '¥400-600' },
    { value: '600-800', label: '¥600-800' },
    { value: '800-1000', label: '¥800-1000' },
    { value: '1000+', label: '¥1000+' }
  ];

  const starOptions = [
    { value: 'all', label: '全部星级' },
    { value: '5', label: '5钻/星豪华' },
    { value: '4', label: '4钻/星高档' },
    { value: '3', label: '3钻/星舒适' },
    { value: '2', label: '2钻/星经济' },
    { value: '1', label: '1钻/星' }
  ];

  const handlePriceSelect = (value) => {
    setPriceRange(value);
  };

  const handleStarSelect = (value) => {
    setStarRating(value);
  };

  const handleConfirm = () => {
    Taro.setStorageSync('priceFilter', { priceRange, starRating });
    Taro.navigateBack();
  };

  const handleReset = () => {
    setPriceRange('all');
    setStarRating('all');
  };

  return (
    <View className="price-filter-page">
      <ScrollView className="filter-content">
        <View className="filter-section">
          <Text className="section-title">价格范围</Text>
          <View className="option-grid">
            {priceOptions.map(option => (
              <View 
                key={option.value} 
                className={`option-item ${priceRange === option.value ? 'option-selected' : ''}`}
                onClick={() => handlePriceSelect(option.value)}
                onTap={() => handlePriceSelect(option.value)}
              >
                <Text className="option-text">{option.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="filter-section">
          <Text className="section-title">星级</Text>
          <View className="option-grid">
            {starOptions.map(option => (
              <View 
                key={option.value} 
                className={`option-item ${starRating === option.value ? 'option-selected' : ''}`}
                onClick={() => handleStarSelect(option.value)}
                onTap={() => handleStarSelect(option.value)}
              >
                <Text className="option-text">{option.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="filter-footer">
        <Button 
          className="reset-button" 
          onClick={handleReset}
          onTap={handleReset}
        >
          重置
        </Button>
        <Button 
          className="confirm-button" 
          onClick={handleConfirm}
          onTap={handleConfirm}
        >
          确认
        </Button>
      </View>
    </View>
  );
};

export default PriceFilterPage;