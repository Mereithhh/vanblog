import React from 'react';
import { Pagination } from 'antd';
import { PaginationProps } from '../types';

export const PaginationComponent: React.FC<PaginationProps> = ({ 
  page, 
  pageSize, 
  total, 
  handlePageChange 
}) => {
  return (
    <div style={{ textAlign: 'right', marginTop: 16 }}>
      <Pagination
        current={page}
        pageSize={pageSize}
        total={total}
        onChange={handlePageChange}
        showSizeChanger
        showQuickJumper
        showTotal={(t) => `共 ${t} 张`}
      />
    </div>
  );
}; 