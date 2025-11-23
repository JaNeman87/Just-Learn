import { View } from "react-native";
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from "react-native-svg";

const CartoonCharacter = ({ width = 200, height = 200, color = "#81B64C" }) => {
    return (
        <View style={{ width, height, justifyContent: "center", alignItems: "center" }}>
            <Svg width="100%" height="100%" viewBox="0 0 200 200">
                <Defs>
                    <RadialGradient id="grad" cx="50%" cy="50%" rx="50%" ry="50%" fx="30%" fy="30%">
                        <Stop offset="0%" stopColor="#A4D474" stopOpacity="1" />
                        <Stop offset="100%" stopColor={color} stopOpacity="1" />
                    </RadialGradient>
                </Defs>

                {/* --- BODY (Blob Shape) --- */}
                <Path
                    d="M100 180 C 40 180, 20 120, 40 80 C 50 40, 90 20, 100 20 C 110 20, 150 40, 160 80 C 180 120, 160 180, 100 180 Z"
                    fill="url(#grad)"
                    stroke="#fff"
                    strokeWidth="3"
                />

                {/* --- EYES --- */}
                {/* Left Eye */}
                <Ellipse cx="75" cy="85" rx="12" ry="18" fill="white" />
                <Circle cx="75" cy="85" r="5" fill="#333" />

                {/* Right Eye (Winking or Thinking) */}
                <Ellipse cx="125" cy="85" rx="12" ry="18" fill="white" />
                <Circle cx="125" cy="85" r="5" fill="#333" />

                {/* --- MOUTH (Smile) --- */}
                <Path d="M 85 120 Q 100 135 115 120" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />

                {/* --- ARMS (Thinking Pose) --- */}
                {/* Left Arm holding chin */}
                <Path d="M 60 140 Q 40 120 50 100" stroke={color} strokeWidth="12" strokeLinecap="round" fill="none" />
                <Circle cx="50" cy="100" r="10" fill={color} stroke="#fff" strokeWidth="2" />

                {/* --- THOUGHT BUBBLES (Shifted Left & Down) --- */}
                <Circle cx="150" cy="60" r="5" fill="#FFF" opacity="0.6" />
                <Circle cx="165" cy="45" r="8" fill="#FFF" opacity="0.8" />
                <Circle cx="180" cy="25" r="12" fill="#FFF" />

                {/* Question Mark in Bubble (Shifted to match bubble) */}
                <Path
                    d="M175 20 C 175 15, 185 15, 185 20 C 185 25, 175 25, 175 30"
                    stroke="#81B64C"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                />
                <Circle cx="175" cy="34" r="1.5" fill="#81B64C" />
            </Svg>
        </View>
    );
};

export default CartoonCharacter;
