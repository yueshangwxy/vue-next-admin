
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import TreeNode from './TreeNode.vue'
import { fetchTreeData} from './data'
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
const emit = defineEmits(['update:modelValue'])

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
  const checkAndSetParents = (node) => {
    if (node.children && node.children.length > 0) {
      // 递归处理子节点
      node.children.forEach(checkAndSetParents)
      
      // 检查当前节点的子节点状态
      updateParentState(node)
    }
  }
  
  nodes.forEach(checkAndSetParents)
}

// 更新父节点状态
const updateParentState = (node) => {
  if (!node.children || node.children.length === 0) return
  
  const allSelected = node.children.every(child => selectedNodes.value.has(child.id))
  const someSelected = node.children.some(child => selectedNodes.value.has(child.id))
  
  if (allSelected) {
    selectedNodes.value.add(node.id)
  } else if (someSelected) {
    selectedNodes.value.add(node.id)
  } else {
    selectedNodes.value.delete(node.id)
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
      } else {
        selectedNodes.value.delete(n.id)
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
}
</style>
