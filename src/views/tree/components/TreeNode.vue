<template>
  <div class="tree-node">
    <div class="node-content" @click="handleExpand" :style=" {
      'padding-left': node.level * 24 +'px'
    }">
      <svg v-if="hasChildren" :class="{
        'arrow-icon': true,
        collapsed: !node.expanded
      }" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 12L3 7h10l-5 5z" />
      </svg>
      <div class="empty-arrow" v-else></div>
      <div class="checkbox-wrapper" @click.stop="handleChange">
        <svg v-if="node.checked" class="checkbox-icon checked" width="18" height="18" viewBox="0 0 24 24">
          <rect x="1" y="1" width="22" height="22" rx="3" fill="#409eff" stroke="#409eff" stroke-width="2" />
          <path d="M5 13L9 17L19 7" stroke="white" stroke-width="2" fill="none" />
        </svg>
        <svg v-else-if="node.indeterminate" class="checkbox-icon indeterminate" width="18" height="18"
          viewBox="0 0 24 24">
          <rect x="1" y="1" width="22" height="22" rx="3" fill="#409eff" stroke="#409eff" stroke-width="2" />
          <line x1="6" y1="12" x2="18" y2="12" stroke="white" stroke-width="3" />
        </svg>
        <svg v-else class="checkbox-icon unchecked" width="18" height="18" viewBox="0 0 24 24">
          <rect x="1" y="1" width="22" height="22" rx="3" fill="white" stroke="#dcdfe6" stroke-width="2" />
        </svg>
        <span class="node-label">{{ node.label }}</span>
      </div>
    </div>
    <Transition mode="out-in">
      <div v-if="node.expanded && hasChildren" class="children">
        <tree-node v-for="child in node.children" :key="child.id" :node="child" :selected-nodes="selectedNodes"
          @toggle-select="onToggleSelect" @toggle-expand="onToggleExpand" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
  import {
    computed
  } from 'vue'

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

  const handleChange = () => {
    emit('toggleSelect', props.node, !(props.node.checked || props.node.indeterminate))
  }

  const handleExpand = () => {
    if (hasChildren.value) {
      emit('toggleExpand', props.node)
    }
  }

  const onToggleSelect = (node, checked) => {
    emit('toggleSelect', node, checked)
  }

  const onToggleExpand = (node) => {
    emit('toggleExpand', node)
  }
</script>

<style scoped>
  .tree-node {
    /* padding: 0 16px; */
  }

  .node-content {
    display: flex;
    align-items: flex-start;
    padding: 14px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .empty-arrow {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }

  .arrow-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    transition: transform 0.3s ease;
  }

  .arrow-icon.collapsed {
    transform: rotate(-90deg);
  }

  .checkbox-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    flex: 1;
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
    font-size: 14px;
    line-height: 20px;
    color: rgba(0, 0, 0, 0.9);
    flex: 1;
  }

  .children {
    margin-top: 5px;
  }
</style>