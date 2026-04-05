export function mapApiResponse(response, options = {}) {
  const body = response?.data;
  const fallbackMessage = options.fallbackMessage || "";

  return {
    success: typeof body?.success === "boolean" ? body.success : true,
    message: body?.message || fallbackMessage,
    data: body?.data,
    statusCode: body?.statusCode ?? response?.status ?? null,
    httpStatus: response?.status ?? null,
    raw: body,
  };
}

export function getApiErrorMessage(
  error,
  fallbackMessage = "Something went wrong. Please try again.",
) {
  const responseMessage = error?.response?.data?.message;
  if (responseMessage) {
    return responseMessage;
  }
  if (error?.message) {
    return error.message;
  }
  return fallbackMessage;
}

export function getValidationErrors(error) {
  const data = error?.response?.data?.data;
  if (data && typeof data === "object") {
    return data;
  }
  return {};
}

export function mapApiError(
  error,
  fallbackMessage = "Something went wrong. Please try again.",
) {
  return {
    message: getApiErrorMessage(error, fallbackMessage),
    statusCode: error?.response?.data?.statusCode ?? error?.response?.status,
    httpStatus: error?.response?.status ?? null,
    validationErrors: getValidationErrors(error),
    raw: error,
  };
}
