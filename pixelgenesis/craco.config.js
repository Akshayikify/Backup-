module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find and modify source-map-loader rules to ignore Firebase modules
      if (webpackConfig.module && webpackConfig.module.rules) {
        webpackConfig.module.rules.forEach((rule) => {
          if (rule.enforce === 'pre' && rule.use) {
            const hasSourceMapLoader = rule.use.some(
              (use) => use.loader && use.loader.includes('source-map-loader')
            );
            if (hasSourceMapLoader) {
              // Exclude Firebase modules from source-map-loader
              rule.exclude = rule.exclude
                ? [rule.exclude, /node_modules\/firebase/]
                : /node_modules\/firebase/;
            }
          } else if (rule.enforce === 'pre' && rule.loader && rule.loader.includes('source-map-loader')) {
            // Handle single loader format
            rule.exclude = rule.exclude
              ? [rule.exclude, /node_modules\/firebase/]
              : /node_modules\/firebase/;
          }
        });
      }

      return webpackConfig;
    },
  },
};

