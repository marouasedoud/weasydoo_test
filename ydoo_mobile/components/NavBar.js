import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; // Correct import of AuthContext

const NavBar = () => {
  const { token, username, logout } = useContext(AuthContext); // Use AuthContext here
  const navigation = useNavigation();

  const handleLogoClick = () => {
    navigation.navigate('Home'); // Or whatever your main screen is named
  };

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={handleLogoClick}>
        <Image
          source={require('../assets/Weasydoo.png')} // Put the image in /assets folder
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>
      {token ? (
        <View style={styles.authSection}>
          <Text style={styles.welcomeMessage}>Welcome, {username}!</Text>
          <TouchableOpacity onPress={logout} style={[styles.authButton, styles.logoutButton]}>
            <Text style={styles.authButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={[styles.authButton, styles.loginButton]}>
          <Text style={styles.authButtonText}>Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
    elevation: 3,
    alignItems: 'center',
  },
  logo: {
    height: 40,
    width: 120,
  },
  authSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeMessage: {
    marginRight: 10,
    color: '#003366',
    fontWeight: '500',
  },
  authButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  authButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  logoutButton: {
    marginLeft: 10,
  },
  loginButton: {
    marginLeft: 0,
  },
});

export default NavBar;
