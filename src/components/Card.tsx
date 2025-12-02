"use client";

import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        "shadow-md rounded-lg p-6 border border-gray-100",
        className
      )}
    >
      {children}
    </div>
  );
}
