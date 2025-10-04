import { useAuth } from '@/context/AuthContext';
import { getUserDocument } from '@/services/api/userService';
import { User } from '@/services/firebase/collections/user';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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