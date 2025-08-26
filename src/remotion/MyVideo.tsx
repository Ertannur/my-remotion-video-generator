import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export interface VideoProps {
  name?: string;
  quizResult?: string;
  videoText?: string;
}

export const MyVideo: React.FC<VideoProps> = ({ 
  name = "User", 
  quizResult, 
  videoText 
}) => {
  const frame = useCurrentFrame();
  
  // Fade in animation
  const titleOpacity = interpolate(frame, [0, 30], [0, 1]);
  const nameOpacity = interpolate(frame, [30, 60], [0, 1]);
  const quizOpacity = interpolate(frame, [60, 90], [0, 1]);
  const messageOpacity = interpolate(frame, [90, 120], [0, 1]);

  return (
    <AbsoluteFill 
      style={{ 
        backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        justifyContent: "center", 
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        color: "white",
        padding: 60
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "80%" }}>
        {/* Title */}
        <h1 
          style={{ 
            fontSize: 72, 
            opacity: titleOpacity,
            marginBottom: 40,
            fontWeight: "bold"
          }}
        >
          Congratulations!
        </h1>
        
        {/* Name */}
        <h2 
          style={{ 
            fontSize: 56, 
            opacity: nameOpacity,
            marginBottom: 30,
            color: "#FFD700"
          }}
        >
          {name}
        </h2>
        
        {/* Quiz Result */}
        {quizResult && (
          <div 
            style={{ 
              fontSize: 36, 
              opacity: quizOpacity,
              marginBottom: 30,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              padding: 20,
              borderRadius: 10
            }}
          >
            Your Score: {quizResult}
          </div>
        )}
        
        {/* Message */}
        {videoText && (
          <p 
            style={{ 
              fontSize: 28, 
              opacity: messageOpacity,
              lineHeight: 1.5,
              fontStyle: "italic"
            }}
          >
            {videoText}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
};