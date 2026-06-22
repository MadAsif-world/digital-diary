module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Reanimated 4 ships its Babel plugin via react-native-worklets, and
    // babel-preset-expo wires it automatically — no manual plugin entry needed.
  };
};
