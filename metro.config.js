const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

const config = getDefaultConfig(__dirname);

// @clerk/shared is nested inside @clerk/clerk-expo/node_modules — expose it to Metro
const clerkSharedRoot = path.resolve(
  __dirname,
  "node_modules/@clerk/clerk-expo/node_modules/@clerk/shared"
);
const clerkReactRoot = path.resolve(__dirname, "node_modules/@clerk/clerk-react");

config.watchFolders = [
  path.resolve(__dirname, "node_modules/@clerk/clerk-expo/node_modules"),
  path.resolve(__dirname, "node_modules/@clerk/clerk-react/node_modules"),
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Resolve @clerk/shared and its subpaths from the nested location
  if (moduleName === "@clerk/shared") {
    return { filePath: path.join(clerkSharedRoot, "dist", "runtime", "index.js"), type: "sourceFile" };
  }
  if (moduleName.startsWith("@clerk/shared/")) {
    const subpath = moduleName.slice("@clerk/shared/".length);
    // Try subpath directory with package.json main first
    const subpathDir = path.join(clerkSharedRoot, subpath);
    const subpathPkg = path.join(subpathDir, "package.json");
    if (fs.existsSync(subpathPkg)) {
      const pkg = JSON.parse(fs.readFileSync(subpathPkg, "utf8"));
      const main = pkg.main || pkg.module || "index.js";
      const filePath = path.resolve(subpathDir, main);
      if (fs.existsSync(filePath)) return { filePath, type: "sourceFile" };
    }
    // Fallback: dist/runtime/<subpath>.js
    const fallback = path.join(clerkSharedRoot, "dist", "runtime", `${subpath}.js`);
    if (fs.existsSync(fallback)) return { filePath: fallback, type: "sourceFile" };
  }

  // Resolve @clerk/clerk-react subpaths (internal, errors, experimental)
  if (moduleName.startsWith("@clerk/clerk-react/")) {
    const subpath = moduleName.slice("@clerk/clerk-react/".length);
    const filePath = path.join(clerkReactRoot, "dist", `${subpath}.js`);
    if (fs.existsSync(filePath)) return { filePath, type: "sourceFile" };
  }

  // Stub native-only modules for web bundling
  if (platform === "web") {
    const nativeOnlyModules = [
      "react-native-maps",
      "react-native-maps-directions",
      "@stripe/stripe-react-native",
      "expo-local-authentication",
      "expo-auth-session",
    ];
    if (nativeOnlyModules.some((m) => moduleName.startsWith(m))) {
      return { type: "empty" };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
