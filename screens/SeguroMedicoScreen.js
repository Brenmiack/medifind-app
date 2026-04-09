import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';

export default function SeguroMedicoScreen({ navigation }) {

  // --- LÓGICA TRADUCIDA DEL KOTLIN ---
  const [documento, setDocumento] = useState('');
  const [numeroIdentidad, setNumeroIdentidad] = useState('');
  const [nombreSeguro, setNombreSeguro] = useState('');
  const [numeroSeguro, setNumeroSeguro] = useState('');

  const guardarDatos = () => {
    // Verificamos que ningún campo esté vacío
    if (!documento.trim() || !numeroIdentidad.trim() || !nombreSeguro.trim() || !numeroSeguro.trim()) {
      Alert.alert("Atención", "Completa todos los campos");
    } else {
      Alert.alert(
        "Éxito", 
        "Datos guardados correctamente",
        [{ text: "OK", onPress: () => navigation.goBack() }] // Regresa al perfil tras guardar
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          <View style={styles.contenedorBlanco}>
            
            {/* ENCABEZADO */}
            <View style={styles.headerContainer}>
              <Image 
                source={require('../assets/logo_medifind.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
              <Text style={styles.titulo}>Seguro Médico</Text>
            </View>

            {/* DOCUMENTO DE IDENTIDAD */}
            <Text style={styles.label}>Documento de identidad</Text>
            <TextInput 
              style={styles.input}
              value={documento}
              onChangeText={setDocumento}
            />

            {/* NÚMERO DE IDENTIDAD */}
            <Text style={styles.label}>Número de identidad</Text>
            <TextInput 
              style={styles.input}
              keyboardType="default"
              value={numeroIdentidad}
              onChangeText={setNumeroIdentidad}
            />

            {/* NOMBRE DEL SEGURO */}
            <Text style={styles.label}>Nombre del seguro</Text>
            <TextInput 
              style={styles.input}
              placeholder="Ej. IMSS, ISSSTE, GNP..."
              value={nombreSeguro}
              onChangeText={setNombreSeguro}
            />

            {/* NÚMERO DE SEGURO */}
            <Text style={styles.label}>Número de seguro</Text>
            <TextInput 
              style={styles.input}
              keyboardType="numeric"
              value={numeroSeguro}
              onChangeText={setNumeroSeguro}
            />

            {/* BOTÓN GUARDAR */}
            <TouchableOpacity style={styles.btnGuardar} onPress={guardarDatos}>
              <Text style={styles.textoBtn}>Guardar</Text>
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
    backgroundColor: '#ECECEC', 
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contenedorBlanco: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 8,
    minHeight: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 130, 
    height: 50,
    marginRight: 10,
  },
  titulo: {
    flex: 1,
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000000',
  },
  label: {
    fontSize: 14,
    color: '#1A1A1A',
    marginTop: 8,
    marginBottom: 6,
  },
  input: {
    height: 50,
    backgroundColor: '#F3F4F6', 
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 15,
  },
  btnGuardar: {
    width: 200,
    height: 50,
    backgroundColor: '#17005A',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 40,
    marginBottom: 20,
  },
  textoBtn: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});