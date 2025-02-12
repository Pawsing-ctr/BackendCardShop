const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Pool } = require("pg");

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "productsdatabase",
  password: "postgres",
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

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
