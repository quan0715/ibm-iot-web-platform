import React from "react";

export function LoadingWidget() {
  return (
    <div className="flex w-fit p-4 flex-row justify-center items-center space-x-2">
      <div className="w-3 h-3 rounded-full bg-red-500 delay-0 animate-bounce"></div>
      <div className="w-3 h-3 rounded-full bg-blue-500 delay-75 animate-bounce"></div>
      <div className="w-3 h-3 rounded-full bg-purple-500 delay-150 animate-bounce"></div>
      <div className="w-3 h-3 rounded-full bg-green-500 delay-225 animate-bounce"></div>
      <div className="w-3 h-3 rounded-full bg-yellow-500 delay-300 animate-bounce"></div>
    </div>
  );
}

export function SuspenseWidget({
  isSuspense = false,
  fallback = <LoadingWidget />,
  children,
}: {
  isSuspense?: boolean;
  fallback?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return <>{isSuspense ? fallback : children}</>;
}
