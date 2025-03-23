import React from 'react';
import type { MenuItemEventHandler } from 'react-contexify';

export interface StaticItem {
  storageType: StorageType;
  staticType: string;
  fileType: string;
  realPath: string;
  meta: any;
  name: string;
  sign: string;
}

export type StorageType = 'local' | 'picgo';

export interface MenuProps {
  clickItem?: StaticItem;
  showDelBtn: boolean;
  handleItemClick: MenuItemEventHandler;
}

export interface ImageGridProps {
  data: StaticItem[];
  responsive: boolean;
  displayMenu: (e: React.MouseEvent, item: StaticItem) => void;
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  handlePageChange: (page: number, pageSize: number) => void;
}

export interface ActionButtonsProps {
  setLoading: (loading: boolean) => void;
  fetchData: () => void;
  showDelAllBtn: boolean;
} 