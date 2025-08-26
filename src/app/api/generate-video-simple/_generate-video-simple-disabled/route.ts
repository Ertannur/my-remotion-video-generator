import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';

interface VideoFormData {
  name: string;
  quizResult: string;
  videoText: string;
}

interface VideoProps {
  name: string;
  quizResult: string;
  videoText: string;
  [key: string]: unknown;
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

    console.log('Video generation requested for:', { name, quizResult, videoText });

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'public', 'videos');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `video_${sanitizedName}_${timestamp}.mp4`;
    const outputPath = path.join(outputDir, filename);

    try {
      // Bundle the Remotion project
      const { bundle } = await import('@remotion/bundler');
      const { renderMedia, selectComposition } = await import('@remotion/renderer');
      const { webpackOverride } = await import('../../../remotion/webpack-override');
      
      const bundleLocation = await bundle({
        entryPoint: path.resolve('./src/remotion/index.ts'),
        webpackOverride,
      });

      // Get the composition
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'MyVideo',
        inputProps: {
          name,
          quizResult,
          videoText,
        } as VideoProps,
      });

      // Render the video
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps: {
          name,
          quizResult,
          videoText,
        } as VideoProps,
      });

      const videoUrl = `/videos/${filename}`;
      
      console.log('Video rendered successfully:', { filename, videoUrl });
      
      return NextResponse.json({ 
        success: true, 
        videoUrl,
        message: `Video generated successfully for ${name}!`,
        data: { name, quizResult, videoText, filename }
      });

    } catch (renderError) {
      console.error('Video rendering failed:', renderError);
      
      // Fall back to mock response if rendering fails
      const videoUrl = `/videos/sample.mp4`;
      
      return NextResponse.json({ 
        success: true, 
        videoUrl,
        message: `Video request processed for ${name}! (Fallback mode)`,
        note: 'Video rendering failed, showing sample video. Check server logs for details.',
        error: renderError instanceof Error ? renderError.message : 'Unknown rendering error',
        data: { name, quizResult, videoText, filename }
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process video request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Video generation API is running',
    status: 'operational',
    endpoints: {
      POST: '/api/generate-video - Generate a new video with form data',
      note: 'Currently in development mode'
    }
  });
}
