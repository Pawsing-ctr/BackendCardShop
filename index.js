const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Pool, Client } = require("pg");
require("dotenv").config();
const bcrypt = require("bcrypt");

const user = process.env.USER;
const database = process.env.DATABASE;
const password = process.env.PASSWORD;

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user,
  host: "localhost",
  database,
  password,
  port: 5432,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/api/products", upload.single("image"), async (req, res) => {
  const { id, name, description, price } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Файл обязателен!" });
  }

  try {
    const existingProduct = await pool.query(
      "SELECT id FROM producttable WHERE id = $1",
      [id]
    );
    if (existingProduct.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Продукт с таким ID уже существует" });
    }

    const result = await pool.query(
      "INSERT INTO producttable (id, name, description, price, photo_data, photo_name, photo_mimetype) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        id,
        name,
        description,
        price,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
      ]
    );

    const product = result.rows[0];

    delete product.photo_data;

    res.status(201).json({ message: "Продукт добавлен!", data: product });
  } catch (error) {
    console.error("Ошибка при добавлении продукта:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, price, photo_name, photo_mimetype FROM producttable"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/api/products/:id/image", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "ID продукта не указан" });
  }

  try {
    const result = await pool.query(
      "SELECT photo_data, photo_mimetype FROM producttable WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Изображение не найдено" });
    }

    const { photo_data, photo_mimetype } = result.rows[0];
    res.contentType(photo_mimetype);
    res.send(photo_data);
  } catch (error) {
    console.error("Ошибка при получении изображения:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM producttable WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Продукт не найден" });
    }

    const deletedProduct = result.rows[0];

    delete deletedProduct.photo_data;

    res.json({ message: "Продукт удален", deletedProduct });
  } catch (error) {
    console.error("Ошибка при удалении продукта:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.post("/api/users", async (req, res) => {
  console.log("Received registration request:", req.body);
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await pool.query(
      "SELECT id FROM userstable WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User with this username or email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO userstable (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email, passwordHash]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: "User registered successfully!",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
