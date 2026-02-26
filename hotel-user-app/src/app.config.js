export default defineAppConfig({
  pages: [
    'pages/search/index',
    'pages/list/index',
    'pages/detail/index',
    'pages/city-select/index',
    'pages/guests-select/index',
    'pages/price-filter/index',
    'pages/date-select/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0066cc',
    navigationBarTitleText: '酒店预订',
    navigationBarTextStyle: 'white'
  }
})
