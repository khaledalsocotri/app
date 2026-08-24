import { Stack, Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { COLORS } from "@/src/theme/theme";

export default function AdminLayout() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.brandPrimary} />
      </View>
    );
  }
  if (!user || !user.is_admin) return <Redirect href="/(tabs)/account" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.surface },
});
