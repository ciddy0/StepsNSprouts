import { Link } from "expo-router";
import { Button, View } from "react-native";

export default function Settings() {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Link href="/profile-settings" asChild>
        <Button title="Edit Profile" onPress={() => {}} />
      </Link>
    </View>
  );
}