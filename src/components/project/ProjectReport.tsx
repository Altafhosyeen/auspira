'use client';
import React from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Card, Typography } from 'antd';
import ProjectCard from './ProjectCard';

const { Title } = Typography;

const ProjectReport = ({ projectsList }: { projectsList: any }) => {
  return (
    <div>
      <Card
        title={
          <Title level={4} className="!mb-0 font-bold! !text-slate-700">
            Project Report
          </Title>
        }
        extra={
          <Button
            type="dashed"
            icon={<ArrowRightOutlined />}
            className=""
            // onClick={() => router.push(MENU_PATH.PROJECTS.pathname + )}
          >
            See Details
          </Button>
        }
        className="rounded-xl border border-slate-200"
      >
        {projectsList?.map((project: any) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </Card>
    </div>
  );
};

export default ProjectReport;
