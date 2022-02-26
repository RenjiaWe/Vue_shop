import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import '@/plugins/element.js'
// 導入全局樣式表
import '@/assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'
// 導入富文本編輯器
import VueQuillEditor from 'vue-quill-editor'
// 導入富文本編輯器對應的樣式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 導入 NProgress 的JS和CSS
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// 導入axios
import axios from 'axios'
// 配置請求的根路徑
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 在 request攔截器中 展示進度條 NProgress.start();
// axios請求攔截
axios.interceptors.request.use(config => {
  NProgress.start()
  // 為請求頭對象,添加 token 驗證的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 在response攔截器中 隱藏進度條 NProgress.done();
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 將富文本編輯器 註冊為全局可用的組件
Vue.use(VueQuillEditor)

Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
