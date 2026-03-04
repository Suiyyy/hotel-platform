import React from 'react';
import { View, Text, TouchableOpacity } from '@tarojs/components';
import './index.scss';

const ActionButtons = ({ primaryText, secondaryText, onPrimaryPress, onSecondaryPress }) => {
  return (
    <View className="action-buttons-container">
      {secondaryText && (
        <TouchableOpacity 
          className="secondary-button" 
          onClick={onSecondaryPress}
          onTap={onSecondaryPress}
          style={{ flex: 1 }}
        >
          <Text style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{secondaryText}</Text>
        </TouchableOpacity>
      )}
      {primaryText && (
        <TouchableOpacity 
          className="primary-button" 
          onClick={onPrimaryPress}
          onTap={onPrimaryPress}
          style={{ flex: 1 }}
        >
          <Text style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{primaryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ActionButtons;
