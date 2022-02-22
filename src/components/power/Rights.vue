<template>
  <div>
    <!-- 麵包屑導航區域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>權限管理</el-breadcrumb-item>
      <el-breadcrumb-item>權限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="權限名稱" prop="authName"></el-table-column>
        <el-table-column label="路徑" prop="path"></el-table-column>
        <el-table-column label="權限等級" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一級權限</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二級權限</el-tag>
            <el-tag type="warning" v-else>三級權限</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>

</template>

<script>
export default {
  data() {
    return {
      // 權限列表
      rightsList: []
    }
  },
  created() {
    // 獲取所有的權限
    this.getRightsList()
  },
  methods: {
    // 獲取權限列表
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      // 獲取失敗
      if (res.meta.status !== 200) {
        return this.$message.error('獲取權限列表失敗 !')
      }
      // 獲取成功
      this.rightsList = res.data
    }
  }
}
</script>

<style>
</style>