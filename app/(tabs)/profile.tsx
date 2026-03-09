import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Picture */}
        <View style={styles.pfpContainer}>
          <Image 
            source={require('@/assets/images/pfp.png')}
            style={styles.pfp}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Image 
              source={require('@/assets/images/camera.png')}
              style={styles.cameraIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#FFFFFF"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#FFFFFF"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Weight"
              placeholderTextColor="#FFFFFF"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor="#FFFFFF"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Sex"
              placeholderTextColor="#FFFFFF"
              value={sex}
              onChangeText={setSex}
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.signOutButton}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0099DB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  titleContainer: {
    backgroundColor: '#EAD4AA',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Pixelify Sans',
    fontSize: 48,
    fontWeight: '600',
    color: '#733E39',
  },
  pfpContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  pfp: {
    width: 144,
    height: 144,
    borderRadius: 72,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
  },
  cameraIcon: {
    width: 30,
    height: 30,
  },
  formContainer: {
    gap: 15,
    marginBottom: 30,
  },
  inputWrapper: {
    backgroundColor: '#8B4513',
    borderRadius: 10,
    padding: 15,
  },
  input: {
    fontFamily: 'Pixelify Sans',
    fontSize: 20,
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6B8E23',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  signOutButton: {
    flex: 1,
    backgroundColor: '#D2691E',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Pixelify Sans',
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});