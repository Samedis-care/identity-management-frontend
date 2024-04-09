const { resolve } = require("path");
const { existsSync, readFileSync } = require("fs");
const { createHash } = require("crypto");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

const dotEnv = () => {
  const path = resolve(__dirname, ".env");
  if (!existsSync(path)) return {};
  try {
    const data = readFileSync(path).toString();
    return Object.fromEntries(
      data.split("\n").map((line) => line.split("=", 2)),
    );
  } catch (e) {
    console.error(e);
    return {};
  }
};

module.exports = (env, argv) => {
  const mode = argv.mode ?? "production";
  const isDev = mode === "development";
  const isProd = mode === "production";
  env = {
    ...dotEnv(),
    ...process.env,
    NODE_ENV: isDev ? "development" : "production",
  };
  const appEnv = Object.fromEntries(
    Object.entries(env).filter(
      ([key]) => key === "NODE_ENV" || key.startsWith("REACT_APP_"),
    ),
  );

  return {
    mode: mode,
    entry: "./src/index.tsx",
    devtool: mode === "production" ? "source-map" : "cheap-module-source-map",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: isDev,
                compilerOptions: {
                  noEmit: false,
                },
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(svg|png)$/,
          type: "asset",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        template: resolve(__dirname, "public", "index.html"),
        ...(isProd
          ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              },
            }
          : undefined),
      }),
      new CopyPlugin({
        patterns: [
          {
            from: "public",
            to: ".",
            filter: (name) => {
              return !/\/public\/index.html$/.test(name);
            },
          },
        ],
      }),
      new webpack.DefinePlugin({
        "process.env": {
          ...Object.fromEntries(
            Object.entries(appEnv).map(([key, value]) => [
              key,
              JSON.stringify(value),
            ]),
          ),
        },
      }),
    ],
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".mjs"],
      symlinks: false,
      fallback: {
        crypto: false,
      },
    },
    optimization: {
      runtimeChunk: isDev,
      removeAvailableModules: !isDev,
      removeEmptyChunks: !isDev,
      splitChunks: isDev ? false : undefined,
    },
    cache: {
      type: "filesystem",
      version: (() => {
        const hash = createHash("md5");
        hash.update(JSON.stringify(appEnv));
        return hash.digest("hex");
      })(),
      cacheDirectory: resolve(__dirname, "node_modules", ".cache"),
      store: "pack",
      buildDependencies: {
        defaultWebpack: ["webpack/lib/"],
        config: [__filename],
        tsconfig: [resolve(__dirname, "tsconfig.json")],
      },
    },
    devServer: {
      proxy: env.BACKEND_PROXY
        ? [
            {
              context: ["/api", "/api-docs"],
              ...JSON.parse(env.BACKEND_PROXY),
            },
          ]
        : undefined,
      historyApiFallback: true,
      devMiddleware: {
        writeToDisk: true,
      },
      client: {
        overlay: {
          errors: true,
          warnings: true,
          runtimeErrors: false,
        },
      },
    },
    output: {
      clean: true,
      path: resolve(__dirname, "build"),
      publicPath: "/",
      pathinfo: false,
      filename: isDev
        ? "static/js/[name].bundle.js"
        : "static/js/[name].[contenthash:8].bundle.js",
      chunkFilename: isDev
        ? "static/js/[name].chunk.js"
        : "static/js/[name].[contenthash:8].chunk.js",
      assetModuleFilename: "static/media/[hash][ext][query]",
    },
  };
};
