
<template>
  <div id="app">
    <h1>树形组件使用示例</h1>
    <TreeComponent 
      :api-url="'/api/tree-data'" 
      v-model="selectedItems"
      @update:modelValue="handleSelectionChange"
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
import TreeComponent from './Tree.vue'

const selectedItems = ref([])

function handleSelectionChange(value) {
  selectedItems.value = value
  console.log('选中项发生变化:', value)
}
</script>
