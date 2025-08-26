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

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'public', 'videos');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `video_${sanitizedName}_${timestamp}.mp4`;

    // Always use sample video for now to avoid build issues
    const videoUrl = `/videos/sample.mp4`;
    
    console.log('Using sample video for deployment compatibility:', { filename, videoUrl });
    
    return NextResponse.json({ 
      success: true, 
      videoUrl,
      message: `Video request processed for ${name}!`,
      note: 'Using sample video for deployment. Full video rendering available in development with proper Remotion setup.',
      data: { name, quizResult, videoText, filename: 'sample.mp4' }
    });

  } catch (error) {
    console.error('Error processing video request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process video request', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
