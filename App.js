import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Importamos todas tus pantallas
import EditarPerfilScreen from './screens/EditarPerfilScreen';
import MainScreen from './screens/MainScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import MensajesScreen from './screens/MensajesScreen';
import AgendarCitaScreen from './screens/AgendarCitaScreen';
import ListaEspecialistasScreen from './screens/ListaEspecialistasScreen';
import PerfilEspecialistaScreen from './screens/PerfilEspecialistaScreen';
import PerfilScreen from './screens/PerfilScreen';
import FiltroModal from './screens/FiltroModal';
import CitasScreen from './screens/CitasScreen';
import HistorialCitasScreen from './screens/HistorialCitasScreen';
import SeguroMedicoScreen from './screens/SeguroMedicoScreen';
import DoctorDetailScreen from './screens/DoctorDetailScreen'; // Importar
import ChatScreen from './screens/ChatScreen'; 
import TerminosScreen from './screens/TerminosScreen';// (Ajusta la ruta si es necesario)

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
        
        {/* 2. Registramos todas las rutas sin dejar texto o espacios sueltos */}
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Citas" component={CitasScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ListaEspecialistas" component={ListaEspecialistasScreen} />
        <Stack.Screen name="PerfilEspecialista" component={PerfilEspecialistaScreen} />
        <Stack.Screen name="Mensajes" component={MensajesScreen} />
        <Stack.Screen name="AgendarCita" component={AgendarCitaScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} />
        <Stack.Screen name="HistorialCitas" component={HistorialCitasScreen} />
        <Stack.Screen name="SeguroMedico" component={SeguroMedicoScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DoctorDetalle" component={DoctorDetailScreen} />
        <Stack.Screen name="Terminos" component={TerminosScreen} />
        {/* Esta es la pantalla modal que sube desde abajo */}
        <Stack.Screen 
          name="Filtro" 
          component={FiltroModal} 
          options={{ presentation: 'transparentModal' }} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}