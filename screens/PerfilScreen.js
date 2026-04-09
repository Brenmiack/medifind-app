import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert,
  ActivityIndicator,
  Image,
  Modal,      
  FlatList,
  Platform, 
  StatusBar,
  Linking // <-- 🌟 IMPORTAMOS LINKING PARA ABRIR EL CORREO
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './ip';


// Definimos la IP para que la función la pueda leer
const IP_SERVIDOR = '192.168.1.15'; 

export default function PerfilScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  // Estados para el Historial de Reseñas
  const [misResenas, setMisResenas] = useState([]);
  const [modalResenas, setModalResenas] = useState(false);
  const [cargandoResenas, setCargandoResenas] = useState(false);

  useEffect(() => {
    const recargarPantalla = navigation.addListener('focus', () => {
      obtenerDatosUsuario();
    });
    return recargarPantalla;
  }, [navigation]);

  const obtenerDatosUsuario = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuario(data);
      }
    } catch (error) {
      console.error("Error al obtener perfil:", error);
    } finally {
      setCargando(false);
    }
  };

  const abrirMisResenas = async () => {
    setModalResenas(true);
    setCargandoResenas(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://${IP_SERVIDOR}:8000/api/app/mis-resenas`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await response.json();
      if (response.ok) setMisResenas(data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar tus reseñas.");
    } finally {
      setCargandoResenas(false);
    }
  };

  // 🌟 NUEVA FUNCIÓN PARA ABRIR EL CORREO DE SOPORTE 🌟
  const contactarSoporte = () => {
    const email = "kineticaaaa@gmail.com";
    const subject = "Ayuda con la aplicación MediFind";
    const body = `Hola equipo de MediFind,\n\nEscribo desde la app móvil. Mi duda/problema es el siguiente:\n\n`;
    
    // mailto: abre la app de correo predeterminada del celular
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
      .catch((err) => {
        Alert.alert("Aviso", "No pudimos abrir tu aplicación de correo. Escríbenos a: " + email);
      });
  };

  const confirmarCerrarSesion = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir de tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar Sesión", style: "destructive", onPress: ejecutarCerrarSesion }
      ]
    );
  };

  const ejecutarCerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      Alert.alert("Error", "No se pudo cerrar la sesión.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.content}>
          {/* SECCIÓN AVATAR */}
          <View style={styles.profileCard}>
            {usuario?.foto_url ? (
              <Image source={{ uri: usuario.foto_url }} style={styles.avatarImagen} />
            ) : (
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={60} color="#0066CC" />
              </View>
            )}
            <Text style={styles.userName}>
              {usuario?.nombre ? `${usuario.nombre} ${usuario.paterno || ''}` : 'Paciente MediFind'}
            </Text>
            <Text style={styles.userEmail}>{usuario?.email || 'correo@ejemplo.com'}</Text>
            
            <TouchableOpacity 
              style={{ backgroundColor: '#0066CC', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginTop: 15, flexDirection: 'row', alignItems: 'center' }} 
              onPress={abrirMisResenas}
            >
              <Ionicons name="star" size={16} color="#FFF" style={{marginRight: 5}}/>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Ver Mis Reseñas</Text>
            </TouchableOpacity>
          </View>

          {/* OPCIONES DEL MENÚ */}
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditarPerfil')}>
              <Ionicons name="settings-outline" size={22} color="#555" />
              <Text style={styles.menuText}>Configuración de cuenta</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            {/* 🌟 CAMBIO 1: BOTÓN A TÉRMINOS 🌟 */}
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Terminos')}>
              <Ionicons name="document-text-outline" size={22} color="#555" />
              <Text style={styles.menuText}>Términos y Privacidad</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            {/* 🌟 CAMBIO 2: BOTÓN A SOPORTE POR CORREO 🌟 */}
            <TouchableOpacity style={styles.menuItem} onPress={contactarSoporte}>
              <Ionicons name="headset-outline" size={22} color="#555" />
              <Text style={styles.menuText}>Contactar Soporte</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { marginTop: 20, borderBottomWidth: 0 }]} onPress={confirmarCerrarSesion}>
              <Ionicons name="log-out-outline" size={22} color="#D32F2F" />
              <Text style={[styles.menuText, { color: '#D32F2F', fontWeight: 'bold' }]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MODAL DE HISTORIAL DE RESEÑAS (Se queda igual) */}
      <Modal visible={modalResenas} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleText}>Mis Reseñas</Text>
              <TouchableOpacity onPress={() => setModalResenas(false)}>
                <Ionicons name="close-circle" size={28} color="#777" />
              </TouchableOpacity>
            </View>

            {cargandoResenas ? (
              <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 50 }} />
            ) : (
              <FlatList
                data={misResenas}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>Aún no has escrito ninguna reseña.</Text>}
                renderItem={({ item }) => (
                  <View style={styles.resenaCard}>
                    <Text style={styles.resenaDoctorNombre}>Dr. {item.doctor?.nombre}</Text>
                    
                    <View style={styles.estrellasRow}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <Ionicons key={n} name={n <= item.estrellas ? "star" : "star-outline"} size={16} color="#FFD700" />
                      ))}
                    </View>
                    
                    <Text style={styles.resenaComentario}>"{item.comentario}"</Text>

                    {item.respuesta ? (
                      <View style={styles.respuestaContainer}>
                        <Text style={styles.respuestaTitulo}>Respuesta del doctor:</Text>
                        <Text style={styles.respuestaTexto}>{item.respuesta}</Text>
                      </View>
                    ) : (
                      <Text style={styles.sinRespuesta}>El doctor aún no ha respondido.</Text>
                    )}
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* BARRA DE NAVEGACIÓN (Se queda igual) */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={24} color="#777777" />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Citas')}>
          <Ionicons name="calendar-outline" size={24} color="#777777" />
          <Text style={styles.navText}>Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="#0066CC" />
          <Text style={[styles.navText, { color: '#0066CC' }]}>Perfil</Text>
        </TouchableOpacity>
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
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  content: { flex: 1, padding: 20 },
  profileCard: { alignItems: 'center', backgroundColor: '#FFF', padding: 25, borderRadius: 20, elevation: 2, marginBottom: 30 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarImagen: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#777', marginTop: 5 },
  menuContainer: { backgroundColor: '#FFF', borderRadius: 15, padding: 10, elevation: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#444' },
  bottomNavigation: { height: 70, backgroundColor: '#FFFFFF', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0F0F0', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 5 },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 12, marginTop: 4, color: '#777' },
  
  // Estilos del Modal de Reseñas
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', height: '80%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
  modalTitleText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
  resenaCard: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' },
  resenaDoctorNombre: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  estrellasRow: { flexDirection: 'row', marginVertical: 5 },
  resenaComentario: { color: '#555', marginBottom: 10, fontStyle: 'italic' },
  respuestaContainer: { backgroundColor: '#E3F2FD', padding: 10, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#0066CC' },
  respuestaTitulo: { fontSize: 12, fontWeight: 'bold', color: '#0066CC' },
  respuestaTexto: { fontSize: 13, color: '#333', marginTop: 2 },
  sinRespuesta: { fontSize: 12, color: '#999' }
});