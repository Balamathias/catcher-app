import WelcomeScreen from "@/components/WelcomeScreen";
import { useThemedColors } from "@/hooks/useThemedColors";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { theme } = useThemedColors();

  return (
    <SafeAreaView
      className={`${theme} bg-background flex items-center justify-center flex-1`}
    >
      <WelcomeScreen />
    </SafeAreaView>
  );
}
