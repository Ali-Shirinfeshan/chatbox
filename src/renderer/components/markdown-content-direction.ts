import type { Element, Root } from 'hast'

const TEXT_BLOCKS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'th', 'td'])

/** Set direction on prose blocks, not on controls or code; never rewrite text. */
export function rehypeContentDirection() {
  return (tree: Root) => {
    function visitChildren(parent: Root | Element) {
      for (const child of parent.children) {
        if (child.type !== 'element') continue
        if (child.tagName === 'pre' || child.tagName === 'code') continue
        if (TEXT_BLOCKS.has(child.tagName)) child.properties.dir = 'auto'
        visitChildren(child)
      }
    }
    visitChildren(tree)
  }
}
