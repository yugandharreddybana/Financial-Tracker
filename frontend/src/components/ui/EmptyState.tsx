// EmptyState.tsx
import React from "react";

interface Props {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<Props> = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
}) => {
  const resolvedAction =
    action ||
    (actionLabel && onAction ? (
      <button onClick={onAction} className="btn-primary text-xs">
        {actionLabel}
      </button>
    ) : null);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs">{description}</p>
      {resolvedAction && <div className="mt-4">{resolvedAction}</div>}
    </div>
  );
};

export default EmptyState;