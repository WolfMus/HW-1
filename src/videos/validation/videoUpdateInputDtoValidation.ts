import { VideoUpdateInputDto } from "../dto/video.update-dto";
import { FieldErrorType } from "../types/validationError";
import { AvailableResolutions } from "../types/videos";

export const videoUpdateInputDtoValidation = (
  data: VideoUpdateInputDto,
): FieldErrorType[] => {
  const errors: FieldErrorType[] = [];

  if (data.title === null || typeof data.title !== "string") {
    errors.push({
      message: "Incorrect input title",
      field: "title",
    });
  } else if (data.title.trim().length === 0 || data.title.length > 40) {
    errors.push({
      message: "Incorrect input title",
      field: "title",
    });
  }

  if (data.author === null || typeof data.author !== "string") {
    errors.push({
      message: "Incorrect input author name",
      field: "author",
    });
  } else if (data.author.trim().length === 0 || data.author.length > 20) {
    errors.push({
      message: "Incorrect input author name",
      field: "author",
    });
  }

  if (!data.availableResolutions || data.availableResolutions.length === 0) {
    errors.push({
      message: "At least one correct resolution should be added",
      field: "availableResolutions",
    });
  } else {
    const validResolutions = Object.values(AvailableResolutions);

    for (const res of data.availableResolutions) {
      if (!validResolutions.includes(res)) {
        errors.push({
          message: "Invalid resolution",
          field: "availableResolutions",
        });
        break;
      }
    }
  }

  if (typeof data.canBeDownloaded !== "boolean") {
    errors.push({
      message: "Not boolean",
      field: "canBeDownloaded",
    });
  }

  if (data.minAgeRestriction !== null) {
    if (
      typeof data.minAgeRestriction !== "number" ||
      data.minAgeRestriction < 1 ||
      data.minAgeRestriction > 18
    ) {
      errors.push({
        message: "Invalid input",
        field: "minAgeRestriction",
      });
    }
  }

  if (
    typeof data.publicationDate !== "string" ||
    !data.publicationDate.trim()
  ) {
    errors.push({
      message: "Incorrect input publicationDate value",
      field: "publicationDate",
    });
  }

  return errors;
};
