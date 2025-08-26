'use client';

import { useState } from 'react';

interface VideoFormData {
  name: string;
  quizResult: string;
  videoText: string;
}

export default function Home() {
  const [formData, setFormData] = useState<VideoFormData>({
    name: '',
    quizResult: '',
    videoText: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

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
    
    try {
      const response = await fetch('/api/generate-video-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        
        // For now, we'll show a success message instead of trying to display the video
        // since we're working around the bundling issues
        setVideoUrl('success'); // Use a flag instead of actual video URL
      } else {
        console.error('Failed to generate video');
      }
    } catch (error) {
      console.error('Error generating video:', error);
    } finally {
      setIsLoading(false);
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
                    Generating Video...
                  </div>
                ) : (
                  'Generate Video'
                )}
              </button>
            </form>

            {videoUrl && (
              <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-3">
                  ✅ Request Processed Successfully!
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
                      <p className="text-gray-600 dark:text-gray-300 italic">
                        &quot;{formData.videoText}&quot;
                      </p>
                    )}
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Status:</strong> Your video generation request has been received and processed successfully! 
                      The frontend and API are working correctly. The actual video generation will be implemented once 
                      the bundling issues with Remotion are resolved.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setVideoUrl(null)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    🔄 Generate Another Video
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
