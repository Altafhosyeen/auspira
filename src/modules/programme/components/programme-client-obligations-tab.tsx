'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Divider, Flex, Tag, Typography } from 'antd';
import { Fragment } from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import { APP_COLORS } from '@/constants/app.theme';
import {
  PROGRAMME_CLIENT_OBLIGATIONS_COPY,
  PROGRAMME_EXTRACT_COPY,
  PROGRAMME_TAB_EMPTY_COPY,
} from '../constants/programme.constants';
import type { ClientObligationsTabProps } from '../types/programme.types';
import { ProgrammeSectionCard, ProgrammeTableHeader } from './programme-section-card';

// Shared between the header band and every data row so the four columns line up exactly.
const COLUMNS = [390, 130, 200] as const;

// "Client Obligations" — the fifth tab of the Program Health detail screen. One table per
// section of the alert's `obligations` object, each listing what the Client owes, the clause it
// rests on, who owns it and what it is due against.
const ProgrammeClientObligationsTab = ({ title, summary, groups }: ClientObligationsTabProps) => {
  const count = groups.reduce((total, group) => total + group.rows.length, 0);

  return (
    <ProgrammeSectionCard
      icon={<FileTextOutlined />}
      title={title}
      tag={
        count > 0 ? (
          <Tag
            bordered={false}
            style={{ background: APP_COLORS.mainSoft, color: APP_COLORS.main, borderRadius: 4 }}
          >
            {PROGRAMME_CLIENT_OBLIGATIONS_COPY.count(count)}
          </Tag>
        ) : undefined
      }
    >
      <Flex vertical gap={16} style={{ padding: '16px 22px 20px' }}>
        {summary && <Typography.Paragraph style={{ margin: 0 }}>{summary}</Typography.Paragraph>}

        {groups.length === 0 ? (
          <EmptyState {...PROGRAMME_TAB_EMPTY_COPY.obligations} />
        ) : (
          groups.map((group) => (
            <Flex key={group.section} vertical gap={8} style={{ minWidth: 0 }}>
              <Typography.Text strong style={{ fontSize: 14 }}>
                {group.section}
              </Typography.Text>

              <ProgrammeTableHeader
                labels={[
                  PROGRAMME_CLIENT_OBLIGATIONS_COPY.columns.description,
                  PROGRAMME_CLIENT_OBLIGATIONS_COPY.columns.clauseNumber,
                  PROGRAMME_CLIENT_OBLIGATIONS_COPY.columns.owner,
                  PROGRAMME_CLIENT_OBLIGATIONS_COPY.columns.dueDate,
                ]}
                widths={COLUMNS}
                alignLastEnd={false}
              />

              <Flex vertical>
                {group.rows.map((row, index) => (
                  <Fragment key={`${group.section}-${row.description}-${row.clauseNumber}`}>
                    <Flex align="center" gap={16} style={{ padding: '12px 32px' }}>
                      <Typography.Text style={{ width: COLUMNS[0], flexShrink: 0 }}>
                        {row.description}
                      </Typography.Text>
                      <Typography.Text style={{ width: COLUMNS[1], flexShrink: 0 }}>
                        {row.clauseNumber || PROGRAMME_EXTRACT_COPY.emptyValue}
                      </Typography.Text>
                      <Typography.Text style={{ width: COLUMNS[2], flexShrink: 0 }}>
                        {row.owner || PROGRAMME_EXTRACT_COPY.emptyValue}
                      </Typography.Text>
                      <Typography.Text style={{ flex: 1 }}>
                        {row.dueDate || PROGRAMME_EXTRACT_COPY.emptyValue}
                      </Typography.Text>
                    </Flex>
                    {index < group.rows.length - 1 && (
                      <Divider style={{ margin: 0, borderColor: APP_COLORS.rowDivider }} />
                    )}
                  </Fragment>
                ))}
              </Flex>
            </Flex>
          ))
        )}
      </Flex>
    </ProgrammeSectionCard>
  );
};

export default ProgrammeClientObligationsTab;
