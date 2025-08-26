# Creating simple test video to check duration

duration_frames=300
fps=30
duration_seconds=$(( duration_frames / fps ))

echo "Video should be ${duration_seconds} seconds long"
echo "Duration in frames: ${duration_frames}"
echo "FPS: ${fps}"
