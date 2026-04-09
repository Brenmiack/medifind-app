import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, TextInput, Alert, Modal,
  KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './ip';


LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

const formatearFechaLocal = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function AgendarCitaScreen({ route, navigation }) {
  
  const { doctorId, horarios, nombreDoctor, citasOcupadas = [] } = route.params;

  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [bloquesDeHoras, setBloquesDeHoras] = useState([]);
  const [mensajeVacio, setMensajeVacio] = useState('Selecciona una fecha arriba.');
  
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const fechaHoy = new Date();
  const minDateStr = formatearFechaLocal(fechaHoy);
  
  const fechaMax = new Date();
  fechaMax.setFullYear(fechaMax.getFullYear() + 1); 
  const maxDateStr = formatearFechaLocal(fechaMax);

  const generarFechas = () => {
    const lista = [];
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      lista.push({
        label: `${dias[d.getDay()]} ${d.getDate()}`,
        value: formatearFechaLocal(d) 
      });
    }
    return lista;
  };

  const fechas = generarFechas();

  useEffect(() => {
    if (fechaSeleccionada) {
      actualizarHorarios();
    }
  }, [fechaSeleccionada]);

  const actualizarHorarios = () => {
    const listaFinal = [];
    const hoyStr = formatearFechaLocal(new Date());
    const ahora = new Date();

    const [year, month, day] = fechaSeleccionada.split('-');
    const fechaObj = new Date(year, month - 1, day);
    
    const diasCompletos = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const diaNombre = diasCompletos[fechaObj.getDay()];

    const horarioDia = horarios.find(h => h.dia === diaNombre);

    if (!horarioDia) {
      setBloquesDeHoras([]);
      setMensajeVacio(`El Dr. ${nombreDoctor} no da consultas los días ${diaNombre}.`);
      return;
    }

    const citasDelDia = citasOcupadas.filter(cita => cita.fecha === fechaSeleccionada);
    const horasTomadas = citasDelDia.map(cita => cita.hora.substring(0, 5));

    const [horaInicio, minInicio] = horarioDia.hora_inicio.split(':');
    const [horaFin, minFin] = horarioDia.hora_fin.split(':');

    let actual = new Date(year, month - 1, day, parseInt(horaInicio), parseInt(minInicio), 0);
    const fin = new Date(year, month - 1, day, parseInt(horaFin), parseInt(minFin), 0);
    
    const duracion = 60; 

    while (actual < fin) {
      const h = actual.getHours().toString().padStart(2, '0');
      const m = actual.getMinutes().toString().padStart(2, '0');
      const horaStr = `${h}:${m}`;
      
      let estaLibre = !horasTomadas.includes(horaStr);
      let cumpleTiempo = true;

      // 🛠️ ARREGLO: Solo aplicamos la regla de las 3 horas si la cita ES HOY.
      if (fechaSeleccionada === hoyStr) {
        // Comparamos la hora actual con la hora de la cita
        const horaCitaObj = new Date();
        horaCitaObj.setHours(parseInt(h), parseInt(m), 0, 0);
        
        const diffEnMilisegundos = horaCitaObj - ahora;
        const diffEnHoras = diffEnMilisegundos / (1000 * 60 * 60);
        
        // Si la cita es hoy, debe faltar al menos 3 horas para que se muestre
        cumpleTiempo = diffEnHoras >= 3;
      }

      if (cumpleTiempo && estaLibre) {
        listaFinal.push(horaStr);
      }
      
      actual.setMinutes(actual.getMinutes() + duracion);
    }

    if (listaFinal.length === 0) {
      setMensajeVacio("Ya no hay horarios disponibles para este día (fuera de tiempo o agenda llena).");
    }

    setBloquesDeHoras(listaFinal);
    setHoraSeleccionada(null); 
  };

  const confirmarCita = () => {
    if (!fechaSeleccionada || !horaSeleccionada) {
      Alert.alert('Aviso', 'Selecciona fecha y hora');
      return;
    }

    Alert.alert(
      'Confirmar Cita', 
      `¿Agendar con Dr. ${nombreDoctor} el ${fechaSeleccionada} a las ${horaSeleccionada}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token'); 

              const response = await fetch(`${API_URL}/app/citas`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                  doctor_id: doctorId,
                  fecha: fechaSeleccionada,
                  hora: horaSeleccionada,
                  notas: motivo 
                })
              });

              const text = await response.text();
              
              try {
                const data = JSON.parse(text);
                if (response.ok) {
                  Alert.alert("¡Éxito!", "¡Listo! Tu cita ha sido confirmada.");
                  navigation.navigate('Home');
                } else {
                  Alert.alert("Ups", data.mensaje || "No se pudo agendar la cita.");
                }
              } catch(e) {
                console.log("Error de Laravel:", text);
                Alert.alert("Error del servidor", "Laravel se quejó. Revisa la terminal.");
              }

            } catch (error) {
              console.error("EL VERDADERO ERROR ES:", error);
              Alert.alert("Error interno", "Revisa la terminal de tu computadora.");
            }
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER FUERA DEL KEYBOARD */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar Cita</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* 🛠️ ARREGLO DEL TECLADO: Usamos 'height' en Android para que respete el bottom */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 150 }} // Aumenté el colchón para que suba bien
          keyboardShouldPersistTaps="handled" 
        >
          <Text style={styles.sectionTitle}>Selecciona una fecha</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {fechas.map((item, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.dateCard, fechaSeleccionada === item.value && styles.dateCardActive]}
                onPress={() => setFechaSeleccionada(item.value)}
              >
                <Text style={[styles.dateText, fechaSeleccionada === item.value && styles.dateTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.btnAbrirCalendario}
              onPress={() => setMostrarCalendario(true)}
            >
              <Ionicons name="calendar-outline" size={24} color="#1A0D5A" />
              <Text style={styles.textoAbrirCalendario}>Más fechas</Text>
            </TouchableOpacity>
          </ScrollView>

          {fechaSeleccionada === formatearFechaLocal(new Date()) && (
            <View style={[styles.avisoAnticipacion, { marginTop: 15 }]}>
              <Ionicons name="information-circle-outline" size={16} color="#0066CC" />
              <Text style={styles.textoAviso}>
                Las citas para hoy deben agendarse con al menos 3 horas de anticipación.
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>
            Horarios disponibles {fechaSeleccionada && `para el ${fechaSeleccionada}`}
          </Text>
          
          <View style={styles.timeGrid}>
            {fechaSeleccionada ? (
              bloquesDeHoras.length > 0 ? (
                bloquesDeHoras.map((hora, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[styles.timeCard, horaSeleccionada === hora && styles.timeCardActive]}
                    onPress={() => setHoraSeleccionada(hora)}
                  >
                    <Text style={[styles.timeText, horaSeleccionada === hora && styles.timeTextActive]}>
                      {hora}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noTimeContainer}>
                  <Ionicons name="alert-circle-outline" size={30} color="#FF5252" />
                  <Text style={styles.noTimeText}>
                    {mensajeVacio}
                  </Text>
                </View>
              )
            ) : (
              <Text style={{color: '#999', marginLeft: 5}}>Selecciona una fecha arriba.</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Motivo de la consulta (Opcional)</Text>
          <TextInput 
            style={styles.inputArea}
            placeholder="Escribe aquí el motivo..."
            multiline={true}
            value={motivo}
            onChangeText={setMotivo}
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={styles.floatingFooter}>
          <TouchableOpacity 
            style={[styles.btnConfirmar, (!fechaSeleccionada || !horaSeleccionada) && { backgroundColor: '#A0AAB5' }]} 
            onPress={confirmarCita}
            disabled={!fechaSeleccionada || !horaSeleccionada}
          >
            <Text style={styles.btnConfirmarText}>Confirmar Cita</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={mostrarCalendario} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Elige otra fecha</Text>
            <Calendar
              minDate={minDateStr}
              maxDate={maxDateStr}
              onDayPress={(day) => {
                setFechaSeleccionada(day.dateString);
                setMostrarCalendario(false);
              }}
              theme={{
                todayTextColor: '#1A0D5A',
                arrowColor: '#1A0D5A',
                selectedDayBackgroundColor: '#1A0D5A',
              }}
            />
            <TouchableOpacity style={styles.btnCerrarModal} onPress={() => setMostrarCalendario(false)}>
              <Text style={styles.txtCerrarModal}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E2E2E', marginTop: 20, marginBottom: 15 },
  horizontalScroll: { flexGrow: 0 },
  dateCard: { width: 70, height: 80, backgroundColor: '#F3F4F6', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  dateCardActive: { backgroundColor: '#1A0D5A', borderColor: '#1A0D5A' },
  dateText: { fontSize: 14, color: '#6F7C8E', fontWeight: '500', textAlign: 'center' },
  dateTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  
  btnAbrirCalendario: { width: 80, height: 80, backgroundColor: '#E8F1F8', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#B0D4F1', borderStyle: 'dashed' },
  textoAbrirCalendario: { fontSize: 12, color: '#1A0D5A', fontWeight: 'bold', marginTop: 4, textAlign: 'center' },
  
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeCard: { width: '30%', paddingVertical: 12, backgroundColor: '#F3F4F6', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
  timeCardActive: { backgroundColor: '#0066CC', borderColor: '#0066CC' },
  timeText: { fontSize: 13, color: '#6F7C8E', fontWeight: '500' },
  timeTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  inputArea: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 15, fontSize: 14, color: '#333', minHeight: 100, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 30 },
  
  // 🛠️ Botón flotante ajustado para no chocar
  floatingFooter: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 20, 
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Un poco transparente para que se vea premium
    borderTopWidth: 1,
    borderColor: '#EEE'
  },
  btnConfirmar: { backgroundColor: '#1A0D5A', height: 55, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnConfirmarText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  noTimeContainer: { width: '100%', alignItems: 'center', padding: 20, backgroundColor: '#FFF5F5', borderRadius: 15, borderWidth: 1, borderColor: '#FFD7D7' },
  noTimeText: { textAlign: 'center', color: '#D32F2F', marginTop: 10, fontSize: 14, fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, color: '#333' },
  btnCerrarModal: { marginTop: 20, padding: 15, backgroundColor: '#F3F4F6', borderRadius: 10, alignItems: 'center' },
  txtCerrarModal: { color: '#333', fontWeight: 'bold', fontSize: 16 },
  avisoAnticipacion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F1F8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  textoAviso: {
    fontSize: 12,
    color: '#0066CC',
    marginLeft: 5,
    flex: 1,
  },
});