// // const express = require("express");
// // const cors = require("cors");
// // const multer = require("multer");

// // const app = express();
// // const PORT = 3005;

// // let storedData = [];

// // app.use(cors());
// // app.use(express.json());

// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, "uploads/");
// //   },
// //   filename: (req, file, cb) => {
// //     cb(null, `${Date.now()}-${file.originalname}`);
// //   },
// // });

// // const upload = multer({ storage });

// // app.post("/api/products", upload.single("image"), (req, res) => {
// //   const { id, name, description, price, photo } = req.body;

// //   if (!req.file) {
// //     return res.status(400).json({ message: "Файл обязателен!" });
// //   }

// //   const newData = {
// //     id,
// //     name,
// //     description,
// //     price,
// //     photo: `http://localhost:${PORT}/${photo}`,
// //   };

// //   storedData.push(newData);
// //   res.status(201).json({ message: "Данные успешно сохранены!", data: newData });
// // });

// // app.get("/api/products", (req, res) => {
// //   res.json(storedData);
// // });

// // app.listen(PORT, () => {
// //   console.log(`Сервер запущен: http://localhost:${PORT}`);
// // });

// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");

// const app = express();
// const PORT = 3005;

// let storedData = [];

// app.use(cors());
// app.use(express.json());

// // Проверяем, существует ли папка uploads, если нет — создаем
// const uploadFolder = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadFolder)) {
//   fs.mkdirSync(uploadFolder);
// }

// // Настройка хранилища Multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // Папка для сохранения изображений
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`); // Уникальное имя файла
//   },
// });

// const upload = multer({ storage });

// // Раздаем статическую папку uploads
// app.use("/uploads", express.static(uploadFolder));

// app.post("/api/products", upload.single("image"), (req, res) => {
//   const { id, name, description, price, photo } = req.body;

//   if (!req.file) {
//     return res.status(400).json({ message: "Файл обязателен!" });
//   }

//   const newData = {
//     id,
//     name,
//     description,
//     price,
//     photo: `http://localhost:${PORT}/uploads/${photo}`,
//   };

//   storedData.push(newData);
//   res.status(201).json({ message: "Данные успешно сохранены!", data: newData });
// });

// app.get("/api/products", (req, res) => {
//   res.json(storedData);
// });

// app.listen(PORT, () => {
//   console.log(`Сервер запущен: http://localhost:${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3005;

const storedData = [];

app.use(cors());
app.use(express.json());

// Проверяем, существует ли папка uploads, если нет — создаем
const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Настройка хранилища Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Папка для сохранения изображений
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Уникальное имя файла
  },
});

const upload = multer({ storage });

// Раздаем статическую папку uploads
app.use("/uploads", express.static(uploadFolder));

app.post("/api/products", upload.single("image"), (req, res) => {
  const { id, name, description, price, photo } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Файл обязателен!" });
  }

  const newData = {
    id,
    name,
    description,
    price,
    photo: `http://localhost:${PORT}/uploads/${req.file.filename}`,
  };

  storedData.push(newData);
  res.status(201).json({ message: "Данные успешно сохранены!", data: newData });
});

app.get("/api/products", (req, res) => {
  res.json(storedData);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
