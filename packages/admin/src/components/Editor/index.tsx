// import breaks from '@bytemd/plugin-breaks';
import frontmatter from '@bytemd/plugin-frontmatter';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import math from '@bytemd/plugin-math';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import mermaid from '@bytemd/plugin-mermaid';
import { Editor } from '@bytemd/react';
import { Spin } from 'antd';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/vs.css';
import 'katex/dist/katex.css';
import { useMemo } from 'react';
import '../../style/github-markdown.css';
import { emoji } from './emoji';
import { imgUploadPlugin, uploadImg } from './imgUpload';
import './index.less';
import { insertMore } from './insertMore';
import { cn } from './locales';

import { useModel } from 'umi';
import { customContainer } from './customContainer';
import { historyIcon } from './history';
import { rawHTML } from './raw';

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
    return [
      customContainer(),
      gfm({ locale: cn }),
      highlight(),
      frontmatter(),
      math({ locale: cn }),
      mediumZoom(),
      mermaid({ locale: cn }),
      imgUploadPlugin(setLoading),
      emoji(),
      insertMore(),
      rawHTML(),
      historyIcon(),
    ];
  }, []);

  return (
    <div style={{ height: '100%' }} className={themeClass}>
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
                res.push({ url: encodeURI(url) });
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
