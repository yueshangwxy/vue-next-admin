<template>
    <div class="app-container">
      <h1>树组件示例</h1>
      
      <div class="demo-container">
        <div class="config-panel">
          <h3>配置</h3>
          <div class="config-row">
            <label>
              <input type="checkbox" v-model="showCheckbox" /> 显示复选框
            </label>
            <label>
              <input type="checkbox" v-model="showSearch" /> 显示搜索框
            </label>
          </div>
          
          <div class="config-row">
            <button @click="setDefaultChecked">设置默认选中</button>
            <button @click="clearChecked">清空选中</button>
            <button @click="getCheckedKeys">获取选中</button>
          </div>
        </div>
        
        <div class="tree-panel">
          <Tree
            ref="treeRef"
            :data="treeData"
            :checked-keys="checkedKeys"
            :show-checkbox="showCheckbox"
            :show-search="showSearch"
            @update:checked-keys="handleCheckChange"
          />
          
          <div class="result-panel">
            <h3>已选节点: {{ checkedKeys.length }} 个</h3>
            <div v-if="checkedKeys.length" class="selected-items">
              <div v-for="key in checkedKeys" :key="key" class="selected-item">
                {{ getNodeLabel(key) }}
              </div>
            </div>
            <div v-else class="empty">暂无选中节点</div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import Tree from './components/Tree.vue'
  
  const treeRef = ref(null)
  const showCheckbox = ref(true)
  const showSearch = ref(true)
  const checkedKeys = ref(['1-1', '1-2-1', '2-1-1'])
  
  // 模拟树数据
  const treeData = ref([
    {
      id: '1',
      label: '一级节点 1',
      children: [
        {
          id: '1-1',
          label: '二级节点 1-1',
          children: [
            { id: '1-1-1', label: '三级节点 1-1-1' },
            { id: '1-1-2', label: '三级节点 1-1-2' },
            { id: '1-1-3', label: '三级节点 1-1-3' }
          ]
        },
        {
          id: '1-2',
          label: '二级节点 1-2',
          children: [
            { id: '1-2-1', label: '三级节点 1-2-1' },
            { id: '1-2-2', label: '三级节点 1-2-2' }
          ]
        },
        { id: '1-3', label: '二级节点 1-3' }
      ]
    },
    {
      id: '2',
      label: '一级节点 2',
      children: [
        {
          id: '2-1',
          label: '二级节点 2-1',
          children: [
            { id: '2-1-1', label: '三级节点 2-1-1' },
            { id: '2-1-2', label: '三级节点 2-1-2' }
          ]
        },
        { id: '2-2', label: '二级节点 2-2' }
      ]
    },
    {
      id: '3',
      label: '一级节点 3',
      children: []
    }
  ])
  
  function handleCheckChange(keys) {
    checkedKeys.value = keys
    console.log('选中节点:', keys)
  }
  
  function getNodeLabel(key) {
    const findNode = (nodes, targetKey) => {
      for (const node of nodes) {
        if (node.id === targetKey) return node.label
        if (node.children) {
          const found = findNode(node.children, targetKey)
          if (found) return found
        }
      }
      return ''
    }
    return findNode(treeData.value, key) || key
  }
  
  function setDefaultChecked() {
    checkedKeys.value = ['1-1', '2-1-1', '3']
  }
  
  function clearChecked() {
    checkedKeys.value = []
  }
  
  function getCheckedKeys() {
    if (treeRef.value) {
      const keys = treeRef.value.getCheckedKeys()
      alert(`当前选中节点: ${keys.join(', ')}`)
    }
  }
  </script>
  
  <style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .app-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  h1 {
    margin-bottom: 24px;
    color: #303133;
    text-align: center;
  }
  
  .demo-container {
    display: flex;
    gap: 24px;
  }
  
  .config-panel {
    width: 300px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }
  
  .config-panel h3 {
    margin-bottom: 16px;
    color: #495057;
  }
  
  .config-row {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .config-row label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #6c757d;
  }
  
  .config-row button {
    padding: 8px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .config-row button:hover {
    background: #0056b3;
  }
  
  .tree-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .result-panel {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }
  
  .result-panel h3 {
    margin-bottom: 12px;
    color: #495057;
  }
  
  .selected-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .selected-item {
    padding: 8px 12px;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    color: #495057;
    font-size: 14px;
  }
  
  .empty {
    color: #6c757d;
    font-style: italic;
    padding: 20px;
    text-align: center;
    background: white;
    border-radius: 4px;
    border: 1px dashed #dee2e6;
  }
  </style>