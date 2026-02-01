<template>
    <div 
      class="tree-node" 
      :style="{ paddingLeft: level * 20 + 8 + 'px' }"
      :class="{ 
        'is-leaf': node.isLeaf,
        'has-children': node.children && node.children.length > 0
      }"
    >
      <div class="node-content" @click.stop="handleNodeClick">
        <!-- 展开/收起图标 -->
        <span 
          v-if="!node.isLeaf" 
          class="expand-icon"
          @click.stop="handleToggleExpand"
        >
          <svg 
            v-if="isExpanded" 
            width="12" 
            height="12" 
            viewBox="0 0 12 12"
          >
            <path d="M2 5h8v2H2z" fill="currentColor"/>
          </svg>
          <svg 
            v-else 
            width="12" 
            height="12" 
            viewBox="0 0 12 12"
          >
            <path d="M5 2v8h2V2zM2 5h8v2H2z" fill="currentColor"/>
          </svg>
        </span>
        <span v-else class="expand-placeholder"></span>
        
        <!-- 复选框 -->
        <span 
          v-if="showCheckbox" 
          class="checkbox" 
          @click.stop="handleCheckboxClick"
        >
          <svg 
            v-if="checkState === 'checked'" 
            width="16" 
            height="16" 
            viewBox="0 0 16 16"
          >
            <rect x="1" y="1" width="14" height="14" rx="2" fill="#409eff" stroke="#409eff"/>
            <path d="M4 8l3 3 5-5" stroke="white" stroke-width="2" fill="none"/>
          </svg>
          <svg 
            v-else-if="checkState === 'indeterminate'" 
            width="16" 
            height="16" 
            viewBox="0 0 16 16"
          >
            <rect x="1" y="1" width="14" height="14" rx="2" fill="#409eff" stroke="#409eff"/>
            <rect x="4" y="7" width="8" height="2" fill="white"/>
          </svg>
          <svg 
            v-else 
            width="16" 
            height="16" 
            viewBox="0 0 16 16"
          >
            <rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="white" stroke="#dcdfe6" stroke-width="1"/>
          </svg>
        </span>
        
        <!-- 节点文本 -->
        <span 
          class="node-label"
          :class="{ 
            'is-checked': checkState === 'checked',
            'is-search-match': isSearchMatch
          }"
        >
          {{ node.label }}
        </span>
      </div>
      
      <!-- 子节点 -->
      <div v-if="!node.isLeaf && isExpanded && hasVisibleChildren" class="node-children">
        <tree-node
          v-for="child in filteredChildren"
          :key="child.id"
          :node="child"
          :level="level + 1"
          :checked-keys="checkedKeys"
          :expanded-keys="expandedKeys"
          :search-text="searchText"
          :show-checkbox="showCheckbox"
          @toggle-expand="$emit('toggle-expand', $event)"
          @toggle-check="$emit('toggle-check', $event)"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, defineProps, defineEmits } from 'vue'
  
  const props = defineProps({
    node: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    checkedKeys: {
      type: Array,
      default: () => []
    },
    expandedKeys: {
      type: Array,
      default: () => []
    },
    searchText: {
      type: String,
      default: ''
    },
    showCheckbox: {
      type: Boolean,
      default: true
    }
  })
  
  const emit = defineEmits(['toggle-expand', 'toggle-check'])
  
  // 是否展开
  const isExpanded = computed(() => props.expandedKeys.includes(props.node.id))
  
  // 是否被选中
  const isChecked = computed(() => props.checkedKeys.includes(props.node.id))
  
  // 复选框状态
  const checkState = computed(() => {
    if (!props.node.children || props.node.children.length === 0) {
      return isChecked.value ? 'checked' : 'unchecked'
    }
    
    // 检查子节点选中状态
    const allChildren = getAllChildIds(props.node)
    const allDirectChildren = props.node.children || []
    
    if (allChildren.every(id => props.checkedKeys.includes(id))) {
      return 'checked'
    } else if (allDirectChildren.some(child => 
      props.checkedKeys.includes(child.id) || 
      child.children?.some(grandChild => props.checkedKeys.includes(grandChild.id))
    )) {
      return 'indeterminate'
    } else {
      return isChecked.value ? 'checked' : 'unchecked'
    }
  })
  
  // 搜索匹配
  const isSearchMatch = computed(() => {
    if (!props.searchText) return false
    return props.node.label.toLowerCase().includes(props.searchText.toLowerCase())
  })
  
  // 是否有可见的子节点
  const hasVisibleChildren = computed(() => {
    if (!props.node.children) return false
    if (!props.searchText) return true
    
    // 搜索时只显示匹配的节点及其父节点
    return props.node.children.some(child => 
      child.label.toLowerCase().includes(props.searchText.toLowerCase())
    )
  })
  
  // 过滤子节点（搜索时使用）
  const filteredChildren = computed(() => {
    if (!props.node.children) return []
    if (!props.searchText) return props.node.children
    
    return props.node.children.filter(child => 
      child.label.toLowerCase().includes(props.searchText.toLowerCase()) ||
      child.children?.some(grandChild => 
        grandChild.label.toLowerCase().includes(props.searchText.toLowerCase())
      )
    )
  })
  
  // 获取所有子节点ID
  function getAllChildIds(node) {
    const ids = []
    function traverse(currentNode) {
      ids.push(currentNode.id)
      if (currentNode.children && currentNode.children.length > 0) {
        currentNode.children.forEach(traverse)
      }
    }
    traverse(node)
    return ids
  }
  
  // 处理节点点击
  function handleNodeClick() {
    emit('toggle-check', props.node, !isChecked.value)
  }
  
  // 处理展开/收起
  function handleToggleExpand() {
    emit('toggle-expand', props.node.id)
  }
  
  // 处理复选框点击
  function handleCheckboxClick() {
    emit('toggle-check', props.node, !isChecked.value)
  }
  </script>
  
  <style scoped>
  .tree-node {
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .tree-node:hover {
    background-color: #f5f7fa;
  }
  
  .node-content {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 0 8px;
    gap: 6px;
  }
  
  .expand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: #909399;
    transition: transform 0.2s;
    cursor: pointer;
    flex-shrink: 0;
  }
  
  .expand-placeholder {
    width: 16px;
    flex-shrink: 0;
  }
  
  .checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    cursor: pointer;
    flex-shrink: 0;
  }
  
  .node-label {
    font-size: 14px;
    color: #606266;
    user-select: none;
    transition: color 0.2s;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .node-label.is-checked {
    color: #409eff;
    font-weight: 500;
  }
  
  .node-label.is-search-match {
    color: #f56c6c;
    background-color: #fef0f0;
    padding: 0 4px;
    border-radius: 2px;
  }
  
  .node-children {
    overflow: hidden;
    animation: fadeIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>