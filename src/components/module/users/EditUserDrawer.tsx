'use client';

import { Button, Drawer, Form, Input, notification, Select, Space } from 'antd';
import { X } from 'lucide-react';
import React from 'react';
import InputX from '@/components/antd/InputX';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { ROLE_COLORS_IN_LIST } from '@/constants/role.ids';
import { useUpdateUser } from '@/hooks/modules/users';
import type { UpdateUserPayload, User } from '@/types/users/users.types';

type Props = {
  open: boolean;
  onClose: () => void;
  user: User | null;
};

// interface ProjectRole {
//   [projectId: string]: number;
// }

export default function EditUserDrawer({ open, onClose, user }: Props) {
  console.log(user);
  const [form] = Form.useForm();
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  // const { data: projects = [] } = useProjectsLookup();

  // Populate form when user is selected
  React.useEffect(() => {
    if (user && open) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        contractor: user.contractor,
        areasOfInterest: user.areasOfInterest,
        roleId: user.roleId,
        phoneNumber: user.phoneNumber,
        jobTitle: user.jobTitle,
      });
    }
  }, [user, open, form]);

  const onFinish = async (values: any) => {
    if (!user) return;

    try {
      const payload: UpdateUserPayload = {
        name: values.fullName,
        email: values.email,
        roleId: values.roleId,
        contractor: values.contractor || user.contractor || null,
        areasOfInterest: values.areasOfInterest || user.areasOfInterest || null,
        phoneNumber: values.phoneNumber || user.phoneNumber || null,
        jobTitle: values.jobTitle || user.jobTitle || null,
      };

      await updateUser({
        id: user.id,
        data: payload,
      });

      notification.success({
        message: 'User Updated',
        description: `User ${values.fullName} has been updated successfully`,
      });

      onClose();
      form.resetFields();
    } catch (error) {
      notification.error({
        message: 'Failed to update user',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  return (
    <Drawer
      placement="right"
      width={420}
      onClose={onClose}
      open={open}
      closeIcon={false}
      rootClassName="custom-drawer"
      styles={{
        section: { borderRadius: '10px 10px 10px 10px', overflow: 'hidden' },
        footer: { borderTop: '1px solid #f1f5f9' },
      }}
      footer={
        <Space className="w-full justify-between">
          <Button onClick={onClose}>Cancel</Button>

          <Button loading={isPending} type="primary" htmlType="submit" form="editUserForm">
            Save
          </Button>
        </Space>
      }
    >
      <div className="mb-0 flex items-start justify-between">
        <div className="space-y-0">
          <p className="m-0 text-[24px] leading-none font-semibold text-slate-900">Edit User</p>

          <p className="m-0 text-sm leading-5 text-slate-600">
            Set up your Users to get started with Auspira
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer border-0 bg-transparent p-0 leading-none"
        >
          <X size={20} />
        </button>
      </div>
      <Form layout="vertical" form={form} onFinish={onFinish} id="editUserForm">
        {/* Full Name */}
        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[{ required: true, message: 'Please enter full name' }]}
        >
          <Input placeholder="John Aly" size="large" />
        </Form.Item>

        {/* Email */}
        <DisabledTooltip
          disabled={!!user?.id}
          reason="Email cannot be changed after the account is created."
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input disabled={!!user?.id} placeholder="johnaly@example.com" size="large" />
          </Form.Item>
        </DisabledTooltip>

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
          <Input placeholder="+44 7700 900000" size="large" />
        </Form.Item>

        {/* Job Title */}
        <Form.Item label="Job Title" name="jobTitle">
          <Input placeholder="e.g. Project Manager" size="large" />
        </Form.Item>

        {/* Organisation  */}
        <Form.Item label="Counterparty Organisation  (Contractor)" name="contractor">
          <InputX placeholder="Start typing to search or create new..." />
        </Form.Item>

        {/* Organizational Role */}
        <Form.Item
          label="Organizational Role"
          name="roleId"
          rules={[{ required: true, message: 'Please select organizational role' }]}
        >
          <Select
            placeholder="Select organizational role"
            size="large"
            options={ROLE_COLORS_IN_LIST.map((role) => ({ label: role.name, value: role.id }))}
          />
        </Form.Item>

        {/* Areas of Interest */}
        <Form.Item label="Areas of Interest" name="areasOfInterest">
          <Input placeholder="e.g. risk management, cost control etc" size="large" />
        </Form.Item>

        {/* Assign Project */}
        {/* <Collapse
          items={[
            {
              key: '1',
              label: <span className="font-semibold">Assign Projects</span>,
              children: (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="px-2 py-2 text-left text-sm font-semibold">Projects</th>
                        <th className="px-2 py-2 text-left text-sm font-semibold">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project.id} className="border-b">
                          <td className="flex items-center gap-3 px-2 py-3">
                            <span className="text-sm">{project.name}</span>
                          </td>
                          <td className="px-2 py-3">
                            <Select disabled placeholder="View only" style={{ width: '100%' }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ),
            },
          ]}
        /> */}
      </Form>
    </Drawer>
  );
}
