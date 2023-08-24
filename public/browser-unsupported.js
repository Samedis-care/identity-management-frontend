function handleIncompatibleBrowser() {
  var lang = window.navigator.language;
  var separator = lang.indexOf("-");
  lang = lang.substring(0, separator);
  if (lang !== "de") {
    // if not supported lang
    lang = "en";
  }
  window.location.href = "/browser-unsupported." + lang + ".html";
}

if (typeof Promise == "undefined" || typeof Object.fromEntries == "undefined") {
  handleIncompatibleBrowser();
}

window.onerror = function (message) {
  if (
    message === "Syntax error" ||
    (typeof message === "string" &&
      message.indexOf("Object doesn't support property or method") === 0)
  ) {
    handleIncompatibleBrowser();
  }
};
