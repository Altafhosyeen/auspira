'use client';
import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
export const VERIFY_EMAIL_KEY = ['verify-email'] as const;
export const VERIFY_OTP_KEY = ['verify-otp'] as const;
const VERIFY_PASSWORD_KEY = ['verify-password'] as const;
const CHANGE_PASSWORD_KEY = ['change-password'] as const;

export const verifyOTP = async ({ email, OTP }: { email: string; OTP: string }) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.AUTH.VERIFY_OTP,
    method: 'POST',
    body: { UserEmail: email, OtpCode: OTP },
    isPublic: true,
  });
};
export const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyOTP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VERIFY_OTP_KEY });
    },
  });
};
export const forgotPassword = async ({ email }: { email: string }) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.AUTH.FORGET_PASSWORD,
    method: 'POST',
    body: { email },
    isPublic: true,
  });
};
export const useForgotPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VERIFY_EMAIL_KEY });
    },
  });
};

export const resendOTP = async ({ email }: { email: string }) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.AUTH.SEND_OTP,
    method: 'POST',
    body: { UserEmail: email },
    isPublic: true,
  });
};
export const useResendOTP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resendOTP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VERIFY_OTP_KEY });
    },
  });
};
export const resetPassword = async ({
  email,
  newPassword,
  token,
}: {
  email: string;
  newPassword: string;
  token: string;
}) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.AUTH.RESET_PASSWORD,
    method: 'POST',
    body: { email, newPassword, token },
    isPublic: true,
  });
};
export const useResetPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VERIFY_PASSWORD_KEY });
    },
  });
};
export const changePassword = async ({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
    method: 'POST',
    body: { currentPassword, newPassword },
    isPublic: true,
  });
};
export const useChangePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANGE_PASSWORD_KEY });
    },
  });
};
