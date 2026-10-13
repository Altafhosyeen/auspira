import React from 'react';
import { Tag, Typography } from 'antd';
import { MENU_PATH } from '@/constants';
import { useRouter } from 'nextjs-toploader/app';
const { Text } = Typography;

const ProjectCard = ({ project }: { project: any }) => {
  const router = useRouter();
  console.log(project);
  return (
    <div onClick={() => router.push(MENU_PATH.PROJECTS.pathname + '/' + project.id)}>
      <div className="mb-3 cursor-pointer rounded-lg border border-slate-100 p-4 transition-shadow hover:shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="border-l-4 border-red-500 pl-3">
            <div className="flex items-center gap-4">
              <Text className="block text-xl font-semibold text-slate-700">{project.name}</Text>
              <Tag color={'red'} className="block text-xl font-semibold text-slate-700">
                8 .1 Urgent
              </Tag>
            </div>
            <Text className="block text-sm text-slate-500">Cl. 62.6 lever ready</Text>
            <Text className="mt-2 block text-base text-slate-600">
              Issue failure notice today to start 3-week deemed clock
            </Text>
          </div>

          <div className="text-right">
            <Text className="block text-2xl font-semibold text-slate-700">$66k</Text>
            <Text className="text-sm text-slate-500">NOW</Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
