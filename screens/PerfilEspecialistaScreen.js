import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  SafeAreaView,
  Linking // <-- ¡Nueva herramienta para abrir apps externas!
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function PerfilEspecialistaScreen({ navigation }) {
  
  const [tabActiva, setTabActiva] = useState('Información');

  // --- LÓGICA TRADUCIDA DEL KOTLIN ---

  const regresar = () => navigation.goBack();
  const regresarHome = () => navigation.navigate('Home');

  // TELEFONO
  const llamarTelefono = () => {
    Linking.openURL('tel:2381234567');
  };

  // WHATSAPP
  const abrirWhatsapp = () => {
    const numero = "5212381234567";
    Linking.openURL(`https://wa.me/${numero}`);
  };

  // MENSAJES (Navega a la pantalla de chat interna)
  const abrirMensajes = () => {
    navigation.navigate('Mensajes');
  };

  // SOLICITAR CITA (Navega a la pantalla de agendar)
  const agendarCita = () => {
    navigation.navigate('AgendarCita');
  };

  // -----------------------------------

  const renderizarContenidoTab = () => {
    switch(tabActiva) {
      case 'Información':
        return <Text style={styles.textoTab}>Aquí va la información general, experiencia y formación del doctor.</Text>;
      case 'Servicios':
        return <Text style={styles.textoTab}>Lista de servicios: Consulta general, Ultrasonido, Vacunación, etc.</Text>;
      case 'Reseñas':
        return <Text style={styles.textoTab}>Sistema de reseñas: "Excelente atención", "Muy puntual" - ⭐⭐⭐⭐⭐</Text>;
      case 'Galería':
        return <Text style={styles.textoTab}>Fotos del consultorio y equipo médico.</Text>;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollArea}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={regresar} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Image 
            source={require('../assets/logo_medifind.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.perfilContainer}>
          <Text style={styles.titulo}>Perfil médico</Text>

          <Image 
            source={require('../assets/pers.png')} 
            style={styles.fotoDoctor} 
          />

          <Text style={styles.nombreDoctor}>Dr. Alejandro Suarez Gutierrez</Text>
          <Text style={styles.especialidad}>Pediatría</Text>
          <Text style={styles.cedula}>Cédula profesional: 78788745</Text>
        </View>

        {/* BOTONES DE CONTACTO CONECTADOS */}
        <View style={styles.botonesContacto}>
          <TouchableOpacity style={styles.btnContactoSecundario} onPress={llamarTelefono}>
            <Ionicons name="call" size={16} color="#333" />
            <Text style={styles.txtBtnContacto}>Teléfono</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnContactoSecundario} onPress={abrirWhatsapp}>
            <FontAwesome5 name="whatsapp" size={16} color="#25D366" />
            <Text style={styles.txtBtnContacto}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnContactoSecundario} onPress={abrirMensajes}>
            <Ionicons name="chatbubble" size={16} color="#333" />
            <Text style={styles.txtBtnContacto}>Mensajes</Text>
          </TouchableOpacity>
        </View>

        {/* BOTÓN SOLICITAR CITA CONECTADO */}
        <View style={styles.contenedorCita}>
          <TouchableOpacity style={styles.btnCita} onPress={agendarCita}>
            <Text style={styles.txtBtnCita}>Solicitar cita</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabLayout}>
          {['Información', 'Servicios', 'Reseñas', 'Galería'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabItem, tabActiva === tab && styles.tabItemActivo]}
              onPress={() => setTabActiva(tab)}
            >
              <Text style={[styles.tabText, tabActiva === tab && styles.tabTextActivo]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contenidoTabs}>
          {renderizarContenidoTab()}
        </View>

      </ScrollView>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={regresarHome}>
          <Ionicons name="home" size={24} color="#0066CC" />
          <Text style={[styles.navText, { color: '#0066CC' }]}>Inicio</Text>
        </TouchableOpacity>
        

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Perfil')}>
        <Ionicons name="person-outline" size={24} color="#777777" />
        <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar-outline" size={24} color="#777777" />
          <Text style={styles.navText}>Citas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#777777" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingHorizontal: 16 },
  backButton: { marginRight: 10 },
  logo: { width: 150, height: 50 },
  perfilContainer: { alignItems: 'center', marginTop: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  fotoDoctor: { width: 110, height: 110, borderRadius: 55, marginTop: 12 },
  nombreDoctor: { fontSize: 16, fontWeight: 'bold', marginTop: 12, color: '#2E2E2E' },
  especialidad: { fontSize: 14, color: '#6F7C8E', marginTop: 4 },
  cedula: { fontSize: 13, color: '#9E9E9E', marginTop: 4 },
  botonesContacto: { flexDirection: 'row', justifyContent: 'center', marginTop: 14, paddingHorizontal: 10 },
  btnContactoSecundario: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginHorizontal: 4 },
  txtBtnContacto: { marginLeft: 6, fontSize: 13, color: '#333', fontWeight: '500' },
  contenedorCita: { alignItems: 'center', marginTop: 15 },
  btnCita: { width: 200, height: 45, backgroundColor: '#1A0D5A', justifyContent: 'center', alignItems: 'center', borderRadius: 22.5 },
  txtBtnCita: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  tabLayout: { flexDirection: 'row', marginTop: 20, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActivo: { borderBottomColor: '#1A0D5A' },
  tabText: { color: '#777777', fontSize: 14, fontWeight: '500' },
  tabTextActivo: { color: '#1A0D5A', fontWeight: 'bold' },
  contenidoTabs: { padding: 16, minHeight: 150 },
  textoTab: { fontSize: 15, color: '#6F7C8E', lineHeight: 22 },
  bottomNavigation: { height: 65, backgroundColor: '#FFFFFF', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#EEEEEE', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 5 },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 12, marginTop: 4, color: '#777777' }
});