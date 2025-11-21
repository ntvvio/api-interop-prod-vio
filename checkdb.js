const db = require('./database.js');

db.all("SELECT * FROM movies", [], (err, rows) => {
  if (err) return console.error("Error movies:", err.message);
  console.log("Movies:", rows);
});

db.all("SELECT * FROM directors", [], (err, rows) => {
  if (err) return console.error("Error directors:", err.message);
  console.log("Directors:", rows);
});