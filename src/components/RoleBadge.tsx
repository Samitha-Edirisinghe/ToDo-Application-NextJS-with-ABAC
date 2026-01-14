import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const roleColors = {
    user: 'bg-blue-100 text-blue-800 border-blue-200',
    manager: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    admin: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors capitalize',
        roleColors[role],
        className
      )}
    >
      {role}
    </span>
  );
}