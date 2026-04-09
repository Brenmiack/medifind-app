import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HistorialCitasScreen({ navigation }) {

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* LOGO */}
        <Image 
          source={require('../assets/logo_medifind.png')} 
          style={styles.logo}
          resizeMode="contain"
        />

        {/* TÍTULO */}
        <Text style={styles.titulo}>Historial de Citas</Text>

        {/* CARD DE LA CITA (Sin botón de cancelar) */}
        <View style={styles.card}>
          
          <Image 
            source={require('../assets/pers.png')} 
            style={styles.imagenDoctor}
          />

          <View style={styles.infoDoctor}>
            <Text style={styles.nombreDoctor}>Dr. Alejandro Suarez Gutierrez</Text>
            <Text style={styles.textoDetalle}>23 enero 2026 - 18:00</Text>
            <Text style={styles.textoDetalle}>Tehuacán, Puebla</Text>
          </View>

        </View>

      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={24} color="#777777" />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        
        {/* Aquí lo dejamos inactivo para que el usuario pueda volver a su agenda actual de Citas */}
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Citas')}>
          <Ionicons name="calendar-outline" size={24} color="#777777" />
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },
  scrollContent: {
    padding: 16,
  },
  logo: {
    width: 140,
    height: 45,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 10,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    // Sombra para Android
    elevation: 6,
    marginBottom: 15,
  },
  imagenDoctor: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  infoDoctor: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nombreDoctor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  textoDetalle: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 2,
  },
  bottomNavigation: {
    height: 65,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#777777',
  }
});