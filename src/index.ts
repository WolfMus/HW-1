import express, { Request, Response } from "express";
import { setupApp } from "./setup-app";

//создание приложения
const app = express();
setupApp(app);

const availableResolutions = {
  P144: "P144",
  P240: "P240",
  P360: "P360",
  P480: "P480",
  P720: "P720",
  P1080: "P1080",
  P1440: "P1440",
  P2160: "P2160",
};
const videos = [
  {
    id: 0,
    title: "string",
    author: "string",
    canBeDownloaded: true,
    minAgeRestriction: null,
    createdAt: "2026-01-30T14:33:58.673Z",
    publicationDate: "2026-01-30T14:33:58.673Z",
    availableResolutions: ["P144"],
  },
];

//returns all videos
app.get("/videos", (req: Request, res: Response) => {
  res.status(200).send(videos);
});

// create new video
app.post("/videos", (req: Request, res: Response) => {
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

  const newVideo = {
    id: videos.length,
    title: req.body.title,
    author: req.body.author,
    canBeDownloaded: true,
    minAgeRestriction: null,
    createdAt: new Date().toISOString(),
    publicationDate: new Date().toISOString(),
    availableResolutions: req.body.availableResolutions,
  };

  videos.push(newVideo);
  res.status(201).send(newVideo);
});

//Return video by id
app.get("/videos/:videoId", (req: Request, res: Response) => {
  const videoId = req.params.videoId;

  if (!videoId) {
    return res.sendStatus(404);
  }

  const id = +videoId
  const video = videos.find((v) => v.id === id);
  if (video) {
    res.status(200);
  } else {
    res.status(404);
  }
});


app.delete("/video/:videoId", (req: Request<{'string'}>, res: Response) => {
  const id = +req.params.videoId;
  const newVideo = videos.filter((v) => v.id !== id)
  if (newVideo.length < videos.length) {
    res.status(204);
  } else {
    res.status(404);
  }
});
//порт приложения
const PORT = process.env.PORT || 5001;

//Запуск приложения
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
