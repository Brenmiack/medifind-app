import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FiltroModal({ navigation }) {
  
  // Estados para guardar los filtros seleccionados
  const [horario, setHorario] = useState(null); // 'Mañana', 'Tarde', 'Noche'
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [citaPrevia, setCitaPrevia] = useState(false);

  const aplicarFiltros = () => {
    // Aquí en el futuro se enviarán los datos a la base de datos
    // Por ahora, solo cerramos el modal y regresamos al Home
    navigation.goBack();
  };

  return (
    // KeyboardAvoidingView ayuda a que el teclado no tape los inputs de precio
    <KeyboardAvoidingView 
      style={styles.fondoOscuro} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Al tocar el fondo oscuro, también se cierra el modal */}
      <TouchableOpacity 
        style={styles.areaCierre} 
        activeOpacity={1} 
        onPress={() => navigation.goBack()} 
      />

      {/* CONTENEDOR DEL MENÚ BLANCO (BOTTOM SHEET) */}
      <View style={styles.bottomSheet}>
        
        {/* BOTÓN CERRAR (X) */}
        <TouchableOpacity style={styles.btnCerrar} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>

        <Image source={require('../assets/logo1.png')} style={styles.logo} />

        <Text style={styles.tituloSecundario}>Buscar por filtrado</Text>

        {/* SECCIÓN: HORARIOS */}
        <Text style={styles.label}>Horarios</Text>
        <View style={styles.chipGroup}>
          {['Mañana', 'Tarde', 'Noche'].map((opcion) => (
            <TouchableOpacity 
              key={opcion}
              style={[styles.chip, horario === opcion && styles.chipActivo]}
              onPress={() => setHorario(opcion)}
            >
              <Text style={[styles.chipText, horario === opcion && styles.chipTextActivo]}>
                {opcion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SECCIÓN: PRECIO */}
        <Text style={styles.label}>Precio de consulta</Text>
        <View style={styles.filaPrecios}>
          <TextInput 
            style={styles.inputPrecio} 
            placeholder="Precio mínimo" 
            keyboardType="numeric"
            value={precioMin}
            onChangeText={setPrecioMin}
          />
          <TextInput 
            style={[styles.inputPrecio, { marginLeft: 10 }]} 
            placeholder="Precio máximo" 
            keyboardType="numeric"
            value={precioMax}
            onChangeText={setPrecioMax}
          />
        </View>

        {/* SECCIÓN: CHECKBOX */}
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setCitaPrevia(!citaPrevia)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, citaPrevia && styles.checkboxActivo]}>
            {citaPrevia && <Text style={styles.palomita}>✓</Text>}
          </View>
          <Text style={styles.checkboxTexto}>
            Solo especialistas con cita previa
          </Text>
        </TouchableOpacity>

        {/* BOTÓN APLICAR */}
        <TouchableOpacity style={styles.btnAplicar} onPress={aplicarFiltros}>
          <Text style={styles.txtBtnAplicar}>Aplicar filtros</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fondoOscuro: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Fondo negro semi-transparente
    justifyContent: 'flex-end', // Empuja el contenido hacia abajo
  },
  areaCierre: {
    flex: 1, // Ocupa todo el espacio de arriba para que al tocarlo se cierre
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    // Sombra hacia arriba
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  btnCerrar: {
    alignSelf: 'flex-end',
  },
  logo: {
    width: 40,
    height: 40,
    marginTop: -10,
  },
  tituloSecundario: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  chipGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActivo: {
    backgroundColor: '#E8F1F8',
    borderColor: '#0066CC',
  },
  chipText: {
    fontSize: 14,
    color: '#777777',
  },
  chipTextActivo: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  filaPrecios: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputPrecio: {
    flex: 1,
    height: 45,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#777777',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActivo: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  palomita: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxTexto: {
    fontSize: 15,
    color: '#333',
  },
  btnAplicar: {
    width: '100%',
    height: 50,
    backgroundColor: '#1A0D5A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
  },
  txtBtnAplicar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});