import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // <-- Importamos Ionicons para el ojito

// 1. Asegúrate de que esta sea tu IP actual de la compu
// La ruta de importación ('../config') depende de dónde esté tu archivo.
// Si tu pantalla está dentro de una carpeta "screens", usas '../' para salir un nivel.
import { API_URL } from '../config';

export default function LoginScreen({ navigation }) {
  
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para controlar si vemos o no la contraseña
  const [ocultarPassword, setOcultarPassword] = useState(true);

  // 2. Función de Login conectada al Backend
  const manejarLogin = async () => {
    // Validación básica
    if (!correo.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña');
      return;
    }

    try {
      // Llamada a la puerta que creamos en PacienteAuthController
      const response = await fetch(`${API_URL}/login-paciente`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: correo,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // ¡ÉXITO! Laravel nos devolvió el Token y los datos del paciente
        console.log("Token de sesión:", data.token);
        
        await AsyncStorage.setItem('token', data.token);

        Alert.alert('¡Bienvenido!', `Hola de nuevo, ${data.paciente.nombre}`, [
          { 
            text: 'Entrar', 
            onPress: () => navigation.navigate('Home') 
          }
        ]);
      } else {
        // El servidor nos dijo que algo está mal (ej. contraseña incorrecta)
        Alert.alert('Error de acceso', data.mensaje || 'Correo o contraseña incorrectos');
      }

    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor. Revisa tu internet y el servidor.');
      console.error(error);
    }
  };

  const irARegistro = () => {
    navigation.navigate('Register');
  };

  const abrirTerminos = () => {
    navigation.navigate('Terminos');
  };

  return (
    <ScrollView style={styles.main} contentContainerStyle={styles.scrollContent}>
      <View style={styles.linearLayout}>

        <Image 
          source={require('../assets/logo1.png')} 
          style={styles.logo}
        />
        <Text style={styles.titulo}>Iniciar sesión</Text>
        <Text style={styles.subtitulo}>Accede a tu cuenta MediFind</Text>

        <TextInput 
          style={styles.input}
          placeholder="Correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          value={correo}
          onChangeText={(texto) => {
            const sinEspacios = texto.replace(/\s/g, '');
            setCorreo(sinEspacios);
          }}
        />

        {/* CONTENEDOR DE CONTRASEÑA CON OJITO */}
        <View style={styles.passwordContainer}>
          <TextInput 
            style={styles.inputPassword}
            placeholder="Contraseña"
            secureTextEntry={ocultarPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setOcultarPassword(!ocultarPassword)}
          >
            <Ionicons 
              name={ocultarPassword ? "eye-off-outline" : "eye-outline"} 
              size={22} 
              color="#777" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btnLogin} onPress={manejarLogin}>
          <Text style={styles.btnText}>Iniciar sesión</Text>
        </TouchableOpacity>

        {/* ENLACE AL REGISTRO RESALTADO */}
        <TouchableOpacity onPress={irARegistro} style={{ marginTop: 20 }}>
          <Text style={styles.txtRegistro}>
            ¿No tienes cuenta? <Text style={styles.txtResaltado}>Regístrate</Text>
          </Text>
        </TouchableOpacity>

        {/* TEXTO DE TÉRMINOS CON ENLACE */}
        <Text style={styles.txtTerminos}>
          Al continuar aceptas los{' '}
          <Text style={styles.linkTerminos} onPress={abrirTerminos}>
            Términos de servicio y Política de privacidad
          </Text>
        </Text>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  linearLayout: { padding: 30, alignItems: 'center' },
  logo: { width: 60, height: 90, marginBottom: 10 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#2E2E2E' },
  subtitulo: { fontSize: 14, color: '#6F7C8E', marginBottom: 30 },
  
  input: { width: '100%', height: 55, backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
  
  // Estilos para el campo de contraseña con ojo
  passwordContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '100%', 
    height: 55,
    backgroundColor: '#F3F4F6', 
    borderRadius: 8, 
    marginBottom: 25, 
    paddingRight: 15
  },
  inputPassword: {
    flex: 1, 
    height: '100%', 
    paddingHorizontal: 15,
  },
  eyeIcon: {
    padding: 5,
  },

  btnLogin: { width: '100%', height: 55, backgroundColor: '#0066CC', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  
  // Estilos para los textos
  txtRegistro: { color: '#6F7C8E', fontSize: 14 },
  txtResaltado: { color: '#0066CC', fontWeight: 'bold' }, // "Regístrate" en azul y negrita
  
  txtTerminos: { fontSize: 12, color: '#6F7C8E', marginTop: 40, textAlign: 'center', lineHeight: 18 },
  linkTerminos: { color: '#0066CC', fontWeight: 'bold', textDecorationLine: 'underline' } // Enlace de los términos
});