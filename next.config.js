// next.config.js
const withPreact = require("next-plugin-preact");

module.exports = withPreact({
  /* regular next.js config options here */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
});
