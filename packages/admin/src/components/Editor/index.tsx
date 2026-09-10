// import breaks from '@bytemd/plugin-breaks';
import frontmatter from '@bytemd/plugin-frontmatter';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight-ssr';
import math from '@bytemd/plugin-math-ssr';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import { Editor } from '@bytemd/react';
import { Spin } from 'antd';
import 'bytemd/dist/index.css';
import 'katex/dist/katex.css';
import { useMemo } from 'react';
import '../../style/github-markdown.css';
import '../../style/code-light.css';
import '../../style/code-dark.css';
import '../../style/custom-container.css';
import { emoji } from './emoji';
import { imgUploadPlugin, uploadImg } from './imgUpload';
import { transferRemotePlugin } from './transferRemote';
import './index.less';
import './mermaid-safety.css';
import './toc-viewport.css';
import { insertMore } from './insertMore';
import { cn } from './locales';
import { useModel } from 'umi';
import { customContainer } from './plugins/customContainer';
import { historyIcon } from './history';
import rawHTML from './rawHTML';
import { Heading } from './plugins/heading';
import { customCodeBlock } from './plugins/codeBlock';
import { LinkTarget } from './plugins/linkTarget';
import { mermaidForEditor } from './plugins/mermaidSafety';
import { withSafeViewerEffects } from './plugins/previewSafety';
import { tocViewportGuard } from './plugins/tocViewport';
import { mobileToolbarPlugin } from './plugins/mobileToolbar';
import './mobile-toolbar.css';

// Keep extra tags / strip list aligned with website/utils/markdownSanitize.ts (#490).
const sanitize = (schema) => {
  schema.protocols.src.push('data');
  schema.tagNames.push('center');
  schema.tagNames.push('iframe');
  schema.tagNames.push('section');
  schema.tagNames.push('u');
  schema.tagNames.push('font');
  schema.tagNames = schema.tagNames.filter((tag) => tag !== 'script');
  schema.strip = Array.from(new Set([...(schema.strip || []), 'script']));
  // remark-rehype already prefixes footnote ids; a second prefix breaks hrefs.
  schema.clobberPrefix = '';
  schema.attributes['*'].push('style');
  schema.attributes['*'].push('src');
  schema.attributes['*'].push('scrolling');
  schema.attributes['*'].push('border');
  schema.attributes['*'].push('frameborder');
  schema.attributes['*'].push('framespacing');
  schema.attributes['*'].push('allowfullscreen');
  schema.attributes.font = Array.from(
    new Set([...(schema.attributes.font || []), 'color', 'size', 'face']),
  );
  return schema;
};

async function uploadEditorImages(files: File[], setLoading: (loading: boolean) => void) {
  setLoading(true);
  const res: { url: string }[] = [];
  try {
    for (const each of files) {
      const url = await uploadImg(each);
      if (url) {
        res.push({ url: encodeURI(url) });
      }
    }
    return res;
  } finally {
    setLoading(false);
  }
}

export default function EditorComponent(props: {
  value: string;
  onChange: (string: string) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
}) {
  const { loading, setLoading } = props;
  const { initialState } = useModel('@@initialState');
  const navTheme = initialState.settings.navTheme;
  const themeClass = navTheme.toLowerCase().includes('dark') ? 'dark' : 'light';
  const plugins = useMemo(() => {
    return withSafeViewerEffects([
      customContainer(),
      gfm({ locale: cn }),
      highlight(),
      frontmatter(),
      math({ locale: cn }),
      mediumZoom(),
      mermaidForEditor({ locale: cn }),
      tocViewportGuard(),
      imgUploadPlugin(setLoading),
      transferRemotePlugin(setLoading, props.onChange),
      emoji(),
      insertMore(),
      rawHTML(),
      historyIcon(),
      Heading(),
      customCodeBlock(),
      LinkTarget(),
      // Keep mode="auto" (tab under 800px). Expand that toolbar; do not dump desktop icons.
      mobileToolbarPlugin({
        uploadImages: (files) => uploadEditorImages(files, setLoading),
      }),
    ]);
  }, [themeClass]);

  return (
    <div style={{ height: '100%', minHeight: 0 }} className={`editor-shell ${themeClass}`}>
      <Spin spinning={loading} className="editor-wrapper">
        <Editor
          value={props.value}
          plugins={plugins}
          onChange={props.onChange}
          locale={cn}
          mode="auto"
          remarkRehype={{ allowDangerousHtml: true }}
          sanitize={sanitize}
          uploadImages={(files: File[]) => uploadEditorImages(files, setLoading)}
        />
      </Spin>
    </div>
  );
}
