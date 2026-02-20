import React from "react";
import usePullToRefresh from "./usePullToRefresh";
import { RefreshCw } from "lucide-react";

export default function PullToRefreshWrapper({ onRefresh, children }) {
  const { containerRef, pulling, pullDistance, refreshing } = usePullToRefresh(onRefresh);

  return (
    <div ref={containerRef} className="overflow-y-auto h-full relative" style={{ overscrollBehavior: "contain" }}>
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-150"
        style={{ height: pulling || refreshing ? `${pullDistance}px` : 0 }}
      >
        <RefreshCw
          className={`w-6 h-6 text-blue-500 dark:text-blue-400 transition-transform ${refreshing ? "animate-spin" : ""}`}
          style={{ transform: `rotate(${(pullDistance / 72) * 360}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}