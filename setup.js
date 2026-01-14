const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Add your MySQL password here
  });

  console.log('Setting up database...');

  try {
    // Create database
    await connection.execute('CREATE DATABASE IF NOT EXISTS todo_app');
    await connection.execute('USE todo_app');

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'manager', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create todos table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('draft', 'in_progress', 'completed') DEFAULT 'draft',
        user_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
      )
    `);

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert test users
    const users = [
      ['550e8400-e29b-41d4-a716-446655440000', 'user@example.com', 'Regular User', hashedPassword, 'user'],
      ['550e8400-e29b-41d4-a716-446655440001', 'manager@example.com', 'Manager User', hashedPassword, 'manager'],
      ['550e8400-e29b-41d4-a716-446655440002', 'admin@example.com', 'Admin User', hashedPassword, 'admin']
    ];

    for (const user of users) {
      await connection.execute(
        'INSERT IGNORE INTO users (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)',
        user
      );
    }

    // Insert sample todos
    const todos = [
      ['660e8400-e29b-41d4-a716-446655440000', 'Complete project', 'Finish the ABAC todo app', 'in_progress', '550e8400-e29b-41d4-a716-446655440000'],
      ['660e8400-e29b-41d4-a716-446655440001', 'Write documentation', 'Document the ABAC rules', 'draft', '550e8400-e29b-41d4-a716-446655440000'],
      ['660e8400-e29b-41d4-a716-446655440002', 'Review code', 'Review team member code', 'completed', '550e8400-e29b-41d4-a716-446655440001'],
      ['660e8400-e29b-41d4-a716-446655440003', 'Deploy application', 'Deploy to production server', 'in_progress', '550e8400-e29b-41d4-a716-446655440002']
    ];

    for (const todo of todos) {
      await connection.execute(
        'INSERT IGNORE INTO todos (id, title, description, status, user_id) VALUES (?, ?, ?, ?, ?)',
        todo
      );
    }

    console.log('Database setup completed successfully!');
    console.log('\nTest accounts:');
    console.log('User: user@example.com / password123');
    console.log('Manager: manager@example.com / password123');
    console.log('Admin: admin@example.com / password123');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();