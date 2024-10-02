export const IS_DEV = process.env.NODE_ENV === "development";

export const env = (async (): Promise<Record<string, string>> => {
  // load env
  const response = await fetch("/env.json?v=" + Date.now());
  return response.json();
})().catch((err) => {
  console.error(
    "Failed loading env.json, did you forget to mount it in the container?",
    err,
  );
  throw err;
});
export const version = (async (): Promise<string> => {
  const response = await fetch("/version.txt?v=" + Date.now());
  return response.text();
})().catch((err) => {
  console.error(
    "Failed loading version.txt, did you forget to create it before building the container?",
    err,
  );
  throw err;
});
export const SentryDsn = (await env).REACT_APP_SENTRY_DSN;
export const SentryEnabled = (await env).REACT_APP_SENTRY_ENABLED === "true";
export const SentrySamplingRate = parseFloat(
  (await env).REACT_APP_SENTRY_SAMPLE_RATE || "0",
);
export const SentryEnv = (await env).REACT_APP_SENTRY_ENV;
export const SentryRelease = (await version) ?? "dev";

export const OauthFacebook = (await env).REACT_APP_OAUTH_FACEBOOK === "y";
export const OauthTwitter = (await env).REACT_APP_OAUTH_TWITTER === "y";
export const OauthGoogle = (await env).REACT_APP_OAUTH_GOOGLE === "y";
export const OauthMicrosoft = (await env).REACT_APP_OAUTH_MICROSOFT === "y";
export const OauthApple = (await env).REACT_APP_OAUTH_APPLE === "y";

export const RecaptchaKey = (await env).REACT_APP_RECAPTCHA_KEY;

export const ProviderLegalName = (await env).REACT_APP_PROVIDER_LEGAL_NAME;
export const ProviderLogoUrl = (await env).REACT_APP_PROVIDER_LOGO_URL;
export const ProviderImprintUrl = (await env).REACT_APP_PROVIDER_IMPRINT_URL;
