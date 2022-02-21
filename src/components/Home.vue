<template>
  <el-container class="home-container">
    <!-- 頭部區域 -->
    <el-header>
      <div>
        <img src="../assets/g2icon.png" alt="" width="60px" height="60px">
        <span>電商管理系統</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主體區域 -->
    <el-container>
      <!-- 側邊欄 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 側邊欄菜單區域 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 一級菜單 -->
          <el-submenu :index=" item.id +''" v-for="item in menulist" :key="item.id">
            <!-- 一級菜單的模板區 -->
            <template slot="title">
              <!-- 圖標 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二級菜單 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <!-- 圖標 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右側內容 -->
      <el-main>
        <router-view>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左側菜單數據
      menulist: [],
      iconsObj: {
        125: 'el-icon-s-custom',
        103: 'el-icon-s-tools',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-marketing'
      },
      //是否摺疊
      isCollapse: false,
      // 被激活的連結地址
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 登出原理
    // 消除掉本地的token值即可,這樣後續的請求就不會攜帶token
    logout() {
      // 清空token
      window.sessionStorage.clear()
      // 跳轉到登入頁面
      this.$router.push('login')
    },
    // 獲取所有的菜單
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      // 如果狀態碼不等於200 等於請求失敗,便把錯誤訊息印出
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 請求成功
      this.menulist = res.data
      console.log(res)
    },
    // 點擊按鈕切換菜單的展開與摺疊
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存連結的激活狀態
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    margin-left: 30px;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border: none;
  }
}
.el-main {
  background-color: #eaedf7;
}
.home-container {
  height: 100%;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 12px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.3em;
  cursor: pointer;
}
</style>