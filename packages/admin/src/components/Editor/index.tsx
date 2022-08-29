import breaks from '@bytemd/plugin-breaks';
import frontmatter from '@bytemd/plugin-frontmatter';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import math from '@bytemd/plugin-math';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import mermaid from '@bytemd/plugin-mermaid';
import { Editor } from '@bytemd/react';
import { Spin } from 'antd';
import 'bytemd/dist/index.css';
import 'github-markdown-css/github-markdown.css';
import 'highlight.js/styles/vs.css';
import 'katex/dist/katex.css';
import { useMemo } from 'react';
import { imgUploadPlugin, uploadImg } from './imgUpload';
import { insertMore } from './insertMore';
import { cn } from './locales';

export default function EditorComponent(props: {
  value: string;
  onChange: (string: string) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
  onBlur: any;
}) {
  const { loading, setLoading } = props;
  const plugins = useMemo(() => {
    return [
      gfm({ locale: cn }),
      highlight(),
      breaks(),
      frontmatter(),
      math({ locale: cn }),
      mediumZoom(),
      mermaid({ locale: cn }),
      imgUploadPlugin(setLoading),
      insertMore(),
    ];
  }, []);

  return (
    <div style={{ height: '100%' }} onBlur={props.onBlur}>
      <Spin spinning={loading} className="editor-wrapper">
        <Editor
          value={props.value}
          plugins={plugins}
          onChange={props.onChange}
          locale={cn}
          uploadImages={async (files: File[]) => {
            setLoading(true);
            const res = [];
            for (const each of files) {
              const url = await uploadImg(each);
              if (url) {
                res.push({ url: url });
              }
            }
            setLoading(false);
            return res;
          }}
        />
      </Spin>
    </div>
  );
}
