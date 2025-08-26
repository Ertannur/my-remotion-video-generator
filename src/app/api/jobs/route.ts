import { NextResponse } from 'next/server';
import { jobQueue } from '../../../lib/job-queue';

export async function GET() {
  try {
    const jobs = jobQueue.getAllJobs();

    return NextResponse.json({
      success: true,
      jobs: jobs.map(job => ({
        id: job.id,
        status: job.status,
        progress: job.progress,
        data: job.data,
        result: job.result,
        error: job.error,
        createdAt: job.createdAt,
        completedAt: job.completedAt
      }))
    });

  } catch (error) {
    console.error('Error fetching all jobs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch jobs', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
