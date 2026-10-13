import { Card, Typography } from 'antd';

interface DetailBannerProps {
  // The record's own description, when it carries one; the caller's fallback copy
  // covers a record raised with none.
  text?: string;
  fallback: string;
  color: string;
  background: string;
  borderColor: string;
  padding?: string;
}

// Presentational — the soft-tinted explainer strip under a detail page's title/tabs.
// Shared by every detail screen (Compensation Event, Request For Information) so they
// stay one component instead of per-module copies that can drift apart.
export const DetailBanner = ({
  text,
  fallback,
  color,
  background,
  borderColor,
  padding = '16px 22px',
}: DetailBannerProps) => (
  <Card style={{ backgroundColor: background, borderColor }} styles={{ body: { padding } }}>
    <Typography.Text style={{ color, fontSize: 13 }}>{text?.trim() || fallback}</Typography.Text>
  </Card>
);
