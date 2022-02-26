<template>
  <div>
    <!-- 麵包屑導航區域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>數據統計</el-breadcrumb-item>
      <el-breadcrumb-item>數據報表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片視圖區 -->
    <el-card>
      <!-- 2.為 ECharts 準備一個定義了寬高的 DOM -->
      <div id="main" style="width: 800px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
// 1.導入ECharts
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      // 需要合併的數據
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {},
  // 此時頁面上的dom元素已經被渲染完畢了
  async mounted() {
    // 3.基于準備好的dom，初始化echarts實例
    var myChart = echarts.init(document.getElementById('main'))

    const { data: res } = await this.$http.get(`reports/type/1`)
    if (res.meta.status !== 200) {
      return this.$message.error('獲取折線數據圖失敗 !')
    }

    // 4.準備數據
    const result = _.merge(res.data, this.options)

    // 5.展示數據
    myChart.setOption(result)
  },
  methods: {}
}
</script>

<style lang="less" scoped>
</style>