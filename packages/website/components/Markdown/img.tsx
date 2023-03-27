import { visit } from "unist-util-visit";
import { BytemdPlugin } from "bytemd";
import m from "medium-zoom"
const ImgZoomPlugin = () => (tree) => {
  visit(tree, (node) => {
    if (node.type === "element" && node.tagName === "img") {
      node.properties.className += " img-zoom"
    }
  })
}

export function Img(): BytemdPlugin {
  return {
    rehype: (processor) => processor.use(ImgZoomPlugin),
    viewerEffect: ({ markdownBody }) => {
      markdownBody.querySelectorAll(".img-zoom").forEach((img: HTMLImageElement) => {
        if (img.getAttribute("data-zoomed")) return
        img.setAttribute("data-zoomed", "true")
        m(img)
      })
    }
  }
}
