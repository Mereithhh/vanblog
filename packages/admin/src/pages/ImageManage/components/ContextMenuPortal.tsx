import React from 'react';
import { Menu, Item, useContextMenu } from 'react-contexify';
import { MenuProps } from '../types';
import 'react-contexify/dist/ReactContexify.css';

export const ContextMenuPortal: React.FC<MenuProps> = ({ 
  clickItem, 
  showDelBtn, 
  handleItemClick 
}) => {
  const { show } = useContextMenu({
    id: 'image-context-menu',
  });

  return (
    <Menu id="image-context-menu">
      <Item data="info" onClick={handleItemClick}>
        详情
      </Item>
      <Item data="copy" onClick={handleItemClick}>
        复制链接
      </Item>
      <Item data="copyMarkdown" onClick={handleItemClick}>
        复制为 Markdown
      </Item>
      <Item data="copyMarkdownAbsolutely" onClick={handleItemClick}>
        复制为绝对路径的 Markdown
      </Item>
      <Item data="download" onClick={handleItemClick}>
        下载图片
      </Item>
      <Item data="searchByLink" onClick={handleItemClick}>
        查找引用此图片的文章
      </Item>
      {showDelBtn && (
        <Item data="delete" onClick={handleItemClick}>
          删除图片
        </Item>
      )}
    </Menu>
  );
}; 