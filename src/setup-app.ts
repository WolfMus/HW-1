import express, { Express, Request, Response } from "express";
import { HttpStatus } from "./core/types/types";
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from "./types";
import { db } from "./db/in-memory.db";
import { VideoType, AvailableResolutions } from "./videos/types/types/videos";
import { FieldErrorType } from "./videos/types/types/validationError";
import { createErrorMessage } from "./core/utils/error.utils";
import { videoInputDtoValidation } from "./videos/types/validation/videoInputDtoValidation";
import { videoUpdateInputDtoValidation } from "./videos/types/validation/videoUpdateInputDtoValidation";
import { VideoInputDto } from "./videos/types/dto/video.input-dto";
import { VideoUpdateInputDto } from "./videos/types/dto/video.update-dto";

export const setupApp = (app: Express) => {
  app.use(express.json()); //middleware для парсинга JSON в теле запроса

  //основной роут
  app.get("/", (req, res) => {
    res.status(200).send("Hello world!");
  });

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
  app.post("/videos", ( req: RequestWithBody<VideoInputDto>, res: Response<ApiResponse> ) => {

      const errors = videoInputDtoValidation(req.body);

      if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).send(createErrorMessage(errors));
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
        availableResolutions: req.body.availableResolutions,
      };
      db.videos.push(newVideo);
      res.status(HttpStatus.Created).send(newVideo);
    },
  );

  //Return video by id
  app.get("/videos/:videoId", (req: RequestWithParams<{ videoId: string }>, res: Response) => {
      const videoId = req.params.videoId;
      if (!videoId) {
        return res.sendStatus(HttpStatus.NotFound);
      }
      const id = +videoId;

      if (isNaN(id)) {
        return res.sendStatus(HttpStatus.NotFound);
      }

      const video = db.videos.find((v) => v.id === id);
      if (video) {
        res.status(200).send(video);
      } else {
        res.sendStatus(HttpStatus.NotFound);
      }
    },
  );

  // update video by id
  app.put("/videos/:id",( req: RequestWithParamsAndBody< { id: string }, VideoUpdateInputDto >, res: Response<ApiResponse>, ) => {
      const errors = videoUpdateInputDtoValidation(req.body);

      if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).send(createErrorMessage(errors));
        return;
      }

      const id = +req.params.id!;
      const video = db.videos.find((v) => v.id === id);
      if (video) {
        video.title = req.body.title;
        video.author = req.body.author;
        video.availableResolutions = req.body.availableResolutions;
        video.canBeDownloaded = req.body.canBeDownloaded;
        video.minAgeRestriction = req.body.minAgeRestriction;
        video.publicationDate = req.body.publicationDate;
        res.sendStatus(HttpStatus.NoContent);
      } else {
        res.sendStatus(HttpStatus.NotFound);
      }
    },
  );

  // delete video by id
  app.delete("/videos/:videoId", (req: RequestWithParams<{ videoId: string }>, res: Response) => {
      const id = +req.params.videoId!;
      const newVideo = db.videos.filter((v) => v.id !== id);
      if (newVideo.length < db.videos.length) {
        db.videos = newVideo;
        res.sendStatus(HttpStatus.NoContent);
      } else {
        res.sendStatus(HttpStatus.NotFound);
      }
    },
  );

  return app;
};
