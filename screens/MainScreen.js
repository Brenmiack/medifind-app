import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  StatusBar 
} from 'react-native';

export default function MainScreen({ navigation }) {

  // --- LÓGICA TRADUCIDA DEL KOTLIN (Handler.postDelayed) ---
  useEffect(() => {
    // Creamos el temporizador de 2.5 segundos
    const timer = setTimeout(() => {
      // Usamos 'replace' en lugar de 'navigate' para simular el finish() de Android.
      // Así borramos esta pantalla del historial y evitamos que el usuario regrese a ella.
      navigation.replace('Login');
    }, 2500);

    // Limpiamos el temporizador si el componente se desmonta por alguna razón
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Ocultamos la barra de estado superior para que se vea como una app 100% inmersiva */}
      <StatusBar hidden={true} />

      <Image 
        source={require('../assets/logo_medifind.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      
      {/* Nota: Como en tu XML decía @string/titulo_app, le puse "MediFind" por defecto. 
          Si tu app se llama distinto, solo cámbialo aquí abajo 👇 */}
      <Text style={styles.titulo}>MediFind</Text>
      <Text style={styles.subtitulo}>Tu salud en buenas manos</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', // Equivalente a android:gravity="center"
    alignItems: 'center',
  },
  logo: {
    width: 190,
    height: 190,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 36,
    fontWeight: '900', // Equivalente a sans-serif-black
    color: '#2E2E2E',
  },
  subtitulo: {
    fontSize: 14,
    color: '#6F7C8E',
    marginTop: 6,
    letterSpacing: 1.2, // Equivalente a android:letterSpacing="0.08"
  }
});