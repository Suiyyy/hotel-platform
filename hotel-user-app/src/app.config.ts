export default defineAppConfig({
  pages: [
    'pages/search/index',
    'pages/list/index',
    'pages/detail/index',
    'pages/favorites/index',
    'pages/history/index'
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
        text: '首页',
        iconPath: './images/tabbar/home.png',
        selectedIconPath: './images/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/favorites/index',
        text: '收藏',
        iconPath: './images/tabbar/favorite.png',
        selectedIconPath: './images/tabbar/favorite-active.png'
      },
      {
        pagePath: 'pages/history/index',
        text: '足迹',
        iconPath: './images/tabbar/history.png',
        selectedIconPath: './images/tabbar/history-active.png'
      }
    ]
  }
})
