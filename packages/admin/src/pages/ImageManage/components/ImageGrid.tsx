import React from 'react';
import { Card, Col, Row, Image } from 'antd';
import { ImageGridProps } from '../types';
import { getImgLink } from './tools';

export const ImageGrid: React.FC<ImageGridProps> = ({ data, responsive, displayMenu }) => {
  const span = responsive ? 8 : 6;

  return (
    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
      {data.map((item) => (
        <Col span={span} key={item.sign} style={{ marginBottom: 16 }}>
          <Card
            hoverable
            bodyStyle={{ padding: 8 }}
            cover={
              <div
                style={{ overflow: 'hidden', height: 150, display: 'flex', alignItems: 'center' }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  displayMenu(e, item);
                }}
              >
                <Image
                  alt={item.name}
                  src={getImgLink(item.realPath)}
                  style={{ width: '100%', objectFit: 'contain' }}
                  preview={{
                    src: getImgLink(item.realPath),
                  }}
                />
              </div>
            }
          >
            <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.name}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}; 