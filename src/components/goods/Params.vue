<template>
  <div>
    <!-- 麵包屑導航區域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>參數列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片視圖區 -->
    <el-card>
      <!-- 頭部的警告區域 -->
      <el-alert show-icon title="注意: 只允許為第三級分類設置相關參數" type="warning" :closable="false">
      </el-alert>
      <!-- 選擇商品分類 -->
      <el-row class="cat_opt">
        <el-col>
          <span>選擇商品分類: </span>
          <!-- 選擇商品分類的級聯選擇框 -->
          <el-cascader v-model="selectedCateKeys" expandTrigger="hover" :options="catelist" :props="cateProps" @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab頁籤區域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加動態參數的面板 -->
        <el-tab-pane label="動態參數" name="many">
          <!-- 添加參數的按鈕 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加參數</el-button>
          <!-- 動態參數表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展開行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循環渲染tag標籤 -->
                <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 輸入文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加的按鈕 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="參數名稱" prop="attr_name"></el-table-column>
            <el-table-column type="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">編輯</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">刪除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加靜態屬性的面板 -->
        <el-tab-pane label="靜態屬性" name="only">
          <!-- 添加屬性的按鈕 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加屬性</el-button>
          <!-- 靜態屬性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展開行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循環渲染tag標籤 -->
                <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 輸入文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加的按鈕 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="屬性名稱" prop="attr_name"></el-table-column>
            <el-table-column type="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">編輯</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">刪除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加參數的對話框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加參數的對話框 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改參數的對話框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 添加參數的對話框 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分類列表
      catelist: [],
      // 級聯選擇框
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 級聯選擇框雙向綁定的事件
      selectedCateKeys: [],
      // 被激活的頁籤名稱
      activeName: 'many',
      //  動態參數的數據
      manyTableData: [],
      // 靜態參數的數據
      onlyTableData: [],
      // 控制添加對話框的顯示與隱藏
      addDialogVisible: false,
      // 添加參數的表單數據對象
      addForm: {
        attr_name: ''
      },
      // 添加表單的驗證規則
      addFormRules: {
        attr_name: [{ required: true, message: '請輸入參數名稱', trigger: 'blur' }]
      },
      // 控制修改對話框的顯示與隱藏
      editDialogVisible: false,
      // 修改的表單數據對象
      editForm: {},
      // 修改表單的驗證對象規則
      editFormRules: {
        attr_name: [{ required: true, message: '請輸入參數名稱', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 獲取所有的商品分類列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      // 獲取失敗
      if (res.meta.status !== 200) {
        return this.$message.error('獲取商品失敗 !')
      }
      // 獲取成功 將值傳回catelist這個空數組裡面
      this.catelist = res.data
    },
    // 級聯選擇框選中項變化,會觸發這個函數
    handleChange() {
      this.getParamsData()
    },
    // tab頁籤點擊事件的處理函數
    handleTabClick() {
      this.getParamsData()
      console.log(this.activeName)
    },
    // 獲取參數列表數據
    async getParamsData() {
      // 選中的不是三級分類
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 選中的是三級分類
      // 根據所選分類的ID 和當前所處的面板,獲取對應的參數
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('獲取參數列表失敗 !')
      }
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的顯示與隱藏
        item.inputVisible = false
        // 文本框中輸入的值
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 監聽添加對話框的關閉事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 點擊按鈕,添加參數的預驗證
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加參數失敗 !')
        }
        this.$message.success('添加參數成功 !')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 點擊按鈕 展示修改的對話框
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return res.$message.error('獲取參數訊息失敗 !')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 重置修改的表單
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 點擊按鈕 修改參數
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改參數失敗 !')
        }
        this.$message.success('修改參數成功!')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 根據ID刪除相對應的參數項
    async removeParams(attr_id) {
      const confirmResult = await this.$confirm('此操作將永久删除該參數, 是否繼續?', '提示', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      // 用戶取消了刪除
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消刪除 !')
      }
      // 用戶刪除了
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
      if (res.meta.status !== 200) {
        return res.$message.error('刪除參數失敗 !')
      }
      console.log(res.data)
      this.$message.success('刪除參數成功 !')
      this.getParamsData()
    },
    // 文本框失去焦點或按下enter鍵都會觸發
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果沒有return證明輸入了內容 需要做後續的處理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 保存這次操作
      this.saveAttrVals(row)
    },
    // 將對 attr_vals 的操作保存到數據庫
    async saveAttrVals(row) {
      // 保存這次操作
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改參數項失敗 !')
      }
      this.$message.success('修改參數項成功 !')
    },
    // 點擊按鈕展示文本輸入框
    async showInput(row) {
      row.inputVisible = true
      // 讓文本框自動獲得焦點
      // $nextTick 方法的作用就是當頁面上的元素被重新渲染之後才會執行回調函數中的代碼
      const { data: res } = await this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 刪除對應的可選項
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    //如果按鈕需要被禁用,則返回true, 否則返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 當前選中的三級分類ID
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 動態計算標題的文本
    titleText() {
      if (this.activeName === 'many') {
        return '動態參數'
      }
      return '靜態屬性'
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 150px;
}
</style>