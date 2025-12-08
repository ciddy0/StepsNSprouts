import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Audio } from 'expo-av';
import { usePathname, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ImageBackground,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75;

interface MenuItem {
    title: string;
    icon: any;
    route: string;
}
const buttonBg = require('@/assets/maiArt/button_square.png');
const menuItems: MenuItem[] = [
    { title: 'garden', icon: require('@/assets/maiArt/tree.png'), route: '/(tabs)/garden' },
    { title: 'stats', icon: require('@/assets/maiArt/stats.png'), route: '/(tabs)/stats' },
    { title: 'achievements', icon: require('@/assets/maiArt/star.png'), route: '/(tabs)/achievements' },
    { title: 'shop', icon: require('@/assets/chest_frame_1.png'), route: '/(tabs)/shop' },
    { title: 'settings', icon: require('@/assets/maiArt/settings.png'), route: '/(tabs)/settings' },

];

export function HamburgerMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [slideAnim] = useState(new Animated.Value(-MENU_WIDTH));
    const router = useRouter();
    const pathname = usePathname();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const clickSoundRef = useRef<Audio.Sound | null>(null);

    const playClickSound = async () => {
        try {
            if (clickSoundRef.current) {
                await clickSoundRef.current.stopAsync();
                await clickSoundRef.current.unloadAsync();
            }

            const { sound } = await Audio.Sound.createAsync(
                require("../assets/music/menu-button-click.mp3"),
                { shouldPlay: true, volume: 1 }
            );
            clickSoundRef.current = sound;
        } catch (error) {
            console.log("Error playing click sound", error);
        }
    };
    const toggleMenu = () => {
        playClickSound();
        if (isOpen) {
            Animated.timing(slideAnim, {
                toValue: -MENU_WIDTH,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setIsOpen(false));
        } else {
            setIsOpen(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };

    const navigateTo = (route: string) => {
        playClickSound();
        toggleMenu();
        setTimeout(() => {
            router.push(route as any);
        }, 300);
    };

    return (
        <>
            <TouchableOpacity
                onPress={toggleMenu}
                style={styles.floatingButton}
                activeOpacity={0.7}
            >
                <Image
                    source={require('@/assets/maiArt/hamburger.png')}
                    style={styles.hamburgerIcon}
                    resizeMode="contain"
                />
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent
                animationType="none"
                onRequestClose={toggleMenu}
            >
                <Pressable style={styles.overlay} onPress={toggleMenu}>
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <Animated.View
                            style={[
                                styles.menuContainer,
                                {
                                    transform: [{ translateX: slideAnim }],
                                    backgroundColor: '#ead4aa',
                                },
                            ]}
                        >
                            <View style={styles.menuHeader}>
                                <Text style={[styles.menuTitle, { color: '#733e39' }]}>
                                    menu
                                </Text>
                                <TouchableOpacity onPress={toggleMenu}>
                                    <ImageBackground
                                        source={buttonBg}
                                        style={styles.closeButtonBg}
                                        resizeMode="contain"
                                    >
                                        <Text style={styles.closeXText}>x</Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.menuItems}>
                                {menuItems.map((item, index) => {
                                    const isActive = pathname === item.route;

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.menuItem,
                                                isActive && {
                                                    backgroundColor: colors.tint + '20',
                                                },
                                            ]}
                                            onPress={() => navigateTo(item.route)}
                                        >
                                            <ImageBackground
                                                source={buttonBg}
                                                style={styles.iconBackground}
                                                resizeMode="contain"
                                            >
                                                <Image
                                                    source={item.icon}
                                                    style={[
                                                        styles.menuIcon,
                                                        isActive && { tintColor: colors.tint },
                                                    ]}
                                                    resizeMode="contain"
                                                />
                                            </ImageBackground>

                                            <Text
                                                style={[
                                                    styles.menuItemText,
                                                    { color: isActive ? colors.tint : '#733e39' },
                                                ]}
                                            >
                                                {item.title}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        top: 50,
        left: 16,
        zIndex: 1000,
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    hamburgerIcon: {
        width: 48,
        height: 48,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
        width: MENU_WIDTH,
        height: '100%',
        paddingTop: 60,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderTopRightRadius: 24,

    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#623B2A',


    },
    menuTitle: {
        fontSize: 28,
        fontFamily: 'PixelifySans_700',
        letterSpacing: 1,
    },
    closeButton: {
        padding: 4,
    },
    closeX: {
        fontSize: 32,
        fontFamily: 'PixelifySans_700',
        lineHeight: 32,
    },
    menuItems: {
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    menuItemText: {
        fontSize: 18,
        marginLeft: 16,
        fontFamily: 'PixelifySans_400',
        color: "#623B2A",
    },
    menuIcon: {
        width: 28,
        height: 28,

    },

    iconBackground: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',

    },

    closeButtonBg: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    closeXText: {
        fontFamily: 'PixelifySans_700',
        fontSize: 22,
        lineHeight: 22,
        color: '#000',
        textAlign: 'center',
        marginTop: -2,
    },

});
