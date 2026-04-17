declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "@fontsource/roboto" {
  // side-effect only CSS import
}
