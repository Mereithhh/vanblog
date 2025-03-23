// import breaks from '@bytemd/plugin-breaks';
import frontmatter from '@bytemd/plugin-frontmatter';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight-ssr';
import math from '@bytemd/plugin-math-ssr';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import mermaid from '@bytemd/plugin-mermaid';
import { Editor } from '@bytemd/react';
import { Spin, Button, Dropdown, message, Modal, Space, Tooltip } from 'antd';
import 'bytemd/dist/index.css';
import 'katex/dist/katex.css';
import React, { MutableRefObject, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import '../../style/github-markdown.css';
import '../../style/code-light.css';
import '../../style/code-dark.css';
import '../../style/custom-container.css';
import { emoji } from './emoji';
import { imgUploadPlugin, uploadImg } from './imgUpload';
import { insertMore } from './insertMore';
import { cn } from './locales';
import { useModel } from '@/utils/umiCompat';
import { customContainer } from './plugins/customContainer';
import { historyIcon } from './history';
import rawHTML from './rawHTML';
import { Heading } from './plugins/heading';
import { customCodeBlock } from './plugins/codeBlock';
import { LinkTarget } from './plugins/linkTarget';

// Toast UI editor styles (needed for reference in production)
import './style.less';
import './diff-style.css';

// Add custom styles for the editor
import './editor.css';

// Add type declaration for sanitize
const sanitize = (schema: any) => {
  // Allow specific tags and attributes for SVG
  schema.svg = {
    tag: true,
    attrs: {
      xmlns: true,
      width: true,
      height: true,
      viewbox: true,
      version: true,
      'stroke-width': true,
      'stroke-linecap': true,
      'stroke-linejoin': true,
      stroke: true,
      fill: true,
      'class': true,
      'font-size': true,
      'text-anchor': true,
      style: true,
    },
    children: ['path', 'polygon', 'rect', 'text', 'line', 'circle', 'defs', 'marker', 'g', 'tspan']
  };

  // Allow SVG path element
  schema.path = {
    tag: true,
    attrs: {
      d: true,
      fill: true,
      stroke: true,
      class: true,
      'marker-end': true,
      'stroke-width': true,
      'stroke-linecap': true,
      'stroke-linejoin': true,
      'data-id': true,
    }
  };

  // Allow data URIs in src attributes
  schema.protocols.src.push('data');
  
  // Add SVG-specific tags
  schema.tagNames.push('center');
  schema.tagNames.push('iframe');
  schema.tagNames.push('script');
  schema.tagNames.push('svg');
  schema.tagNames.push('path');
  schema.tagNames.push('g');
  schema.tagNames.push('circle');
  schema.tagNames.push('rect');
  schema.tagNames.push('line');
  schema.tagNames.push('polyline');
  schema.tagNames.push('polygon');
  
  // Add SVG-specific attributes
  schema.attributes['*'].push('style');
  schema.attributes['*'].push('src');
  schema.attributes['*'].push('scrolling');
  schema.attributes['*'].push('border');
  schema.attributes['*'].push('frameborder');
  schema.attributes['*'].push('framespacing');
  schema.attributes['*'].push('allowfullscreen');
  schema.attributes['*'].push('viewBox');
  schema.attributes['*'].push('width');
  schema.attributes['*'].push('height');
  schema.attributes['*'].push('fill');
  schema.attributes['*'].push('stroke');
  schema.attributes['*'].push('d');
  schema.attributes['*'].push('xmlns');
  schema.attributes['*'].push('focusable');
  schema.attributes['*'].push('data-icon');
  schema.attributes['*'].push('aria-hidden');
  
  schema.strip = [];
  return schema;
};

export default function EditorComponent(props: {
  value: string;
  onChange: (string: string) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
}) {
  const { loading, setLoading } = props;
  // @ts-ignore
  const { initialState } = useModel('@@initialState');
  const navTheme = initialState?.settings?.navTheme || 'light';
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
      Heading(),
      customCodeBlock(),
      LinkTarget(),
    ];
  }, []);

  return (
    <div className={`editor-container ${themeClass}`}>
      <Spin spinning={loading} className="editor-wrapper">
        <Editor
          value={props.value}
          plugins={plugins}
          onChange={props.onChange}
          locale={cn}
          sanitize={sanitize}
          uploadImages={async (files: File[]) => {
            setLoading(true);
            const res = [];
            try {
              for (const each of files) {
                const url = await uploadImg(each);
                if (url) {
                  // For SVG files, don't apply encodeURI as the data URI is already properly formatted
                  const isSvg = each.type === 'image/svg+xml';
                  // If it's already a data URI, use it as is
                  if (url.startsWith('data:')) {
                    res.push({ url });
                  } else {
                    // For regular URLs, encode them
                    res.push({ url: encodeURI(url) });
                  }
                }
              }
            } catch (error) {
              console.error('Error uploading images:', error);
            } finally {
              setLoading(false);
            }
            return res;
          }}
        />
      </Spin>
    </div>
  );
}
