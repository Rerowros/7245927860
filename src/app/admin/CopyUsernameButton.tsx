"use client";
import React, { useState } from "react";

export default function CopyUsernameButton({ username }: { username: string }) {
  const [show, setShow] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`@${username}`);
    setShow(true);
    setTimeout(() => setShow(false), 1500);
  };

  return (
    <>
      <button
        type="button"
        className="ml-4 text-sm text-neutral-500 dark:text-neutral-400 hover:underline focus:outline-none"
        onClick={handleCopy}
        title="Скопировать username"
      >
        @{username}
      </button>
      {show && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg bg-green-600 bg-opacity-80 text-white text-base shadow-2xl animate-fade-in-up z-[9999] whitespace-nowrap pointer-events-none select-none">
          Скопировано!
        </div>
      )}
      <style jsx>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.25s;
        }
      `}</style>
    </>
  );
}
