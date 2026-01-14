'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Todo, User } from '@/types';
import { getPermissions } from '@/lib/abac';
import { TodoForm } from './TodoForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TodoListProps {
  currentUser: User;
}

export function TodoList({ currentUser }: TodoListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const queryClient = useQueryClient();

  const { data: todos, isLoading, error } = useQuery({
    queryKey: ['todos', currentUser.id],
    queryFn: async () => {
      const response = await fetch('/api/todos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch todos');
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete todo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', currentUser.id] });
    },
  });

  const handleDelete = (todo: Todo) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      deleteMutation.mutate(todo.id);
    }
  };

  const handleEdit = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsEditDialogOpen(true);
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };

  const permissions = getPermissions(currentUser.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading todos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load todos. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Todos</h2>
        {permissions.canCreate && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Todo
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todos?.map((todo: Todo) => {
                const canUpdate = permissions.canUpdate && todo.user_id === currentUser.id;
                const canDelete = permissions.canDelete && 
                  todo.user_id === currentUser.id && 
                  todo.status === 'draft';
                const canDeleteAny = permissions.canDeleteAny;

                return (
                  <TableRow key={todo.id}>
                    <TableCell className="font-medium">{todo.title}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {todo.description || 'No description'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[todo.status]}>
                        {todo.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{todo.user?.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {todo.user?.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(todo.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {(canUpdate || canDelete || canDeleteAny) && (
                          <>
                            {canUpdate && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(todo)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {(canDelete || canDeleteAny) && (
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDelete(todo)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                        {!canUpdate && !canDelete && !canDeleteAny && (
                          <span className="text-sm text-muted-foreground">
                            No actions available
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Todo</DialogTitle>
          </DialogHeader>
          <TodoForm
            mode="create"
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ['todos', currentUser.id] });
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
          </DialogHeader>
          {selectedTodo && (
            <TodoForm
              mode="edit"
              todo={selectedTodo}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedTodo(null);
                queryClient.invalidateQueries({ queryKey: ['todos', currentUser.id] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}