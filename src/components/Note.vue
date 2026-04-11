<script setup lang="ts">
function markdownToDomTree(markdown: string): object {
	let result: object = {};

	return {
		type: "doc",
		children: markdownToDomTree(markdown),
	}
}

function domTreeToMarkdowwn(domTree: object): string {
	return ""
}

const markdown = `
# 一级标题

这是一个普通段落，包含 **加粗文本** 和 _斜体文本_。

这是一个带嵌套的例子：**加粗里面有 _斜体_ 内容**。

## 二级标题

- 列表项一
- 列表项二，包含 **加粗**
- 列表项三，包含 _斜体_ 和普通文本

这是另一个段落。
`

// console.log(markdownToDomTree(markdown))
console.log()

</script>

<template>
	<div id="note-wrapper">
		123
	</div>
</template>

<style scoped>
	#note-wrapper {
		display: flex;
		flex: 1;
		background-color: #fefaf0;
		border-radius: 5px;
		color: black;
		padding: 50px;
	}
</style>