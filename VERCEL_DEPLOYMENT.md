# Vercel Configuration for Remotion Video Generator

This configuration is optimized for deploying the Remotion Video Generator to Vercel.

## Important Notes:

1. **Video Rendering Limitations**: Vercel has a 10-second timeout for serverless functions, which may not be sufficient for video rendering. The app includes:
   - Async job queue system for background processing
   - Fallback to sample videos when rendering fails
   - Progress indicators for user experience

2. **Dependencies**: The app uses:
   - `@remotion/bundler` and `@remotion/renderer` for video generation
   - Custom webpack configuration to handle bundling issues
   - In-memory job queue (upgrade to Redis for production)

3. **File Storage**: Currently uses `/public/videos` for storing generated videos. For production, consider:
   - AWS S3 or other cloud storage
   - CDN for video delivery
   - Database for job persistence

## Deployment Commands:

```bash
npm run build
vercel --prod
```

## Environment Variables (if needed):
- None required for basic functionality
- Add Redis URL for persistent job queue
- Add cloud storage credentials for production

## Performance Considerations:
- Video rendering is CPU/memory intensive
- Consider using dedicated video rendering services for scale
- Monitor Vercel function execution times and memory usage
