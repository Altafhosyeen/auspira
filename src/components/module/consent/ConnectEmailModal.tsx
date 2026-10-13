import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Modal,
  notification,
  Space,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { useGetConsentConnect } from '@/hooks/modules/consent';
import { useAuthStore } from '@/store/auth.store';

const { Text, Title, Link } = Typography;

interface ConsentData {
  redirectUrl?: string;
}

const ProfessionalEmailConnectModal = () => {
  const { token } = theme.useToken();
  const [isOpen, setIsOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { status: sessionStatus } = useSession();

  // Fetching the consent data (including the redirect URL)
  const { data: consentData, isLoading: isConsentLoading } = useGetConsentConnect() as {
    data: ConsentData | undefined;
    isLoading: boolean;
  };

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    setIsOpen(false);
    setConsentChecked(false);
  };

  const handleConnect = () => {
    setConnecting(true);

    // Ensure we have a valid redirect URL from the API response
    if (consentData?.redirectUrl) {
      // Redirect the user to the Google OAuth consent page
      window.location.href = consentData.redirectUrl;
    } else {
      setConnecting(false);
      notification.error({ message: 'Unable to initialize connection. Please try again.' });
      console.error('Redirect URL missing in consentData:', consentData);
    }
  };

  const isStatusLoading = sessionStatus === 'loading';
  const isConnected = Boolean(user?.emailInboxConnected);
  const isCancelDisabled = connecting || isConsentLoading;
  const isAgreeDisabled = !consentChecked || !consentData?.redirectUrl;
  const agreeDisabledReason = !consentChecked
    ? 'Check the box above to authorise access before continuing.'
    : 'Waiting for the connection details to load.';

  return (
    <div>
      <Tooltip
        title={
          isStatusLoading
            ? 'Checking your connection status…'
            : isConnected
              ? 'Your inbox is already connected to Auspira, so there is nothing left to set up. To disconnect or reconnect, revoke access from your Google Account settings.'
              : 'Connect your inbox so Auspira can read incoming emails for transaction details and attachments.'
        }
      >
        {/* antd disables pointer events on a disabled Button, so the wrapper receives the hover */}
        <span className="inline-block">
          <Button
            disabled={isStatusLoading || isConnected}
            loading={isStatusLoading}
            type="primary"
            icon={<MailOutlined />}
            onClick={handleOpen}
          >
            <span className="hidden lg:inline">
              {isConnected ? 'Connected with Auspira' : 'Connect With Auspira'}
            </span>
          </Button>
        </span>
      </Tooltip>

      <Modal
        open={isOpen}
        onCancel={handleClose}
        width={800} // Optimized width for readable line length at 100% zoom
        centered
        destroyOnClose
        title={null}
        footer={[
          <DisabledTooltip
            key="cancel"
            disabled={isCancelDisabled}
            reason="Please wait until this step finishes before cancelling."
          >
            <Button onClick={handleClose} disabled={isCancelDisabled}>
              Cancel
            </Button>
          </DisabledTooltip>,
          <DisabledTooltip key="connect" disabled={isAgreeDisabled} reason={agreeDisabledReason}>
            <Button
              type="primary"
              loading={connecting || isConsentLoading}
              disabled={isAgreeDisabled}
              onClick={handleConnect}
              style={{ minWidth: '140px' }}
            >
              Agree & Continue
            </Button>
          </DisabledTooltip>,
        ]}
      >
        {/* Visual Connection Header */}
        <div
          style={{
            textAlign: 'center',
            padding: '24px 0 16px 0',
            background: `linear-gradient(180deg, ${token.colorFillAlter} 0%, rgba(255,255,255,0) 100%)`,
            borderRadius: '8px 8px 0 0',
            marginBottom: '16px',
          }}
        >
          <Space size="large" align="center">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: token.colorPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.2)',
              }}
            >
              <SafetyOutlined style={{ fontSize: '24px', color: '#fff' }} />
            </div>
            <ArrowRightOutlined style={{ color: token.colorTextDescription, fontSize: '16px' }} />
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #d9d9d9',
              }}
            >
              <MailOutlined style={{ fontSize: '24px', color: '#595959' }} />
            </div>
          </Space>
          <Title
            level={4}
            className="font-bold!"
            style={{ marginTop: '16px', marginBottom: '4px' }}
          >
            Connect Your Email
          </Title>
        </div>

        {/* Warning Alert */}
        <Alert
          message="Important Privacy Notice"
          description="By proceeding, you grant Auspira permission to read your incoming emails. This process is automated, secure, and your password credentials are never stored."
          type="warning"
          showIcon
          style={{ marginBottom: '20px', borderRadius: '6px' }}
        />

        {/* Permission Scopes */}
        <div style={{ marginBottom: '24px' }}>
          <Text
            strong
            style={{
              display: 'block',
              marginBottom: '16px',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: token.colorTextSecondary,
            }}
          >
            Requested Permissions
          </Text>

          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Allowed Access */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <CheckCircleOutlined
                style={{
                  color: token.colorSuccess,
                  fontSize: '18px',
                  marginTop: '2px', // Perfect vertical centering with the first text line
                }}
              />
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: '14px', display: 'block', lineHeight: '1.4' }}>
                  Read-Only Email Access
                </Text>
                <Text
                  type="secondary"
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.5',
                    display: 'block',
                    marginTop: '4px',
                  }}
                >
                  Our system will scan inbox messages specifically for relevant transaction details
                  and PDF attachments.
                </Text>
              </div>
            </div>

            {/* Restricted Access */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <CloseCircleOutlined
                style={{
                  color: token.colorError,
                  fontSize: '18px',
                  marginTop: '2px', // Perfect vertical centering with the first text line
                }}
              />
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: '14px', display: 'block', lineHeight: '1.4' }}>
                  No Writing, Sending, or Deletion Capabilities
                </Text>
                <Text
                  type="secondary"
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.5',
                    display: 'block',
                    marginTop: '4px',
                  }}
                >
                  We cannot compose emails on your behalf, delete messages, or access your account's
                  primary security settings.
                </Text>
              </div>
            </div>
          </Space>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* Security Info Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: token.colorFillAlter,
            padding: '10px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
          }}
        >
          <Space size="small" align="center">
            <LockOutlined style={{ color: token.colorSuccess, fontSize: '14px' }} />
            <Text style={{ fontSize: '12px', lineHeight: '1' }} type="secondary">
              Secured with 256-bit SSL & Google OAuth 2.0 protocol
            </Text>
          </Space>
          <Tag color="success" bordered={false} style={{ margin: 0 }}>
            Secure Connection
          </Tag>
        </div>

        {/* Explicit Checkbox Consent */}
        <div style={{ padding: '2px 0' }}>
          <Checkbox
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <Text
              style={{
                fontSize: '13px',
                lineHeight: '1.5',
                display: 'block',
                color: token.colorText,
                marginLeft: '4px', // Space between custom checkbox layout and text
              }}
            >
              I authorize Auspira to access my email data as specified above. I understand that I
              can revoke this access at any time through my Google Account settings.
            </Text>
          </Checkbox>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Space size="small" split={<span style={{ color: token.colorTextQuaternary }}>•</span>}>
            <Link href="/privacy" target="_blank" style={{ fontSize: '12px' }}>
              Privacy Policy
            </Link>
            <Link href="/terms" target="_blank" style={{ fontSize: '12px' }}>
              Data Security Terms
            </Link>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default ProfessionalEmailConnectModal;
