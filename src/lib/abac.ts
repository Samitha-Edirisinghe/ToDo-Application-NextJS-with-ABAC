import { UserRole, TodoStatus, ABACPermissions } from '@/types';

export function getPermissions(userRole: UserRole, todoUserId?: string, currentUserId?: string, todoStatus?: TodoStatus): ABACPermissions {
  const permissions: ABACPermissions = {
    canViewAll: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canDeleteAny: false,
  };

  switch (userRole) {
    case 'user':
      permissions.canCreate = true;
      permissions.canUpdate = true;
      permissions.canViewAll = false;
      permissions.canDelete = todoUserId === currentUserId && todoStatus === 'draft';
      permissions.canDeleteAny = false;
      break;
    
    case 'manager':
      permissions.canViewAll = true;
      permissions.canCreate = false;
      permissions.canUpdate = false;
      permissions.canDelete = false;
      permissions.canDeleteAny = false;
      break;
    
    case 'admin':
      permissions.canViewAll = true;
      permissions.canCreate = false;
      permissions.canUpdate = false;
      permissions.canDelete = false;
      permissions.canDeleteAny = true;
      break;
  }

  return permissions;
}

export function canViewTodo(userRole: UserRole, todoUserId: string, currentUserId: string): boolean {
  if (userRole === 'manager' || userRole === 'admin') {
    return true;
  }
  return todoUserId === currentUserId;
}

export function canCreateTodo(userRole: UserRole): boolean {
  return userRole === 'user';
}

export function canUpdateTodo(userRole: UserRole, todoUserId: string, currentUserId: string): boolean {
  if (userRole === 'user') {
    return todoUserId === currentUserId;
  }
  return false;
}

export function canDeleteTodo(userRole: UserRole, todoUserId: string, currentUserId: string, todoStatus: TodoStatus): boolean {
  if (userRole === 'admin') {
    return true;
  }
  if (userRole === 'user') {
    return todoUserId === currentUserId && todoStatus === 'draft';
  }
  return false;
}