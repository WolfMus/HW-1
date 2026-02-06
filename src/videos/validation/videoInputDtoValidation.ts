import { VideoInputDto } from "../dto/video.input-dto";
import { FieldErrorType } from "../types/validationError";
import { AvailableResolutions } from "../types/videos";

export const videoInputDtoValidation = (
  data: VideoInputDto,
): FieldErrorType[] => {
  const errors: FieldErrorType[] = [];

  if (!data.title || typeof data.title !== "string" || data.title.length > 40) {
    errors.push({
      message: "Incorrect input title",
      field: "title",
    });
  }

  if (!data.author || typeof data.author !== "string" || data.author.length > 20) {
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

  return errors;
};
