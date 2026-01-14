import mysql from 'mysql2/promise';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'todo_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  ) as any[];
  return rows[0];
}

export async function getUserById(id: string) {
  const [rows] = await pool.execute(
    'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ?',
    [id]
  ) as any[];
  return rows[0];
}

export async function createUser(data: { email: string; name: string; password: string; role: string }) {
  const { email, name, password, role } = data;
  const [result] = await pool.execute(
    'INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)',
    [email, name, password, role]
  ) as any;
  return getUserById(result.insertId);
}

export async function getTodosByUserId(userId: string) {
  const [rows] = await pool.execute(
    `SELECT t.*, u.email, u.name, u.role 
     FROM todos t 
     JOIN users u ON t.user_id = u.id 
     WHERE t.user_id = ? 
     ORDER BY t.created_at DESC`,
    [userId]
  ) as any[];
  return rows;
}

export async function getAllTodos() {
  const [rows] = await pool.execute(
    `SELECT t.*, u.email, u.name, u.role 
     FROM todos t 
     JOIN users u ON t.user_id = u.id 
     ORDER BY t.created_at DESC`
  ) as any[];
  return rows;
}

export async function getTodoById(id: string) {
  const [rows] = await pool.execute(
    `SELECT t.*, u.email, u.name, u.role 
     FROM todos t 
     JOIN users u ON t.user_id = u.id 
     WHERE t.id = ?`,
    [id]
  ) as any[];
  return rows[0];
}

export async function createTodo(data: { title: string; description?: string; status: string; userId: string }) {
  const { title, description, status, userId } = data;
  const [result] = await pool.execute(
    'INSERT INTO todos (title, description, status, user_id) VALUES (?, ?, ?, ?)',
    [title, description || null, status, userId]
  ) as any;
  return getTodoById(result.insertId);
}

export async function updateTodo(id: string, data: Partial<{ title: string; description: string; status: string }>) {
  const updates = [];
  const values = [];
  
  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  
  if (updates.length === 0) return null;
  
  values.push(id);
  await pool.execute(
    `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  return getTodoById(id);
}

export async function deleteTodo(id: string) {
  await pool.execute('DELETE FROM todos WHERE id = ?', [id]);
  return { success: true };
}