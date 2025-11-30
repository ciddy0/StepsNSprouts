import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
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
    icon: string;
    route: string;
}

const menuItems: MenuItem[] = [
    { title: 'Home', icon: 'house.fill', route: '/(tabs)' },
    { title: 'Garden', icon: 'leaf.fill', route: '/(tabs)/garden' },
    { title: 'Stats', icon: 'paperplane.fill', route: '/(tabs)/test' },
    { title: 'Settings', icon: 'gearshape.fill', route: '/(tabs)/settings' },
    { title: 'Achievements', icon: 'star.fill', route: '/(tabs)/achievements' },
    { title: 'Shop', icon: 'cart.fill', route: '/(tabs)/shop' },
];

export function HamburgerMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [slideAnim] = useState(new Animated.Value(-MENU_WIDTH));
    const router = useRouter();
    const pathname = usePathname();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const toggleMenu = () => {
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
        toggleMenu();
        setTimeout(() => {
            router.push(route as any);
        }, 300);
    };

    return (
        <>
            {/* Floating Hamburger Button */}
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
                                    backgroundColor: colors.background,
                                },
                            ]}
                        >
                            <View style={styles.menuHeader}>
                                <Text style={[styles.menuTitle, { color: colors.text }]}>
                                    MENU
                                </Text>
                                <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
                                    <Text style={[styles.closeX, { color: colors.text }]}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.menuItems}>
                                {menuItems.map((item, index) => {
                                    const isActive = pathname === item.route ||
                                        (item.route === '/(tabs)' && pathname === '/(tabs)/index');

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
                                            <IconSymbol
                                                name={item.icon as any}
                                                size={24}
                                                color={isActive ? colors.tint : colors.text}
                                            />
                                            <Text
                                                style={[
                                                    styles.menuItemText,
                                                    { color: isActive ? colors.tint : colors.text },
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
        width: 32,
        height: 32,
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
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#ccc',
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
    },
});
