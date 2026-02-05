import request from "supertest";
import { setupApp } from "../../../src/setup-app.ts";
import { app } from "../../../src";
import { VideoInputDto } from "../../../src/videos/types/dto/video.input-dto";
import { AvailableResolutions } from "../../../src/videos/types/types/videos";
import { HttpStatus } from "../../../src/core/types/types";

describe("Videos API body validation check", () => {
  setupApp(app);

  const correctTestVideoData: VideoInputDto = {
    title: "string",
    author: "string",
    availableResolutions: [AvailableResolutions.P2160],
  };

  beforeAll(async () => {
    await request(app).delete("/testing/all-data").expect(HttpStatus.NoContent);
  });

  it("Should not create video when incorrect body passed; POST /videos", async () => {
    const invalidDataSet1 = await request(app)
      .post("/videos")
      .send({
        ...correctTestVideoData,
        title: null,
        author: null,
        availableResolutions: null,
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet1.body.errorsMessages).toHaveLength(3);

    const invalidDataSet2 = await request(app)
        .post('/videos')
        .send({
            ...correctTestVideoData,
            title: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',    //too long
            author: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',    //too long
            availableResolutions: ''                                                //length === 0 
        })
        .expect(HttpStatus.BadRequest)

        expect(invalidDataSet2.body.errorsMessages).toHaveLength(3)

        const videosListResponse = await request(app).get("/videos");
        expect(videosListResponse.body).toHaveLength(0);
  });

});
