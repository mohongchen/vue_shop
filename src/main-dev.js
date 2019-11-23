import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入vue-table-with-tree
import ZkTable from 'vue-table-with-tree-grid'
import axios from 'axios'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles导入相关样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入加载进度条的包对应的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.prototype.$http = axios
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios设置请求拦截器 在这里展示进度条
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token') // 设置响应头
  return config
}, err => {
  console.log(err)
})
// 在response回复拦截器中隐藏进度条
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.config.productionTip = false
// 格式化时间的过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.component('tree-table', ZkTable)
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
