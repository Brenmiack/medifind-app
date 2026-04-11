import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  FlatList, Image, ActivityIndicator, Platform, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL, IP_SERVIDOR } from './ip';

const corregirUrl = (url) => {
  if (!url) return null;
  return url.trim().replace('localhost', IP_SERVIDOR).replace('127.0.0.1', IP_SERVIDOR);
};

export default function MensajesScreen({ navigation }) {
  const [conversaciones, setConversaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Se recarga cada vez que el usuario vuelve a esta pantalla
  useFocusEffect(
    useCallback(() => {
      cargarConversaciones();
      const intervalo = setInterval(cargarConversaciones, 8000);
      return () => clearInterval(intervalo);
    }, [])
  );

  const cargarConversaciones = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/app/mis-citas`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });

      // Usamos el endpoint de chat para traer conversaciones del paciente
      const res2 = await fetch(`http://${IP_SERVIDOR}:8000/api/app/chat/mis-conversaciones`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });

      if (res2.ok) {
        const data = await res2.json();
        setConversaciones(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const renderItem = ({ item }) => {
    const doctor = item.doctor;
    const ultimoMsj = item.mensajes?.[item.mensajes.length - 1];
    const noLeidos = item.no_leidos_paciente ?? 0;
    const hora = ultimoMsj
      ? new Date(ultimoMsj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('Chat', {
          doctorId: doctor?.id,
          doctorNombre: doctor?.nombre,
          doctorFoto: doctor?.foto_url
        })}
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          {doctor?.foto_url ? (
            <Image source={{ uri: corregirUrl(doctor.foto_url) }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={22} color="#0066CC" />
            </View>
          )}
          {noLeidos > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{noLeidos}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.fila}>
            <Text style={styles.nombre} numberOfLines={1}>Dr. {doctor?.nombre}</Text>
            <Text style={styles.hora}>{hora}</Text>
          </View>
          <Text style={styles.preview} numberOfLines={1}>
            {ultimoMsj ? ultimoMsj.contenido : 'Sin mensajes aún'}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#CCC" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mensajes</Text>
        <View style={{ width: 26 }} />
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 50 }} />
      ) : conversaciones.length === 0 ? (
        <View style={styles.vacio}>
          <Ionicons name="chatbubbles-outline" size={80} color="#E0E0E0" />
          <Text style={styles.vacioTitulo}>Sin conversaciones</Text>
          <Text style={styles.vacioSub}>Cuando chates con un doctor, aparecerá aquí.</Text>
        </View>
      ) : (
        <FlatList
          data={conversaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#EEE'
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5'
  },
  avatarWrap: { position: 'relative', marginRight: 14 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center', alignItems: 'center'
  },
  badge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: '#0066CC', borderRadius: 10,
    minWidth: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  info: { flex: 1 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  nombre: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', flex: 1, marginRight: 8 },
  hora: { fontSize: 11, color: '#999' },
  preview: { fontSize: 13, color: '#777' },
  vacio: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  vacioTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 16 },
  vacioSub: { fontSize: 14, color: '#9E9E9E', marginTop: 8, textAlign: 'center', lineHeight: 22 }
});