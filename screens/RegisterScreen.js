import React, { useState } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  Alert,
  KeyboardAvoidingView, 
  Platform,             
  SafeAreaView,
  StatusBar // <-- 1. Agregado para el notch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

const API_URL = 'http://192.168.1.22:8000/api'; 

export default function RegisterScreen({ navigation }) {
  
  const [nombre, setNombre] = useState('');
  const [apellidoP, setApellidoP] = useState('');
  const [apellidoM, setApellidoM] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [telefono, setTelefono] = useState('');
  const [terminos, setTerminos] = useState(false);

  const [ocultarPassword, setOcultarPassword] = useState(true);
  const [ocultarConfirmar, setOcultarConfirmar] = useState(true);

  const manejarRegistro = async () => {
    if (!nombre.trim() || !apellidoP.trim() || !correo.trim() || !password.trim() || !confirmar.trim() || !telefono.trim()) {
      Alert.alert('Aviso', 'Completa todos los campos principales');
      return;
    }
    if (password !== confirmar) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (!terminos) {
      Alert.alert('Aviso', 'Debes aceptar los términos y condiciones');
      return;
    }

    // Ya no juntamos los nombres aquí, los mandamos separados en el body 👇

    try {
      const response = await fetch(`${API_URL}/registro-paciente`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          paterno: apellidoP.trim(),
          materno: apellidoM.trim(),
          email: correo, 
          password: password,
          telefono: telefono
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Registro exitoso', 
          'Bienvenido a MediFind',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error en el registro', data.message || 'Verifica tus datos e intenta de nuevo.');
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No pudimos conectar con el servidor.');
      console.error(error);
    }
  };

  const abrirTerminos = () => {
    navigation.navigate('Terminos');
  };

  return (
    // 2. Aplicamos el truco del StatusBar para que no se pegue al techo
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F4F4', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      
      {/* 3. Forzamos el comportamiento en Android ('height') y le damos un offset */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.main} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.linearLayout}>

            <View style={styles.headerContainer}>
              <Image source={require('../assets/logo_medifind.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.titulo}>Registro</Text>
            <Text style={styles.subtitulo}>Ingresa estos datos para ser parte de nosotros</Text>

            <TextInput 
              style={styles.input} placeholder="Nombre(s)" maxLength={50} value={nombre}
              onChangeText={(t) => setNombre(t.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))}
            />

            <TextInput 
              style={styles.input} placeholder="Apellido Paterno" maxLength={50} value={apellidoP}
              onChangeText={(t) => setApellidoP(t.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))}
            />

            <TextInput 
              style={styles.input} placeholder="Apellido Materno" maxLength={50} value={apellidoM}
              onChangeText={(t) => setApellidoM(t.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))}
            />

            <TextInput 
              style={styles.input} placeholder="Correo electrónico" maxLength={50} keyboardType="email-address" autoCapitalize="none" value={correo}
              onChangeText={(t) => setCorreo(t.replace(/\s/g, ''))}
            />

            <TextInput 
              style={styles.input} placeholder="Teléfono (10 dígitos)" maxLength={10} keyboardType="numeric" value={telefono}
              onChangeText={(t) => setTelefono(t.replace(/[^0-9]/g, ''))}
            />

            <View style={styles.passwordContainer}>
              <TextInput 
                style={styles.inputPassword}
                placeholder="Contraseña"
                maxLength={50}
                secureTextEntry={ocultarPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setOcultarPassword(!ocultarPassword)}>
                <Ionicons name={ocultarPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#777" />
              </TouchableOpacity>
            </View>

            <View style={[styles.passwordContainer, { marginBottom: 20 }]}>
              <TextInput 
                style={styles.inputPassword}
                placeholder="Confirma tu contraseña"
                maxLength={50}
                secureTextEntry={ocultarConfirmar}
                value={confirmar}
                onChangeText={setConfirmar}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setOcultarConfirmar(!ocultarConfirmar)}>
                <Ionicons name={ocultarConfirmar ? "eye-off-outline" : "eye-outline"} size={22} color="#777" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btnRegistro} onPress={manejarRegistro}>
              <Text style={styles.btnText}>Regístrate</Text>
            </TouchableOpacity>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={[styles.checkbox, terminos && styles.checkboxActivo]} 
                onPress={() => setTerminos(!terminos)}
              >
                {terminos && <Text style={styles.palomita}>✓</Text>}
              </TouchableOpacity>
              
              <Text style={styles.checkboxTexto}>
                Acepto{' '}
                <Text style={styles.linkTexto} onPress={abrirTerminos}>
                  Términos de servicio y Políticas de Privacidad
                </Text>
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#F4F4F4' },
  scrollContent: { 
    flexGrow: 1, 
    // 4. Quitamos el justifyContent: 'center' que trababa el scroll 
    // y metemos el "colchón" mágico de espacio al final.
    paddingTop: 20,
    paddingBottom: 100 
  },
  linearLayout: { paddingHorizontal: 30, alignItems: 'center' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  logo: { width: 150, height: 50 }, 
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#2E2E2E', marginTop: 10 },
  subtitulo: { fontSize: 14, color: '#777777', marginBottom: 25, textAlign: 'center' },
  
  input: { 
    width: '100%', height: 50, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: 25, paddingHorizontal: 20, marginBottom: 15 
  },
  
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center', width: '100%', height: 50,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: 25, marginBottom: 15, paddingRight: 15
  },
  inputPassword: { flex: 1, height: '100%', paddingHorizontal: 20 },
  eyeIcon: { padding: 5 },

  btnRegistro: { 
    width: '100%', height: 50, backgroundColor: '#0066CC', borderRadius: 25, 
    justifyContent: 'center', alignItems: 'center', marginTop: 5
  },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20, width: '100%', paddingHorizontal: 5 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#777777', borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkboxActivo: { backgroundColor: '#0066CC', borderColor: '#0066CC' },
  palomita: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  checkboxTexto: { fontSize: 13, color: '#777777', flex: 1 },
  linkTexto: { color: '#0066CC', fontWeight: 'bold', textDecorationLine: 'underline' }
});