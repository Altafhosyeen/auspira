'use client';

import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Input, notification, Select, Space } from 'antd';
import { X } from 'lucide-react';
import React from 'react';
import InputX from '@/components/antd/InputX';
import { ROLE_COLORS_IN_LIST } from '@/constants/role.ids';
import { useCreateUser } from '@/hooks/modules/users';
import type { CreateUserPayload, ProjectAssignment } from '@/types/users/users.types';

type Props = {
  open: boolean;
  onClose: () => void;
};

interface ProjectRoleMap {
  [projectId: string]: number;
}

export default function AddUserDrawer({ open, onClose }: Props) {
  const [form] = Form.useForm();
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);
  const [projectRoles, setProjectRoles] = React.useState<ProjectRoleMap>({});
  const { mutateAsync: createUser, isPending } = useCreateUser();

  // Explicit handler triggered ONLY by clicking Cancel or Close (X) buttons
  const handleCancelAndReset = () => {
    form.resetFields();
    setSelectedProjects([]);
    setProjectRoles({});
    onClose();
  };

  const onFinish = async (values: any) => {
    try {
      const projectAssignments: ProjectAssignment[] = selectedProjects
        .filter((projectId) => projectRoles[projectId] !== undefined)
        .map((projectId) => ({
          projectId,
          projectRole: projectRoles[projectId],
        }));

      const payload: CreateUserPayload = {
        email: values.email,
        name: values.name,
        roleId: values.roleId,
        contractor: values.contractor || null,
        areasOfInterest: values.areasOfInterest || null,
        phoneNumber: values.phoneNumber || null,
        projectAssignments,
      };

      await createUser(payload);

      notification.success({
        message: 'User Invited',
        description: `An invitation has been sent to ${values.email}`,
      });

      onClose(); // Just close, do not trigger a reset here
    } catch {
      // Error is handled by Axios interceptor
    }
  };

  return (
    <div className="m-10 p-10">
      <Drawer
        placement="right"
        width={420}
        onClose={onClose}
        open={open}
        closeIcon={false}
        rootClassName="custom-drawer"
        styles={{
          section: { borderRadius: '10px', overflow: 'hidden' },
          body: { padding: 0 }, // Removes default body padding
          footer: { borderTop: '1px solid #f1f5f9' },
        }}
        footer={
          <Space className="w-full justify-between">
            <Button onClick={handleCancelAndReset}>Cancel</Button>
            <Button
              loading={isPending}
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              type="primary"
              htmlType="submit"
              form="addUserForm"
            >
              Invite
            </Button>
          </Space>
        }
      >
        {/* Edge-to-Edge Full Width Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50 px-6 py-4">
          <div className="flex flex-col gap-1">
            <h2 className="heading-section m-0 leading-tight">Invite User</h2>
            <p className="m-0 text-xs font-normal text-slate-700">
              Set up team access to get started with Auspira
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancelAndReset}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-slate-700 transition-all duration-150 outline-none hover:bg-slate-200/60 hover:text-slate-700 active:scale-95"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Spaced Content Body */}
        <div className="p-6">
          <p className="m-0 mb-6 text-sm leading-normal text-slate-500">
            Set up your Users to get started with Auspira
          </p>

          <Form layout="vertical" form={form} onFinish={onFinish} id="addUserForm">
            {/* Name */}
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input placeholder="John Aly" />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email address' },
              ]}
            >
              <Input placeholder="Johnaly@example.com" />
            </Form.Item>

            {/* Phone Number */}
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[
                {
                  pattern: /^\+?[0-9][0-9\s\-()]{6,19}$/,
                  message: 'Please enter a valid phone number (e.g. +1 949 403 9430)',
                },
              ]}
            >
              <Input placeholder="+44 7700 900000" />
            </Form.Item>

            {/* Organisation  */}
            <Form.Item label="Counterparty Organisation  (Contractor)" name="contractor">
              <InputX placeholder="e.g. ABC Contractors" />
            </Form.Item>

            {/* Organizational Role */}
            <Form.Item
              label="Organizational Role"
              name="roleId"
              rules={[{ required: true, message: 'Please select organizational role' }]}
            >
              <Select
                placeholder="Select organizational role"
                options={ROLE_COLORS_IN_LIST.map((role) => ({ label: role.name, value: role.id }))}
              />
            </Form.Item>

            {/* Areas of Interest */}
            <Form.Item label="Areas of Interest" name="areasOfInterest">
              <Input placeholder="e.g. risk management, cost control etc" />
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </div>
  );
}
