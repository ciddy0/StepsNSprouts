import { useAuth } from '@/context/AuthContext';
import { getUserDocument } from '@/services/api/userService';
import { User } from '@/services/firebase/collections/user';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

//added to fix useFocusEffect error
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const data = await getUserDocument(user.uid);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setDataLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);
  
  // Refetch user data every time the screen comes into focus (after returning from /profile-settings)
  useFocusEffect(
    useCallback(() => {
      const refetchOnFocus = async () => {
        if (user) {
          try {
            const data = await getUserDocument(user.uid);
            setUserData(data);
          } catch (error) {
            console.error('Error fetching user data on focus:', error);
          }
        }
      };

      refetchOnFocus();
      // No cleanup needed
    }, [user])
  );

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <View>
        <ActivityIndicator />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <Text>Welcome to Steps n Sprouts</Text>
      
      <View>
        <Text>Firebase Auth Info:</Text>
        <Text>Email: {user?.email}</Text>
        <Text>User ID: {user?.uid}</Text>
        <Text>Email Verified: {user?.emailVerified ? 'Yes' : 'No'}</Text>
      </View>

      {userData && (
        <View>
          <Text>Firestore User Data:</Text>
          <Text>Username: {userData.username}</Text>
          <Text>First Name: {userData.firstName || 'Not set'}</Text>
          <Text>Last Name: {userData.lastName || 'Not set'}</Text>
          <Text>Email: {userData.email}</Text>
          <Text>Step Goal: {userData.stepGoal}</Text>
          <Text>Pomes Currency: {userData.pomes}</Text>
          <Text>Profile Picture: {userData.profilePicture || 'Not set'}</Text>

          {/* navigate to profile settings */}
          <TouchableOpacity onPress={() => router.push('/profile-settings')} style={{ marginTop: 12 }}>
            <Text style={{ textDecorationLine: 'underline' }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      {!userData && (
        <View>
          <Text>No Firestore user data found</Text>
        </View>
      )}
      
      <TouchableOpacity onPress={handleLogout} disabled={loading}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text>Log Out</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}