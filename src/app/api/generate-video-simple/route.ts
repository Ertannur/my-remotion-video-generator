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

    console.log('Video generation requested for:', { name, quizResult, videoText });

    // For now, let's create a mock video response to test the frontend
    // We'll implement the actual Remotion rendering in a separate process
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'public', 'videos');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Generate a sample MP4 URL (we'll create actual videos later)
    const timestamp = Date.now();
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `video_${sanitizedName}_${timestamp}.mp4`;
    
    // Return a sample video URL for now
    const videoUrl = `/videos/sample.mp4`;
    
    console.log('Mock video generated:', { filename, videoUrl });
    
    return NextResponse.json({ 
      success: true, 
      videoUrl,
      message: `Video request processed for ${name}!`,
      note: 'This is a mock response while we resolve the bundling issues. The form data was received successfully.',
      data: { name, quizResult, videoText, filename }
    });

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
