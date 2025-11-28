"use client";

export default function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
    </div>
  );
}
