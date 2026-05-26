// NOTE: From pnpm v11, this can be an .mjs file!

function readPackage(pkg, ctx) {
  if (pkg.name === "components-care" && pkg.dependencies?.xlsx) {
    delete pkg.dependencies.xlsx;
    // eslint-disable-next-line @stylistic/max-len
    ctx.log(
      `[.pnpmfile.cjs] We remove the components-care > xlsx dependency to prevent installation failure, caused by xlsx being an "exotic" subdependency. Instead we install a newer version of xlsx directly ourselves.`,
    );
  }

  if (pkg.name === "xlsx") {
    ctx.log(
      `[.pnpmfile.cjs] xlsx is installed via a non-npm CDN that does not report available updates. Regularly check https://cdn.sheetjs.com for the latest version of xlsx and update manually.`,
    );
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
