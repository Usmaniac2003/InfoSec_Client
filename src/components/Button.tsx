"use client";

import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

export default function Button({
  children,
  className,
  variant = "primary",
  loading = false,
  ...props
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-md font-medium transition flex items-center justify-center";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={clsx(base, variants[variant], className, {
        "opacity-75 cursor-not-allowed": loading,
      })}
      disabled={loading}
      {...props}
    >
      {loading ? <span className="animate-spin mr-2">⚪</span> : null}
      {children}
    </button>
  );
}
