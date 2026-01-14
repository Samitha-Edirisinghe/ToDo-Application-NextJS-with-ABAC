# Todo Application with ABAC

A full-stack todo application with Attribute-Based Access Control (ABAC) built with Next.js, MySQL, and TanStack Query.

## Features

- **Authentication**: User login and registration with JWT
- **ABAC (Attribute-Based Access Control)**: Three roles with different permissions
- **Todo Management**: Create, read, update, and delete todos
- **Role-Based Views**: Different views based on user role
- **Responsive Design**: Built with Tailwind CSS and shadcn/ui

## User Roles and Permissions

| Role | View Todos | Create Todos | Update Todos | Delete Todos |
|------|------------|--------------|--------------|--------------|
| User | Own only | Yes | Own only | Own draft only |
| Manager | All | No | No | No |
| Admin | All | No | No | Any todo |

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Data Fetching**: TanStack Query
- **Backend**: Next.js API Routes
- **Database**: MySQL with HeidiSQL
- **Authentication**: Custom JWT-based auth

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- MySQL Server (with HeidiSQL or another client)
- Git

### 2. Database Setup

1. Open HeidiSQL and connect to your MySQL server
2. Run the SQL commands from `database.sql` to create the database and tables
3. Update the `.env` file with your database credentials

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=todo_app
JWT_SECRET=your-secret-key-change-this-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000