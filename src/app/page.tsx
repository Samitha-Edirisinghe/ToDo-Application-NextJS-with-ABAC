'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TodoList } from '@/components/TodoList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, LogIn } from 'lucide-react';
import { getPermissions } from '@/lib/abac';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // User is logged in, no redirect needed
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Welcome to Todo App with ABAC</CardTitle>
            <CardDescription>
              A demonstration of Attribute-Based Access Control in a todo application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4 mr-2" />
              <AlertDescription>
                Please login or sign up to access the todo application. You can use one of the following test accounts:
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Can create, update, and delete own todos in draft state</p>
                  <p className="font-mono text-sm">Email: user@example.com</p>
                  <p className="font-mono text-sm">Password: password123</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manager Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Can view all todos but cannot modify</p>
                  <p className="font-mono text-sm">Email: manager@example.com</p>
                  <p className="font-mono text-sm">Password: password123</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Can view all todos and delete any todo</p>
                  <p className="font-mono text-sm">Email: admin@example.com</p>
                  <p className="font-mono text-sm">Password: password123</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={() => router.push('/login')}>
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button variant="outline" onClick={() => router.push('/signup')}>
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const permissions = getPermissions(user.role);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.name}!</CardTitle>
          <CardDescription>
            Your role: <span className="font-semibold capitalize">{user.role}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-primary/5">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">View Todos</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-2xl font-bold">
                  {permissions.canViewAll ? 'All' : 'Own Only'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Create Todos</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-2xl font-bold">
                  {permissions.canCreate ? '✓' : '✗'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Update Todos</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-2xl font-bold">
                  {permissions.canUpdate ? 'Own Only' : '✗'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Delete Drafts</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-2xl font-bold">
                  {permissions.canDelete ? 'Own Drafts' : '✗'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Delete Any</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-2xl font-bold">
                  {permissions.canDeleteAny ? '✓' : '✗'}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <TodoList currentUser={user} />
    </div>
  );
}