const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Stub native-only modules for web bundling
config.resolver.resolveRequest = (context, moduleName, platform) => {
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
