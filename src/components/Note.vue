<script setup lang="ts">
import {ref} from "vue";
import { isDigitType, isDigit, findFirstNotOfFrom } from "../utils/DOMTypeDetermineUtils.ts";

type commonBlockType =
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
let globalId = 1;

interface commonBlock {
	id?: string
	type: commonBlockType
	level?: number
	children?: commonBlock[]
	text?: string
	isClosed?: boolean
}

// 分为大类型判断、文本判断
function markdownToDomTree(markdown: string): commonBlock {
	let rootBlock: commonBlock = {
		id: newBlockId(),
		type: "doc",
		children: [],
	};

	let textBeginIndex = 0
	let textEndIndex = 0

	while (textBeginIndex < markdown.length) {
		let currentSymbol = markdown[textEndIndex]
		let maybeType: commonBlockType = "";
		let certainType: commonBlockType = "";

		// 类型判断
		if (currentSymbol == "\n" && markdown[textEndIndex + 1] != "\n") {
			textBeginIndex++
			textEndIndex++
			continue;
		}
		else if (currentSymbol == "#") {
			maybeType = "heading"
		}
		else if (currentSymbol == "*") {
			maybeType = "unorderedList"
		}
		else if (isDigitType(currentSymbol)) {
			maybeType = "orderedList"
		}
		else {
			certainType = "paragraph"
		}

		let headingLevel: number = 0;
		while (!certainType && textEndIndex < markdown.length) {
			textEndIndex ++;
			currentSymbol = markdown[textEndIndex];

			// 标题判断
			if (maybeType === "heading") {
				if (currentSymbol == " ") {
					textBeginIndex += 2
					certainType = "heading"
					break;
				}
				else if (currentSymbol == "#") {
					textBeginIndex++
					headingLevel++;
				}
				else {
					textBeginIndex = 0
					certainType = "paragraph"
					break;
				}
			}
			// 无序列表
			else if (maybeType === "unorderedList") {
				if (currentSymbol == " ") {
					textBeginIndex += 2
					certainType = "unorderedList"
				}
				else {
					certainType = "paragraph"
				}
				break;
			}
			// 有序列表
			else if (maybeType === "orderedList") {
				if (currentSymbol == " ") {
					certainType = "orderedList"
					break;
				}
				else if (isDigitType(currentSymbol)) {}
				else {
					certainType = "paragraph"
					break;
				}
			}
		}

		// 创建块
		// 获取文本
		if (certainType == "paragraph" && markdown[textBeginIndex] == "\n") {
			textEndIndex = findFirstNotOfFrom(markdown, "\n", textBeginIndex);
		}
		else if (certainType == "unorderedList") {
			textEndIndex = markdown.indexOf('\n\n', textBeginIndex);
		}
		else {
			textEndIndex = markdown.indexOf('\n', textBeginIndex);
		}
		if (textEndIndex == -1) textEndIndex = markdown.length
		if (certainType == "heading") {
			rootBlock.children?.push({
				id: newBlockId(),
				type: certainType,
				level: headingLevel,
				children: recognizeText(markdown.slice(textBeginIndex,textEndIndex))
			})
		}
		else if (certainType == "unorderedList") {
			let childs = markdown.slice(textBeginIndex,textEndIndex).split("\n* ")
			console.log(childs)
			rootBlock.children?.push({
				id: newBlockId(),
				type: certainType,
				children: childs.map((value) => {
					return {
						children: recognizeText(value),
						type: "item"
					}
				})
			})
		}
		else {
			rootBlock.children?.push({
				id: newBlockId(),
				type: certainType,
				children: recognizeText(markdown.slice(textBeginIndex,textEndIndex))
			})
		}
		if (textBeginIndex == textEndIndex) {
			textBeginIndex++
			textEndIndex++
		}
		else {
			textBeginIndex = textEndIndex;
		}
	}

	return rootBlock
}

function createBlock(str: string) {

}

function determineType() {

}


interface textType {
	id: commonBlockType
	value: string
	length: number
}

let textTypes: textType[] = [{
	id: "bold",
	value: "**",
	length: 2
}, {
	id: "italic",
	value: "*",
	length: 1
}]

function recognizeText(str: string): commonBlock[] | undefined {
	if (str.length == 0) return [];

	let resultBlock: commonBlock = {
		type: "temp",
		children: []
	}
	let insertStack: commonBlock[] = [resultBlock]  // 指示插入位置 [ commonBlock1, commonBlock2 ]，commonBlock[index1].children
	let currentIndex: number = 0;
	let handledIndex: number = 0;
	while (currentIndex != str.length) {
		for (let element of textTypes) {
			const insertBlock = insertStack.at(-1)
			if (!insertBlock || !insertBlock.children) throw new Error();
			if (str.slice(currentIndex, currentIndex + element.length) == element.value) {
				// 类型匹配
				// 起始类型，此时i指向textType.value开头
				if (insertBlock.type != element.id) {
					// 1. 匹配类型前面的文本入栈
					if (handledIndex != currentIndex) {
						insertBlock.children.push({
							type: "text",
							text: str.slice(handledIndex, currentIndex),
						})
					}
					handledIndex = currentIndex + element.length;

					// 2. 结果数组、插入栈都入栈一个新类型
					let newBlock: commonBlock = {
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
					handledIndex = currentIndex + element.length;

					// 2. 插入栈元素出栈
					insertBlock.isClosed = true
					insertStack.pop()
				}
				currentIndex += element.length - 1;
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


// function domTreeToMarkdowwn(domTree: object): block {
// 	return ""
// }

function newBlockId(): string {
	return "block" + globalId++;
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

`
const domOutput = ref("");

function renderDomTree(node: commonBlock) {
	if (node.children && node.children.length > 0) {
		if (["bold", "italic"].includes(node.type)) {
			domOutput.value += `<span class="${node.isClosed ? node.type : ""}">`
			for (let child of node.children) {
				renderDomTree(child);
			}
			domOutput.value += `</span>`
		}
		else if (node.type == "orderedList") {

		}
		else if (node.type == "unorderedList") {
			domOutput.value += `<ul class="">`
			for (let child of node.children) {
				domOutput.value += `<li>`
				renderDomTree(child);
				domOutput.value += `</li>`
			}
			domOutput.value += `</ul>`
		}
		else if (node.type == "heading") {
			domOutput.value += `<div class="${node.type} ${node.level != undefined ? "h" + (node.level + 1) : ""}">`
			for (let child of node.children) {
				renderDomTree(child);
			}
			domOutput.value += `</div>`
		}
		else {
			for (let child of node.children) {
				renderDomTree(child);
			}
		}
	} else {
		domOutput.value += `${node.text}`
	}
}

function printDomTree(node: commonBlock, level = 0) {
	let tabs = "\t".repeat(level);

	if (node.children && node.children.length > 0) {
		console.log(tabs + "type-" + node.type + ";isClosed:" + node.isClosed);
		for (let child of node.children) {
			printDomTree(child, level + 1);
		}
	} else {
		console.log(tabs + "type-" + node.type + ":" + node.text);
	}
}

function main() {
	let domTree = markdownToDomTree(markdown)
	console.log(domTree)
	// printDomTree(domTree)
	renderDomTree(domTree)
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