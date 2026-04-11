import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, Image,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, IP_SERVIDOR } from './ip';



const corregirUrlChat = (url) => {
  if (!url) return null;
  return url.trim().replace('localhost', IP_SERVIDOR).replace('127.0.0.1', IP_SERVIDOR);
};

export default function ChatScreen({ route, navigation }) {
  const { doctorId, doctorNombre, doctorFoto } = route.params || {};

  const [conversacionId, setConversacionId] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  
  const flatListRef = useRef(null);

  // 1. INICIAR CHAT: Se ejecuta UNA SOLA VEZ al abrir la pantalla
  useEffect(() => {
    iniciarChat();
  }, []); 

  // 2. RECARGA AUTOMÁTICA
  useEffect(() => {
    if (!conversacionId) return; 

    const intervalo = setInterval(() => {
      cargarHistorial(conversacionId);
    }, 5000); 

    return () => clearInterval(intervalo); 
  }, [conversacionId]);

  const iniciarChat = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/app/chat/iniciar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ doctor_id: doctorId })
      });
      
      const data = await response.json();
      if (response.ok) {
        setConversacionId(data.id);
        cargarHistorial(data.id);
      }
    } catch (error) {
      console.error("Error al iniciar chat:", error);
    }
  };

  const cargarHistorial = async (idChat) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://${IP_SERVIDOR}:8000/api/app/chat/${idChat}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      
      const data = await response.json();
      if (response.ok) setMensajes(data);

      // 🌟 AQUÍ ESTÁ LA MAGIA PARA LAS PALOMITAS AZULES DEL DOCTOR 🌟
      try {
        // Le avisamos al servidor que el paciente ya vio los mensajes de este chat
        await fetch(`http://${IP_SERVIDOR}:8000/api/app/chat/${idChat}/leer`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Accept': 'application/json' 
          }
        });
      } catch (err) {
        console.log("No se pudo marcar como leido", err);
      }
      // 🌟 FIN DE LA MAGIA 🌟

    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setCargando(false);
    }
  };

  const enviarMensaje = async () => {
    if (nuevoMensaje.trim() === '') return;
    const textoAEnviar = nuevoMensaje;
    setNuevoMensaje('');

    const mensajeTemporal = {
      id: Date.now(), 
      emisor: 'paciente',
      contenido: textoAEnviar,
      created_at: new Date().toISOString(),
      leido: 0
    };
    setMensajes((prev) => [...prev, mensajeTemporal]);

    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`http://${IP_SERVIDOR}:8000/api/app/chat/enviar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ conversacion_id: conversacionId, contenido: textoAEnviar })
      });
    } catch (error) { console.error("Error al enviar:", error); }
  };

  const renderMensaje = ({ item }) => {
    const esMio = item.emisor === 'paciente';
    const hora = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.mensajeContenedor, esMio ? styles.mensajeMio : styles.mensajeDoctor]}>
        <Text style={[styles.textoMensaje, esMio ? styles.textoMio : styles.textoDoctor]}>
          {item.contenido}
        </Text>
        <View style={styles.infoMensaje}>
          <Text style={styles.horaTexto}>{hora}</Text>
          {esMio && (
            <Ionicons 
              name={item.leido ? "checkmark-done" : "checkmark"} 
              size={16} 
              color={item.leido ? "#34B7F1" : "#888"} 
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnRegresar}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.infoDoctorHeader}>
          <View style={styles.avatarMini}>
            {doctorFoto ? (
              <Image 
                source={{ uri: `${corregirUrlChat(doctorFoto)}?t=${new Date().getTime()}` }} 
                style={styles.fotoMini} 
              />
            ) : (
              <Ionicons name="person" size={20} color="#0066CC" />
            )}
          </View>
          <Text style={styles.nombreHeader}>Dr. {doctorNombre}</Text>
        </View>
      </View>

      {/* MODIFICACIÓN AQUÍ: 
        1. Se cambia `null` por `'height'` en Android para forzar el redibujado.
        2. Se añade `keyboardVerticalOffset` por si el header empuja el layout.
      */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0} 
      >
        <View style={{ flex: 1 }}>
          {cargando ? (
            <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              ref={flatListRef}
              data={mensajes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMensaje}
              contentContainerStyle={styles.listaMensajes}
              // Asegura que al escribir también baje la lista
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Escribe un mensaje..." 
            value={nuevoMensaje} 
            onChangeText={setNuevoMensaje} 
            multiline 
          />
          <TouchableOpacity style={styles.btnEnviar} onPress={enviarMensaje}>
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
    // ESTA ES LA LÍNEA MÁGICA:
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { backgroundColor: '#0066CC', padding: 15, flexDirection: 'row', alignItems: 'center' },
  btnRegresar: { marginRight: 15 },
  infoDoctorHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarMini: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 10, overflow: 'hidden' },
  fotoMini: { width: 36, height: 36 },
  nombreHeader: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  listaMensajes: { padding: 15 },
  mensajeContenedor: { maxWidth: '80%', padding: 10, borderRadius: 12, marginBottom: 8 },
  mensajeMio: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6', borderBottomRightRadius: 0 },
  mensajeDoctor: { alignSelf: 'flex-start', backgroundColor: '#FFF', borderBottomLeftRadius: 0 },
  textoMensaje: { fontSize: 16 },
  infoMensaje: { flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', marginTop: 4 },
  horaTexto: { fontSize: 10, color: '#666', marginRight: 4 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#FFF', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F0F2F5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, fontSize: 16, maxHeight: 100 },
  btnEnviar: { backgroundColor: '#0066CC', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});