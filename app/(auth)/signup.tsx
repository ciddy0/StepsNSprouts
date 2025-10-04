import { useAuth } from '@/context/AuthContext';
import { isUsernameTaken } from '@/services/api/userService';
import { signInWithGoogleIdToken, useGoogleAuth } from '@/services/firebase/auth';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ERROR = 'Error';
const SUCCESS = 'SUCCESS';

export default function SignUpScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { signUp } = useAuth();
    const [request, response, promptAsync] = useGoogleAuth();

    // Handle Google Sign-In response
    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleSignIn(id_token);
        }
    }, [response]);

    const handleGoogleSignIn = async (idToken: string) => {
        setLoading(true);
        try {
            await signInWithGoogleIdToken(idToken);
            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert('Google Sign-In Failed', 'Unable to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
        Alert.alert(ERROR, 'Please fill in all fields');
        return;
    }
    
    if (username.length < 3) {
        Alert.alert(ERROR, 'Username must be at least 3 characters');
        return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        Alert.alert(ERROR, 'Username can only contain letters, numbers, and underscores');
        return;
    }
    
    if (password !== confirmPassword) {
        Alert.alert(ERROR, 'Passwords do not match');
        return;
    }
    
    if (password.length < 6){
        Alert.alert(ERROR, 'Password must be at least 6 characters');
        return;
    }
    
    setLoading(true);
    
    try {
        // Check if username is taken
        console.log('Checking username availability...');
        const taken = await isUsernameTaken(username);
        if (taken) {
            Alert.alert(ERROR, 'Username is already taken');
            setLoading(false);
            return;
        }
        
        console.log('Creating Firebase Auth account...');
        await signUp(email, password, username);
        
        Alert.alert(SUCCESS, 'Account created successfully');
        router.replace('/(tabs)');
    } catch (error: any) {
        console.error('Signup error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        let errorMessage = 'An error occurred during signup';

        if (error.message === 'Username is already taken') {
            errorMessage = 'Username is already taken';
        } else if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak';
        } else if (error.message) {
            errorMessage = error.message;
        }

        Alert.alert('Sign Up Failed', errorMessage);
    } finally {
        setLoading(false);
    }
};
    
    return (
        <View>
            <Text>Signup</Text>

            <Text>Username</Text>
            <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder='Username'
                autoCapitalize='none'
                editable={!loading}
            />

            <Text>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder='Email'
                autoCapitalize='none'
                keyboardType='email-address'
                editable={!loading}
            />
            
            <Text>Password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder='Password'
                secureTextEntry
                autoCapitalize='none'
                editable={!loading}
            />
            
            <Text>Confirm Password</Text>
            <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder='Confirm Password'
                secureTextEntry
                autoCapitalize='none'
                editable={!loading}
            />
            
            <TouchableOpacity onPress={handleSignup} disabled={loading}>
                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <Text>Sign Up</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => promptAsync()} 
                disabled={!request || loading}
            >
                <Text>Sign up with Google</Text>
            </TouchableOpacity>

            <Link href="/(auth)/login" asChild disabled={loading}>
                <TouchableOpacity>
                    <Text>Already have an account? Log In</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}