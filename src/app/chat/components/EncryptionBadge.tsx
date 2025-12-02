"use client";

import { Lock } from "lucide-react";

export default function EncryptionBadge() {
  return (
    <div className="inline-flex items-center gap-2 bg-green-800/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
      <Lock className="w-4 h-4" /> End-to-End Encrypted
    </div>
  );
}
