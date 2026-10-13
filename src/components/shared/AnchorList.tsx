'use client';

import React from 'react';
import { Anchor, AnchorProps, Card, Empty } from 'antd';
import styles from '@/app/styles/Classifier.module.css';
import { AnchorItem } from '@/types';

interface Props extends AnchorProps {
  items: AnchorItem[];
  title?: string;
  wrapperClassName?: string;
  anchorListClass?: string;
  emptyText?: string;
}

const AnchorList = ({
  title,
  items,
  wrapperClassName,
  anchorListClass,
  emptyText,
  ...rest
}: Props) => {
  return (
    <div className={`sticky top-4 self-start ${wrapperClassName ?? ''}`}>
      <Card
        styles={{
          body: {
            paddingRight: 0,
          },
        }}
      >
        {title && <Card.Meta className="mb-3!" title={title} />}
        <div
          className={`${styles.classifierTypeAnchorList} max-h-[calc(100vh-330px)] overflow-y-auto pr-1 ${anchorListClass ?? ''}`}
        >
          {items.length > 0 ? (
            <Anchor affix={false} items={items} {...rest} />
          ) : (
            <Empty
              description={emptyText || 'No items to display'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default AnchorList;
