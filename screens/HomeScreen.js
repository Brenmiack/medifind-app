import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, 
  ScrollView, SafeAreaView, ActivityIndicator, Platform, StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, IP_SERVIDOR } from './ip';

const obtenerIniciales = (nombre) => {
  if (!nombre) return 'DR';
  const nombreLimpio = nombre.replace(/^(Dr\.|Dra\.)\s*/i, '').trim();
  const partes = nombreLimpio.split(' ');
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  if (partes.length === 1 && partes[0].length > 0) return partes[0][0].toUpperCase();
  return 'DR';
};

const generarColorHex = (texto) => {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = texto.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colores = ['#FF6B6B', '#4ECDC4', '#556270', '#C7F464', '#FF847C', '#C44D58', '#00A8C6', '#8C4646'];
  return colores[Math.abs(hash) % colores.length];
};

export default function HomeScreen({ navigation }) {
  const [doctores, setDoctores] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [especialidadActiva, setEspecialidadActiva] = useState(null);
  const [mostrarTodo, setMostrarTodo] = useState(false);
  const [badgeCitas, setBadgeCitas] = useState(0);       // ✅ Una sola vez, dentro del componente
  const [badgeMensajes, setBadgeMensajes] = useState(0); // ✅ Una sola vez, dentro del componente

  useEffect(() => {
    const inicializarHome = async () => {
      await cargarEspecialidades();
      await cargarDoctores();
      await actualizarBadges();
      setCargando(false);
    };
    inicializarHome();

    const intervalo = setInterval(actualizarBadges, 15000);
    return () => clearInterval(intervalo);
  }, []);

  const actualizarBadges = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      // Citas aceptadas (lo que le interesa al paciente)
      const resCitas = await fetch(`${API_URL}/app/mis-citas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const citas = await resCitas.json();
      const nuevas = Array.isArray(citas) ? citas.filter(c => c.estado === 'aceptada').length : 0;
      setBadgeCitas(nuevas);

      // Mensajes no leídos
      const resMsj = await fetch(`http://${IP_SERVIDOR}:8000/api/app/chat/mis-conversaciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const convs = await resMsj.json();
      const noLeidos = Array.isArray(convs)
        ? convs.reduce((sum, c) => sum + (c.no_leidos_paciente ?? 0), 0)
        : 0;
      setBadgeMensajes(noLeidos);

    } catch(e) { console.error('Error badges:', e); }
  };

  const corregirUrlFoto = (url) => {
    if (!url) return null;
    return url.trim().replace('localhost', IP_SERVIDOR).replace('127.0.0.1', IP_SERVIDOR);
  };

  const cargarEspecialidades = async () => {
    try {
      const res = await fetch(`${API_URL}/app/especialidades`);
      const data = await res.json();
      setEspecialidades(data);
    } catch (e) { console.error(e); }
  };

  const cargarDoctores = async (especialidadId = null, buscarNombre = '') => {
    setEspecialidadActiva(especialidadId);
    setCargando(true);
    try {
      let url = `${API_URL}/app/doctores?`;
      if (especialidadId) url += `especialidad_id=${especialidadId}&`;
      if (buscarNombre.trim() !== '') url += `nombre=${buscarNombre}`;
      const res = await fetch(url);
      const data = await res.json();
      setDoctores(data);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  const manejarBusqueda = (texto) => {
    setTextoBusqueda(texto);
    cargarDoctores(especialidadActiva, texto);
  };

  const especialidadesVisibles = mostrarTodo ? especialidades : especialidades.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollArea}>

        {/* Header con logo y botón chat */}
        <View style={styles.topBar}>
          <Image source={require('../assets/logo_medifind.png')} style={styles.logo} resizeMode="contain" />
          <TouchableOpacity style={styles.btnChat} onPress={() => navigation.navigate('Mensajes')}>
            <View style={{ position: 'relative' }}>
              <Ionicons name="chatbubbles-outline" size={26} color="#0066CC" />
              {badgeMensajes > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeMensajes > 9 ? '9+' : badgeMensajes}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#777777" />
            <TextInput
              style={styles.searchInput}
              placeholder="Busca por nombre o especialidad"
              value={textoBusqueda}
              onChangeText={manejarBusqueda}
            />
          </View>
        </View>

        {/* Especialidades */}
        <Text style={styles.sectionTitle}>Especialidades</Text>
        <View style={styles.cardEspecialidades}>
          <View style={styles.chipContainer}>
            <TouchableOpacity
              style={[styles.chip, especialidadActiva === null ? styles.chipActivo : styles.chipInactivo]}
              onPress={() => cargarDoctores(null, textoBusqueda)}
            >
              <Text style={especialidadActiva === null ? styles.chipTextActivo : styles.chipTextInactivo}>Todos</Text>
            </TouchableOpacity>

            {especialidadesVisibles.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.chip, especialidadActiva === item.id ? styles.chipActivo : styles.chipInactivo]}
                onPress={() => cargarDoctores(item.id, textoBusqueda)}
              >
                <Text style={especialidadActiva === item.id ? styles.chipTextActivo : styles.chipTextInactivo}>
                  {item.nombre}
                </Text>
              </TouchableOpacity>
            ))}

            {especialidades.length > 5 && (
              <TouchableOpacity style={[styles.chip, styles.chipExpandir]} onPress={() => setMostrarTodo(!mostrarTodo)}>
                <Text style={styles.chipTextExpandir}>{mostrarTodo ? "Ver menos" : "Ver mas"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Resultados */}
        <View style={styles.favoritesHeader}>
          <MaterialCommunityIcons name="heart" size={26} color="#FF5252" />
          <Text style={styles.favoritesTitle}>Resultados</Text>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 10, paddingBottom: 100 }}>
          {cargando ? (
            <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 30 }} />
          ) : doctores.length > 0 ? (
            doctores.map((doc) => (
              <TouchableOpacity
                key={`doc-img-${doc.id}-${mostrarTodo}`}
                style={styles.doctorCard}
                onPress={() => navigation.navigate('DoctorDetalle', { doctorId: doc.id })}
              >
                <View style={styles.doctorInfo}>
                  {doc.foto_url ? (
                    <Image
                      source={{ uri: `${corregirUrlFoto(doc.foto_url)}?t=${new Date().getTime()}`, headers: { Accept: 'image/*' } }}
                      style={styles.doctorImage}
                    />
                  ) : (
                    <View style={[styles.avatarLetras, { backgroundColor: generarColorHex(doc.nombre || 'A') }]}>
                      <Text style={styles.textoAvatar}>{obtenerIniciales(doc.nombre)}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.doctorName} numberOfLines={1} ellipsizeMode="tail">Dr. {doc.nombre}</Text>
                    <Text style={styles.doctorSpecialty} numberOfLines={1} ellipsizeMode="tail">
                      {doc.especialidad?.nombre || 'General'}
                    </Text>
                    {doc.calificacion_promedio > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={{ fontSize: 12, color: '#666', marginLeft: 3 }}>
                          {parseFloat(doc.calificacion_promedio).toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#0066CC" />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResultText}>No se encontraron resultados.</Text>
          )}
        </View>
      </ScrollView>

      {/* ✅ UN SOLO menú inferior con badges */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#0066CC" />
          <Text style={[styles.navText, { color: '#0066CC' }]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Citas')}>
          <View style={{ position: 'relative' }}>
            <Ionicons name="calendar-outline" size={24} color="#777777" />
            {badgeCitas > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeCitas > 9 ? '9+' : badgeCitas}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Citas</Text>
        </TouchableOpacity>

        
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Perfil')}>
          <Ionicons name="person-outline" size={24} color="#777777" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollArea: { flex: 1 },
  logo: { width: 150, height: 50 },
  searchContainer: { marginTop: 18, paddingHorizontal: 20 },
  searchInputContainer: { height: 50, backgroundColor: '#F3F4F6', borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
  sectionTitle: { fontSize: 16, marginLeft: 20, marginTop: 20, color: '#333', fontWeight: 'bold' },
  cardEspecialidades: { paddingHorizontal: 20, marginTop: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginBottom: 10, marginRight: 8, borderWidth: 1 },
  chipInactivo: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
  chipActivo: { backgroundColor: '#0066CC', borderColor: '#0066CC' },
  chipExpandir: { backgroundColor: '#FFF', borderColor: '#0066CC', borderStyle: 'dashed' },
  chipTextInactivo: { fontSize: 13, color: '#666' },
  chipTextActivo: { fontSize: 13, color: '#FFFFFF', fontWeight: 'bold' },
  chipTextExpandir: { fontSize: 13, color: '#0066CC', fontWeight: 'bold' },
  favoritesHeader: { flexDirection: 'row', alignItems: 'center', marginLeft: 20, marginTop: 10 },
  favoritesTitle: { fontSize: 26, fontWeight: 'bold', marginLeft: 10, color: '#2E2E2E' },
  doctorCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  doctorInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  doctorImage: { width: 55, height: 55, borderRadius: 28, marginRight: 15, backgroundColor: '#EEE' },
  avatarLetras: { width: 55, height: 55, borderRadius: 28, marginRight: 15, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  textoAvatar: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 20, marginTop: 20, marginRight: 20 },
  btnChat: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  doctorName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  doctorSpecialty: { fontSize: 14, color: '#0066CC' },
  noResultText: { textAlign: 'center', color: '#999', marginTop: 30 },
  bottomNavigation: { position: 'absolute', bottom: 0, width: '100%', height: 65, backgroundColor: '#FFFFFF', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#EEEEEE', justifyContent: 'space-around', alignItems: 'center' },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, marginTop: 4, color: '#777777' },
  badge: { position: 'absolute', top: -4, right: -8, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
});