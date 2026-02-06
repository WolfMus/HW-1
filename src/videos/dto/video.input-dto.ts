import { AvailableResolutions } from "../types/videos";

export type VideoInputDto = {
  title: string;
  author: string;
  availableResolutions: AvailableResolutions[];
};
