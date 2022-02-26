<template>
  <div>
    <!-- 麵包屑導航區域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>權限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片視圖 -->
    <el-card>
      <!-- 添加角色按鈕區 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表區域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展開列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '','vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一級權限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二級權限和三級權限 -->
              <el-col :span="19">
                <!-- 通過for循環 渲染二級權限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop','vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名稱" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">編輯</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="rolesdelete(scope.row.id)">刪除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配權限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色對話框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" @close="addDislogClosed">
      <el-form :model="addRolesForm" ref="addRolesForm" label-width="100px">
        <el-form-item label="角色名稱" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRolesUser">確 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑對話框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="30%">
      <el-form :model="editRolesForm" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名稱" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormInfo">確 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配權限的對話框 -->
    <el-dialog title="分配權限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 樹形控件 -->
      <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色的列表數據
      rolelist: [],
      // 所有權限的數據
      rightslist: [],
      // 控制分配權限對話框的顯示與隱藏
      setRightDialogVisible: false,
      // 添加角色對話框的顯示和隐藏
      addDialogVisible: false,
      // 编辑對話框的顯示和隐藏
      editDialogVisible: false,
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      editRolesForm: {},
      // 樹型控件的綁定對象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默認選中的結點id值陣列
      defKeys: [],
      // 當前即將分配腳色的ID
      rolesId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //獲取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('獲取角色列表失敗 !')
      }
      this.rolelist = res.data
    },
    // 添加角色
    addRolesUser() {
      this.$refs.addRolesForm.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRolesForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失敗!')
        }
        this.$message.success('添加角色成功!')
        this.getRolesList()
        this.addDialogVisible = false
      })
      // console.log(this.addRolesForm)
    },
    // 清空添加角色對話框
    addDislogClosed() {
      this.$refs.addRolesForm.resetFields()
    },
    // 删除角色
    async rolesdelete(id) {
      const confirmRusult = await this.$confirm('此操作將永久删除該角色, 是否繼續?', '删除角色', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confirmRusult !== 'confirm') {
        return this.$message.info('已取消該删除操作')
      }
      this.$http.delete('roles/' + id).then((res) => {
        const { data: response } = res
        if (response.meta.status !== 200) {
          return this.$message.error('該用户删除失敗')
        }
        this.$message.success('該用户已經删除')
        this.getRolesList()
      })
    },
    // 得到修改用户的訊息
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查詢角色失敗!')
      }
      this.editRolesForm = res.data
      this.editDialogVisible = true
    },
    editFormInfo() {
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) return
        this.$http
          .put('roles/' + this.editRolesForm.roleId, {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc
          })
          .then((res) => {
            if (res.data.meta.status !== 200) {
              return this.$message.error('修改角色失敗!')
            }
            this.$message.success('修改角色成功!')
            this.getRolesList()
          })
        this.editDialogVisible = false
      })
    },
    // 根據ID刪除對應的權限
    async removeRightById(role, rightId) {
      //彈出提示用戶是否要刪除
      const confirmResult = await this.$confirm('此操作將永久删除該文件, 是否繼續?', '提示', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('刪除已取消 !')
      }
      // 刪除失敗
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('刪除數據失敗 !')
      }
      // 刪除成功
      role.children = res.data
    },
    // 展示分配權限的對話框
    async showSetRightDialog(role) {
      this.roldId = role.id
      // 獲取所有權限列表
      const { data: res } = await this.$http.get('rights/tree')
      //獲取失敗
      if (res.meta.status !== 200) {
        return this.$message.error('獲取權限數據失敗 !')
      }
      //獲取成功
      // 把獲取到的權限保存到data中
      this.rightslist = res.data

      // 遞歸獲取三級節點的id
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    // 通過遞歸的形式 獲取角色下所有三級權限的id 並保存到defKeys陣列中
    getLeafKeys(node, arr) {
      // 如果當前node節點不包含children屬性則是三級節點
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // 監聽分配權限對話框的關閉
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 點擊為腳色分配權限
    async allotRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roldId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return res.$message.error('分配權限失敗 !')
      }
      this.$message.success('分配權限成功 !')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>