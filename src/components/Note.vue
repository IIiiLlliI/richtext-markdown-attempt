<script setup lang="ts">
import {ref} from "vue";
import {isDigitType, isDigit, findFirstNotOfFrom} from "../utils/DOMTypeDetermineUtils.ts";

type BlockType =
	"heading"
	| "paragraph"
	| "table"
	| "orderedList"
	| "unorderedList"
	| "item"
	| "doc"
	| "bold"
	| "link"
	| "italic"
	| "text"
	| "temp"
	| "";

interface Block {
	id?: string
	type: BlockType
	level?: number         // heading 用：0=h1, 1=h2, …
	serialNumber?: number  // orderedList 用：表示序号
	text?: string          // 叶子节点（type=text）用
	isClosed?: boolean     // inline 标记是否配对闭合
	children?: Block[]
}

let _idCounter = 1

function newId(): string {
	return "block" + _idCounter++
}

// 分为大类型判断、文本判断
function markdownToDomTree(markdown: string): Block {
	const doc: Block = {id: newId(), type: "doc", children: []}

	// 把整个文档按"空行"切成若干段落区块（paragraph group），
	// 然后对每个区块再细分类型
	const lines = markdown.split("\n")
	let i = 0

	while (i < lines.length) {

		const line = lines[i]

		// 空行跳过
		if (line.trim() === "") {
			i++
			continue
		}

		// ── Heading ──────────────────────────────────────────
		const headingMatch = line.match(/^(#{1,6}) (.+)$/)
		if (headingMatch) {
			doc.children!.push({
				id: newId(),
				type: "heading",
				level: headingMatch[1].length - 1,   // # → 0, ## → 1, …
				children: recognizeInline(headingMatch[2]),
			})
			i++
			continue
		}

		// ── Unordered list ───────────────────────────────────
		// 收集连续的 "* " 开头行作为一个列表块
		if (line.startsWith("* ")) {
			const items: Block[] = []
			while (i < lines.length && lines[i].startsWith("* ")) {
				items.push({
					type: "item",
					children: recognizeInline(lines[i].slice(2)),
				})
				i++
			}
			doc.children!.push({id: newId(), type: "unorderedList", children: items})
			continue
		}

		// ── Ordered list ─────────────────────────────────────
		// 匹配连续的序号的有序列表等
		if (line.match(/^(\d+)\. (.+)$/)) {
			const items: Block[] = []
			let prevNumber = undefined
			while (i < lines.length && lines[i].match(/^(\d+)\. (.+)$/)) {
				const orderedListMatch = lines[i].match(/^(\d+)\. (.+)$/)
				// 前置序号存在且不连续，打断
				if (!orderedListMatch || (prevNumber && parseInt(orderedListMatch[1]) != prevNumber + 1)) break
				prevNumber = parseInt(orderedListMatch[1])
				items.push({
					type: "item",
					serialNumber: prevNumber,
					children: recognizeInline(orderedListMatch[2]),
				})
				i++
			}
			doc.children!.push({id: newId(), type: "orderedList", children: items})
			continue
		}

		// ── Paragraph ────────────────────────────────────────
		doc.children!.push({
			id: newId(),
			type: "paragraph",
			children: recognizeInline(line),
		})
		i++
	}

	return doc
}

interface textType {
	id: BlockType
	value: string
}
let textTypes: textType[] = [{
	id: "bold",
	value: "**",
}, {
	id: "italic",
	value: "*",
}]
function recognizeInline(str: string): Block[] | undefined {
	if (str.length == 0) return [];

	let resultBlock: Block = {
		type: "temp",
		children: []
	}
	let insertStack: Block[] = [resultBlock]  // 指示插入位置 [ Block1, Block2 ]，Block2.children
	let currentIndex: number = 0;  // 用于界定实际文本的双指针
	let handledIndex: number = 0;
	while (currentIndex != str.length) {
		for (let element of textTypes) {
			const insertBlock = insertStack.at(-1)
			if (!insertBlock || !insertBlock.children) throw new Error();

			if (str.slice(currentIndex, currentIndex + element.value.length) == element.value) {
				// 类型匹配
				// 起始类型，此时currentIndex指向匹配标识符的前面
				if (insertBlock.type != element.id) {
					// 1. 匹配类型前面的文本入栈
					if (handledIndex != currentIndex) {
						insertBlock.children.push({
							type: "text",
							text: str.slice(handledIndex, currentIndex),
						})
					}
					handledIndex = currentIndex + element.value.length;

					// 2. 结果数组、插入栈都入栈一个新类型
					let newBlock: Block = {
						type: element.id,
						children: [],
						isClosed: false
					}
					insertBlock.children.push(newBlock)
					insertStack.push(newBlock)

					// 结束类型
				} else if (insertBlock.type == element.id) {
					// 1. 匹配类型前面的文本入栈
					if (handledIndex != currentIndex) {
						insertBlock.children.push({
							type: "text",
							text: str.slice(handledIndex, currentIndex),
						})
					}
					handledIndex = currentIndex + element.value.length;

					// 2. 插入栈元素出栈
					insertBlock.isClosed = true
					insertStack.pop()
				}
				currentIndex += element.value.length - 1;
				break;
			}
		}
		currentIndex += 1
	}
	const insertBlock = insertStack.at(-1)
	if (handledIndex != currentIndex && insertBlock && insertBlock.children) {
		insertBlock.children.push({
			type: "text",
			text: str.slice(handledIndex, currentIndex),
		})
	}
	return resultBlock.children;
}

const domOutput = ref("");
function renderDomTree(node: Block): string {
	// 叶子节点
	if (!node.children) {
		return node.text || "";
	}

	// 开始标签
	let startTag = "";
	let endTag = "";

	switch (node.type) {
		case "heading":
			const level = node.level != undefined ? ` h${node.level + 1}` : "";
			startTag = `<div class="${node.type}${level}">`;
			endTag = `</div>`;
			break;
		case "table":
			startTag = `<table class="${node.type}">`;
			endTag = `</table>`;
			break;
		case "orderedList":
			startTag = `<ol class="${node.type}">`;
			endTag = `</ol>`;
			break;
		case "unorderedList":
			startTag = `<ul class="${node.type}">`;
			endTag = `</ul>`;
			break;
		case "bold":
		case "italic":
			const className = node.isClosed ? node.type : "";
			startTag = `<span class="${className}">`;
			endTag = `</span>`;
			break;
		case "item":
			startTag = `<li class="${node.type}" value="${node.serialNumber}">`;
			endTag = `</li>`;
			break;
		default:
			startTag = `<div class="${node.type}">`;
			endTag = `</div>`;
			break;
	}

	// 递归渲染子节点
	const childrenHtml = node.children
		.map(child => renderDomTree(child))
		.join("");

	return startTag + childrenHtml + endTag;
}

const markdown = `
# 一级标题

这是一个普通段落，包含 **加粗文本** 和 *斜体文本*。

这是一个带嵌套的例子：**加粗里面有 *斜体* 内容**。

## 二级标题

* 列表项一
* 列表项二，包含 **加粗**
* 列表项三，包含 *斜体* 和普通文本

** 1 { a } 2 **

1. 你好啊
2. 哈哈** 哈 **
54. 序号54的标题
`

function main() {
	let domTree = markdownToDomTree(markdown)
	domOutput.value = renderDomTree(domTree)
}

main()
</script>

<template>
	<div id="note-wrapper" v-html="domOutput">
	</div>
</template>

<style>
#note-wrapper {
	background-color: #fefaf0;
	border-radius: 5px;
	flex: 1;
	color: black;
	padding: 50px;
	cursor: text;
}

#note-wrapper {
	div {
		line-height: 2;
	}

	.heading {
		font-weight: bold;
	}

	.h1 {
		font-size: 2rem;
	}

	.h2 {
		font-size: 1.6rem;
	}

	.h3 {
		font-size: 1.4rem;
	}

	.h4 {
		font-size: 1.2rem;
	}

	.h5 {
		font-size: 1rem;
	}

	.h6 {
		font-size: 0.875rem;
	}

	.bold {
		font-weight: bold;
	}

	.italic {
		font-style: italic;
		font-synthesis: style;
	}
}


</style>