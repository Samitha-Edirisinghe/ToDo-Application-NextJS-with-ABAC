import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllTodos, getTodosByUserId, createTodo } from '@/lib/db';
import { canCreateTodo, canViewTodo } from '@/lib/abac';

export async function GET(request: NextRequest) {
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

    let todos;
    if (user.role === 'manager' || user.role === 'admin') {
      // Managers and Admins can see all todos
      todos = await getAllTodos();
    } else {
      // Users can only see their own todos
      todos = await getTodosByUserId(user.id);
    }

    return NextResponse.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Check if user can create todos
    if (!canCreateTodo(user.role)) {
      return NextResponse.json(
        { message: 'Forbidden: You cannot create todos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, status = 'draft' } = body;

    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    const todo = await createTodo({
      title,
      description,
      status,
      userId: user.id,
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Create todo error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}