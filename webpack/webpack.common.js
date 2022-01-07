/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	plugins: [
		new CopyPlugin({
			patterns: [{ from: "static" }],
		}),
	],
	entry: {
		backgroundPage: path.join(__dirname, "..", "src/backgroundPage.ts"),
		popup: path.join(__dirname, "..", "src/popup/index.tsx"),
	},
	output: {
		path: path.join(__dirname, "..", "dist"),
		filename: "js/[name].js",
	},
	module: {
		rules: [
			{
				exclude: /node_modules/,
				test: /\.tsx?$/,
				use: "ts-loader",
			},
			{
				test: /\app.css$/,
				use: ["style-loader", "css-loader", "postcss-loader"],
			},
			{
				test: /\.module.css$/,
				use: [
					"style-loader",
					{
						loader: "css-loader",
						options: {
							modules: true,
						},
					},
					"postcss-loader",
				],
			},
		],
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"],
		alias: {
			"@src": path.resolve(__dirname, "..", "src/"),
			"@components": path.resolve(__dirname, "..", "src/components/"),
		},
	},
};
