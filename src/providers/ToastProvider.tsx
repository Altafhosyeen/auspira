import React from 'react';
import { ToastContainer } from 'react-toastify';

function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      // hideProgressBar={true}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable={false}
      pauseOnHover={true}
      theme="light"
    />
  );
}

export default ToastProvider;
