import React, { useRef, useState, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import HomeScreen from "./components/HomeScreen";
import LoginScreen from "./components/LoginScreen";
import ProductList from "./components/ProductList";
import { AuthContext } from "./context/AuthContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

function AppNavigator() {
  const navigationRef = useRef();
  const [currentRoute, setCurrentRoute] = useState();
  const { token, username, logout } = useContext(AuthContext);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        const route = navigationRef.current.getCurrentRoute();
        setCurrentRoute(route ? route.name : null);
      }}
      onStateChange={() => {
        const route = navigationRef.current.getCurrentRoute();
        setCurrentRoute(route ? route.name : null);
      }}
    >
      {currentRoute !== "Login" && (
        <NavBar token={token} username={username} logout={logout} />
      )}

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} token={token} />}
        </Stack.Screen>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Products" component={ProductList} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
