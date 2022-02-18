<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    // 登出原理
    // 消除掉本地的token值即可,這樣後續的請求就不會攜帶token
    logout() {
      // 清空token
      window.sessionStorage.clear()
      // 跳轉到登入頁面
      this.$router.push('login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>