import request from "supertest";
import { setupApp } from "../../src/setup-app";
import { app } from "../../src/index";

describe("/videos", () => {
  setupApp(app);
  beforeAll(async () => {
    await request(app).delete("/__test__/all-data");
  });

  it("Shoud return 200 and video array", async () => {
    await request(app).get("/videos").expect(200, []);
  });

  it("shoud return video by id", async () => {
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
