import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Add comprehensive rules to handle all problematic file types
    config.module.rules.push(
      {
        test: /\.d\.ts$/,
        use: 'ignore-loader',
      },
      {
        test: /\.(md|txt|wasm|bin|exe|node)$/,
        type: 'asset/resource',
      },
      {
        test: /package\.json$/,
        type: 'asset/resource',
      }
    );

    // Ignore specific directories that cause issues
    config.module.rules.push({
      test: /node_modules[\/\\]@?esbuild/,
      use: 'ignore-loader',
    });

    // For server-side, externalize problematic packages
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push(
          'esbuild',
          '@esbuild/darwin-arm64',
          '@esbuild/darwin-x64', 
          '@esbuild/linux-x64',
          '@esbuild/win32-x64',
          'canvas',
          'playwright',
          'puppeteer',
          'chrome-aws-lambda',
        );
      }
    }

    // Browser fallbacks
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      buffer: false,
      os: false,
      util: false,
      url: false,
      assert: false,
      constants: false,
      timers: false,
      child_process: false,
      net: false,
      tls: false,
      zlib: false,
      http: false,
      https: false,
      vm: false,
      worker_threads: false,
      perf_hooks: false,
      async_hooks: false,
    };

    // Aggressive alias to prevent esbuild from being included
    config.resolve.alias = {
      ...config.resolve.alias,
      'esbuild': false,
      '@esbuild/darwin-arm64': false,
      '@esbuild/darwin-x64': false,
      '@esbuild/linux-x64': false,
      '@esbuild/win32-x64': false,
    };

    return config;
  },
};

export default nextConfig;
