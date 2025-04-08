import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { AntDesign } from "@expo/vector-icons";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      await login(username, password);
      navigation.goBack(); // Navigate back on success
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} style={styles.arrowIcon} />
          </TouchableOpacity>

          <View style={styles.textContainer}>
            <Text style={styles.authText}>Authorized</Text>
            <Text style={styles.authText}>users space</Text>
          </View>

          <View style={styles.loginBox}>
            <Image
              source={require("../assets/Weasydoo.png")}
              style={styles.logoImage}
            />
            {error && <Text style={styles.error}>{error}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>LOG IN</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#58B1F4",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  arrowButton: {
    position: "absolute",
    top: 80,
    left: 10,
    backgroundColor: "#003366",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 10,
  },
  arrowIcon: {
    color: "white",
  },
  textContainer: {
    alignSelf: "center",
  },
  authText: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold",
    lineHeight: 50,
    textShadowColor: "#09233ecd",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loginBox: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    marginTop: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#1D9BF0",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    backgroundColor: "#ffdddd",
    color: "#d8000c",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d8000c",
  },
  logoImage: {
    height: 40,
    resizeMode: "contain",
    marginBottom: 20,
    alignSelf: "center",
  },
});
