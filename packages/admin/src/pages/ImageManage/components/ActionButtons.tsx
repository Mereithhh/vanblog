import React from 'react';
import { Button, Modal, Space, message } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { ActionButtonsProps } from '../types';
import { deleteAllIMG } from '@/services/van-blog/api';
import CopyUploadBtn from '@/components/CopyUploadBtn';
import UploadBtn from '@/components/UploadBtn';
import { copyImgLink } from './tools';

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  setLoading, 
  fetchData, 
  showDelAllBtn 
}) => {
  return (
    <Space>
      <Button icon={<ReloadOutlined />} onClick={fetchData}>
        刷新
      </Button>
      
      <CopyUploadBtn
        setLoading={setLoading}
        onError={() => {
          message.error('剪切板无图片！');
        }}
        text="剪切板上传"
        onFinish={(data: unknown) => {
          const uploadData = data as { src: string; isNew: boolean };
          copyImgLink(
            uploadData.src,
            true,
            uploadData.isNew ? '剪切板图片上传成功! ' : '剪切板图片已存在! ',
            false,
          );
          fetchData();
        }}
        url="/api/admin/img/upload?withWaterMark=true"
        accept=".png,.jpg,.jpeg,.webp,.jiff,.gif"
      />
      
      <UploadBtn
        setLoading={setLoading}
        muti={true}
        text="上传图片"
        onFinish={(info: any) => {
          copyImgLink(
            info?.response?.data?.src,
            true,
            info?.response?.data?.isNew ? `${info.name} 上传成功! ` : `${info.name} 已存在! `,
            false,
          );
          fetchData();
        }}
        url="/api/admin/img/upload?withWaterMark=true"
        accept=".png,.jpg,.jpeg,.webp,.jiff,.gif"
      />

      {showDelAllBtn && (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            Modal.confirm({
              title: '确定删除全部图片吗？',
              content: '删除后不可恢复！',
              okText: '确定',
              cancelText: '取消',
              onOk: async () => {
                try {
                  setLoading(true);
                  await deleteAllIMG();
                  setLoading(false);
                  message.success('删除成功！');
                  fetchData();
                } catch (error) {
                  setLoading(false);
                  message.error('删除失败！');
                }
              },
            });
          }}
        >
          删除全部
        </Button>
      )}
    </Space>
  );
}; 