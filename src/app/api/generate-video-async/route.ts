import { NextRequest, NextResponse } from 'next/server';
import { jobQueue } from '../../../lib/job-queue';

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

    console.log('Video generation job requested for:', { name, quizResult, videoText });

    // Add job to queue
    const jobId = jobQueue.addJob({ name, quizResult, videoText });

    return NextResponse.json({ 
      success: true, 
      jobId,
      message: `Video generation started for ${name}!`,
      statusUrl: `/api/job-status/${jobId}`,
      note: 'Video is being processed. Check the status using the provided URL.'
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
