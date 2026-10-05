import { useState, useEffect } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

const Toast = ({ message, type = "info", onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <FiCheckCircle className="toast-icon success" />,
    error: <FiAlertCircle className="toast-icon error" />,
    info: <FiInfo className="toast-icon info" />,
  };

  return (
    <div className={`toast-notification toast-${type}`}>
      {icons[type] || icons.info}
      <span className="toast-message">{message}</span>
      <button onClick={onClose} className="toast-close">
        <FiX />
      </button>
    </div>
  );
};

export default Toast;
