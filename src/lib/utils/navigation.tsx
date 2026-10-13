import { FormInstance, Modal } from 'antd';

export const confirmBack = ({
  setToggle,
  form,
}: {
  toggle?: number;
  setToggle: () => void;
  form: FormInstance;
  handleSubmit?: (values: any) => Promise<void>;
}) => {
  if (form.isFieldsTouched()) {
    Modal.confirm({
      title: 'Do you want to save changes?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        form.submit();
      },
      onCancel: () => {
        setToggle();
        form.resetFields();
      },
    });
  } else {
    setToggle();
    form.resetFields();
  }
};
