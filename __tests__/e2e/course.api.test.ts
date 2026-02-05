import request from "supertest";
import { setupApp } from "../../src/setup-app";
import { app } from "../../src/index";
import { HttpStatus } from "../../src/core/types/types";
import { VideoUpdateInputDto } from "../../src/videos/types/dto/video.update-dto";

describe("Video API", () => {
  setupApp(app);

  beforeAll(async () => {
    await request(app).delete("/testing/all-data").expect(HttpStatus.NoContent)
  })

  it("Shoud return 200 and video array", async () => {
    await request(app).get("/videos").expect(200, []);
  });

  it("shoudn't return video by id", async () => {
    await request(app).get("/videos/11111").expect(404);
  });

  it("should create new video", async () => {
    await request(app)
      .post("/videos")
      .send({
        title: "string",
        author: "string",
        availableResolutions: ["P144"],
      });
  });
});


