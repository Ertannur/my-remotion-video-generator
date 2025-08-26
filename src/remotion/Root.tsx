// remotion/Root.tsx
import { Composition } from "remotion";
import { MyVideo } from "./MyVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        name: "Sample User",
        quizResult: "95/100",
        videoText: "Great job on completing the quiz!"
      }}
    />
  );
};