'use client';

import { Button, Form, Input, Modal, notification, Select, Space } from 'antd';
import { ProjectRole } from '@/constants/enum.constant';
import { useAssignProjectToUser, useGetAssignableProjects } from '@/hooks/modules/project';
import type { User } from '@/types/users/users.types';

type Props = {
  open: boolean;
  onClose: () => void;
  user: User | null;
};

const PROJECT_ROLE_OPTIONS = [
  { label: 'Project Manager', value: ProjectRole.ProjectManager },
  { label: 'Supervisor', value: ProjectRole.Supervisor },
  { label: 'Contractor', value: ProjectRole.Contractor },
  { label: 'Observer', value: ProjectRole.Observer },
];

export default function AssignProjectModal({ open, onClose, user }: Props) {
  const [form] = Form.useForm();
  const { mutateAsync: assignProject, isPending } = useAssignProjectToUser<{
    userId: string;
    projectRole: number;
    notes: string | null;
  }>();

  const { data: assignableProjects = [], isLoading: isAssignableProjectsLoading } =
    useGetAssignableProjects<{ projectId: string; name: string }[]>(user?.id, {
      // Refetch a fresh list every time the modal opens — assignable projects change as the
      // user gets assigned/unassigned elsewhere, so cached data shouldn't linger between opens.
      enabled: open && !!user?.id,
      staleTime: 0,
      refetchOnMount: 'always',
    });

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const onFinish = async (values: { projectId: string; projectRole: number; notes?: string }) => {
    if (!user) return;

    try {
      await assignProject({
        id: values.projectId,
        data: {
          userId: user.id,
          projectRole: values.projectRole,
          notes: values.notes?.trim() || null,
        },
      });

      notification.success({
        message: 'Project Assigned',
        description: `Project assigned to ${user.fullName} successfully`,
      });

      handleClose();
    } catch (error) {
      notification.error({
        message: 'Failed to assign project',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={null}
      footer={null}
      destroyOnClose
      width={460}
      centered
    >
      <div className="mb-5 space-y-1">
        <p className="m-0 text-[22px] leading-tight font-semibold text-slate-900">Assign Project</p>
        <p className="m-0 text-sm leading-5 text-slate-600">
          Assign a project to {user?.fullName ?? 'this user'} and set their project role.
        </p>
      </div>

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Project"
          name="projectId"
          rules={[{ required: true, message: 'Please select a project' }]}
        >
          <Select
            placeholder="Select a project"
            size="large"
            loading={isAssignableProjectsLoading}
            showSearch
            optionFilterProp="label"
            options={assignableProjects.map((project) => ({
              label: project.name,
              value: project.projectId,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Project Role"
          name="projectRole"
          rules={[{ required: true, message: 'Please select a project role' }]}
        >
          <Select placeholder="Select a project role" size="large" options={PROJECT_ROLE_OPTIONS} />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea
            placeholder="Add an optional note about this assignment..."
            rows={4}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Space className="mt-2 flex w-full justify-end">
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            loading={isPending}
            // icon={<ArrowRightOutlined />}
            type="primary"
            htmlType="submit"
          >
            Save
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}
