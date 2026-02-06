import { Request, Response, Router } from "express";
import { HttpStatus } from "../../core/types/types";
import { db } from "../../db/in-memory.db";
import { VideoInputDto } from "../dto/video.input-dto";
import { ApiResponse, VideoType } from "../types/videos";
import { videoInputDtoValidation } from "../validation/videoInputDtoValidation";
import { videoUpdateInputDtoValidation } from "../validation/videoUpdateInputDtoValidation";
import { createErrorMessage } from "../../core/utils/error.utils";
import {
  RequestWithParams,
  RequestWithBody,
  RequestWithParamsAndBody,
} from "../../types";
import { VideoUpdateInputDto } from "../dto/video.update-dto";

export const videosRouter = Router({});

videosRouter
  //returns all videos
  .get("", (req, res: Response<VideoType[]>) => {
    res.status(HttpStatus.Ok).send(db.videos);
  })

  // create new video
  .post(
    "",
    (req: RequestWithBody<VideoInputDto>, res: Response<ApiResponse>) => {
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
  )

  //Return video by id
  .get(
    ":videoId",
    (req: RequestWithParams<{ videoId: string }>, res: Response) => {
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
  )

  // update video by id
  .put(
    ":id",
    (
      req: RequestWithParamsAndBody<{ id: string }, VideoUpdateInputDto>,
      res: Response<ApiResponse>,
    ) => {
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
  )

  // delete video by id
  .delete(
    ":videoId",
    (req: RequestWithParams<{ videoId: string }>, res: Response) => {
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
