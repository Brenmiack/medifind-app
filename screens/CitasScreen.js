import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView,
  Alert, ActivityIndicator, FlatList, RefreshControl, Modal, TextInput, Platform, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, IP_SERVIDOR } from './ip';

const corregirUrlFoto = (url) => {
  if (!url) return null;
  return url.trim().replace('localhost', IP_SERVIDOR).replace('127.0.0.1', IP_SERVIDOR);
};

export default function CitasScreen({ navigation }) {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [pestañaActiva, setPestañaActiva] = useState('proximas'); 

  // Estados para el sistema de Reseñas
  const [modalResena, setModalResena] = useState(false);
  const [doctorAcalificar, setDoctorAcalificar] = useState(null);
  const [citaIdActual, setCitaIdActual] = useState(null); 
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviandoResena, setEnviandoResena] = useState(false);

  useEffect(() => {
    obtenerCitas();
  }, []);

  const confirmarCancelacion = (id) => {
    Alert.alert(
      "Cancelar Cita",
      "¿Estás seguro de que deseas cancelar esta cita?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Sí, cancelar", 
          style: "destructive", 
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              // 🌟 CORREGIDO: Usando API_URL
              const response = await fetch(`${API_URL}/app/cancelar-cita/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
              });
              if (response.ok) {
                Alert.alert("Éxito", "Cita cancelada.");
                obtenerCitas();
              }
            } catch (e) { Alert.alert("Error", "No se pudo conectar."); }
          } 
        }
      ]
    );
  };
  
  const obtenerCitas = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // 🌟 CORREGIDO: Usando API_URL
      const response = await fetch(`${API_URL}/app/mis-citas`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await response.json();
      if (response.ok) setCitas(data);
    } catch (error) {
      console.error("Error al obtener citas:", error);
    } finally {
      setCargando(false);
    }
  };

  const alRefrescar = async () => {
    setRefrescando(true);
    await obtenerCitas();
    setRefrescando(false);
  };

  // --- LÓGICA DE FILTRADO (PRÓXIMAS VS HISTORIAL) ---
  const obtenerCitasFiltradas = () => {
    return citas.filter(cita => {
      const estadoActual = cita.estado?.toLowerCase();
      if (pestañaActiva === 'proximas') {
        return estadoActual === 'pendiente' || estadoActual === 'aceptada';
      } else {
        return estadoActual === 'completada' || estadoActual === 'cancelada';
      }
    });
  };

  // --- FUNCIONES DE RESEÑAS ---
  const abrirModalCalificacion = (cita) => {
    setDoctorAcalificar(cita.doctor);
    setCitaIdActual(cita.id); 
    setEstrellas(0);
    setComentario('');
    setModalResena(true);
  };

  const enviarResena = async () => {
    if (estrellas === 0) return Alert.alert('Aviso', 'Selecciona estrellas.');
    if (comentario.trim() === '') return Alert.alert('Aviso', 'Escribe un comentario.');

    setEnviandoResena(true);
    try {
      const token = await AsyncStorage.getItem('token');
      // 🌟 CORREGIDO: Usando API_URL
      const response = await fetch(`${API_URL}/app/resenas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: doctorAcalificar.id,
          cita_id: citaIdActual,
          estrellas: estrellas,
          comentario: comentario
        })
      });

      if (response.ok) {
        Alert.alert('¡Éxito!', 'Gracias por calificar.');
        setModalResena(false);
        obtenerCitas(); 
      } else {
        const errorData = await response.json();
        Alert.alert('Error', JSON.stringify(errorData));
      }
    } catch (error) {
      Alert.alert('Error', 'Problema de conexión.');
    } finally {
      setEnviandoResena(false);
    }
  };

  const renderCita = ({ item }) => {
    const coloresEstado = {
      pendiente: { bg: '#FFF3E0', txt: '#FF9800', label: 'Pendiente' },
      aceptada:  { bg: '#E8F5E9', txt: '#4CAF50', label: 'Aceptada' },
      cancelada: { bg: '#FFEBEE', txt: '#F44336', label: 'Cancelada' },
      completada:{ bg: '#E3F2FD', txt: '#2196F3', label: 'Completada' }
    };
    
    const estadoLimpio = item.estado?.toLowerCase();
    const estiloActual = coloresEstado[estadoLimpio] || coloresEstado.pendiente;

    return (
      <View style={styles.card}>
        <Image 
          source={ item.doctor?.foto_url ? { uri: `${corregirUrlFoto(item.doctor.foto_url)}?t=${new Date().getTime()}`, headers: { Accept: 'image/*' } } : require('../assets/pers.png') } 
          style={styles.imagenDoctor}
        />
        <View style={styles.infoDoctor}>
          <View style={styles.filaTop}>
            <Text style={styles.nombreDoctor} numberOfLines={1}>Dr. {item.doctor?.nombre || 'No disponible'}</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                style={{ marginRight: 12, padding: 2 }}
                onPress={() => navigation.navigate('Chat', { 
                  doctorId: item.doctor.id, 
                  doctorNombre: item.doctor.nombre,
                  doctorFoto: item.doctor.foto_url
                })}
              >
                <Ionicons name="chatbubbles" size={22} color="#0066CC" />
              </TouchableOpacity>

              <View style={[styles.badge, { backgroundColor: estiloActual.bg }]}>
                <Text style={[styles.badgeText, { color: estiloActual.txt }]}>{estiloActual.label}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.textoDetalle}>{item.fecha} - {item.hora.substring(0, 5)}</Text>
          <Text style={{color: 'red', fontSize: 10}}>Estado: {item.estado} | Reseña: {item.tiene_resena}</Text>

          <View style={{ marginTop: 10 }}>
            {item.estado?.toLowerCase() === 'completada' && (item.tiene_resena == 0 || item.tiene_resena == null) && (
              <TouchableOpacity 
                style={styles.btnCalificar} 
                onPress={() => abrirModalCalificacion(item)}
              >
                <Ionicons name="star" size={14} color="#FFF" style={{marginRight: 4}} />
                <Text style={styles.textoBtnCalificar}>Calificar Consulta</Text>
              </TouchableOpacity>
            )}

            {item.tiene_resena == 1 && item.estado?.toLowerCase() === 'completada' && (
              <View style={styles.badgeResenaOk}>
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                <Text style={styles.textoResenaOk}> Ya calificada</Text>
              </View>
            )}

            {(item.estado?.toLowerCase() === 'pendiente' || item.estado?.toLowerCase() === 'aceptada') && (
              <TouchableOpacity style={styles.btnCancelar} onPress={() => confirmarCancelacion(item.id)}>
                <Text style={styles.textoBtnCancelar}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.headerRow}>
          <Text style={styles.titulo}>Mis Citas</Text>
          <Image source={require('../assets/logo_medifind.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, pestañaActiva === 'proximas' && styles.tabActivo]} onPress={() => setPestañaActiva('proximas')}>
            <Text style={[styles.tabText, pestañaActiva === 'proximas' && styles.tabTextActivo]}>Próximas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, pestañaActiva === 'historial' && styles.tabActivo]} onPress={() => setPestañaActiva('historial')}>
            <Text style={[styles.tabText, pestañaActiva === 'historial' && styles.tabTextActivo]}>Historial</Text>
          </TouchableOpacity>
        </View>

        {cargando ? (
          <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={obtenerCitasFiltradas()}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCita}
            refreshControl={<RefreshControl refreshing={refrescando} onRefresh={alRefrescar} colors={['#0066CC']} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name={pestañaActiva === 'proximas' ? "calendar-clear-outline" : "folder-open-outline"} 
                  size={70} 
                  color="#cbd5e1" 
                />
                <Text style={styles.emptyTitle}>
                  {pestañaActiva === 'proximas' ? 'Sin citas próximas' : 'Historial vacío'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {pestañaActiva === 'proximas' 
                    ? 'Aún no tienes citas agendadas. Busca un doctor y agenda tu primera consulta.' 
                    : 'Aquí aparecerán tus citas completadas y canceladas.'}
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      <Modal visible={modalResena} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Califica al Dr. {doctorAcalificar?.nombre}</Text>
            <View style={styles.starsContainer}>
              {[1,2,3,4,5].map(n => (
                <TouchableOpacity key={n} onPress={() => setEstrellas(n)}>
                  <Ionicons name={n <= estrellas ? "star" : "star-outline"} size={40} color="#FFD700" />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.inputComentario} placeholder="Tu opinión..." multiline value={comentario} onChangeText={setComentario} />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalResena(false)}><Text style={styles.txtCerrarModal}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnEnviarResena} onPress={enviarResena} disabled={enviandoResena}>
                {enviandoResena ? <ActivityIndicator color="#FFF" /> : <Text style={styles.txtEnviarResena}>Enviar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}><Ionicons name="home-outline" size={24} color="#777" /><Text style={styles.navText}>Inicio</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Ionicons name="calendar" size={24} color="#0066CC" /><Text style={[styles.navText, { color: '#0066CC' }]}>Citas</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Perfil')}><Ionicons name="person-outline" size={24} color="#777" /><Text style={styles.navText}>Perfil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  mainContent: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  titulo: { fontSize: 26, fontWeight: 'bold' },
  logo: { width: 100, height: 40 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 5, marginBottom: 15 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActivo: { backgroundColor: '#FFF', elevation: 2 },
  tabText: { fontSize: 14, color: '#777', fontWeight: 'bold' },
  tabTextActivo: { color: '#0066CC' },
  card: { backgroundColor: '#FFF', flexDirection: 'row', padding: 12, borderRadius: 12, elevation: 3, marginBottom: 15, borderWidth: 1, borderColor: '#F0F0F0' },
  imagenDoctor: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEE' },
  infoDoctor: { flex: 1, marginLeft: 15 },
  filaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nombreDoctor: { fontSize: 15, fontWeight: 'bold' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  textoDetalle: { fontSize: 12, color: '#666' },
  btnCalificar: { backgroundColor: '#FF9800', flexDirection: 'row', padding: 8, borderRadius: 8, alignSelf: 'flex-start', alignItems: 'center' },
  textoBtnCalificar: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  badgeResenaOk: { flexDirection: 'row', alignItems: 'center' },
  textoResenaOk: { color: '#4CAF50', fontWeight: 'bold', fontSize: 12 },
  btnCancelar: { backgroundColor: '#D32F2F', padding: 8, borderRadius: 8, alignSelf: 'flex-start' },
  textoBtnCancelar: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFF', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  inputComentario: { backgroundColor: '#F3F4F6', borderRadius: 10, padding: 15, height: 100, textAlignVertical: 'top', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btnEnviarResena: { backgroundColor: '#0066CC', padding: 12, borderRadius: 10, width: '60%', alignItems: 'center' },
  txtEnviarResena: { color: '#FFF', fontWeight: 'bold' },
  txtCerrarModal: { color: '#777', fontWeight: 'bold' },
  bottomNavigation: { height: 70, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#EEE', justifyContent: 'space-around', alignItems: 'center' },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#777' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  }
});