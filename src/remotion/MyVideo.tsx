import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export interface VideoProps {
  name?: string;
  quizResult?: string;
  videoText?: string;
}

// Helper function to create particle animations
const Particle = ({ delay, x, y }: { delay: number, x: number, y: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const opacity = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 }
  });
  
  const scale = interpolate(opacity, [0, 1], [0, 1]);
  const rotation = interpolate(frame, [0, 300], [0, 360]);
  
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 20,
        height: 20,
        backgroundColor: '#FFD700',
        borderRadius: '50%',
        opacity: opacity * 0.7,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
      }}
    />
  );
};

// Animated Chart Component
const ScoreChart = ({ score, delay }: { score: string, delay: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Extract numeric score (assuming format like "85/100" or "85%")
  const numericScore = parseInt(score.match(/\d+/)?.[0] || "0");
  const maxScore = score.includes('/') ? parseInt(score.split('/')[1]) || 100 : 100;
  const percentage = (numericScore / maxScore) * 100;
  
  const chartProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 }
  });
  
  const barHeight = interpolate(chartProgress, [0, 1], [0, percentage * 2]);
  
  return (
    <div style={{
      width: 200,
      height: 200,
      position: 'relative',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 20,
      padding: 20,
      margin: '20px auto'
    }}>
      <div style={{
        fontSize: 18,
        marginBottom: 15,
        textAlign: 'center',
        color: '#FFD700'
      }}>
        Your Performance
      </div>
      <div style={{
        width: '100%',
        height: barHeight,
        backgroundColor: `linear-gradient(to top, #00FF88, #00DDFF)`,
        borderRadius: 5,
        transition: 'height 0.5s ease',
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20
      }} />
      <div style={{
        position: 'absolute',
        bottom: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        zIndex: 1
      }}>
        {numericScore}
      </div>
    </div>
  );
};

export const MyVideo: React.FC<VideoProps> = ({ 
  name = "User", 
  quizResult, 
  videoText 
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // Enhanced spring animations with better timing
  const titleAnimation = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 200 }
  });
  
  const nameAnimation = spring({
    frame: frame - 30,
    fps,
    config: { damping: 150 }
  });
  
  const contentAnimation = spring({
    frame: frame - 60,
    fps,
    config: { damping: 200 }
  });
  
  const finalAnimation = spring({
    frame: frame - 120,
    fps,
    config: { damping: 200 }
  });

  // Advanced animations
  const titleScale = interpolate(titleAnimation, [0, 1], [0.5, 1]);
  const titleY = interpolate(titleAnimation, [0, 1], [-100, 0]);
  
  const nameScale = interpolate(nameAnimation, [0, 1], [0.8, 1]);
  const nameRotation = interpolate(nameAnimation, [0, 1], [-10, 0]);
  
  // Background gradient animation
  const gradientRotation = interpolate(frame, [0, 300], [0, 360]);
  
  // Generate particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: 90 + i * 5,
    x: Math.random() * width,
    y: Math.random() * height
  }));

  return (
    <AbsoluteFill>
      {/* Animated Background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${gradientRotation}deg, #667eea 0%, #764ba2 50%, #f093fb 100%)`,
          opacity: 0.9
        }}
      />
      
      {/* Particles */}
      {particles.map(particle => (
        <Particle
          key={particle.id}
          delay={particle.delay}
          x={particle.x}
          y={particle.y}
        />
      ))}
      
      {/* Main Content */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          color: "white",
          padding: 60,
          textAlign: "center"
        }}
      >
        <div style={{ maxWidth: "90%" }}>
          {/* Animated Title with 3D effect */}
          <h1 
            style={{ 
              fontSize: 80, 
              fontWeight: "bold",
              transform: `translateY(${titleY}px) scale(${titleScale})`,
              textShadow: '4px 4px 8px rgba(0, 0, 0, 0.3)',
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 40,
              opacity: titleAnimation
            }}
          >
            🎉 Congratulations! 🎉
          </h1>
          
          {/* Animated Name with enhanced effects */}
          <h2 
            style={{ 
              fontSize: 64, 
              marginBottom: 40,
              transform: `scale(${nameScale}) rotate(${nameRotation}deg)`,
              color: "#FFD700",
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              opacity: nameAnimation,
              fontWeight: 600
            }}
          >
            {name}!
          </h2>
          
          {/* Enhanced Quiz Result with Chart */}
          {quizResult && (
            <div style={{ opacity: contentAnimation }}>
              <ScoreChart score={quizResult} delay={60} />
              <div 
                style={{ 
                  fontSize: 42, 
                  marginBottom: 30,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  padding: '15px 30px',
                  borderRadius: 15,
                  border: '2px solid rgba(255, 215, 0, 0.5)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
              >
                <span style={{ fontSize: 30 }}>🏆</span> Your Score: <strong>{quizResult}</strong>
              </div>
            </div>
          )}
          
          {/* Enhanced Message with typewriter effect */}
          {videoText && (
            <div style={{ opacity: finalAnimation }}>
              <div style={{
                fontSize: 32,
                lineHeight: 1.6,
                fontStyle: "italic",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: '20px 40px',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(5px)',
                maxWidth: '80%',
                margin: '0 auto'
              }}>
                <div style={{ marginBottom: 10, fontSize: 24 }}>💭</div>
                &quot;{videoText}&quot;
              </div>
            </div>
          )}
          
          {/* Final celebration elements */}
          <div 
            style={{
              opacity: finalAnimation,
              marginTop: 40,
              fontSize: 48
            }}
          >
            ⭐ 🌟 ⭐ 🌟 ⭐
          </div>
        </div>
      </AbsoluteFill>
      
      {/* Overlay effects */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.1) 100%)',
          pointerEvents: 'none'
        }}
      />
    </AbsoluteFill>
  );
};