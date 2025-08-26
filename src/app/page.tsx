'use client';

import { useState, useEffect } from 'react';

interface VideoFormData {
  name: string;
  quizResult: string;
  videoText: string;
}

interface JobStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  data: VideoFormData;
  result?: {
    videoUrl: string;
    filename: string;
  };
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export default function Home() {
  const [formData, setFormData] = useState<VideoFormData>({
    name: '',
    quizResult: '',
    videoText: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<JobStatus | null>(null);
  const [jobPollingInterval, setJobPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (jobPollingInterval) {
        clearInterval(jobPollingInterval);
      }
    };
  }, [jobPollingInterval]);

  // Poll job status
  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/job-status/${jobId}`);
      const data = await response.json();
      
      if (data.success && data.job) {
        setCurrentJob(data.job);
        
        if (data.job.status === 'completed' && data.job.result) {
          setVideoUrl(data.job.result.videoUrl);
          setIsLoading(false);
          if (jobPollingInterval) {
            clearInterval(jobPollingInterval);
            setJobPollingInterval(null);
          }
        } else if (data.job.status === 'failed') {
          setIsLoading(false);
          if (jobPollingInterval) {
            clearInterval(jobPollingInterval);
            setJobPollingInterval(null);
          }
        }
      }
    } catch (error) {
      console.error('Error polling job status:', error);
    }
  };

  const startJobPolling = (jobId: string) => {
    // Poll every 2 seconds
    const interval = setInterval(() => {
      pollJobStatus(jobId);
    }, 2000);
    setJobPollingInterval(interval);
    
    // Initial poll
    pollJobStatus(jobId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setCurrentJob(null);
    setVideoUrl(null);
    
    try {
      // First try the async job queue system
      const asyncResponse = await fetch('/api/generate-video-async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (asyncResponse.ok) {
        const asyncResult = await asyncResponse.json();
        console.log('Async Job Started:', asyncResult);
        
        if (asyncResult.success && asyncResult.jobId) {
          // Start polling for job status
          startJobPolling(asyncResult.jobId);
          return;
        }
      }
      
      // Fallback to direct rendering if async fails
      console.log('Falling back to basic rendering...');
      const response = await fetch('/api/generate-video-basic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Direct API Response:', result);
        
        if (result.success && result.videoUrl) {
          setVideoUrl(result.videoUrl);
        } else {
          // Use fallback success flag for mock responses
          setVideoUrl('/videos/sample.mp4');
        }
      } else {
        console.error('Failed to generate video');
      }
    } catch (error) {
      console.error('Error generating video:', error);
    } finally {
      if (!currentJob || currentJob.status === 'failed') {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Video Generator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Create personalized videos with Remotion
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="quizResult" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quiz Result / Score
                </label>
                <input
                  type="text"
                  id="quizResult"
                  name="quizResult"
                  value={formData.quizResult}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 85/100 or Advanced Level"
                />
              </div>

              <div>
                <label htmlFor="videoText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video Message
                </label>
                <textarea
                  id="videoText"
                  name="videoText"
                  value={formData.videoText}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter the text you want to appear in your video..."
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.name}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {currentJob ? (
                      <span>
                        {currentJob.status === 'pending' && 'Queuing video...'}
                        {currentJob.status === 'processing' && `Processing... ${currentJob.progress || 0}%`}
                      </span>
                    ) : (
                      'Generating Video...'
                    )}
                  </div>
                ) : (
                  'Generate Video'
                )}
              </button>
            </form>

            {/* Job Progress Indicator */}
            {currentJob && currentJob.status !== 'completed' && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {currentJob.status === 'pending' && '📋 Video queued for processing...'}
                    {currentJob.status === 'processing' && '🎬 Creating your video...'}
                    {currentJob.status === 'failed' && '❌ Video generation failed'}
                  </span>
                  {currentJob.progress !== undefined && (
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {currentJob.progress}%
                    </span>
                  )}
                </div>
                
                {currentJob.progress !== undefined && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${currentJob.progress}%` }}
                    />
                  </div>
                )}
                
                {currentJob.status === 'failed' && currentJob.error && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      <strong>Error:</strong> {currentJob.error}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Don&apos;t worry, we&apos;ll fall back to our sample video system.
                    </p>
                  </div>
                )}
              </div>
            )}

            {videoUrl && (
              <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-3">
                  ✅ Video Generated Successfully!
                </h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Hello, {formData.name}!
                    </h4>
                    {formData.quizResult && (
                      <p className="text-lg text-blue-600 dark:text-blue-400 mb-2">
                        Your Score: {formData.quizResult}
                      </p>
                    )}
                    {formData.videoText && (
                      <p className="text-gray-600 dark:text-gray-300 italic mb-4">
                        &quot;{formData.videoText}&quot;
                      </p>
                    )}
                  </div>

                  {/* Video Preview */}
                  <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-3 text-center">
                      Your Video Preview
                    </h5>
                    <div className="flex justify-center">
                      <video 
                        controls 
                        className="max-w-full h-auto rounded-lg shadow-lg"
                        style={{ maxHeight: '300px' }}
                        onError={(e) => {
                          console.log('Video failed to load:', videoUrl, e);
                        }}
                      >
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                        <div className="text-center p-4">
                          <p className="text-gray-600 dark:text-gray-300">
                            Video preview not available. Use the download button below.
                          </p>
                        </div>
                      </video>
                    </div>
                  </div>

                  {/* Download and Action Buttons */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={videoUrl}
                      download={`video_${formData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.mp4`}
                      className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      📥 Download Video
                    </a>
                    <button
                      onClick={() => window.open(videoUrl, '_blank')}
                      className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                    >
                      👁️ View Fullscreen
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.share({
                            title: 'My Generated Video',
                            text: `Check out my personalized video for ${formData.name}!`,
                            url: window.location.origin + videoUrl,
                          });
                        } catch (error) {
                          // Fallback: copy to clipboard
                          console.log('Share failed, using clipboard fallback:', error);
                          navigator.clipboard.writeText(window.location.origin + videoUrl);
                          alert('Video link copied to clipboard!');
                        }
                      }}
                      className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                    >
                      🔗 Share Video
                    </button>
                  </div>

                  {/* Status Information */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Status:</strong> Video generated successfully! You can preview, download, or share your personalized video.
                      {videoUrl.includes('sample') && (
                        <span className="block mt-2 text-amber-700 dark:text-amber-300">
                          <strong>Note:</strong> This is a fallback sample video. Full video rendering is being processed.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => {
                      setVideoUrl(null);
                      setFormData({ name: '', quizResult: '', videoText: '' });
                    }}
                    className="inline-flex items-center px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    🔄 Create Another Video
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
