module.exports = {
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  external: [
    'react-native',
    'react-native-fs',
    'react-native-audio-recorder-player',
    'react-native-permissions',
    'openai',
    'react-native-base64',
    'uuid'
  ],
  noExternal: [],
  clean: true,
  sourcemap: true,
}; 