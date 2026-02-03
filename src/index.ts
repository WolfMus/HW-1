import express, { Request, Response } from "express";
import { setupApp } from "./setup-app";
import { registerHooks } from "node:module";

//создание приложения
const app = express();
setupApp(app);

enum AvailableResolutions {
  P144 = "P144",
  P240 = "P240",
  P360 = "P360",
  P480 = "P480",
  P720 = "P720",
  P1080 = "P1080",
  P1440 = "P1440",
  P2160 = "P2160",
}

type VideoType = {
  id: number;
  title: string | null;
  author: string | null;
  canBeDownloaded: boolean;
  minAgeRestriction: number | null;
  createdAt: string;
  publicationDate: string;
  availableResolutions: AvailableResolutions[];
};

type FieldErrorType = {
  message: string;
  field: string;
};

type ApiResponse =
  | { errorsMessages: FieldErrorType[] }
  | VideoType[]
  | VideoType;

let videos: VideoType[] = [];

// clear data for testing
app.delete("/testing/all-data", (req, res) => {
  videos = [];
  res.status(204).send(videos);
});

//returns all videos
app.get("/videos", (req, res: Response<VideoType[]>) => {
  res.status(200).send(videos);
});

// create new video
app.post(
  "/videos",
  (
    req: Request<
      {},
      {},
      {
        title: string | null;
        author: string | null;
        availableResolutions: AvailableResolutions[];
      }
    >,
    res: Response<ApiResponse>,
  ) => {
    const errors: FieldErrorType[] = [];

    const title = req.body.title;
    if (title !== null) {
      if (!title || typeof title !== "string" || title.length > 40) {
        errors.push({
          message: "Incorrect input title",
          field: "title",
        });
      }
    }

    const author = req.body.author;
    if (author !== null) {
      if (!author || typeof author !== "string" || author.length > 20) {
        errors.push({
          message: "Incorrect input author name",
          field: "author",
        });
      }
    }

    const resolution = req.body.availableResolutions;
    if (!resolution) {
      errors.push({
        message: "At least one resolution should be added",
        field: "availableResolution",
      });
    }

    if (errors.length > 0) {
      res.status(400).send({
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
    res.status(201).send(newVideo);
  },
);

//Return video by id
app.get(
  "/videos/:videoId",
  (req: Request<{ videoId: string }>, res: Response) => {
    const videoId = req.params.videoId;
    if (!videoId) {
      return res.sendStatus(404);
    }
    const id = +videoId;

    if (isNaN(id)) {
      return res.sendStatus(404);
    }

    const video = videos.find((v) => v.id === id);
    if (video) {
      res.status(200).send(video);
    } else {
      res.sendStatus(404);
    }
  },
);

// update video by id
app.put(
  "/videos/:id",
  (
    req: Request<
      { id: string },
      {},
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
    if (title !== null) {
      if (!title || typeof title !== "string" || title.length > 40) {
        errors.push({
          message: "Incorrect input title",
          field: "title",
        });
      }
    }

    const author = req.body.author;
    if (author !== null) {
      if (!author || typeof author !== "string" || author.length > 20) {
        errors.push({
          message: "Incorrect input author name",
          field: "author",
        });
      }
    }

    const resolution = req.body.availableResolutions;
    if (resolution.length === 0) {
      errors.push({
        message: "At least one correct resolution should be added",
        field: "availableResolution",
      });
    } else {
      const validResolutions = Object.values(AvailableResolutions);

      for (const res of resolution) {
        if (!validResolutions.includes(res)) {
          errors.push({
            message: "Invalid resolution",
            field: "availableResolution",
          });
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
      res.status(400).send({
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
      res.status(204).send(video);
    } else {
      res.sendStatus(404);
    }
  },
);

// delete video by id
app.delete(
  "/videos/:videoId",
  (req: Request<{ videoId: string }>, res: Response) => {
    const id = +req.params.videoId!;
    const newVideo = videos.filter((v) => v.id !== id);
    if (newVideo.length < videos.length) {
      videos = newVideo;
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  },
);

//порт приложения
const PORT = process.env.PORT || 5001;

//Запуск приложения
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
