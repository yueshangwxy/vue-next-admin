
<template>
  <div id="app">
    <h1>树形组件使用示例</h1>
    <div class="popup">
      <TreeComponent 
        v-show="showTree"
        v-model="selectedItems"
        @update:modelValue="handleSelectionChange"
        @confirm="handleConfirm"
      />
    </div>
    <div @click="toggleShowTree">{{ showTree ? '关闭弹窗' : '打开弹窗'}}</div>
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

const showTree = ref(false)
const toggleShowTree = () => {
  showTree.value = !showTree.value
}
const handleSelectionChange = (value) => {
  selectedItems.value = value
  console.info('选中项发生变化:', value)
}

const handleConfirm = (selectedNodes) => {
  console.info('确认选择，最后一个全选节点:', selectedNodes)
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
.popup {
  max-width: 480px;
}
</style>
