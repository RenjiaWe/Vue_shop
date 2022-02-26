<template>
  <div>
    <!-- 麵包屑導航區域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>用戶管理</el-breadcrumb-item>
      <el-breadcrumb-item>用戶列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片視圖區域 -->
    <el-card>
      <!-- 搜索與添加 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用戶</el-button>
        </el-col>
      </el-row>
      <!-- 用戶列表區 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="信箱" prop="email"></el-table-column>
        <el-table-column label="電話" prop="mobile"></el-table-column>
        <el-table-column label="身份" prop="role_name"></el-table-column>
        <el-table-column label="狀態">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <!-- 修改按鈕 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 刪除按鈕 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配按鈕 -->
            <el-tooltip effect="dark" content="分配腳色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分頁區域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用戶的對話框 -->
    <el-dialog title="添加用戶" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 內容主體 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px">
        <el-form-item label="用戶名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密碼" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="信箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手機" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部區域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">確 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用戶的對話框 -->
    <el-dialog title="修改用戶" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用戶名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="信箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手機" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">確 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配腳色的對話框 -->
    <el-dialog title="分配腳色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>當前的用戶:{{userInfo.username}}</p>
        <p>當前的角色:{{userInfo.role_name}}</p>
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 驗證信箱的規則
    var checkEmail = (rule, value, callback) => {
      // 驗證信箱的正則表達式
      // 中間一定要有一個@
      //'@'前後可以是英文, 數字, 符號.或_或-
      //'@'前後至少1個字，至多64個字
      const regEmail = /^([\w\.\-]){1,64}\@([\w\.\-]){1,64}$/
      if (regEmail.test(value)) {
        // 合法的信箱註冊
        return callback()
      }
      callback(new Error('請輸入正確的信箱格式'))
    }
    //驗證手機的規則
    var checkMobile = (rule, value, callback) => {
      // 必須09開頭且長度為10位數字
      const regMobile = /^09[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('請輸入正確格式的手機號碼'))
    }
    return {
      //獲取用戶列表的參數對象
      queryInfo: {
        query: '',
        // 當前的頁數
        pagenum: 1,
        // 當前每頁顯示多少條數據
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用戶對話框的顯示與隱藏
      addDialogVisible: false,
      // 添加用戶表單的數據
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表單的驗證規則對象
      addFormRules: {
        username: [
          { require: true, message: '請輸入用戶名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用戶名長度請在3~10個字之間',
            trigger: 'blur'
          }
        ],
        password: [
          { require: true, message: '請輸入密碼', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用戶名長度請在6~15個字之間',
            trigger: 'blur'
          }
        ],
        email: [
          { require: true, message: '請輸入信箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { require: true, message: '請輸入手機號碼', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用戶對話框的顯示與隱藏
      editDialogVisible: false,
      // 查詢到的用戶訊息對象
      editForm: {},
      editFormRules: {
        email: [
          { require: true, message: '請輸入用戶信箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { require: true, message: '請輸入用戶手機', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制分配腳色的對話框顯示與隱藏
      setRoleDialogVisible: false,
      // 需要被分配腳色的用戶訊息
      userInfo: {},
      // 所有腳色的數據列表
      rolesList: {},
      // 已選中的腳色ID值
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('獲取用戶數據失敗')
      }
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 監聽pagesize改變的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 監聽頁碼值改變的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 監聽switch狀態的改變
    async userStateChanged(userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用戶失敗!')
      }
      this.$message.success('更新用戶狀態成功 !')
    },
    // 監聽添加用戶對話框的關閉事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 點擊按鈕 添加新用戶
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        //可以發起請求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用戶失敗 !')
        }
        this.$message.success('添加用戶成功 !')
        // 隱藏添加用戶的對話框
        this.addDialogVisible = false
        // 重新獲得用戶數劇列表
        this.getUserList()
      })
    },
    // 展示編輯用戶的對話框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查詢用戶訊息失敗 !')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 監聽用戶修改對話框的事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用戶訊息並提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        // 發起修改用戶訊息的請求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        // 修改失敗
        if (res.meta.status !== 200) {
          return this.$message.error('更新用戶訊息失敗 !')
        }
        // 修改成功
        // 1.關閉對話框
        this.editDialogVisible = false
        // 2.刷新數據列表
        this.getUserList()
        // 3.提示修改成功
        this.$message.success('更新用戶訊息成功 !')
      })
    },
    // 根據ID刪除對應的用戶訊息
    async removeUserById(id) {
      // 跳出提示框是否確定要刪除
      const confirmResult = await this.$confirm('此操作将永久删除文件, 是否繼續?', '提示', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)

      // 如果用戶確認刪除 則返回值字串confirm
      // 如果用戶取消刪除 則返回值字串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消刪除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('刪除用戶失敗 !')
      }
      this.$message.success('刪除用戶成功 !')
      this.getUserList()
    },
    // 展示分配腳色的對話框
    async setRole(userInfo) {
      this.userInfo = userInfo
      // 在展示對話框之前,獲取所有腳色的列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('獲取腳色列表失敗 !')
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 點擊按鈕分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('請選擇要分配的腳色 !')
      }

      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })

      if (res.meta.status !== 200) {
        return this.$message.error('更新腳色失敗 !')
      }

      this.$message.success('更新用戶成功 !')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 監聽分配腳色對話框的關閉事件
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less">
.el-pagination {
  margin: 15px;
}
</style>