import React from 'react';
import { type FormInstance } from 'antd';
import ProgramSetupForm from './program-setup/ProgramSetpForm';
import AdaptiveLogicCard from './program-setup/AdaptiveLogicCard';

interface ProjectSetupProps {
  form: FormInstance;
}

const ProjectSetup: React.FC<ProjectSetupProps> = ({ form }) => {
  return (
    <div className="flex gap-8">
      <ProgramSetupForm form={form} />
      <AdaptiveLogicCard />
    </div>
  );
};

export default ProjectSetup;
