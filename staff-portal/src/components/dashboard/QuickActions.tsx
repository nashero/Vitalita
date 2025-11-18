/**
 * Quick Actions component - role-specific action buttons
 */

import { LucideIcon } from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

export default function QuickActions({ actions, title = 'Quick Actions' }: QuickActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const colorClass = action.color || 'bg-red-600 hover:bg-red-700';

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg
                ${colorClass} text-white
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                hover:shadow-md
              `}
            >
              <Icon className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

