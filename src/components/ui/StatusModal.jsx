import React from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { Heading, Text } from "./Typography";
import { Button } from "./Button";

const StatusModal = ({
  isOpen,
  type = "success",
  title,
  message,
  onClose,
  actionLabel,
  loading = false,
}) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
              isSuccess
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isSuccess ? <CheckCircle size={30} /> : <AlertCircle size={30} />}
          </div>

          <Heading level={3} className="text-slate-900 mb-2">
            {title}
          </Heading>

          <Text variant="body" className="text-slate-600 mb-6">
            {message}
          </Text>

          <Button
            onClick={onClose}
            className={`w-full h-11 ${
              isSuccess
                ? "bg-slate-900 hover:bg-slate-800 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
            disabled={loading}
          >
            {loading ? "Please wait..." : actionLabel || (isSuccess ? "Continue" : "Try Again")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;