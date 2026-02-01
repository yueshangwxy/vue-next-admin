<template>
    <div class="tree-container">
      <!-- 搜索框 -->
      <div class="tree-search" v-if="showSearch">
        <input
          v-model="searchText"
          type="text"
          class="search-input"
          placeholder="搜索节点..."
          @input="handleSearch"
        />
      </div>
      
      <!-- 树形结构 -->
      <div class="tree-content">
        <tree-node
          v-for="node in visibleNodes"
          :key="node.id"
          :node="node"
          :level="0"
          :checked-keys="innerCheckedKeys"
          :expanded-keys="innerExpandedKeys"
          :search-text="searchText"
          :show-checkbox="showCheckbox"
          @toggle-expand="handleToggleExpand"
          @toggle-check="handleToggleCheck"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue'
  import TreeNode from './TreeNode.vue'
  
  const props = defineProps({
    // 树数据
    data: {
      type: Array,
      default: () => []
    },
    // 默认选中的节点key
    checkedKeys: {
      type: Array,
      default: () => []
    },
    // 默认展开的节点key
    defaultExpandedKeys: {
      type: Array,
      default: () => []
    },
    // 是否显示复选框
    showCheckbox: {
      type: Boolean,
      default: true
    },
    // 是否显示搜索框
    showSearch: {
      type: Boolean,
      default: true
    }
  })
  
  const emit = defineEmits(['update:checkedKeys', 'check-change'])
  
  // 搜索文本
  const searchText = ref('')
  
  // 内部管理的选中keys
  const innerCheckedKeys = ref([...props.checkedKeys])
  // 内部管理的展开keys
  const innerExpandedKeys = ref([...props.defaultExpandedKeys])
  
  // 扁平化所有节点（用于搜索和操作）
  const flatNodes = ref([])
  
  // 构建节点映射
  function buildNodeMap(nodes, parent = null, level = 0) {
    const result = []
    for (const node of nodes) {
      const currentNode = {
        id: node.id,
        label: node.label,
        children: node.children || [],
        parent: parent,
        level: level,
        isLeaf: !node.children || node.children.length === 0
      }
      result.push(currentNode)
      
      if (node.children && node.children.length > 0) {
        result.push(...buildNodeMap(node.children, currentNode, level + 1))
      }
    }
    return result
  }
  
  // 获取所有父节点
  function getAllParentIds(node) {
    const parentIds = []
    let current = node.parent
    while (current) {
      parentIds.push(current.id)
      current = current.parent
    }
    return parentIds
  }
  
  // 获取所有子节点
  function getAllChildIds(node) {
    const childIds = []
    function traverse(childNode) {
      childIds.push(childNode.id)
      if (childNode.children && childNode.children.length > 0) {
        childNode.children.forEach(traverse)
      }
    }
    traverse(node)
    return childIds.slice(1) // 排除自己
  }
  
  // 处理搜索
  function handleSearch() {
    if (!searchText.value.trim()) {
      return
    }
    
    // 搜索时展开所有匹配节点的父级
    const matchedNodes = flatNodes.value.filter(node => 
      node.label.toLowerCase().includes(searchText.value.toLowerCase())
    )
    
    const expandedSet = new Set(innerExpandedKeys.value)
    matchedNodes.forEach(node => {
      const parentIds = getAllParentIds(node)
      parentIds.forEach(id => expandedSet.add(id))
    })
    innerExpandedKeys.value = Array.from(expandedSet)
  }
  
  // 处理展开/收起
  function handleToggleExpand(nodeId) {
    const index = innerExpandedKeys.value.indexOf(nodeId)
    if (index > -1) {
      innerExpandedKeys.value.splice(index, 1)
    } else {
      innerExpandedKeys.value.push(nodeId)
    }
  }
  
  // 处理节点勾选
  function handleToggleCheck(node, checked) {
    const nodeObj = flatNodes.value.find(n => n.id === node.id)
    if (!nodeObj) return
    
    const checkedSet = new Set(innerCheckedKeys.value)
    
    // 处理当前节点
    if (checked) {
      checkedSet.add(node.id)
    } else {
      checkedSet.delete(node.id)
    }
    
    // 处理子节点
    if (nodeObj.children && nodeObj.children.length > 0) {
      const childIds = getAllChildIds(nodeObj)
      if (checked) {
        childIds.forEach(id => checkedSet.add(id))
      } else {
        childIds.forEach(id => checkedSet.delete(id))
      }
    }
    
    // 处理父节点
    updateParentCheckedState(nodeObj.parent, checkedSet)
    
    innerCheckedKeys.value = Array.from(checkedSet)
    emit('update:checkedKeys', innerCheckedKeys.value)
    emit('check-change', innerCheckedKeys.value)
  }
  
  // 更新父节点状态
  function updateParentCheckedState(parent, checkedSet) {
    if (!parent) return
    
    const allChildren = getAllChildIds(parent)
    const allDirectChildren = parent.children || []
    
    // 计算选中状态
    const allChildrenChecked = allChildren.every(id => checkedSet.has(id))
    const allDirectChildrenChecked = allDirectChildren.every(child => checkedSet.has(child.id))
    
    if (allChildrenChecked && allChildren.length > 0) {
      checkedSet.add(parent.id)
    } else if (allDirectChildrenChecked && allDirectChildren.length > 0) {
      checkedSet.add(parent.id)
    } else {
      checkedSet.delete(parent.id)
    }
    
    // 递归更新父级
    if (parent.parent) {
      updateParentCheckedState(parent.parent, checkedSet)
    }
  }
  
  // 计算可见节点（考虑展开状态）
  const visibleNodes = computed(() => {
    if (!props.data.length) return []
    
    function filterVisible(nodes, level) {
      return nodes.filter(node => {
        if (level === 0) return true
        
        // 检查所有父级是否展开
        const parentIds = getAllParentIds(node)
        return parentIds.every(id => innerExpandedKeys.value.includes(id))
      })
    }
    
    return filterVisible(flatNodes.value.filter(node => node.level === 0), 0)
  })
  
  // 监听数据变化
  watch(() => props.data, (newData) => {
    if (newData.length) {
      flatNodes.value = buildNodeMap(newData)
    }
  }, { immediate: true })
  
  // 监听外部选中的keys变化
  watch(() => props.checkedKeys, (newKeys) => {
    innerCheckedKeys.value = [...newKeys]
  }, { immediate: true })
  
  // 暴露方法
  defineExpose({
    getCheckedKeys: () => innerCheckedKeys.value,
    setCheckedKeys: (keys) => {
      innerCheckedKeys.value = [...keys]
    }
  })
  </script>
  
  <style scoped>
  .tree-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    user-select: none;
  }
  
  .tree-search {
    margin-bottom: 12px;
  }
  
  .search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.3s;
  }
  
  .search-input:focus {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
  }
  
  .tree-content {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 8px 0;
  }
  </style>