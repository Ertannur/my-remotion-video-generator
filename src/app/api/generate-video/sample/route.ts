import { NextResponse } from 'next/server';

export async function GET() {
  // This creates a simple sample video response
  // In a real app, this would serve an actual video file
  
  const sampleVideoData = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f0f0f0"/>
      <text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="20" fill="#333">
        Sample Video Placeholder
      </text>
      <text x="200" y="180" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
        Your Remotion video will appear here
      </text>
    </svg>
  `;

  return new NextResponse(sampleVideoData, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}
