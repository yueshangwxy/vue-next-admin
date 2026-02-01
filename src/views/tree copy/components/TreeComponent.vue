
<template>
  <div class="tree-component">
    <input v-model="searchText" placeholder="搜索节点..." class="search-input" />
    <div class="tree-root">
      <tree-node
        v-for="node in filteredTreeData"
        :key="node.id"
        :node="node"
        :selected-nodes="selectedNodes"
        @toggle-select="toggleSelect"
        @toggle-expand="toggleExpand"
      />
    </div>
    <div class="button-group">
      <button @click="confirmSelection" class="confirm-btn">确认</button>
      <button @click="resetSelection" class="reset-btn">重置</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import TreeNode from './TreeNode.vue'
import {fetchTreeData} from './data'

// 接收父组件传递的数据
const props = defineProps({
  apiUrl: {
    type: String,
    required: true
  },
  modelValue: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'confirm'])

// 搜索文本
const searchText = ref('')

// 全量数据
const treeData = ref([])

// 选中节点ID集合
const selectedNodes = ref(new Set(props.modelValue))

// 加载数据
const loadData = async () => {
  try {
    const response = await fetch(props.apiUrl)
    treeData.value = fetchTreeData()
    // 初始化时检查父节点状态
    initializeParentStates(treeData.value)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 初始化时检查并设置父节点状态
const initializeParentStates = (nodes) => {
  // 先收集所有有子节点的节点（从叶子节点开始）
  const nodesWithChildren = []
  const collectNodesWithChildren = (nodeList) => {
    nodeList.forEach(node => {
      if (node.children && node.children.length > 0) {
        collectNodesWithChildren(node.children)
        nodesWithChildren.push(node)
      }
    })
  }
  collectNodesWithChildren(nodes)
  
  // 从最深层的父节点开始更新状态
  nodesWithChildren.forEach(node => {
    updateParentState(node)
  })
}

// 更新父节点状态 - 改进版本（基于全选/半选字段）
const updateParentState = (node) => {
  if (!node.children || node.children.length === 0) return
  
  // 计算子节点的状态分布
  let fullySelectedCount = 0
  let unselectedCount = 0
  let totalChildren = node.children.length
  
  node.children.forEach(child => {
    if (child._fullySelected) {
      fullySelectedCount++
    } else if (!child._fullySelected && !child._partiallySelected) {
      unselectedCount++
    }
  })
  
  // 设置父节点状态
  if (fullySelectedCount === totalChildren) {
    // 所有子节点都是全选状态
    node._fullySelected = true
    node._partiallySelected = false
    selectedNodes.value.add(node.id)
  } else if (unselectedCount === totalChildren) {
    // 所有子节点都是未选中状态
    node._fullySelected = false
    node._partiallySelected = false
    selectedNodes.value.delete(node.id)
  } else {
    // 混合状态（半选）
    node._fullySelected = false
    node._partiallySelected = true
    selectedNodes.value.add(node.id)
  }
}

// 初始化加载数据
onMounted(() => {
  loadData()
})

// 监听选中变化并触发更新
watch(selectedNodes.value, (newVal) => {
  emit('update:modelValue', Array.from(newVal))
})

// 过滤后的树数据（基于搜索）
const filteredTreeData = computed(() => {
  if (!searchText.value) return treeData.value
  const result = []
  const search = searchText.value.toLowerCase()
  const traverse = (nodes, parentMatched = false) => {
    return nodes.map(node => {
      const isMatch = node.label.toLowerCase().includes(search)
      const children = node.children ? traverse(node.children, isMatch || parentMatched) : []
      const hasMatchingChild = children.some(child => child.visible)
      const visible = isMatch || hasMatchingChild || parentMatched
      
      // 如果节点匹配或有匹配的子节点，则展开该节点
      if (visible && (isMatch || hasMatchingChild)) {
        node.expanded = true
      }
      
      return {
        ...node,
        children,
        visible
      }
    }).filter(node => node.visible)
  }
  return traverse(treeData.value)
})

// 展开/收起节点
function toggleExpand(node) {
  node.expanded = !node.expanded
}

// 切换选择状态
function toggleSelect(node, isChecked) {
  const updateSelection = (nodes, check) => {
    nodes.forEach(n => {
      if (check) {
        selectedNodes.value.add(n.id)
        n._fullySelected = true
        n._partiallySelected = false
      } else {
        selectedNodes.value.delete(n.id)
        n._fullySelected = false
        n._partiallySelected = false
      }
      if (n.children && n.children.length > 0) {
        updateSelection(n.children, check)
      }
    })
  }

  // 更新当前节点及子节点
  updateSelection([node], isChecked)

  // 更新所有父级节点状态
  updateParentStatesRecursive(node.id)
}

// 递归更新父节点状态
const updateParentStatesRecursive = (childNodeId) => {
  const getParentNode = (nodes, targetId) => {
    for (const node of nodes) {
      if (node.children && node.children.some(child => child.id === targetId)) {
        return node
      }
      if (node.children) {
        const found = getParentNode(node.children, targetId)
        if (found) return found
      }
    }
    return null
  }

  const parentNode = getParentNode(treeData.value, childNodeId)
  if (parentNode) {
    updateParentState(parentNode)
    // 递归更新上级节点
    updateParentStatesRecursive(parentNode.id)
  }
}

// 工具函数：根据ID查找节点
function findNodeById(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

// 确认选择
function confirmSelection() {
  const selectedIds = Array.from(selectedNodes.value)
  const selectedNodesData = []
  
  // 获取所有选中节点的完整数据
  const collectSelectedNodes = (nodes) => {
    nodes.forEach(node => {
      if (selectedNodes.value.has(node.id)) {
        selectedNodesData.push(node)
      }
      if (node.children && node.children.length > 0) {
        collectSelectedNodes(node.children)
      }
    })
  }
  
  collectSelectedNodes(treeData.value)
  
  // 找到最后一个全选节点
  const lastFullySelectedNode = findLastFullySelectedNode(selectedNodesData)
  
  console.log('所有选中的最后一个全选节点:', lastFullySelectedNode)
  emit('confirm', lastFullySelectedNode)
}

// 查找最后一个全选节点
function findLastFullySelectedNode(selectedNodesData) {
  // 从后往前找，找到第一个满足条件的节点（即其所有子节点都被全选）
  for (let i = selectedNodesData.length - 1; i >= 0; i--) {
    const node = selectedNodesData[i]
    if (node.children && node.children.length > 0) {
      const allChildrenFullySelected = node.children.every(child => child._fullySelected)
      
      if (allChildrenFullySelected) {
        return node
      }
    }
  }
  return null
}

// 重置选择
function resetSelection() {
  selectedNodes.value.clear()
  // 重置所有节点的展开状态和选择状态
  const resetExpandState = (nodes) => {
    nodes.forEach(node => {
      node.expanded = false
      node._fullySelected = false
      node._partiallySelected = false
      if (node.children && node.children.length > 0) {
        resetExpandState(node.children)
      }
    })
  }
  resetExpandState(treeData.value)
  searchText.value = ''
}
</script>

<style scoped>
.tree-component {
  font-family: Arial, sans-serif;
}
.search-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.tree-root {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
}
.button-group {
  display: flex;
  gap: 10px;
}
.confirm-btn, .reset-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.confirm-btn {
  background-color: #409eff;
  color: white;
}
.confirm-btn:hover {
  background-color: #337ecc;
}
.reset-btn {
  background-color: #f56c6c;
  color: white;
}
.reset-btn:hover {
  background-color: #dd6161;
}
</style>
