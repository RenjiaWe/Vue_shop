<template>
  <div>
    <!-- 麵包屑導航區域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分類</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片視圖區 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分類</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table class="treeTable" show-index index-text="#" border :data="catelist" :columns="columns" :selection-type="false" :expand-type="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一級</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二級</el-tag>
          <el-tag type="warning" v-else>三級</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showeditCateDialog(scope.row)">編輯</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">刪除</el-button>
        </template>
      </tree-table>
      <!-- 分頁區域 -->
      <el-pagination class="bottompage" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分類的對話框 -->
    <el-dialog title="添加分類" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 添加分類的表單 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分類名稱: " prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父級分類: ">
          <!-- options  用來指定數據源-->
          <!-- props  用來指定配置對象 -->
          <el-cascader clearable change-on-select expandTrigger="hover" v-model="selecteKeys" :options="parentCateList" :props="{
              expandTrigger: 'hover',
              ...cascaderProps,
              checkStrictly: 'true'}" @change="parentCateChanged"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">確 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分類信息 -->
    <el-dialog title="修改分類" :visible.sync="editCateDialogVisbel" width="50%">
      <el-form :model="editCate" :rules="editCateRules" ref="editCateRef" label-width="100px">
        <el-form-item label="分類名称" prop="cat_name">
          <el-input v-model="editCate.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisbel = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查詢條件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分類的數據列表
      catelist: [],
      // 總數據條數
      total: 0,
      // 為table指定列的定義
      columns: [
        {
          label: '分類名稱',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示將當前列定義為模板列
          type: 'template',
          // 表示當前這一列使用模板名稱
          template: 'isok'
        },
        {
          label: '排序',
          // 表示將當前列定義為模板列
          type: 'template',
          // 表示當前這一列使用模板名稱
          template: 'order'
        },
        {
          label: '操作',
          // 表示將當前列定義為模板列
          type: 'template',
          // 表示當前這一列使用模板名稱
          template: 'opt'
        }
      ],
      // 控制添加分類對話框的顯示與隱藏
      addCateDialogVisible: false,
      // 添加分類表單的數據對象
      addCateForm: {
        // 將要添加的分類的名稱
        cat_name: '',
        // 父級分類的ID
        cat_pid: 0,
        // 分類的等級,默認要添加的是一級分類
        cat_level: 0
      },
      // 添加分類表單的驗證規則對象
      addCateFormRules: {
        cat_name: [{ required: true, message: '請輸入分類名稱', trigger: 'blur' }]
      },
      // 父級分類的列表
      parentCateList: [],
      // 指定級聯選擇器的配置對象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 選中的父級分類的ID陣列
      selecteKeys: [],
      // 編輯對話框的顯示和隐藏
      editCateDialogVisbel: false,
      editCate: {},
      editCateRules: {
        cat_name: [{ required: true, message: '請輸入要修改的訊息', trigger: 'blur' }]
      },
      editCateId: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 獲取商品分類數據
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return res.$message.error('獲取商品分類失敗 !')
      }
      // 把數據列表 賦值給 catelist
      this.catelist = res.data.result
      // 為總數據條數賦值
      this.total = res.data.total
    },
    // 監聽pagesize改變的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 監聽pagenum 改變
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 點擊按鈕,展示添加分類的對話框
    showAddCateDialog() {
      // 先獲取父級分類裡面的數據列表
      this.getParentCateList()
      // 再展示出對話框
      this.addCateDialogVisible = true
    },
    // 獲取父級分類的數據列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return res.$message.error('獲取父級數據失敗 !')
      }
      this.parentCateList = res.data
    },
    // 選擇項發生變化便觸發下列代碼
    parentCateChanged() {
      console.log(this.selecteKeys)
      // 如果selecteKeys中的陣列長度大於0 代表選中了父級分類
      // 反之則表示沒有選中父級分類
      if (this.selecteKeys.length > 0) {
        // 父級分類的ID
        this.addCateForm.cat_pid = this.selecteKeys[this.selecteKeys.length - 1]
        // 為當前分類的等級賦值
        this.addCateForm.cat_level = this.selecteKeys.length
        return
      } else {
        // 父級分類的ID
        this.addCateForm.cat_pid = 0
        // 為當前分類的等級賦值
        this.addCateForm.cat_level = 0
      }
    },
    //點擊按鈕 添加新的分類
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return res.$message.error('添加分類失敗 !')
        }
        this.$message.success('添加成功 !')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 監聽對話框的關閉事件 重置表單數據
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selecteKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    async showeditCateDialog(cateInfo) {
      this.editCateId = cateInfo.cat_id
      const { data: res } = await this.$http.get('categories/' + cateInfo.cat_id)
      this.editCate = res.data
      this.editCateDialogVisbel = true
    },
    // 編輯分類訊息
    async editCateInfo() {
      const { data: res } = await this.$http.put('categories/' + this.editCate.cat_id, { cat_name: this.editCate.cat_name })
      if (res.meta.status !== 200) {
        return this.$message.error('更新分類數據失敗!')
      }
      this.$message.success('更新分類數據成功!')
      this.getCateList()
      this.editCateDialogVisbel = false
      // console.log(res)
    },
    // 删除分類
    async removeCate(id) {
      const confirRustle = await this.$confirm('此操作將永久删除該文件, 是否繼續?', '删除分類', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)

      if (confirRustle !== 'confirm') {
        return this.$message.info('已取消删除操作!')
      }

      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('分類删除失敗!')
      }
      this.$message.success('該分類已经成功删除!')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.bottompage {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>