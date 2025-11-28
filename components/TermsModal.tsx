import {
    ImageBackground,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View
} from "react-native";

const A = {
    bg: require("../assets/maiArt/backdrop.png"),
    panel: require("../assets/maiArt/panel_brown.png"),
    close: require("../assets/maiArt/button_square.png"),
};

const BROWN = "#623B2A";
const LIGHT_BROWN = "#8B6F47";

interface TermsModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function TermsModal({ visible, onClose }: TermsModalProps) {
    const { width } = useWindowDimensions();
    const pixel =
        Platform.OS === "web" && width >= 768
            ? ({ imageRendering: "pixelated" } as any)
            : undefined;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <ImageBackground
                    source={A.bg}
                    style={styles.bgFull}
                    resizeMode="cover"
                    imageStyle={pixel}
                >
                    <View style={styles.center}>
                        <ImageBackground
                            source={A.panel}
                            style={styles.panel}
                            resizeMode="contain"
                            imageStyle={pixel}
                        >
                            {/* Close button */}
                            <Pressable
                                style={styles.closeBadge}
                                onPress={onClose}
                            >
                                <ImageBackground
                                    source={A.close}
                                    style={{ width: 58, height: 58, alignItems: "center", justifyContent: "center" }}
                                    imageStyle={pixel}
                                >
                                    <Text style={styles.closeX}>x</Text>
                                </ImageBackground>
                            </Pressable>

                            {/* Title */}
                            <Text style={styles.title}>terms & conditions</Text>

                            {/* Scrollable Content */}
                            <ScrollView
                                style={styles.scrollContainer}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.sectionTitle}>Data Collection</Text>
                                <Text style={styles.paragraph}>
                                    Steps n Sprouts collects and stores the following information to provide you with our services:
                                </Text>

                                <View style={styles.bulletList}>
                                    <Text style={styles.bullet}>• Email address (for authentication)</Text>
                                    <Text style={styles.bullet}>• Age (optional, for personalized experience)</Text>
                                    <Text style={styles.bullet}>• Weight (optional, for health tracking)</Text>
                                    <Text style={styles.bullet}>• Height (optional, for health metrics)</Text>
                                    <Text style={styles.bullet}>• Daily step count (from your device)</Text>
                                </View>

                                <Text style={styles.sectionTitle}>How We Use Your Data</Text>
                                <Text style={styles.paragraph}>
                                    Your data is used solely to track your fitness progress, calculate streaks, and grow your virtual tree. We do not share your personal information with third parties.
                                </Text>

                                <Text style={styles.sectionTitle}>Data Security</Text>
                                <Text style={styles.paragraph}>
                                    All data is stored securely using Firebase services. Your health data is encrypted and protected according to industry standards.
                                </Text>

                                <Text style={styles.sectionTitle}>Your Rights</Text>
                                <Text style={styles.paragraph}>
                                    You have the right to access, modify, or delete your personal data at any time through your profile settings. If you delete your account, all associated data will be permanently removed.
                                </Text>

                                <Text style={styles.sectionTitle}>Changes to Terms</Text>
                                <Text style={styles.paragraph}>
                                    We may update these terms from time to time. Continued use of the app constitutes acceptance of any changes.
                                </Text>

                                <Text style={styles.footer}>
                                    Last updated: November 2025
                                </Text>
                            </ScrollView>
                        </ImageBackground>
                    </View>
                </ImageBackground>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    bgFull: {
        flex: 1,
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    center: {
        width: "100%",
        maxWidth: 440,
        alignItems: "center",
        justifyContent: "center",
    },
    panel: {
        width: 360,
        height: 640,
        alignItems: "center",
        paddingTop: 24,
        paddingHorizontal: 20,
    },
    closeBadge: {
        position: "absolute",
        top: -8,
        right: -6,
        zIndex: 10,
    },
    closeX: {
        fontFamily: "PixelifySans_700",
        fontSize: 26,
        color: BROWN,
        lineHeight: 26,
        textAlign: "center",
    },
    title: {
        fontFamily: "PixelifySans_700",
        fontSize: 24,
        color: BROWN,
        textAlign: "center",
        marginBottom: 16,
    },
    scrollContainer: {
        flex: 1,
        width: "100%",
    },
    scrollContent: {
        paddingBottom: 20,
    },
    sectionTitle: {
        fontFamily: "PixelifySans_700",
        fontSize: 18,
        color: BROWN,
        marginTop: 12,
        marginBottom: 6,
    },
    paragraph: {
        fontFamily: "PixelifySans_400",
        fontSize: 14,
        color: LIGHT_BROWN,
        lineHeight: 20,
        marginBottom: 8,
    },
    bulletList: {
        marginLeft: 8,
        marginBottom: 8,
    },
    bullet: {
        fontFamily: "PixelifySans_400",
        fontSize: 14,
        color: LIGHT_BROWN,
        lineHeight: 20,
        marginBottom: 4,
    },
    footer: {
        fontFamily: "PixelifySans_400",
        fontSize: 12,
        color: LIGHT_BROWN,
        textAlign: "center",
        marginTop: 16,
        fontStyle: "italic",
    },
});
