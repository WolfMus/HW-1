import { FieldErrorType } from "../../videos/types/validationError";

export const createErrorMessage = (
    errors: FieldErrorType[],
): { errorsMessages: FieldErrorType[] } => {
    return {errorsMessages: errors };
}