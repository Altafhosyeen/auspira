import React from 'react';
import { Upload, Typography, Button, Card, Alert } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Title, Text, Link } = Typography;

export default function ProgramIngestionCard() {
  const props = {
    name: 'file',
    multiple: true,
    action: '/upload',
    onChange(info: any) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
    },
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <Card className="rounded-2xl shadow-md">
          <Dragger {...props} className="rounded-xl border-dashed p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-blue-100 p-4">
                <InboxOutlined className="text-2xl text-blue-500" />
              </div>

              <Title level={4} className="!mb-0 text-center font-bold!">
                Drag & drop programme files
              </Title>

              <Text type="secondary" className="text-center">
                or <Link>browse files</Link> from your computer
              </Text>

              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <Button size="small">Primavera P6 (.xer)</Button>
                <Button size="small">MS Project (.mpp)</Button>
                <Button size="small">XML</Button>
              </div>
            </div>
          </Dragger>
        </Card>

        <Alert
          className="mt-4 rounded-2xl border-0"
          style={{ background: '#EFF4FF', padding: '16px 20px' }}
          message={<span className="font-semibold text-gray-800">PDF Fallback Option</span>}
          description={
            <span className="text-gray-600">
              If native files are unavailable, you may upload a PDF export of the programme.
              However, please note that AI intelligence, dependency mapping, and automated data
              extraction will be significantly limited compared to native formats.
            </span>
          }
          type="info"
          showIcon
        />
      </div>
    </div>
  );
}
