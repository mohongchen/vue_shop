<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加用户按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table
        :data="rolList"
        style="width: 100%"
        border
        stripe
      >
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom',i1==0?'bdtop':'','vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable>
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  :class="[i2==0?'':'bdtop','vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                    >
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close='removeRightsById(scope.row,item3.id)'
                    >
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- 获取一行数据 -->
            <!-- <pre>{{ scope.row }}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index">
        </el-table-column>
        <el-table-column
          prop="roleName"
          label="角色名称"
        >
        </el-table-column>
        <el-table-column
          prop="roleDesc"
          label="角色描述"
        >
        </el-table-column>
        <el-table-column
          label="操作"
          width="300px"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
            >编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
            >删除</el-button>
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="showSetRightDialogVisable"
      width="50%"
      @close="setRightDialogClose"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defkeys"
        ref="treeRef"
      ></el-tree>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="showSetRightDialogVisable = false">取 消</el-button>
        <el-button
          type="primary"
          @click="allotRights"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色的权限数据
      rolList: [],
      // 控制分配权限对话框是否显示
      showSetRightDialogVisable: false,
      // 所有权限列表
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的权限
      defkeys: [],
      // 更改权限的角色的id
      roleId: ''
    }
  },
  created() {
    this.getRolList()
  },
  methods: {
    async getRolList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolList = res.data
    },
    // 根据id删除权限
    async removeRightsById(role, rightID) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightID}`)
        if (res.meta.status !== 200) {
          this.$message.error('删除权限失败')
          return
        }
        // 防止整个列表刷新并且将服务器返回的最新权限列表更新
        role.children = res.data
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      // 把获取到的权限数据保存
      this.rightsList = res.data
      // 获取当前角色的所有权限 传入一个node节点和一个存储权限的arr
      this.getLeafKeys(role, this.defkeys)
      this.showSetRightDialogVisable = true
    },
    // 获取当前角色的所有权限 传入一个node节点和一个存储权限的arr
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听对话框的关闭事件
    setRightDialogClose() {
      this.defkeys = []
    },
    // 分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedNodes()
      ]
      //   keys.pop()
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      // 重新获取权限列表
      this.getRolList()
      this.showSetRightDialogVisable = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
