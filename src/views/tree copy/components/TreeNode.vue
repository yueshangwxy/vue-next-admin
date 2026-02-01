
<template>
  <div class="tree-node">
    <div class="node-content" @click="handleExpand">
      <span class="arrow" :class="{ hidden: !hasChildren }">
        {{ node.expanded ? '▼' : '▶' }}
      </span>
      <div class="checkbox-wrapper" @click.stop="handleChange">
        <svg 
          v-if="node._fullySelected" 
          class="checkbox-icon checked" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24"
        >
          <rect x="1" y="1" width="22" height="22" rx="3" fill="#409eff" stroke="#409eff" stroke-width="2"/>
          <path d="M5 13L9 17L19 7" stroke="white" stroke-width="2" fill="none"/>
        </svg>
        <svg 
          v-else-if="node._partiallySelected" 
          class="checkbox-icon indeterminate" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24"
        >
          <rect x="1" y="1" width="22" height="22" rx="3" fill="#409eff" stroke="#409eff" stroke-width="2"/>
          <line x1="6" y1="12" x2="18" y2="12" stroke="white" stroke-width="3"/>
        </svg>
        <svg 
          v-else 
          class="checkbox-icon unchecked" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24"
        >
          <rect x="1" y="1" width="22" height="22" rx="3" fill="white" stroke="#dcdfe6" stroke-width="2"/>
        </svg>
        <span class="node-label">{{ node.label }}</span>
      </div>
    </div>
    <div v-if="node.expanded && hasChildren" class="children">
      <tree-node
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected-nodes="selectedNodes"
        @toggle-select="onToggleSelect"
        @toggle-expand="onToggleExpand"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  selectedNodes: {
    type: Set,
    required: true
  }
})

const emit = defineEmits(['toggleSelect', 'toggleExpand'])

const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

function handleChange() {
  emit('toggleSelect', props.node, !(props.node._fullySelected || props.node._partiallySelected))
}

function handleExpand() {
  if (hasChildren.value) {
    emit('toggleExpand', props.node)
  }
}

function onToggleSelect(node, checked) {
  emit('toggleSelect', node, checked)
}

function onToggleExpand(node) {
  emit('toggleExpand', node)
}
</script>

<style scoped>
.tree-node {
  padding-left: 20px;
}
.node-content {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
}
.arrow {
  margin-right: 5px;
  transition: transform 0.2s;
  width: 16px;
  text-align: center;
}
.arrow.hidden {
  visibility: hidden;
  margin-right: 5px;
}
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.checkbox-icon {
  width: 18px;
  height: 18px;
}
.checked {
  color: #409eff;
}
.indeterminate {
  color: #409eff;
}
.unchecked {
  color: #666;
}
.node-label {
  user-select: none;
}
.children {
  margin-top: 5px;
}
</style>
