import WelcomeScreen from "@/components/WelcomeScreen";
import { useSession } from "@/contexts/session-context";
import { useThemedColors } from "@/hooks/useThemedColors";
import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { theme } = useThemedColors();

  const { user } = useSession()

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <SafeAreaView
      className={`${theme} bg-background flex items-center justify-center flex-1`}
    >
      <WelcomeScreen />
    </SafeAreaView>
  );
}
