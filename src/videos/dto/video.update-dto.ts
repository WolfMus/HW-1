import { AvailableResolutions } from "../types/videos";

export type VideoUpdateInputDto = {
  title: string | null;
  author: string | null;
  availableResolutions: AvailableResolutions[];
  canBeDownloaded: boolean;
  minAgeRestriction: number | null;
  publicationDate: string;
};