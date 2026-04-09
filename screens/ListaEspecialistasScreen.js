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

export default function ListaEspecialistasScreen({ navigation }) {
  
  // -- LÓGICA TRADUCIDA DE KOTLIN --

  const regresarHome = () => {
    // Equivale al intent a HomeActivity y el finish()
    navigation.navigate('Home');
  };

  const verPerfilDoctor = () => {
    // Equivale al intent a PerfilEspecialistaActivity
    navigation.navigate('PerfilEspecialista');
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* CABECERA (Flecha, Logo y Título) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={regresarHome} style={styles.backButton}>
          {/* Usamos un ícono nativo en lugar de buscar la imagen "salir" */}
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        
        <Image 
          source={require('../assets/logo_medifind.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.tituloEspecialistas}>Lista de especialistas</Text>

      {/* CONTENEDOR DE DOCTORES */}
      <ScrollView style={styles.listaDoctores} contentContainerStyle={{ paddingBottom: 20 }}>
        
        {/* CARD DOCTOR 1 */}
        <TouchableOpacity style={styles.cardDoctor} onPress={verPerfilDoctor} activeOpacity={0.8}>
          <View style={styles.cardContent}>
            
            {/* Si no tienes la imagen pers.png, puedes descomentar el ícono de abajo */}
            <Image source={require('../assets/pers.png')} style={styles.fotoDoctor} />
            {/* <Ionicons name="person-circle" size={50} color="#ccc" /> */}

            <View style={styles.infoDoctor}>
              <Text style={styles.nombreDoctor}>Dr. Alejandro Suarez</Text>
              <Text style={styles.especialidadDoctor}>Pediatría</Text>
              <Text style={styles.ratingDoctor}>⭐ 4.8 (10)</Text>
            </View>

            {/* Ícono de corazón (Favoritos) */}
            <Ionicons name="heart-outline" size={24} color="#FF5252" style={styles.corazon} />
          </View>
        </TouchableOpacity>

        {/* CARD DOCTOR 2 */}
        <TouchableOpacity style={styles.cardDoctor} onPress={verPerfilDoctor} activeOpacity={0.8}>
          <View style={styles.cardContent}>
            
            <Image source={require('../assets/pers.png')} style={styles.fotoDoctor} />

            <View style={styles.infoDoctor}>
              <Text style={styles.nombreDoctor}>Dra. Susana Zabaleta</Text>
              <Text style={styles.especialidadDoctor}>Pediatría</Text>
              <Text style={styles.ratingDoctor}>⭐ 4.9 (5)</Text>
            </View>
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* BOTTOM NAVIGATION (Idéntico al de HomeScreen) */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={regresarHome}>
          <Ionicons name="home" size={24} color="#0066CC" />
          <Text style={[styles.navText, { color: '#0066CC' }]}>Inicio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar-outline" size={24} color="#777777" />
          <Text style={styles.navText}>Citas</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Perfil')}>
        <Ionicons name="person-outline" size={24} color="#777777" />
        <Text style={styles.navText}>Perfil</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 5,
  },
  logo: {
    width: 150,
    height: 50,
    marginLeft: 10,
  },
  tituloEspecialistas: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: '#333',
  },
  listaDoctores: {
    flex: 1,
    padding: 16,
    marginTop: 10,
  },
  cardDoctor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    // Sombras para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // Sombras para Android (Equivale a app:cardElevation="8dp")
    elevation: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  fotoDoctor: {
    width: 50,
    height: 50,
    borderRadius: 25, // Para hacerla circular si es cuadrada
  },
  infoDoctor: {
    flex: 1,
    paddingLeft: 12,
  },
  nombreDoctor: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E2E2E',
  },
  especialidadDoctor: {
    fontSize: 13,
    color: '#6F7C8E',
    marginTop: 2,
  },
  ratingDoctor: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  corazon: {
    marginLeft: 10,
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