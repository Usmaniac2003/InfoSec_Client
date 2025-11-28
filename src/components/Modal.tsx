"use client";

import React from "react";
import Button from "./Button";
import clsx from "clsx";

interface ModalProps {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  onClose: () => void;
  className?: string;
}

export default function Modal({
  open,
  title,
  children,
  onClose,
  className,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur"
      onClick={onClose}
    >
      <div
        className={clsx(
          "bg-white rounded-lg shadow-lg p-6 w-full max-w-md",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-lg font-semibold mb-4 text-gray-900">{title}</h2>
        )}

        {children}

        <div className="mt-4 text-right">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
