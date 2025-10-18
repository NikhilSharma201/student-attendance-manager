import React, { useState, useEffect } from 'react';

function App() {
  // State management
  const [view, setView] = useState('login'); // 'login', 'teacher', 'student'
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [studentData, setStudentData] = useState(null);
  const [message, setMessage] = useState('');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setView(data.user.role);
        
        // Fetch data based on role
        if (data.user.role === 'teacher') {
          fetchStudents();
        } else {
          fetchStudentAttendance(data.user.id);
        }
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (error) {
      setMessage('Cannot connect to server. Please ensure backend is running.');
    }
  };

  // Fetch all students (for teacher)
  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/students');
      const data = await response.json();
      setStudents(data);
      
      // Initialize attendance checkboxes
      const initialAttendance = {};
      data.forEach(student => {
        initialAttendance[student.id] = false;
      });
      setAttendance(initialAttendance);
    } catch (error) {
      setMessage('Error fetching students');
    }
  };

  // Fetch student attendance
  const fetchStudentAttendance = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:5000/attendance/${studentId}`);
      const data = await response.json();
      setStudentData(data);
    } catch (error) {
      setMessage('Error fetching attendance data');
    }
  };

  // Mark attendance
  const handleMarkAttendance = async () => {
    const attendanceList = Object.entries(attendance).map(([id, present]) => ({
      student_id: parseInt(id),
      status: present ? 'present' : 'absent'
    }));

    try {
      const response = await fetch('http://localhost:5000/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: attendanceList })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Attendance marked successfully ✅');
        fetchStudents(); // Refresh data
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to mark attendance');
      }
    } catch (error) {
      setMessage('Error marking attendance');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setView('login');
    setEmail('');
    setPassword('');
    setRole('student');
    setStudents([]);
    setAttendance({});
    setStudentData(null);
    setMessage('');
  };

  // Toggle attendance checkbox
  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f4f6fb 0%, #e8ecf4 100%)',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    },
    loginContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    },
    loginCard: {
      background: 'white',
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,43,91,0.15)',
      width: '100%',
      maxWidth: '420px'
    },
    header: {
      background: '#002B5B',
      color: 'white',
      padding: '20px 40px',
      borderRadius: '8px',
      marginBottom: '30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 12px rgba(0,43,91,0.2)'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#002B5B',
      marginBottom: '10px',
      textAlign: 'center'
    },
    subtitle: {
      fontSize: '14px',
      color: '#666',
      textAlign: 'center',
      marginBottom: '30px'
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      marginBottom: '15px',
      border: '2px solid #e0e0e0',
      borderRadius: '6px',
      fontSize: '16px',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s'
    },
    select: {
      width: '100%',
      padding: '12px 15px',
      marginBottom: '15px',
      border: '2px solid #e0e0e0',
      borderRadius: '6px',
      fontSize: '16px',
      boxSizing: 'border-box',
      background: 'white',
      cursor: 'pointer'
    },
    button: {
      width: '100%',
      padding: '14px',
      background: '#00ADB5',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background 0.3s, transform 0.1s',
      marginTop: '10px'
    },
    logoutButton: {
      padding: '10px 20px',
      background: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background 0.3s'
    },
    dashboard: {
      maxWidth: '1100px',
      margin: '0 auto'
    },
    table: {
      width: '100%',
      background: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    },
    th: {
      background: '#002B5B',
      color: 'white',
      padding: '15px',
      textAlign: 'left',
      fontWeight: 'bold'
    },
    td: {
      padding: '15px',
      borderBottom: '1px solid #f0f0f0',
      color: '#333'
    },
    checkbox: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    },
    message: {
      padding: '12px 20px',
      borderRadius: '6px',
      marginBottom: '20px',
      textAlign: 'center',
      fontWeight: 'bold'
    },
    successMessage: {
      background: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    errorMessage: {
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    card: {
      background: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      marginBottom: '20px'
    },
    statBox: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#002B5B',
      textAlign: 'center',
      marginBottom: '10px'
    },
    statLabel: {
      fontSize: '18px',
      color: '#666',
      textAlign: 'center'
    },
    alert: {
      padding: '15px 20px',
      borderRadius: '6px',
      marginTop: '20px',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    alertSuccess: {
      background: '#d4edda',
      color: '#155724',
      border: '2px solid #c3e6cb'
    },
    alertDanger: {
      background: '#f8d7da',
      color: '#721c24',
      border: '2px solid #f5c6cb'
    }
  };

  // LOGIN VIEW
  if (view === 'login') {
    return (
      <div style={styles.container}>
        <div style={styles.loginContainer}>
          <div style={styles.loginCard}>
            <div style={styles.title}>🎓 College Attendance Portal</div>
            <div style={styles.subtitle}>Institutional Management System</div>
            
            {message && (
              <div style={{...styles.message, ...styles.errorMessage}}>
                {message}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
              
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
              
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={styles.select}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
              
              <button
                type="submit"
                style={styles.button}
                onMouseOver={(e) => e.target.style.background = '#008c94'}
                onMouseOut={(e) => e.target.style.background = '#00ADB5'}
              >
                Login
              </button>
            </form>

            <div style={{marginTop: '20px', fontSize: '12px', color: '#888', textAlign: 'center'}}>
              <strong>Demo Credentials:</strong><br/>
              Teacher: raj@school.com / 12345<br/>
              Student: amit@student.com / 12345
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TEACHER DASHBOARD
  if (view === 'teacher') {
    return (
      <div style={styles.container}>
        <div style={styles.dashboard}>
          <div style={styles.header}>
            <h1 style={{margin: 0, fontSize: '24px'}}>Welcome, {user?.name}</h1>
            <button
              style={styles.logoutButton}
              onClick={handleLogout}
              onMouseOver={(e) => e.target.style.background = '#c82333'}
              onMouseOut={(e) => e.target.style.background = '#dc3545'}
            >
              Logout
            </button>
          </div>

          {message && (
            <div style={{...styles.message, ...styles.successMessage}}>
              {message}
            </div>
          )}

          <div style={styles.card}>
            <h2 style={{color: '#002B5B', marginBottom: '20px'}}>📋 Mark Today's Attendance</h2>
            
            <div style={{overflowX: 'auto'}}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Student ID</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Current Attendance</th>
                    <th style={styles.th}>Mark Present</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td style={styles.td}>{student.id}</td>
                      <td style={styles.td}>{student.name}</td>
                      <td style={styles.td}>
                        <span style={{
                          color: student.percentage >= 75 ? '#28a745' : '#dc3545',
                          fontWeight: 'bold'
                        }}>
                          {student.percentage}%
                        </span>
                      </td>
                      <td style={styles.td}>
                        <input
                          type="checkbox"
                          checked={attendance[student.id] || false}
                          onChange={() => toggleAttendance(student.id)}
                          style={styles.checkbox}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              style={{...styles.button, marginTop: '20px'}}
              onClick={handleMarkAttendance}
              onMouseOver={(e) => e.target.style.background = '#008c94'}
              onMouseOut={(e) => e.target.style.background = '#00ADB5'}
            >
              Submit Attendance
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STUDENT DASHBOARD
  if (view === 'student') {
    return (
      <div style={styles.container}>
        <div style={styles.dashboard}>
          <div style={styles.header}>
            <h1 style={{margin: 0, fontSize: '24px'}}>Welcome, {user?.name}</h1>
            <button
              style={styles.logoutButton}
              onClick={handleLogout}
              onMouseOver={(e) => e.target.style.background = '#c82333'}
              onMouseOut={(e) => e.target.style.background = '#dc3545'}
            >
              Logout
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={{color: '#002B5B', marginBottom: '30px', textAlign: 'center'}}>
              📊 Your Attendance Summary
            </h2>
            
            {studentData && (
              <>
                <div style={styles.statBox}>{studentData.percentage}%</div>
                <div style={styles.statLabel}>Overall Attendance</div>
                
                <div style={{
                  ...styles.alert,
                  ...(studentData.percentage >= 75 ? styles.alertSuccess : styles.alertDanger)
                }}>
                  {studentData.percentage >= 75 
                    ? '✅ Good Attendance! Keep it up!' 
                    : '🚫 You are in Defaulter List - Attendance Below 75%'}
                </div>

                <div style={{marginTop: '30px', display: 'flex', justifyContent: 'space-around'}}>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '32px', fontWeight: 'bold', color: '#28a745'}}>
                      {studentData.present}
                    </div>
                    <div style={{color: '#666', marginTop: '5px'}}>Days Present</div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '32px', fontWeight: 'bold', color: '#dc3545'}}>
                      {studentData.absent}
                    </div>
                    <div style={{color: '#666', marginTop: '5px'}}>Days Absent</div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '32px', fontWeight: 'bold', color: '#002B5B'}}>
                      {studentData.total}
                    </div>
                    <div style={{color: '#666', marginTop: '5px'}}>Total Days</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;