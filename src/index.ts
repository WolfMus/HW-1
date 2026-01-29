import express from "express";
import { setupApp } from "./setup-app";

//создание приложения
const app = express();
setupApp(app);

//порт приложения
const PORT = process.env.PORT || 5001;

app.get("testing/all-data", (req, res) => {
  res.send(404);
});

// create new video
app.post("/videos", (req, res) => {
  
});

//Запуск приложения
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
