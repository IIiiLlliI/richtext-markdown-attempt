<script setup lang="ts">
import Toolbar from '../components/Toolbar.vue'
import Note from '../components/Note.vue'

const leftTools = [
	{ icon: '📁', action: 'files', label: '文件' },
	{ icon: '🔍', action: 'search', label: '搜索' },
	{ icon: '📐', action: 'outline', label: '大纲' },
]

const rightTools = [
	{ icon: '👁', action: 'preview', label: '预览' },
	{ icon: '⚙', action: 'settings', label: '设置' },
]
</script>

<template>
	<div id="framework">
		<div id="head">
			<div id="logo">☯</div>
			<div id="name">markdown editor</div>
		</div>
		<div id="body">
			<Toolbar direction="left" :tools="leftTools" :defaultActive="0">
				<template #files>
					<div class="panel-content">
						<div class="panel-title">文件</div>
						<div class="file-item">index.md</div>
						<div class="file-item">readme.md</div>
						<div class="file-item">notes.md</div>
					</div>
				</template>
				<template #search>
					<div class="panel-content">
						<div class="panel-title">搜索</div>
						<input type="text" placeholder="搜索..." class="search-input" />
					</div>
				</template>
				<template #outline>
					<div class="panel-content">
						<div class="panel-title">大纲</div>
						<div class="outline-item">标题 1</div>
						<div class="outline-item indent">小标题 1.1</div>
						<div class="outline-item indent">小标题 1.2</div>
						<div class="outline-item">标题 2</div>
					</div>
				</template>
			</Toolbar>
			<Note></Note>
			<Toolbar direction="right" :tools="rightTools">
				<template #preview>
					<div class="panel-content">
						<div class="panel-title">预览</div>
						<p>Markdown 预览内容</p>
					</div>
				</template>
				<template #settings>
					<div class="panel-content">
						<div class="panel-title">设置</div>
						<label class="setting-item">
							<input type="checkbox" /> 自动保存
						</label>
						<label class="setting-item">
							<input type="checkbox" checked /> 显示行号
						</label>
					</div>
				</template>
			</Toolbar>
		</div>
	</div>
</template>

<style scoped lang="scss">
#framework {
	height: 100%;
	display: flex;
	flex-direction: column;
}

#head {
	height: var(--toolbar-width);
	background-color: #6b6375;
	padding: 5px;
	display: flex;
	gap: 5px;
}

#head > div {
	min-width: 30px;
	height: 30px;
	border-radius: 3px;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0 10px;
}

#head > div:hover {
	background-color: rgba(0, 0, 0, 0.6);
}

#head #logo {
	padding: 0;
	font-size: 16px;

	&:hover {
		background: none;
	}
}

#body {
	display: flex;
	flex: 1;
	width: 100%;
	overflow: hidden;
	justify-content: space-between;
	background-color: #6b6375;
	padding-bottom: 10px;
}

.panel-content {
	.panel-title {
		font-weight: bold;
		margin-bottom: 10px;
		color: #fff;
	}

	.file-item,
	.outline-item {
		padding: 5px 8px;
		cursor: pointer;
		border-radius: 5px;
		color: #ccc;
		font-size: 13px;

		&:hover {
			background-color: rgba(255, 255, 255, 0.1);
			color: #fff;
		}

		&.indent {
			padding-left: 16px;
			font-size: 12px;
		}
	}

	.search-input {
		width: 100%;
		padding: 6px 8px;
		border: none;
		border-radius: 5px;
		background-color: rgba(0, 0, 0, 0.3);
		color: #fff;
		font-size: 13px;

		&::placeholder {
			color: #888;
		}

		&:focus {
			outline: 1px solid #8b7bb8;
		}
	}

	.setting-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 0;
		color: #ccc;
		font-size: 13px;
		cursor: pointer;

		&:hover {
			color: #fff;
		}

		input[type='checkbox'] {
			accent-color: #8b7bb8;
		}
	}
}

</style>
