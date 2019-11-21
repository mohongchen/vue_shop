<template>
  <div>
    <!-- 商品分类组件 -->
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加用户按钮 -->
      <el-row>
        <el-col>
          <el-button
            type="primary"
            @click="showAddCateDialog"
          >添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        show-index
        :selection-type="false"
        :expand-type="false"
        border
        :show-row-hover="false"
      >
        <template
          slot="isOk"
          slot-scope="scope"
        >
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: green"
          ></i>
          <i
            class="el-icon-error"
            v-else
            style="color: red"
          ></i>
        </template>
        <!-- 排序 -->
        <template
          slot="order"
          slot-scope="scope"
        >
          <el-tag
            size="mini"
            v-if="scope.row.cat_level===0"
          >一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level===1"
          >二级</el-tag>
          <el-tag
            size="mini"
            type="warning"
            v-else
          >三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="setting">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisable"
      width="50%"
      @close="addCateFormClose"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item
          label="分类名称"
          prop="cat_name"
        >
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- :options用来指定数据源 -->
          <!-- :props 用来指定级联的方式 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            change-on-select
            clearable
          ></el-cascader>
          <!-- <el-cascader-panel :options="parentCateList"></el-cascader-panel> -->
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="addCateDialogVisable = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addCate"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类表
      cateList: [],
      // 商品分类查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //   总数据条数
      total: 0,
      //   为table指定列的属性
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '分类名称',
        // 当前这行是否使用模板列
        type: 'template',
        // 模板列名称
        template: 'isOk'
      }, {
        label: '排序',
        // 当前这行是否使用模板列
        type: 'template',
        // 模板列名称
        template: 'order'
      }, {
        label: '操作',
        // 当前这行是否使用模板列
        type: 'template',
        // 模板列名称
        template: 'setting'
      }],
      //   添加分类对话框显示
      addCateDialogVisable: false,
      // 添加分类表单数据
      addCateForm: {
        cat_name: '',
        // 添加1级分类，则父分类Id应该设置为  0
        cat_pid: 0,
        //  默认分类等级为一级分类
        cat_level: 0
      },
      //   添加分类表单验证规则
      addCateFormRules: {
        cat_name: [{
          required: true,
          message: '请输入分类名称',
          trigger: 'blur'
        }]
      },
      // 父级分类的列表
      parentCateList: [],
      // 选中的id
      selectedKeys: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      //   为商品分类列表赋值
      this.cateList = res.data.result
      //   记录总条数
      this.total = res.data.total
    },
    // 监听pageSize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 控制添加分类按钮的显示与隐藏
    showAddCateDialog() {
      // 先获取父级分类的列表
      this.getParentCateList()
      this.addCateDialogVisable = true
    },
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败')
      this.parentCateList = res.data
      console.log(this.parentCateList)
    },
    // 选择项改变时触发
    parentCateChange() {
      // 如果selectedKeys的长度大于零则说明选择了父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类的等级
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 当前分类的等级
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮添加分类
    addCate() {
      // 预验证
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('更新失败')
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisable = false
      })
    },
    // 监听添加分类表单的关闭
    addCateFormClose() {
      // 重置数据
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
