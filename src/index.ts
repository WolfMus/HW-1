import express, { Request, Response } from "express";
import { setupApp } from "./setup-app";

//создание приложения
export const app = express();
setupApp(app);

//порт приложения
const PORT = process.env.PORT || 5001;

//Запуск приложения
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
