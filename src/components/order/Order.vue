<template>
  <div>
    <!-- 麵包屑導航區域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>訂單管理</el-breadcrumb-item>
      <el-breadcrumb-item>訂單列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片視圖 -->
    <el-card>
      <!-- 搜尋區域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="請輸入内容" clearable v-model="queryInfo.query" @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 訂單列表數據 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="訂單編號" prop="order_number"></el-table-column>
        <el-table-column label="訂單價格" prop="order_price"></el-table-column>
        <el-table-column label="付款狀態" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="出貨狀態" prop="is_send"></el-table-column>
        <el-table-column label="下單時間" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>

      </el-table>

      <!-- 分頁區 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 修改地址的對話框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="區域" prop="address1">
          <el-input v-model="addressForm.address1"></el-input>
        </el-form-item>
        <el-form-item label="詳細地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">確 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示物流進度的對話框 -->
    <el-dialog title="物流進度" :visible.sync="progressVisible" width="50%">
      <span>後台API接口已無法使用</span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      // 訂單列表的數據
      orderlist: [],
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [{ required: true, message: '請輸入區域', trigger: 'blur' }],
        address2: [{ required: true, message: '請輸入詳細地址', trigger: 'blur' }]
      },
      progressVisible: false
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('數據獲取失敗 !')
      }
      this.total = res.data.total
      this.orderlist = res.data.goods
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 展示修改地址的對話框
    showBox() {
      this.addressVisible = true
    },
    showProgressBox() {
      this.progressVisible = true
    },
    // 關閉對話框並清空
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
</style>