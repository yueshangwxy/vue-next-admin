
<template>
  <div id="app">
    <h1>树形组件使用示例</h1>
    <div class="popup">
      <TreeComponent 
        ref="treeComponentRef"
        v-model="showPopup"
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
import { onMounted, ref } from 'vue'
import TreeComponent from './components/TreeComponent.vue'

const selectedItems = ref([])

const showPopup = ref(false)
const toggleShowTree = () => {
  showPopup.value = !showPopup.value
}
const treeComponentRef = ref()

const handleConfirm = (selectedNodes) => {
  showPopup.value = false
  console.info('确认选择，最后一个全选节点:', selectedNodes)
}
onMounted(() => {
  treeComponentRef.value?.loadData({})
})
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
