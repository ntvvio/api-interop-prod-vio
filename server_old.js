// require('dotenv').config();
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const db = require('./database');
// const { authenticateToken, authorizeRole } = require('./middleware/auth');

// const app = express();
// app.use(express.json());

// const PORT = process.env.PORT || 3300;
// const JWT_SECRET = process.env.JWT_SECRET || 'rahasiaSuperAman';

// // ===================================================
// // ============== AUTHENTIKASI & REGISTRASI ==========
// // ===================================================

// // Register user biasa (role = user)
// app.post('/auth/register', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password)
//       return res.status(400).json({ error: 'Username dan password wajib diisi' });

//     const hashed = await bcrypt.hash(password, 10);
//     const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
//     const params = [username.toLowerCase(), hashed, 'user'];

//     db.run(sql, params, function (err) {
//       if (err) {
//         if (err.message.includes('UNIQUE'))
//           return res.status(400).json({ error: 'Username sudah digunakan' });
//         return res.status(500).json({ error: err.message });
//       }

//       res.status(201).json({
//         message: 'Registrasi berhasil',
//         userId: this.lastID,
//         role: 'user'
//       });
//     });
//   } catch (err) {
//     res.status(500).json({ error: 'Terjadi kesalahan server' });
//   }
// });

// // Register admin (untuk pengujian)
// app.post('/auth/register-admin', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password)
//       return res.status(400).json({ error: 'Username dan password wajib diisi' });

//     const hashed = await bcrypt.hash(password, 10);
//     const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
//     const params = [username.toLowerCase(), hashed, 'admin'];

//     db.run(sql, params, function (err) {
//       if (err) {
//         if (err.message.includes('UNIQUE'))
//           return res.status(400).json({ error: 'Username admin sudah ada' });
//         return res.status(500).json({ error: err.message });
//       }

//       res.status(201).json({
//         message: 'Admin berhasil dibuat',
//         userId: this.lastID,
//         role: 'admin'
//       });
//     });
//   } catch (err) {
//     res.status(500).json({ error: 'Terjadi kesalahan server' });
//   }
// });

// // Login (JWT menyertakan role)
// app.post('/auth/login', (req, res) => {
//   const { username, password } = req.body;
//   if (!username || !password)
//     return res.status(400).json({ error: 'Username dan password wajib diisi' });

//   db.get('SELECT * FROM users WHERE username = ?', [username.toLowerCase()], async (err, user) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (!user) return res.status(401).json({ error: 'User tidak ditemukan' });

//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) return res.status(401).json({ error: 'Password salah' });

//     const payload = { user: { id: user.id, username: user.username, role: user.role } };
//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

//     res.json({ message: 'Login berhasil', token });
//   });
// });

// // ===================================================
// // =================== MOVIES CRUD ===================
// // ===================================================

// // GET semua film (publik)
// app.get('/movies', (req, res) => {
//   db.all('SELECT * FROM movies ORDER BY id ASC', [], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows);
//   });
// });

// // Tambah film (login siapa pun)
// app.post('/movies', authenticateToken, (req, res) => {
//   const { title, director, year } = req.body;
//   if (!title || !director || !year)
//     return res.status(400).json({ error: 'Semua field wajib diisi' });

//   db.run('INSERT INTO movies (title, director, year) VALUES (?, ?, ?)', [title, director, year], function (err) {
//     if (err) return res.status(500).json({ error: err.message });

//     db.get('SELECT * FROM movies WHERE id = ?', [this.lastID], (err, movie) => {
//       if (err) return res.status(500).json({ error: err.message });
//       res.status(201).json({
//         message: 'Film berhasil ditambahkan',
//         data: movie,
//         added_by: req.user.username
//       });
//     });
//   });
// });

// // Update film (admin only)
// app.put('/movies/:id', [authenticateToken, authorizeRole('admin')], (req, res) => {
//   const { title, director, year } = req.body;
//   if (!title || !director || !year)
//     return res.status(400).json({ error: 'Semua field wajib diisi' });

//   db.run('UPDATE movies SET title=?, director=?, year=? WHERE id=?',
//     [title, director, year, req.params.id],
//     function (err) {
//       if (err) return res.status(500).json({ error: err.message });
//       if (this.changes === 0) return res.status(404).json({ error: 'Film tidak ditemukan' });

//       db.get('SELECT * FROM movies WHERE id=?', [req.params.id], (err, movie) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ message: 'Film berhasil diperbarui', data: movie });
//       });
//     });
// });

// // Hapus film (admin only)
// app.delete('/movies/:id', [authenticateToken, authorizeRole('admin')], (req, res) => {
//   db.run('DELETE FROM movies WHERE id=?', [req.params.id], function (err) {
//     if (err) return res.status(500).json({ error: err.message });
//     if (this.changes === 0) return res.status(404).json({ error: 'Film tidak ditemukan' });
//     res.json({ message: Film dengan ID ${req.params.id} berhasil dihapus });
//   });
// });

// // ===================================================
// // ================== DIRECTORS CRUD =================
// // ===================================================

// // GET semua sutradara (publik)
// app.get('/directors', (req, res) => {
//   db.all('SELECT * FROM directors ORDER BY id ASC', [], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows);
//   });
// });

// // GET sutradara berdasarkan ID (publik)
// app.get('/directors/:id', (req, res) => {
//   db.get('SELECT * FROM directors WHERE id = ?', [req.params.id], (err, row) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (!row) return res.status(404).json({ error: 'Sutradara tidak ditemukan' });
//     res.json(row);
//   });
// });

// // Tambah sutradara (login siapa pun)
// app.post('/directors', authenticateToken, (req, res) => {
//   const { name, birthYear } = req.body;
//   if (!name || !birthYear)
//     return res.status(400).json({ error: 'name dan birthYear wajib diisi' });

//   db.run('INSERT INTO directors (name, birthYear) VALUES (?, ?)', [name, birthYear], function (err) {
//     if (err) return res.status(500).json({ error: err.message });

//     db.get('SELECT * FROM directors WHERE id = ?', [this.lastID], (err, director) => {
//       if (err) return res.status(500).json({ error: err.message });
//       res.status(201).json({
//         message: 'Sutradara berhasil ditambahkan',
//         data: director,
//         added_by: req.user.username
//       });
//     });
//   });
// });

// // Update sutradara (admin only)
// app.put('/directors/:id', [authenticateToken, authorizeRole('admin')], (req, res) => {
//   const { name, birthYear } = req.body;
//   db.run('UPDATE directors SET name=?, birthYear=? WHERE id=?',
//     [name, birthYear, req.params.id],
//     function (err) {
//       if (err) return res.status(500).json({ error: err.message });
//       if (this.changes === 0)
//         return res.status(404).json({ error: 'Sutradara tidak ditemukan' });

//       db.get('SELECT * FROM directors WHERE id=?', [req.params.id], (err, director) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ message: 'Data sutradara berhasil diperbarui', data: director });
//       });
//     });
// });

// // Hapus sutradara (admin only)
// app.delete('/directors/:id', [authenticateToken, authorizeRole('admin')], (req, res) => {
//   db.run('DELETE FROM directors WHERE id=?', [req.params.id], function (err) {
//     if (err) return res.status(500).json({ error: err.message });
//     if (this.changes === 0)
//       return res.status(404).json({ error: 'Sutradara tidak ditemukan' });

//     res.json({ message: Sutradara dengan ID ${req.params.id} berhasil dihapus });
//   });
// });

// // ===================================================
// // ==================== SERVER RUN ===================
// // ===================================================
// app.listen(PORT, () => {
//   console.log(`Server berjalan di http://localhost:${PORT}`);
// });