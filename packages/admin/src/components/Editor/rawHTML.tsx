import { BytemdPlugin } from "bytemd"
import rehypeRaw from "rehype-raw";;
export default function (): BytemdPlugin {
  return {
    rehype: (processor) => processor.use(rehypeRaw)
  }
}
