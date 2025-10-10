import { Image } from 'expo-image';
import { useState } from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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
        <View style={styles.editContainer}>
          <Image
            source={require('@/assets/images/edit_profile.png')}
            style={styles.edit}
            resizeMode="contain"
          />
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
          <ImageBackground
            source={require('@/assets/images/input.png')}
            style={styles.inputBackground}
            resizeMode="stretch"
          >
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#1719bfff"
              value={firstName}
              onChangeText={setFirstName}
            />
          </ImageBackground>

          <ImageBackground
            source={require('@/assets/images/input.png')}
            style={styles.inputBackground}
            resizeMode="stretch"
         
          >
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#1719bfff"
              value={lastName}
              onChangeText={setLastName}
            />
          </ImageBackground>

          <ImageBackground
            source={require('@/assets/images/input.png')}
            style={styles.inputBackground}
            resizeMode="stretch"
          >
            <TextInput
              style={styles.input}
              placeholder="Weight"
              placeholderTextColor="#1719bfff"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </ImageBackground>

          <ImageBackground
            source={require('@/assets/images/input.png')}
            style={styles.inputBackground}
            resizeMode="stretch"
          >
            <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor="#1719bfff"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
          </ImageBackground>

          <ImageBackground
            source={require('@/assets/images/input.png')}
            style={styles.inputBackground}
            resizeMode="stretch"
          >
            <TextInput
              style={styles.input}
              placeholder="Sex"
              placeholderTextColor="#1719bfff"
              value={sex}
              onChangeText={setSex}
            />
          </ImageBackground>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButtonContainer}>
          <ImageBackground
            source={require('@/assets/images/save_button.png')}
            style={styles.saveButton}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Back Arrow */}
        <TouchableOpacity style={styles.backButton}>
          <Image 
            source={require('@/assets/images/back_arrow.png')}  // replace with your arrow image
            style={styles.backIcon}
            resizeMode="contain"
           />
        </TouchableOpacity>
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
  editContainer: {
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 40,
  },
  edit: {
    width: 300,
    height: 144,
  },
  pfpContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  pfp: {
    width: 144,
    height: 144,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '25%',
    borderRadius: 20,
    padding: 0,
  },
  cameraIcon: {
    width: 30,
    height: 30,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
    marginBottom: 30,
  },
  inputBackground: {
    width: '105%',
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  input: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 20,
    color: '#1719bfff',
    textAlign: 'left',
  },
  saveButtonContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  saveButton: {
    width: 300,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton:{
    position:'absolute',
    top: 50, 
    left: 20, 
    zIndex: 10,
    padding:5,
  },
  backIcon:{
    width: 50,
    height: 50, 
  },
});
