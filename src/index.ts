import express, { Request, Response } from "express";
import { setupApp } from "./setup-app";

//создание приложения
const app = express();
setupApp(app);

const enum availableResolutions {
  P144 = "P144",
  P240 = "P240",
  P360 = "P360",
  P480 = "P480",
  P720 = "P720",
  P1080 = "P1080",
  P1440 = "P1440",
  P2160 = "P2160",
}

type videoType = {
  id: number;
  title: string;
  author: string;
  canBeDownloaded: boolean;
  minAgeRestriction: number | null;
  createdAt: string;
  publicationDate: string;
  availableResolutions: availableResolutions[];
};

let videos: videoType[] = [];

// clear data for testing
app.delete("/testing/all-data", (req: Request<{}>, res: Response) => {
  videos = [];
  res.status(204).send(videos);
});

//returns all videos
app.get(
  "/videos",
  (req: Request<{}, {}, {}, {}>, res: Response<videoType[]>) => {
    res.status(200).send(videos);
  },
);

// create new video
app.post(
  "/videos",
  (
    req: Request<
      {},
      {},
      {
        title: "string";
        author: "string";
        availableResolutions: availableResolutions[];
      }
    >,
    res: Response,
  ) => {
    const title = req.body.title;
    if (!title || typeof title !== "string" || title.length > 40) {
      res.status(400).send({
        errorsMessages: [
          {
            message: "Incorrect input title",
            field: "title",
          },
        ],
      });
      return;
    }

    const author = req.body.author;
    if (!author || typeof author !== "string" || author.length > 20) {
      res.status(400).send({
        errorsMessages: [
          {
            message: "Incorrect input author name",
            field: "author",
          },
        ],
      });
      return;
    }

    const dateNow = new Date();
    const dateDefault = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newVideo = {
      id: videos.length,
      title: req.body.title,
      author: req.body.author,
      canBeDownloaded: true,
      minAgeRestriction: null,
      createdAt: dateNow.toISOString(),
      publicationDate: dateDefault.toISOString(),
      availableResolutions: req.body.availableResolutions,
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
      return res.status(400).json({ error: "Video ID is required" });
    }
    const id = +videoId;

    if (isNaN(id)) {
      return res.sendStatus(404);
    }

    const video = videos.find((v) => v.id === id);
    if (video) {
      res.sendStatus(200);
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
        title: "string";
        author: "string";
        availableResolutions: availableResolutions[];
        canBeDownloaded: "boolean";
        minAgeRestriction: "number";
        publicationDate: "string";
      }
    >,
    res: Response,
  ) => {
    const title = req.body.title;
    if (!title || typeof title !== "string" || title.length > 40) {
      res.status(400).send({
        errorsMessages: [
          {
            message: "Incorrect input title",
            field: "title",
          },
        ],
      });
      return;
    }

    const author = req.body.author;
    if (!author || typeof author !== "string" || author.length > 20) {
      res.status(400).send({
        errorsMessages: [
          {
            message: "Incorrect input author name",
            field: "author",
          },
        ],
      });
      return;
    }

    const resolution = req.body.availableResolutions;
    if (!resolution) {
      res.status(400).send({
        errorsMessages: [
          {
            message: "At least one resolution should be added",
            field: "availableResolution",
          },
        ],
      });
      return;
    }

    const download = req.body.canBeDownloaded;
    if (typeof download !== "boolean") {
      res.status(400).send({
        errorsMessages: [
          {
            message: "Not boolean",
            field: "canBeDownloaded",
          },
        ],
      });
      return;
    }

    const ageRestriction = req.body.minAgeRestriction;
    if (ageRestriction !== null && typeof ageRestriction !== "number") {
      res.status(400).send({
        errorsMessages: [
          {
            message: "Incorrect input minAgeRestriction value",
            field: "minAgeRestriction",
          },
        ],
      });
      return;
    }
    if (ageRestriction < 1 || ageRestriction > 18) {
      res.status(400).send({
        errorsMessages: [
          {
            message: "Incorrect input minAgeRestriction value",
            field: "minAgeRestriction",
          },
        ],
      });
      return;
    }

    const publicationDate = req.body.publicationDate;
    if (typeof publicationDate !== "string" || !publicationDate.trim()) {
      res.status(400).send({
        errorsMessages: [
          {
            message: "Incorrect input publicationDate value",
            field: "publicationDate",
          },
        ],
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
      res.sendStatus(204);
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
