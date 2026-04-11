import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Image, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator,
  StatusBar // <-- 🛠️ IMPORTAMOS STATUSBAR PARA MEDIR EL NOTCH
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import { API_URL } from './ip';


export default function EditarPerfilScreen({ navigation }) {

  const [nombre, setNombre] = useState('');
  const [paterno, setPaterno] = useState('');
  const [materno, setMaterno] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  
  const [telefono, setTelefono] = useState('');
  const [fotoUrl, setFotoUrl] = useState(null); 
  
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  useEffect(() => {
    obtenerDatosActuales();
  }, []);

  const obtenerDatosActuales = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNombre(data.nombre || '');
        setPaterno(data.paterno || '');
        setMaterno(data.materno || '');
        setCorreo(data.email || ''); 
        setTelefono(data.telefono || '');
        
        setFotoUrl(data.foto_url || null); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargandoDatos(false);
    }
  };

  const cambiarFoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tus fotos para cambiar el perfil.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 0.5, 
    });

    if (!result.canceled) {
      mandarFotoAlServidor(result.assets[0].uri);
    }
  };

  const mandarFotoAlServidor = async (uri) => {
    setSubiendoFoto(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('foto', {
        uri: uri,
        name: 'perfil.jpg',
        type: 'image/jpeg',
      });

      const response = await  fetch(`${API_URL}/app/perfil/foto`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', 
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFotoUrl(data.foto_url); 
        Alert.alert("¡Éxito!", "Tu foto de perfil ha sido actualizada.");
      } else {
        Alert.alert("Error", data.mensaje || "No se pudo subir la foto.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error de red", "Verifica tu conexión.");
    } finally {
      setSubiendoFoto(false);
    }
  };

  const actualizarPerfil = async () => {
    if (!nombre.trim() || !paterno.trim()) {
      Alert.alert("Atención", "Completa tu nombre y apellido paterno"); return;
    }
    if (telefono.trim().length > 0 && telefono.trim().length < 10) {
      Alert.alert("Error", "El teléfono debe tener 10 números."); return;
    }

    setGuardando(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const datosActualizados = {
        nombre: nombre.trim(), paterno: paterno.trim(), materno: materno.trim(),
        telefono: telefono.trim()
      };
      if (contrasena.trim() !== '') datosActualizados.password = contrasena;

      const response = await fetch(`${API_URL}/app/perfil/actualizar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
      });

      if (response.ok) {
        Alert.alert("Éxito", "Información guardada."); navigation.goBack(); 
      } else {
        const errorData = await response.json(); Alert.alert("Aviso", errorData.message);
      }
    } catch (error) { Alert.alert("Error", "Verifica tu conexión"); } finally { setGuardando(false); }
  };

  if (cargandoDatos) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#17005A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🛠️ Le decimos al teclado que empuje la pantalla hacia arriba */}
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // 🛠️ Permite tocar el botón "Actualizar" sin tener que cerrar el teclado primero
        >
          <View style={styles.cardBlanca}>
            
            <View style={styles.headerContainer}>
              <Image source={require('../assets/logo_medifind.png')} style={styles.logo} resizeMode="contain" />
              <Text style={styles.titulo} numberOfLines={1} adjustsFontSizeToFit>Edita tu perfil</Text>
            </View>

            <View style={styles.seccionFoto}>
              <TouchableOpacity onPress={cambiarFoto} disabled={subiendoFoto} style={styles.botonFoto}>
                {fotoUrl ? (
                  <Image source={{ uri: fotoUrl }} style={styles.imagenPerfil} />
                ) : (
                  <View style={styles.imagenPlaceholder}>
                    <Ionicons name="person" size={50} color="#0066CC" />
                  </View>
                )}
                
                <View style={styles.lapicitoBadge}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                </View>

                {subiendoFoto && (
                  <View style={styles.cargandoFotoFondo}>
                    <ActivityIndicator size="small" color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.textoFoto}>Toca para cambiar foto</Text>
            </View>

            <Text style={styles.label}>Nombre(s)</Text>
            <TextInput style={styles.input} maxLength={40} value={nombre} onChangeText={(t) => setNombre(t.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))} />

            <View style={styles.filaApellidos}>
              <View style={styles.columnaApellidoPaterno}>
                <Text style={styles.label}>Apellido Paterno</Text>
                <TextInput style={styles.input} maxLength={30} value={paterno} onChangeText={(t) => setPaterno(t.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))} />
              </View>
              <View style={styles.columnaApellidoMaterno}>
                <Text style={styles.label}>Apellido Materno</Text>
                <TextInput style={styles.input} maxLength={30} value={materno} onChangeText={(t) => setMaterno(t.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))} />
              </View>
            </View>

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput style={[styles.input, { backgroundColor: '#E8E8E8', color: '#888' }]} value={correo} editable={false} />

            <Text style={styles.label}>Nueva Contraseña (Opcional)</Text>
            <TextInput style={styles.input} placeholder="Dejar en blanco para conservar" secureTextEntry={true} value={contrasena} onChangeText={setContrasena} />

           

            <Text style={styles.label}>Teléfono</Text>
            <TextInput style={styles.input} keyboardType="numeric" maxLength={10} value={telefono} onChangeText={(t) => setTelefono(t.replace(/[^0-9]/g, ''))} />

            <TouchableOpacity style={styles.btnActualizar} onPress={actualizarPerfil} disabled={guardando}>
              {guardando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.textoBtn}>Actualizar datos</Text>}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 🛠️ AQUÍ ESTÁ LA MAGIA DEL NOTCH Y EL TECLADO
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', // Para que la barra de arriba se vea blanca 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 // Respetamos la barra de Android
  }, 
  keyboardContainer: { flex: 1 }, 
  scrollView: { flex: 1, backgroundColor: '#FFFFFF' }, 
  scrollContent: { 
    flexGrow: 1, 
    paddingBottom: 100 // 🛠️ COLCHÓN DE ESPACIO EXTRA PARA EL TECLADO
  },
  cardBlanca: { backgroundColor: '#FFFFFF', paddingHorizontal: 30, paddingTop: 20, minHeight: '100%' }, 
  
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logo: { width: 140, height: 60, marginRight: 10 }, 
  titulo: { flex: 1, fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' }, // Bajé un poquito la fuente para que no se corte
  label: { fontSize: 15, color: '#1A1A1A', marginTop: 10, marginBottom: 6 }, 
  input: { height: 48, backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 16, fontSize: 15, marginBottom: 10 },
  filaApellidos: { flexDirection: 'row', justifyContent: 'space-between' }, 
  columnaApellidoPaterno: { flex: 1, marginRight: 6 }, 
  columnaApellidoMaterno: { flex: 1, marginLeft: 6 },
  btnActualizar: { width: 220, height: 48, backgroundColor: '#17005A', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 28, marginBottom: 20 }, 
  textoBtn: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  
  seccionFoto: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  botonFoto: { width: 100, height: 100, borderRadius: 50, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, backgroundColor: '#FFF' },
  imagenPerfil: { width: 100, height: 100, borderRadius: 50 },
  imagenPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  lapicitoBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#17005A', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  cargandoFotoFondo: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  textoFoto: { marginTop: 10, fontSize: 13, color: '#555' }
});