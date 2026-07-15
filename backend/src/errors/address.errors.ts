import { AppError } from "@utils/AppError";

export const AddressErrors = {
  ADDRESS_NOT_FOUND: () =>
    new AppError("Address not found.", 404, "ADDRESS_NOT_FOUND"),
  ADDRESS_ALREADY_EXISTS: () =>
    new AppError("This address already exists. Please edit the existing one.", 409, "ADDRESS_ALREADY_EXISTS"),
  ADDRESS_LIMIT_REACHED: () =>
    new AppError("You can save up to 5 addresses. Please delete one before adding another.", 409, "ADDRESS_LIMIT_REACHED"),
  ADDRESS_IN_USE: () =>
    new AppError("This address is used by an order and cannot be deleted.", 409, "ADDRESS_IN_USE"),
};
