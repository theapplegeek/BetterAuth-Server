export const CHANGE_EMAIL_PATH = "/api/auth/change-email";
export const CHANGE_EMAIL_NEUTRAL_MESSAGE =
  "Check your current email inbox to confirm this change. If the request is valid, you will receive instructions there.";

export const toNeutralChangeEmailResponse = (
  path: string,
  response: Response
): Response => {
  if (path !== CHANGE_EMAIL_PATH) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("content-type", "application/json; charset=utf-8");

  return new Response(
    JSON.stringify({
      status: true,
      message: CHANGE_EMAIL_NEUTRAL_MESSAGE,
    }),
    {
      status: 200,
      statusText: "OK",
      headers,
    }
  );
};
