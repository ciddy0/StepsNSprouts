// app/(auth)/login.tsx
import { useAuth } from '@/context/AuthContext';
import { signInWithGoogleIdToken, useGoogleAuth } from '@/services/firebase/auth';
import { Audio } from 'expo-av';
import { Link, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ERROR = 'Error';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);
    
    const { signIn } = useAuth();
    const [request, response, promptAsync] = useGoogleAuth();

    // Play background music when component mounts
    useEffect(() => {
        const playBackgroundMusic = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../../assets/music/lofi-background-music-326931.mp3'), // Change to your music file path
                    { shouldPlay: true, isLooping: true, volume: 0.3 }
                );
                soundRef.current = sound;
            } catch (error) {
                console.log('Error loading music:', error);
            }
        };

        playBackgroundMusic();

        // Cleanup: stop music when component unmounts
        return () => {
            if (soundRef.current) {
                soundRef.current.stopAsync();
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleSignIn(id_token)
        }
    })

    const handleGoogleSignIn = async (idToken: string) => {
        setLoading(true);
        try {
            await signInWithGoogleIdToken(idToken);
            // Stop music when navigating away
            if (soundRef.current) {
                await soundRef.current.stopAsync();
            }
            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert('Google Sign-In Failed', 'Unable to sign in with Google')
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(ERROR, 'Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            await signIn(email, password);
            // Stop music when navigating away
            if (soundRef.current) {
                await soundRef.current.stopAsync();
            }
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Login Failed', 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            <Text>Log In</Text>
            
            <Text>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
            />

            <Text>Password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
            />

            <TouchableOpacity onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator /> : <Text>Log In</Text>}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={()  => promptAsync()}
                disabled={!request || loading}
            >
                <Text>Sign in with Google</Text>
            </TouchableOpacity>

            <Link href="/(auth)/signup" asChild>
                <TouchableOpacity disabled={loading}>
                    <Text>Don't have an account? Sign Up</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}