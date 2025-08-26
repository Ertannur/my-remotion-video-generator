import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';

interface VideoFormData {
  name: string;
  quizResult: string;
  videoText: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VideoFormData = await request.json();
    const { name, quizResult, videoText } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'public', 'videos');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    console.log('Starting video generation for:', { name, quizResult, videoText });

    try {
      // Dynamic imports to avoid bundling issues
      const { bundle } = await import("@remotion/bundler");
      const { renderMedia, selectComposition } = await import("@remotion/renderer");

      // Path to the Remotion entry file
      const entry = path.join(process.cwd(), "src", "remotion", "index.ts");
      
      console.log('Bundling Remotion project...');
      // Bundle the Remotion project
      const bundleLocation = await bundle({
        entryPoint: entry,
        webpackOverride: (config) => {
          // Optimize webpack config for better compatibility
          config.resolve = config.resolve || {};
          config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
            crypto: false,
            buffer: false,
            stream: false,
            util: false,
            os: false,
            assert: false,
            constants: false,
          };

          // Ignore TypeScript declaration files and binaries
          config.module = config.module || {};
          config.module.rules = config.module.rules || [];
          
          config.module.rules.push({
            test: /\.d\.ts$/,
            use: 'ignore-loader',
          });

          config.module.rules.push({
            test: /\.(exe|node|wasm|bin)$/,
            type: 'asset/resource',
          });

          // Handle externals more safely
          if (Array.isArray(config.externals)) {
            config.externals.push('esbuild', 'playwright', 'canvas');
          } else if (config.externals) {
            config.externals = [config.externals, 'esbuild', 'playwright', 'canvas'];
          } else {
            config.externals = ['esbuild', 'playwright', 'canvas'];
          }

          return config;
        },
      });

      console.log('Getting composition info...');
      // Get the composition
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: "MyVideo",
        inputProps: { name, quizResult, videoText },
      });

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
      const outputLocation = path.join(outputDir, `video_${sanitizedName}_${timestamp}.mp4`);

      console.log('Rendering video...');
      // Render the video
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation,
        inputProps: { name, quizResult, videoText },
      });

      // Return the URL to access the generated video
      const videoUrl = `/videos/${path.basename(outputLocation)}`;
      
      console.log('Video generated successfully:', videoUrl);
      
      return NextResponse.json({ 
        success: true, 
        videoUrl,
        message: `Video generated successfully for ${name}!` 
      });

    } catch (renderError) {
      console.error('Remotion rendering error:', renderError);
      
      return NextResponse.json(
        { 
          error: 'Failed to render video', 
          details: renderError instanceof Error ? renderError.message : 'Unknown rendering error',
          suggestion: 'Make sure Remotion is properly configured and all dependencies are installed.'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Video generation API is running',
    endpoints: {
      POST: '/api/generate-video - Generate a new video with form data'
    }
  });
}
