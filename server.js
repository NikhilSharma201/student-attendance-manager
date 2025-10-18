const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./attendance.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables and insert default data
// Replace the initializeDatabase function with:
function initializeDatabase() {
  // Create users table with correct columns
  db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS attendance`);
    db.run(`DROP TABLE IF EXISTS users`);
    
    db.run(`CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('✅ Users table ready');
        insertDefaultUsers();
      }
    });

    db.run(`CREATE TABLE attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )`, (err) => {
      if (err) {
        console.error('Error creating attendance table:', err.message);
      } else {
        console.log('✅ Attendance table ready');
      }
    });
  });
}

// Insert default users
function insertDefaultUsers() {
  const defaultUsers = [
    { name: 'Mr. Raj', email: 'raj@school.com', password: '12345', role: 'teacher' },
    { name: 'Amit', email: 'amit@student.com', password: '12345', role: 'student' },
    { name: 'Sara', email: 'sara@student.com', password: '12345', role: 'student' },
    { name: 'Ravi', email: 'ravi@student.com', password: '12345', role: 'student' }
  ];

  const insertStmt = db.prepare('INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
  
  defaultUsers.forEach(user => {
    insertStmt.run(user.name, user.email, user.password, user.role);
  });
  
  insertStmt.finalize(() => {
    console.log('✅ Default users inserted');
  });
}

// API ENDPOINTS

// 1. Login endpoint
app.post('/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  const query = 'SELECT * FROM users WHERE email = ? AND password = ? AND role = ?';
  
  db.get(query, [email, password, role], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials or role' });
    }
    
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  });
});

// 2. Get all students with attendance percentage
app.get('/students', (req, res) => {
  const query = `
    SELECT 
      u.id, 
      u.name, 
      u.email,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
      COUNT(a.id) as total_days
    FROM users u
    LEFT JOIN attendance a ON u.id = a.student_id
    WHERE u.role = 'student'
    GROUP BY u.id, u.name, u.email
  `;

  db.all(query, [], (err, students) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const studentsWithPercentage = students.map(student => {
      const percentage = student.total_days > 0 
        ? Math.round((student.present_days / student.total_days) * 100) 
        : 0;
      
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        percentage: percentage
      };
    });

    res.json(studentsWithPercentage);
  });
});

// 3. Mark attendance for students
app.post('/mark', (req, res) => {
  const { attendance } = req.body;

  if (!attendance || !Array.isArray(attendance)) {
    return res.status(400).json({ error: 'Invalid attendance data' });
  }

  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

  // Check if attendance already marked for today
  const checkQuery = 'SELECT COUNT(*) as count FROM attendance WHERE date = ?';
  
  db.get(checkQuery, [today], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.count > 0) {
      return res.status(400).json({ error: 'Attendance already marked for today' });
    }

    // Insert attendance records
    const insertStmt = db.prepare('INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)');
    
    let completed = 0;
    let hasError = false;

    attendance.forEach(record => {
      insertStmt.run(record.student_id, today, record.status, (err) => {
        if (err && !hasError) {
          hasError = true;
          return res.status(500).json({ error: 'Error marking attendance' });
        }
        
        completed++;
        
        if (completed === attendance.length && !hasError) {
          insertStmt.finalize();
          res.json({ success: true, message: 'Attendance marked successfully' });
        }
      });
    });
  });
});

// 4. Get attendance summary for a specific student
app.get('/attendance/:id', (req, res) => {
  const studentId = req.params.id;

  const query = `
    SELECT 
      COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
      COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
      COUNT(*) as total
    FROM attendance
    WHERE student_id = ?
  `;

  db.get(query, [studentId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const percentage = result.total > 0 
      ? Math.round((result.present / result.total) * 100) 
      : 0;

    res.json({
      present: result.present,
      absent: result.absent,
      total: result.total,
      percentage: percentage
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log('Server running at http://localhost:5000');
  console.log('Attendance Management System Backend Active');
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('\n✅ Database connection closed');
    }
    process.exit(0);
  });
});