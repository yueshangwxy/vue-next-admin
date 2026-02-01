<template>
  <div class="tree-component">
    <input v-model="searchText" placeholder="搜索节点..." class="search-input" />
    <div class="tree-root">
      <tree-node v-for="node in filteredTreeData" :key="node.id" :node="node" :selected-nodes="selectedNodes"
        @toggle-select="toggleSelect" @toggle-expand="toggleExpand" />
    </div>
    <div class="button-container">
      <div class="button-group">
        <div @click="resetSelection" class="reset-btn">重置</div>
        <div @click="confirmSelection" class="confirm-btn">确认</div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import {
    ref,
    computed,
    watch,
    onMounted
  } from 'vue'
  import TreeNode from './TreeNode.vue'
  import {
    fetchTreeData
  } from './data'

  // 接收父组件传递的数据
  const props = defineProps({
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

  // 选中节点ID集合（仅包含全选节点，不包含半选节点）
  const selectedNodes = ref(new Set(props.modelValue))

  // 存储被选中的最后一级节点对象
  const selectedLastLevelNodes = ref([])

  // 加载数据
  const loadData = async () => {
    try {
      treeData.value = fetchTreeData()
      // 初始化时检查父节点状态
      // initializeParentStates(treeData.value)
      // // 初始化时更新选中的最后一级节点
      // updateSelectedLastLevelNodes()
    } catch (error) {
      console.info('加载数据失败:', error)
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

  // 更新父节点状态 - 改进版本（基于全选/半选字段，半选节点不放入selectedNodes）
  const updateParentState = (node) => {
    if (!node.children || node.children.length === 0) return

    // 计算子节点的状态分布
    let fullySelectedCount = 0
    let unselectedCount = 0
    let totalChildren = node.children.length

    node.children.forEach(child => {
      if (child.checked) {
        fullySelectedCount++
      } else if (!child.checked && !child.indeterminate) {
        unselectedCount++
      }
    })

    // 设置父节点状态
    if (fullySelectedCount === totalChildren) {
      // 所有子节点都是全选状态
      node.checked = true
      node.indeterminate = false
      selectedNodes.value.add(node.id)
    } else if (unselectedCount === totalChildren) {
      // 所有子节点都是未选中状态
      node.checked = false
      node.indeterminate = false
      selectedNodes.value.delete(node.id)
    } else {
      // 混合状态（半选）
      node.checked = false
      node.indeterminate = true
      // 半选节点不放入selectedNodes
      selectedNodes.value.delete(node.id)
    }
  }

  // 获取所有选中的最后一级节点
  const getSelectedLastLevelNodes = () => {
    const selectedNodes = []

    // 遍历整个树结构
    const traverse = (nodes) => {
      nodes.forEach(node => {
        // 如果是最后一级节点（没有子节点）且被选中
        if ((!node.children || node.children.length === 0) && node.checked) {
          selectedNodes.push(node)
        } else if (node.children && node.children.length > 0) {
          // 递归遍历子节点
          traverse(node.children)
        }
      })
    }

    traverse(treeData.value)
    return selectedNodes
  }

  // 更新选中节点列表
  const updateSelectedLastLevelNodes = () => {
    selectedLastLevelNodes.value = getSelectedLastLevelNodes()
  }

  // 初始化加载数据
  onMounted(() => {
    loadData()
  })

  // 监听选中变化并触发更新
  watch(selectedNodes.value, () => {
    updateSelectedLastLevelNodes()
    emit('update:modelValue', Array.from(selectedNodes.value))
  })

  // 过滤后的树数据（基于搜索）
  const filteredTreeData = computed(() => {
    if (!searchText.value) return treeData.value
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
  const toggleExpand = (node) => {
    node.expanded = !node.expanded
  }

  // 切换选择状态
  const toggleSelect = (node, isChecked) => {
    const updateSelection = (nodes, check) => {
      nodes.forEach(n => {
        if (check) {
          selectedNodes.value.add(n.id)
          n.checked = true
          n.indeterminate = false
        } else {
          selectedNodes.value.delete(n.id)
          n.checked = false
          n.indeterminate = false
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

    // 更新选中的最后一级节点
    updateSelectedLastLevelNodes()
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
  const findNodeById = (nodes, id) => {
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
  const confirmSelection = () => {
    const lastLevelNodes = getSelectedLastLevelNodes()
    console.info('被选中的最后一级节点:', lastLevelNodes)
    emit('confirm', lastLevelNodes)
  }

  // 重置选择
  const resetSelection = () => {
    selectedNodes.value.clear()
    selectedLastLevelNodes.value = []
    // 重置所有节点的展开状态和选择状态
    const resetExpandState = (nodes) => {
      nodes.forEach(node => {
        node.expanded = false
        node.checked = false
        node.indeterminate = false
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
    padding: 16px;
  }

  .search-input {
    width: 100%;
    padding: 8px;
    margin-bottom: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .tree-root {
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 10px;
  }

  .button-container {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 16px;
  }
  .button-group {
    width: 100%;
    max-width: 448px;
    display: flex;
    gap: 8px;
  }

  .confirm-btn,
  .reset-btn {
    width: 100%;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    text-align: center;
  }

  .confirm-btn {
    background-color: #409eff;
    color: white;
  }

  .confirm-btn:hover {
    background-color: #337ecc;
  }

  .reset-btn {
    background-color: #eae7e7;
    color: white;
    color: #337ecc;
  }

  .reset-btn:hover {
    background-color: #eae7e7;
  }
</style>
