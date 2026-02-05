import express, { Express, Request, Response } from "express";
import { HttpStatus } from "./core/types/types";
import { RequestWithBody, RequestWithParams, RequestWithParamsAndBody } from "./types";
import { db } from "./db/in-memory.db";
import { VideoType } from "./videos/types/videos";

export const setupApp = (app: Express) => {
  app.use(express.json()); //middleware для парсинга JSON в теле запроса

  //основной роут
  app.get("/", (req, res) => {
    res.status(200).send("Hello world!");
  });

  
type FieldErrorType = {
  message: string;
  field: string;
};

type ApiResponse =
  | { errorsMessages: FieldErrorType[] }
  | VideoType[]
  | VideoType;

// clear data for testing
app.delete("/testing/all-data", (req, res) => {
  db.videos = [];
  res.status(HttpStatus.NoContent).send(db.videos);
});

//returns all videos
app.get("/videos", (req, res: Response<VideoType[]>) => {
  res.status(HttpStatus.Ok).send(db.videos);
});

// create new video
app.post("/videos",(req: RequestWithBody<{
                        title: string;
                        author: string;
                        availableResolutions: AvailableResolutions[];
                        }>, 
                    res: Response<ApiResponse>,) => {

    const errors: FieldErrorType[] = [];

    const title = req.body.title;
    if (!title || typeof title !== "string" || title.length > 40) {
      errors.push({
        message: "Incorrect input title",
        field: "title",
      });
    }

    const author = req.body.author;
    if (!author || typeof author !== "string" || author.length > 20) {
      errors.push({
        message: "Incorrect input author name",
        field: "author",
      });
    }

    const resolution = req.body.availableResolutions;
    if (!resolution || resolution.length === 0) {
      errors.push({
        message: "At least one correct resolution should be added",
        field: "availableResolutions",
      });
    } else {
      const validResolutions = Object.values(AvailableResolutions);

      for (const res of resolution) {
        if (!validResolutions.includes(res)) {
          errors.push({
            message: "Invalid resolution",
            field: "availableResolutions",
          });
          break;
        }
      }
    }

    if (errors.length > 0) {
      res.status(HttpStatus.BadRequest).send({
        errorsMessages: errors,
      });
      return;
    }

    const dateNow = new Date();
    const dateDefault = new Date(dateNow.getTime() + 24 * 60 * 60 * 1000);

    const newVideo = {
      id: Date.now(),
      title: req.body.title,
      author: req.body.author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: dateNow.toISOString(),
      publicationDate: dateDefault.toISOString(),
      availableResolutions: resolution,
    };
    videos.push(newVideo);
    res.status(HttpStatus.Created).send(newVideo);
  },
);

//Return video by id
app.get(
  "/videos/:videoId",
  (req: RequestWithParams<{ videoId: string }>, res: Response) => {
    const videoId = req.params.videoId;
    if (!videoId) {
      return res.sendStatus(HttpStatus.NotFound);
    }
    const id = +videoId;

    if (isNaN(id)) {
      return res.sendStatus(HttpStatus.NotFound);
    }

    const video = videos.find((v) => v.id === id);
    if (video) {
      res.status(200).send(video);
    } else {
      res.sendStatus(HttpStatus.NotFound);
    }
  },
);

// update video by id
app.put("/videos/:id", (req: RequestWithParamsAndBody<
      { id: string },
      {
        title: string | null;
        author: string | null;
        availableResolutions: AvailableResolutions[];
        canBeDownloaded: boolean;
        minAgeRestriction: number | null;
        publicationDate: string;
      }
    >,
    res: Response<ApiResponse>,
  ) => {
    const errors: FieldErrorType[] = [];

    const title = req.body.title;
    if (title === null || typeof title !== "string") {
      errors.push({
        message: "Incorrect input title",
        field: "title",
      });
    } else if (title.trim().length === 0 || title.length > 40) {
      errors.push({
        message: "Incorrect input title",
        field: "title",
      });
    }

    const author = req.body.author;
    if (author === null || typeof author !== "string") {
      errors.push({
        message: "Incorrect input author name",
        field: "author",
      });
    } else if (author.trim().length === 0 || author.length > 20) {
      errors.push({
        message: "Incorrect input author name",
        field: "author",
      });
    }

    const resolution = req.body.availableResolutions;
    if (!resolution || resolution.length === 0) {
      errors.push({
        message: "At least one correct resolution should be added",
        field: "availableResolutions",
      });
    } else {
      const validResolutions = Object.values(AvailableResolutions);

      for (const res of resolution) {
        if (!validResolutions.includes(res)) {
          errors.push({
            message: "Invalid resolution",
            field: "availableResolutions",
          });
          break;
        }
      }
    }

    const download = req.body.canBeDownloaded;
    if (typeof download !== "boolean") {
      errors.push({
        message: "Not boolean",
        field: "canBeDownloaded",
      });
    }

    const ageRestriction = req.body.minAgeRestriction;
    if (ageRestriction !== null) {
      if (
        typeof ageRestriction !== "number" ||
        ageRestriction < 1 ||
        ageRestriction > 18
      ) {
        errors.push({
          message: "Invalid input",
          field: "minAgeRestriction",
        });
      }
    }

    const publicationDate = req.body.publicationDate;
    if (typeof publicationDate !== "string" || !publicationDate.trim()) {
      errors.push({
        message: "Incorrect input publicationDate value",
        field: "publicationDate",
      });
    }

    if (errors.length > 0) {
      res.status(HttpStatus.BadRequest).send({
        errorsMessages: errors,
      });
      return;
    }

    const id = +req.params.id!;
    const video = videos.find((v) => v.id === id);
    if (video) {
      video.title = title;
      video.author = author;
      video.availableResolutions = resolution;
      video.canBeDownloaded = download;
      video.minAgeRestriction = ageRestriction;
      video.publicationDate = publicationDate;
      res.sendStatus(HttpStatus.NoContent);
    } else {
      res.sendStatus(HttpStatus.NotFound);
    }
  },
);

// delete video by id
app.delete("/videos/:videoId",
  (req: RequestWithParams<{ videoId: string }>, res: Response) => {
    const id = +req.params.videoId!;
    const newVideo = videos.filter((v) => v.id !== id);
    if (newVideo.length < videos.length) {
      videos = newVideo;
      res.sendStatus(HttpStatus.NoContent);
    } else {
      res.sendStatus(HttpStatus.NotFound);
    }
  },
);

  return app;
};
