import Vue from 'vue'
import Router from 'vue-router'
// 引入-登入組件
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'
import Welcome from '@/components/Welcome.vue'
import Users from '@/components/user/Users.vue'
import Rights from '@/components/power/Rights.vue'
import Roles from '@/components/power/Roles.vue'
import Cate from '@/components/goods/Cate.vue'
import Params from '@/components/goods/Params.vue'
Vue.use(Router)

const router = new Router({
  routes: [
    // 當用戶訪問/根路徑時自動跳轉到登入頁面
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {

  if (to.path === '/login') return next()
  //獲取token 
  const tokenStr = window.sessionStorage.getItem('token')
  //判斷用戶訪問的頁面
  //如果用戶返回的值不是token代表他沒有登入,強制返回登入頁面
  if (!tokenStr) return next('/login')
  //反之有token則放行next
  next()
})

export default router