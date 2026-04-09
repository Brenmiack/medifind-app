import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TerminosScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Términos y Privacidad</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.fecha}>Última actualización: Abril 2026</Text>

        <Text style={styles.parrafo}>
          Bienvenido a MediFind. Al registrarte y utilizar nuestra aplicación, aceptas los siguientes términos de servicio y políticas de privacidad. Lee detenidamente.
        </Text>

        <Text style={styles.subtitulo}>1. Recopilación de Datos</Text>
        <Text style={styles.parrafo}>
          Para brindarte un servicio óptimo, MediFind recopila información básica de identificación (nombre, correo electrónico, teléfono) y datos relacionados con tu uso de la plataforma, como tu historial de citas médicas y los especialistas que consultas.
        </Text>

        <Text style={styles.subtitulo}>2. Uso de la Información y Minería de Datos</Text>
        <Text style={styles.parrafo}>
          En MediFind aplicamos técnicas de análisis y minería de datos de forma anónima para mejorar tu experiencia. Analizamos las tendencias de búsqueda (ej. especialidades más buscadas) y el historial de citas para optimizar nuestro algoritmo. Esto nos permite recomendarte a los especialistas mejor calificados y más relevantes según tus necesidades previas, mejorando el ecosistema de salud digital.
        </Text>

        <Text style={styles.subtitulo}>3. Geolocalización</Text>
        <Text style={styles.parrafo}>
          La aplicación solicita acceso a servicios de mapas y ubicación exclusivamente para calcular rutas y mostrarte la ubicación exacta del consultorio del especialista. MediFind no rastrea tu ubicación en segundo plano.
        </Text>

        <Text style={styles.subtitulo}>4. Reseñas y Comportamiento del Usuario</Text>
        <Text style={styles.parrafo}>
          Al calificar a un médico tras una cita completada, aceptas que tu puntuación y comentario sean públicos dentro de la plataforma. MediFind se reserva el derecho de eliminar comentarios que contengan lenguaje ofensivo o inapropiado.
        </Text>

        <Text style={styles.subtitulo}>5. Seguridad de la Cuenta</Text>
        <Text style={styles.parrafo}>
          Tus contraseñas son encriptadas mediante algoritmos de seguridad estándar (Hashing) antes de ser almacenadas en nuestras bases de datos. El acceso a la información viaja mediante tokens seguros. Eres responsable de mantener la confidencialidad de tus credenciales de acceso.
        </Text>

        <TouchableOpacity style={styles.btnEntendido} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Entendido</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEEEEE', backgroundColor: '#FFFFFF' },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scrollView: { flex: 1, backgroundColor: '#F9F9F9' },
  content: { padding: 20, paddingBottom: 40 },
  fecha: { fontSize: 13, color: '#888', marginBottom: 20, fontStyle: 'italic', textAlign: 'right' },
  subtitulo: { fontSize: 18, fontWeight: 'bold', color: '#1A0D5A', marginTop: 20, marginBottom: 10 },
  parrafo: { fontSize: 15, color: '#444', lineHeight: 24, textAlign: 'justify' },
  btnEntendido: { backgroundColor: '#0066CC', paddingVertical: 15, borderRadius: 25, alignItems: 'center', marginTop: 40 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});