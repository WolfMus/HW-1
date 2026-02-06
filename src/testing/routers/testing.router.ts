import { Router } from "express";
import { HttpStatus } from "../../core/types/types";
import { db } from "../../db/in-memory.db";

export const testingRouter = Router({});

// clear data for testing
testingRouter.delete("/all-data", (req, res) => {
  db.videos = [];
  res.status(HttpStatus.NoContent).send(db.videos);
});
