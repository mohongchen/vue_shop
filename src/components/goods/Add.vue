<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- form表单tabs只能嵌套tab-pane 所以它要被放在表单里 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tabs标签 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane
            label="基本信息"
            name="0"
          >
            <el-form-item
              label="商品名称"
              prop="goods_name"
            >
              <el-input
                v-model="addForm.goods_name"
                placeholder="请输入内容"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="商品价格"
              prop="goods_price"
            >
              <el-input
                v-model="addForm.goods_price"
                placeholder="请输入内容"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="商品重量"
              prop="goods_weight"
            >
              <el-input
                v-model="addForm.goods_weight"
                placeholder="请输入内容"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="商品数量"
              prop="goods_number"
            >
              <el-input
                v-model="addForm.goods_number"
                placeholder="请输入内容"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="商品分类"
              prop="goods_cat"
            >
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChage"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane
            label="商品参数"
            name="1"
          >
            <el-form-item
              v-for="item in manytableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <!-- <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox> -->
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane
            label="商品属性"
            name="2"
          >
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlytableData"
              :key="item.attr_id"
            >
              <el-input
                v-model="item.attr_vals"
                placeholder="请输入内容"
              ></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane
            label="商品图片"
            name="3"
          >
            <!-- action表示上传的图片到后台Api的位置 -->
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button
                size="small"
                type="primary"
              >点击上传</el-button>
              <div
                slot="tip"
                class="el-upload__tip"
              >只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane
            label="商品内容"
            name="4"
          >
            <!-- 富文本编辑器 -->
            <!-- bidirectional data binding（双向数据绑定） -->
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
            <el-button
              type="primary"
              @click="add"
            >添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%"
    >
      <img
        :src="previewURL"
        class="previewImg"
      >
    </el-dialog>
  </div>
</template>

<script>
// 引入lodash命名为_ 用于深拷贝对象
import _ from 'lodash'
export default {
  data() {
    return {
      // 当前步骤
      activeIndex: 0,
      // 添加商品的表单对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      // 添加商品的参数规则
      addFormRules: {
        goods_name: {
          required: true,
          message: '请输入商品名称',
          trigger: 'blur'
        },
        goods_price: {
          required: true,
          message: '请输入商品价格',
          trigger: 'blur'
        },
        goods_weight: {
          required: true,
          message: '请输入商品重量',
          trigger: 'blur'
        },
        goods_number: {
          required: true,
          message: '请输入商品数量',
          trigger: 'blur'
        },
        goods_cat: {
          required: true,
          message: '请选择商品分类',
          trigger: 'blur'
        }
      },
      // 商品分类列表
      cateList: [],
      // 级联选择器渲染规则
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 商品参数列表
      manytableData: [],
      // 商品参数列表
      onlytableData: [],
      // 图片的上传地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的url
      previewURL: '',
      // 图片预览对话框
      previewVisible: false
    }
  },
  created() {
    this.getCatesList()
  },
  methods: {
    async getCatesList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据列表失败')
      this.cateList = res.data
    },
    // 级联选择器发生变化时
    handleChage() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 监听tabs标签页切换的钩子
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    async tabClicked() {
      // 访问动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
        // 让字符串重新变成数组
        // console.log(res.data) 这种输出res.data[0].attr_vals里面是rrue
        // console.log(res.data[0].attr_vals) 这种是字符串
        res.data.forEach(item => {
          if (item.attr_vals.length === 0) {
            return null
          }
          item.attr_vals = item.attr_vals.split(' ')
        })
        this.manytableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
        this.onlytableData = res.data
      }
    },
    handlePreview(file) {
      this.previewURL = file.response.data.url
      this.previewVisible = true
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // 拼接得到一个图片对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      // 添加到数据中
      this.addForm.pics.push(picInfo)
    },
    handleRemove(file) {
      // 获取图片的临时路径
      const filePath = file.response.data.tmp_path
      // 找到数据中对应的索引值
      const i = this.addForm.pics.findIndex(i => i.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    // 添加商品按钮的点击事件
    add() {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) {
          this.$message.error('请填写必要的表单项')
        }
        // 向服务器发起添加请求
        // 由于双向绑定的数据不能更换数据类型所以这里先做一个深拷贝
        let form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manytableData.forEach(item => {
          let newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理动态参数
        this.onlytableData.forEach(item => {
          let newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        // 跳转到商品列表页
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
  margin: 0 5px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.quill-editor {
  margin-bottom: 10px;
}
</style>
