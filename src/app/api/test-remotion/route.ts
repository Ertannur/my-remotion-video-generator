import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic Remotion imports
    const { bundle } = await import("@remotion/bundler");
    const { renderMedia, selectComposition } = await import("@remotion/renderer");
    
    return NextResponse.json({ 
      success: true,
      message: 'Remotion packages loaded successfully',
      packages: {
        bundler: typeof bundle,
        renderer: typeof renderMedia,
        selector: typeof selectComposition
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to load Remotion packages'
    }, { status: 500 });
  }
}
