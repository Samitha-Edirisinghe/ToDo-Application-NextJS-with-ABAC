import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getTodoById, updateTodo, deleteTodo } from '@/lib/db';
import { canUpdateTodo, canDeleteTodo } from '@/lib/abac';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const todo = await getTodoById(params.id);
    if (!todo) {
      return NextResponse.json(
        { message: 'Todo not found' },
        { status: 404 }
      );
    }

    // Check if user can view this todo
    if (!canViewTodo(user.role, todo.user_id, user.id)) {
      return NextResponse.json(
        { message: 'Forbidden: You cannot view this todo' },
        { status: 403 }
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Get todo error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const todo = await getTodoById(params.id);
    if (!todo) {
      return NextResponse.json(
        { message: 'Todo not found' },
        { status: 404 }
      );
    }

    // Check if user can update this todo
    if (!canUpdateTodo(user.role, todo.user_id, user.id)) {
      return NextResponse.json(
        { message: 'Forbidden: You cannot update this todo' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updatedTodo = await updateTodo(params.id, body);

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Update todo error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const todo = await getTodoById(params.id);
    if (!todo) {
      return NextResponse.json(
        { message: 'Todo not found' },
        { status: 404 }
      );
    }

    // Check if user can delete this todo
    if (!canDeleteTodo(user.role, todo.user_id, user.id, todo.status)) {
      return NextResponse.json(
        { message: 'Forbidden: You cannot delete this todo' },
        { status: 403 }
      );
    }

    await deleteTodo(params.id);

    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}