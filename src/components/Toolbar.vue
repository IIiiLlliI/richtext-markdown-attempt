<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
	direction?: 'left' | 'right'
	tools: Array<{
		icon: string
		action: string
		label?: string
	}>
	defaultActive?: number
}>()

const activeTool = ref<string | null>(null)

const toggleTool = (action: string) => {
	if (activeTool.value === action) {
		activeTool.value = null
	} else {
		activeTool.value = action
	}
}

onMounted(() => {
	if (props.defaultActive !== undefined) activeTool.value = props.tools[props.defaultActive].action
})
</script>

<template>
	<div class="toolbar-wrapper" :class="direction">
		<div class="toolbar">
			<div
				v-for="tool in tools"
				:key="tool.action"
				class="tool"
				:class="{ active: activeTool === tool.action }"
				@click="toggleTool(tool.action)"
				:title="tool.label || tool.action"
			>
				{{ tool.icon }}
			</div>
		</div>
		<div class="content" v-if="activeTool">
			<slot :name="activeTool"></slot>
		</div>
	</div>
</template>

<style scoped>
.toolbar-wrapper {
	display: flex;
	height: 100%;
	max-height: 100%;
}

.toolbar-wrapper.left {
	flex-direction: row;
}

.toolbar-wrapper.left .content {
	margin-right: 10px;
}

.toolbar-wrapper.right {
	flex-direction: row-reverse;
}

.toolbar-wrapper.right .content {
	margin-left: 10px;
}

.toolbar {
	display: flex;
	flex-direction: column;
	padding: 5px;
	gap: 5px;
	background-color: #6b6375;
	width: var(--toolbar-width);
	height: 100%;
}

.content {
	width: 300px;
	height: 100%;
	background-color: #4a4252;
	overflow-y: auto;
	padding: 10px;
	border-left: 1px solid rgba(0, 0, 0, 0.3);
	border-radius: 5px;
}

.toolbar-wrapper.right .content {
	border-left: none;
	border-right: 1px solid rgba(0, 0, 0, 0.3);
}

.tool {
	height: 30px;
	min-width: 30px;
	border-radius: 5px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 14px;
	cursor: pointer;
	user-select: none;
	padding: 0 8px;
}

.tool:hover {
	background-color: rgba(0, 0, 0, 0.6);
}

.tool.active {
	background-color: rgba(0, 0, 0, 0.8);
}
</style>
