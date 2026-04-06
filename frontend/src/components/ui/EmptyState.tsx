import React from "react";
import { LucideIcon, Inbox } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Pass either a pre-built ReactNode OR use the convenience actionLabel+onAction props */
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<Props> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
      <Icon size={28} className="text-gray-400" />
    </div>
    <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-gray-400 max-w-xs mb-4">{description}</p>
    )}
    {/* Support both patterns */}
    {action && <div className="mt-2">{action}</div>}
    {!action && actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-2 btn-primary"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
