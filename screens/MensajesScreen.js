import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MensajesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* CABECERA CON BOTÓN DE REGRESO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mensajes</Text>
        <View style={{ width: 28 }} /> {/* Espaciador para centrar el título */}
      </View>

      {/* CONTENIDO CENTRADO (Equivalente a tu LinearLayout con gravity="center") */}
      <View style={styles.content}>
        <Ionicons name="chatbubbles-outline" size={80} color="#E0E0E0" style={styles.icono} />
        <Text style={styles.titulo}>Pantalla de mensajes</Text>
        <Text style={styles.subtitulo}>Aún no tienes mensajes con este especialista. Envía un saludo para comenzar.</Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  icono: {
    marginBottom: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 15,
    color: '#9E9E9E',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  }
});