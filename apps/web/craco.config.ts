import webpack from "webpack";
import path from "path";
import { realpathSync } from "node:fs";
import ESLintWebpackPlugin from "eslint-webpack-plugin";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

const appDirectory = realpathSync(process.cwd());
const resolveApp = (relativePath: string) =>
  path.resolve(appDirectory, relativePath);

export default {
  devServer: {
    port: 6006,
  },
  plugins: [
    {
      plugin: require("craco-babel-loader"),
      options: {
        includes: [
          resolveApp("../../packages/algocore"),
          resolveApp("../../packages/theme"),
          resolveApp("../../packages/utils"),
          resolveApp("../../packages/ui"),
        ],
      },
    },
  ],
  webpack: {
    configure: (webpackConfig: any, { env, paths }: any) => {
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new MonacoWebpackPlugin(),
        new ESLintWebpackPlugin({
          extensions: ["ts", "tsx", "js", "jsx"],
          exclude: ["node_modules"],
          eslintPath: require.resolve("eslint"),
          context: ".",
          cache: true,
        }),
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        }),
        new webpack.DefinePlugin({
          "process.env.APP_VERSION": JSON.stringify(
            process.env.npm_package_version,
          ),
        }),
      ];
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          ...webpackConfig.resolve.fallback,
          stream: require.resolve("stream"),
          buffer: require.resolve("buffer"),
          path: require.resolve("path-browserify"),
          crypto: require.resolve("crypto-browserify"),
          process: require.resolve("process/browser"),
          url: require.resolve("url"),
          perf_hooks: false,
          fs: false,
        },
      };
      paths.appBuild = webpackConfig.output.path = path.resolve("dist");
      return webpackConfig;
    },
  },
};
