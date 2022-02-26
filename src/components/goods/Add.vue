<template>
  <div>
    <!-- 麵包屑導航區域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片視圖 -->
    <el-card>
      <!-- 提示區域 -->
      <el-alert title="添加商品訊息" type="info" center show-icon :closable="false">
      </el-alert>
      <!-- 步驟條區域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本訊息"></el-step>
        <el-step title="商品參數"></el-step>
        <el-step title="商品屬性"></el-step>
        <el-step title="商品圖片"></el-step>
        <el-step title="商品內容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab欄區域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本訊息" name="0">
            <el-form-item label="商品名稱" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品價格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品數量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分類" prop="goods_cat">
              <el-cascader expand-change='hover' v-model="addForm.goods_cat" :options="catelist" :props="cateProps" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品參數" name="1">
            <!-- 渲染表單的item項 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 複選框組 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品屬性" name="2">
            <el-form-item :label="item.attr_name" v-for=" item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品圖片" name="3">
            <!-- action 表示圖片要上傳到的後台API地址 -->
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="hanldeSuccess">
              <el-button size="small" type="primary">點擊上傳</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品內容" name="4">
            <!-- 富文本編輯器組件 -->
            <quill-editor v-model="addForm.goods_introduce">

            </quill-editor>
            <!-- 添加商品的按鈕 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 圖片預覽 -->
    <el-dialog title="圖片預覽" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      // 添加商品的表單數據對象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所屬的分類陣列
        goods_cat: [],
        // 圖片的陣列
        pics: [],
        // 商品的詳情描述
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [{ required: true, message: '請輸入商品名稱', trigger: 'blur' }],
        goods_price: [{ required: true, message: '請輸入商品價格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '請輸入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '請輸入商品數量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '請選擇商品分類', trigger: 'blur' }]
      },
      // 商品分類列表
      catelist: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 動態參數列表數據
      manyTableData: [],
      // 靜態屬性列表數據
      onlyTableData: [],
      // 上傳圖片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 圖片上傳的請求頭對象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 獲取所有商品分類數據
    async getCateList() {
      const { data: res } = await this.$http.get(`categories`)
      if (res.meta.status !== 200) {
        return this.$message.erro('獲取商品分類失敗 !')
      }
      this.catelist = res.data
    },
    // 級聯選擇器選中項變化,會觸發這個函數
    handleChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },

    beforeTabLeave(activeName, oldActiveName) {
      // 當前的頁面name為0
      // 且級聯的選擇器沒有選中第三類
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('請先選擇商品分類 !')
        // 返回fales讓用戶無法跳轉 請用戶勾選商品分類
        return false
      }
    },
    async tabClicked() {
      // 訪問的是動態參數面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('獲取動態參數數據失敗 !')
        }
        console.log(res.data)
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('獲取靜態屬性失敗 !')
        }
        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 處理圖片預覽效果
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 處理移除圖片的操作
    handleRemove(file) {
      //1. 獲取將要刪除的圖片的臨時路徑
      const filePath = file.response.data.tmp_path
      //2. 從pics陣列中,找到這個圖片對應的索引值
      const i = this.addForm.pics.findIndex((x) => {
        x.pic === filePath
      })
      //3. 調用數組的splice 方法 ,把圖片訊息對象,從pics陣列中移除
      this.addForm.pics.splice(i, 1)
    },
    // 監聽圖片上傳成功的事件
    hanldeSuccess(response) {
      // 1.拼接得到一個圖片對象
      const picInfo = { pic: response.data.tmp_path }
      // 2.將圖片 push到 pics陣列中
      this.addForm.pics.push(picInfo)
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('請填寫必要的表單 !')
        }
        // 執行添加
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 處理動態參數
        this.manyTableData.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(newInfo)
        })
        // 處理靜態屬性
        this.onlyTableData.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_vals: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // 發起請求添加商品
        // 商品的名稱不能重複
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return res.$message.error('添加商品失敗 !')
        }
        this.$message.success('添加商品成功 !')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 10px;
}
</style>