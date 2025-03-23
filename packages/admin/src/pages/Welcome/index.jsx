import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import './index.less';
import ArticleTab from './tabs/article';
import OverView from './tabs/overview';
import Viewer from './tabs/viewer';
import { useModel } from '@/utils/umiCompat';

export default () => {
  const { initialState } = useModel('@@initialState');
  const isDarkMode = initialState?.settings?.navTheme?.toLowerCase().includes('dark');
  
  const navs = useRef([
    {
      key: 'overview',
      tab: '总览',
    },
    {
      key: 'article',
      tab: '文章数据',
    },
    {
      key: 'viewer',
      tab: '访问数据',
    },
  ]);
  const [key, setKey] = useState('overview');
  
  // Use appropriate background color based on theme
  const backgroundColor = isDarkMode ? '#141414' : '#f0f2f5';
  
  return (
    <div style={{ background: backgroundColor, margin: -24, padding: 24 }}>
      <PageContainer
        className="thinheader"
        tabList={navs.current}
        onTabChange={(value) => setKey(value)}
      >
        {key === 'overview' && <OverView />}
        {key === 'article' && <ArticleTab />}
        {key === 'viewer' && <Viewer />}
      </PageContainer>
    </div>
  );
};
