
<template>
  <div id="app">
    <h1>树形组件使用示例</h1>
    <TreeComponent 
      :api-url="'/api/tree-data'" 
      v-model="selectedItems"
      @update:modelValue="handleSelectionChange"
      @confirm="handleConfirm"
    />
    <div class="selected-info">
      <h3>已选中项：</h3>
      <ul>
        <li v-for="item in selectedItems" :key="item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TreeComponent from './components/TreeComponent.vue'

const selectedItems = ref([])

function handleSelectionChange(value) {
  selectedItems.value = value
  console.log('选中项发生变化:', value)
}

function handleConfirm(lastFullySelectedNode) {
  console.log('确认选择，最后一个全选节点:', lastFullySelectedNode)
  if (lastFullySelectedNode) {
    alert(`最后一个全选节点: ${lastFullySelectedNode.label}`)
  } else {
    alert('没有找到全选节点')
  }
}
</script>

<style>
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}
.selected-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}
.selected-info h3 {
  margin-top: 0;
}
.selected-info ul {
  padding-left: 20px;
}
</style>
