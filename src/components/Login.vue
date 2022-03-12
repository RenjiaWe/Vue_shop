<template>
  <div class="login-container">
    <div class="login_box">
      <!-- 頭像 -->
      <div class="avatar_box">
        <img src="/assets/logo.png" alt="">
      </div>
      <!-- 登入表單區域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_form">
        <!-- 用戶名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <!-- 密碼 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
        </el-form-item>
        <!-- 按鈕區域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登入</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 這是登入表單的數據綁定對象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 這是表單驗證規則的對象
      loginFormRules: {
        // 驗證用戶名是否合法
        username: [
          { required: true, message: '请输入登入名称', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登入密碼', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登入失敗')
        this.$message.success('登入成功')
        // 1. 將登入成功的token保存到客戶端的sessionStorage中
        //  1.1 項目中除了登入之外的其他的api接口,必須在登入之後才能訪問
        //  1.2 token只能在當前網站打開時生效,所以將token保存在sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 2. 通過編程式導航跳轉到後台主頁,路由地址是 /home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  color: aqua;
  height: 100%;
  background-color: #ccc;
}
.login_box {
  width: 500px;
  height: 300px;
  background-color: whitesmoke;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 130px;
    width: 130px;
    position: absolute;
    border-radius: 50%;
    padding: 10px;
    background-color: white;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>