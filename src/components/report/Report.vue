<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 2.为ECharts准备一个具备大小（宽高）的Dom -->
      <div
        id="main"
        style="width: 800px;height:400px;"
      ></div>
    </el-card>
  </div>
</template>

<script>
// 1.引入
import echarts from 'echarts'
// 深拷贝对象也可以合并对象
import _ from 'lodash'
export default {
  data() {
    return {
      // 官方数据需要用这个数据和服务器端的合并才会显示完整的折线图
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
  created() { },
  //   dom结构加载完
  async mounted() {
    // 3.基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    // 从服务器获取数据
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败！')
    }
    // 4.准备数据和配置项
    const result = _.merge(res.data, this.options)
    // 5.使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  }
}
</script>
