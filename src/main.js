import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import '@/plugins/element.js'
// 導入全局樣式表
import '@/assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'
// 導入axios
import axios from 'axios'
// 配置請求的根路徑
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// axios請求攔截
axios.interceptors.request.use(config => {
  // 為請求頭對象,添加 token 驗證的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
