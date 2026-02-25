export default defineAppConfig({
  pages: [
    'pages/search/index',
    'pages/list/index',
    'pages/detail/index',
    'pages/favorites/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0066cc',
    navigationBarTitleText: '酒店预订',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#0066cc',
    backgroundColor: '#fff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/search/index',
        text: '首页'
      },
      {
        pagePath: 'pages/favorites/index',
        text: '收藏'
      }
    ]
  }
})
