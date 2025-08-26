// Simple in-memory job queue for video rendering
// In production, use Redis or a proper queue system like Bull Queue

export interface VideoJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: {
    name: string;
    quizResult: string;
    videoText: string;
  };
  result?: {
    videoUrl: string;
    filename: string;
  };
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  progress?: number;
}

class JobQueue {
  private jobs: Map<string, VideoJob> = new Map();
  private queue: string[] = [];
  private processing: boolean = false;

  // Add a new job to the queue
  addJob(data: VideoJob['data']): string {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: VideoJob = {
      id: jobId,
      status: 'pending',
      data,
      createdAt: new Date(),
      progress: 0
    };

    this.jobs.set(jobId, job);
    this.queue.push(jobId);
    
    // Start processing if not already processing
    if (!this.processing) {
      this.processQueue();
    }

    return jobId;
  }

  // Get job status
  getJob(jobId: string): VideoJob | undefined {
    return this.jobs.get(jobId);
  }

  // Get all jobs (for admin/debugging)
  getAllJobs(): VideoJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Process the queue
  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const jobId = this.queue.shift();
      if (!jobId) continue;

      const job = this.jobs.get(jobId);
      if (!job) continue;

      try {
        await this.processJob(job);
      } catch (error) {
        console.error('Job processing error:', error);
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        job.completedAt = new Date();
        this.jobs.set(jobId, job);
      }
    }

    this.processing = false;
  }

  // Process individual job
  private async processJob(job: VideoJob) {
    try {
      // Update job status
      job.status = 'processing';
      job.progress = 10;
      this.jobs.set(job.id, job);

      // For deployment compatibility, skip actual video rendering
      console.log('Simulating video rendering for deployment...');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update progress
      job.progress = 50;
      this.jobs.set(job.id, job);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      job.progress = 80;
      this.jobs.set(job.id, job);
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Complete with fallback sample video
      job.status = 'completed';
      job.progress = 100;
      job.result = {
        videoUrl: '/videos/sample.mp4',
        filename: 'sample.mp4'
      };
      job.completedAt = new Date();
      this.jobs.set(job.id, job);

      console.log('Video job completed (sample mode):', job.id);

    } catch (error) {
      throw error; // Re-throw to be handled by processQueue
    }
  }

  // Clean up old jobs (optional, for memory management)
  cleanOldJobs(maxAge: number = 24 * 60 * 60 * 1000) { // 24 hours default
    const cutoffTime = new Date(Date.now() - maxAge);
    
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.createdAt < cutoffTime && (job.status === 'completed' || job.status === 'failed')) {
        this.jobs.delete(jobId);
      }
    }
  }
}

// Export singleton instance
export const jobQueue = new JobQueue();

// Clean up old jobs every hour
if (typeof window === 'undefined') { // Only run on server
  setInterval(() => {
    jobQueue.cleanOldJobs();
  }, 60 * 60 * 1000); // 1 hour
}
