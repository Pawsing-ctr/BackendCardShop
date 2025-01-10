const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3005;

let storedData = [];

app.use(cors());

// Обработка JSON-запросов
app.use(express.json());

// запись для админки
app.post("/api/data", (req, res) => {
  const newData = req.body; // Получение данных из тела запроса
  storedData.push(newData); // Сохранение данных в памяти
  res
    .status(201)
    .json({ message: "Данные успешно сохранены!", data: storedData });
});

// Получение данных для пользователя
app.get("/api/data", (req, res) => {
  res.json(storedData); // Возврат сохранённых данных
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
