import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Linking, Platform, Alert 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { API_URL, IP_SERVIDOR } from './ip';

export default function DoctorDetailScreen({ route, navigation }) {
  const { doctorId } = route.params; 
  const [doctor, setDoctor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarTodasResenas, setMostrarTodasResenas] = useState(false); // ✅ AGREGA ESTA LÍNEA

  const corregirUrlFoto = (url) => {
    if (!url) return null;
    return url.trim().replace('localhost', IP_SERVIDOR).replace('127.0.0.1', IP_SERVIDOR);
  };

  

  // Función mágica para leer arreglos o JSONs de la base de datos y convertirlos en burbujas
  const renderBurbujas = (datos) => {
    if (!datos) return <Text style={styles.description}>No especificado</Text>;
    
    let items = [];
    if (Array.isArray(datos)) {
      items = datos;
    } else if (typeof datos === 'string') {
      try { items = JSON.parse(datos); } 
      catch (e) { items = [datos]; } 
    }

    if (items.length === 0) return <Text style={styles.description}>No especificado</Text>;

    return (
      <View style={styles.tagsContainer}>
        {items.map((item, index) => {
          const textoTag = typeof item === 'object' ? (item.nombre || item.name) : item;
          return (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{textoTag}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  // Función para abrir WhatsApp
  const abrirWhatsApp = (numero) => {
    if (!numero) return;
    const url = `whatsapp://send?phone=${numero}`;
    Linking.openURL(url).catch(() => {
      alert('Asegúrate de tener WhatsApp instalado');
    });
  };

const [resenas, setResenas] = useState([]);

useEffect(() => {
  fetch(`${API_URL}/app/doctores/${doctorId}`)
    .then(res => res.json())
    .then(data => { setDoctor(data); setCargando(false); })
    .catch(err => console.error(err));

  fetch(`${API_URL}/app/doctores/${doctorId}/resenas`)
    .then(res => {
      if (!res.ok) return [];
      return res.json();
    })
    .then(data => setResenas(Array.isArray(data) ? data : []))
    .catch(err => console.error(err));
}, [doctorId]);

  // 🌟 FUNCIÓN CORREGIDA PARA ABRIR EL MAPA CON ETIQUETA 🌟
  const abrirNavegacionGPS = () => {
    const { latitud, longitud, direccion, nombre } = doctor;

    if (latitud && longitud) {
      // Creamos una etiqueta limpia (codificada para que no rompa la URL si tiene espacios)
      const etiqueta = encodeURIComponent(`Consultorio Dr. ${nombre}`);

      // Pasamos la etiqueta para obligar a Google Maps a usar ese nombre en el Pin
      const url = Platform.select({
        ios: `maps:${latitud},${longitud}?q=${etiqueta}`,
        android: `geo:${latitud},${longitud}?q=${latitud},${longitud}(${etiqueta})`
      });
      
      Linking.openURL(url).catch(() => {
        // Fallback: Si falla abrir la app nativa, lo abrimos en el navegador web
        Linking.openURL(`https://maps.google.com/?q=${latitud},${longitud}`);
      });
    } 
    else if (direccion) {
      // Búsqueda por texto si el doctor no tiene coordenadas
      const url = Platform.select({
        ios: `maps:0,0?q=${encodeURIComponent(direccion)}`,
        android: `geo:0,0?q=${encodeURIComponent(direccion)}`
      });
      Linking.openURL(url);
    } else {
      Alert.alert("Aviso", "El doctor no ha especificado una ubicación.");
    }
  };

  if (cargando) return <ActivityIndicator size="large" color="#0066CC" style={{flex:1, justifyContent: 'center'}} />;

  return (
    <ScrollView style={styles.container}>
  
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#0066CC" />
      </TouchableOpacity>

      {/* HEADER: Foto, Nombre, Especialidad Principal y Tipo de Consulta */}
      <View style={styles.header}>
        <Image 
          source={
            doctor.foto_url 
              ? { 
                  uri: `${corregirUrlFoto(doctor.foto_url)}?t=${new Date().getTime()}`,
                  headers: { Accept: 'image/*' } 
                } 
              : require('../assets/pers.png')
          } 
          style={styles.image} 
        />
        <Text style={styles.name}>Dr. {doctor.nombre}</Text>
        <Text style={styles.specialty}>{doctor.especialidad?.nombre || 'Medicina General'}</Text>

{/* ✅ CÉDULA */}
{doctor.cedula && (
  <Text style={{ fontSize: 13, color: '#999', marginBottom: 6 }}>
    Cédula: {doctor.cedula}
  </Text>
)}



        {/* PROMEDIO DE RESEÑAS */}
{doctor.calificacion_promedio > 0 && (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
    {[1,2,3,4,5].map(i => (
      <Ionicons 
        key={i} 
        name={i <= Math.round(doctor.calificacion_promedio) ? "star" : "star-outline"} 
        size={18} 
        color="#F59E0B" 
      />
    ))}
    <Text style={{ marginLeft: 6, color: '#666', fontSize: 14 }}>
      {parseFloat(doctor.calificacion_promedio).toFixed(1)} ({doctor.total_resenas || 0} reseñas)
    </Text>
  </View>
)}



        
        {/* TIPO DE CONSULTA */}
        {doctor.tipo_consulta && (
          <View style={styles.consultaBadge}>
            <Ionicons name="medical" size={14} color="#0066CC" style={{marginRight: 5}}/>
            <Text style={styles.consultaBadgeText}>{doctor.tipo_consulta}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        
        {/* CONTACTO Y DIRECCIÓN */}
        <Text style={styles.sectionTitle}>Información de Contacto</Text>
        <View style={styles.contactContainer}>
          
          {/* BOTÓN INTERACTIVO DE UBICACIÓN */}
          <TouchableOpacity 
            style={[styles.contactRow, { backgroundColor: '#F0F7FF', padding: 12, borderRadius: 10, marginBottom: 15 }]} 
            onPress={abrirNavegacionGPS}
          >
            <View style={{ backgroundColor: '#0066CC', padding: 8, borderRadius: 50, marginRight: 12 }}>
              <Ionicons name="location" size={20} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: '#444', fontWeight: 'bold' }}>Ubicación del consultorio</Text>
              <Text style={{ fontSize: 13, color: '#0066CC' }}>
                {doctor.direccion || 'Toca para ver en el mapa'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0066CC" />
          </TouchableOpacity>
          
          <View style={styles.contactRow}>
            <Ionicons name="call" size={20} color="#0066CC" />
            <Text style={styles.contactText}>{doctor.telefono || 'Sin teléfono'}</Text>
          </View>

          {doctor.whatsapp && (
            <TouchableOpacity style={styles.contactRow} onPress={() => abrirWhatsApp(doctor.whatsapp)}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text style={[styles.contactText, {color: '#25D366', fontWeight: 'bold'}]}>{doctor.whatsapp} (Toque para abrir)</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        {/* SOBRE MÍ */}
        <Text style={styles.sectionTitle}>Sobre mí</Text>
        <Text style={styles.description}>{doctor.descripcion || "Este doctor aún no ha agregado una descripción."}</Text>
        
        <View style={styles.divider} />

        {/* SERVICIOS QUE OFRECE */}
        <Text style={styles.sectionTitle}>Servicios que ofrece</Text>
        {renderBurbujas(doctor.servicios)}

        {/* ESPECIALIDADES ADICIONALES */}
        <Text style={[styles.sectionTitle, {marginTop: 20}]}>Especialidades Adicionales</Text>
        {renderBurbujas(doctor.especialidades_extra)}

        {/* HORARIOS */}
        <Text style={styles.sectionTitle}>Horarios Disponibles</Text>
        {doctor.horarios?.length > 0 ? (
          doctor.horarios.map((h, i) => (
            <View key={i} style={styles.horarioItem}>
              <Text style={styles.diaText}>{h.dia}:</Text>
              <Text style={styles.horaText}>{h.hora_inicio} - {h.hora_fin}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.description}>No hay horarios registrados.</Text>
        )}
      </View>
             {/* RESEÑAS */}
{resenas.length > 0 && (
  <View style={{ paddingHorizontal: 25, marginBottom: 10 }}>
    <Text style={styles.sectionTitle}>Reseñas</Text>

    {(mostrarTodasResenas ? resenas : resenas.slice(0, 3)).map((r, i) => (
      <View key={i} style={{ backgroundColor: '#F8F9FA', borderRadius: 10, padding: 14, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ fontWeight: 'bold', color: '#333' }}>{r.paciente_nombre || 'Paciente'}</Text>
          <Text style={{ color: '#F59E0B' }}>{'★'.repeat(r.estrellas)}{'☆'.repeat(5 - r.estrellas)}</Text>
        </View>
        <Text style={{ color: '#555', fontSize: 13 }}>{r.comentario}</Text>
        {r.respuesta ? (
          <Text style={{ color: '#7C3AED', fontSize: 12, marginTop: 6 }}>
            💬 Dr: {r.respuesta}
          </Text>
        ) : null}
      </View>
    ))}

    {resenas.length > 3 && (
      <TouchableOpacity
        onPress={() => setMostrarTodasResenas(!mostrarTodasResenas)}
        style={{ alignItems: 'center', paddingVertical: 10 }}
      >
        <Text style={{ color: '#0066CC', fontWeight: 'bold', fontSize: 14 }}>
          {mostrarTodasResenas ? 'Ver menos ▲' : `Ver todas (${resenas.length}) ▼`}
        </Text>
      </TouchableOpacity>
    )}
  </View>
)}


      <TouchableOpacity 
        style={styles.bookBtn} 
        onPress={() => navigation.navigate('AgendarCita', { 
          doctorId: doctor.id, 
          nombreDoctor: doctor.nombre, 
          horarios: doctor.horarios,
          citasOcupadas: doctor.citas || [] 
        })}
      >
        <Text style={styles.bookBtnText}>Agendar Cita</Text>
 
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  backBtn: { marginTop: 50, marginLeft: 20 },
  header: { alignItems: 'center', marginTop: 10, paddingHorizontal: 20 },
  image: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#EEE', elevation: 4, shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  name: { fontSize: 24, fontWeight: 'bold', marginTop: 15, color: '#333', textAlign: 'center' },
  specialty: { fontSize: 16, color: '#666', marginBottom: 10 },
  consultaBadge: { flexDirection: 'row', backgroundColor: '#E8F1F8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignItems: 'center', marginBottom: 10 },
  consultaBadgeText: { color: '#0066CC', fontWeight: 'bold', fontSize: 13 },
  infoSection: { padding: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#222' },
  description: { color: '#555', lineHeight: 22, fontSize: 15 },
  
  contactContainer: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 12, marginBottom: 10 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  contactText: { marginLeft: 10, fontSize: 15, color: '#444', flex: 1 },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 },
  tag: { backgroundColor: '#F0F0F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  tagText: { color: '#333', fontSize: 13 },
  
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
  
  horarioItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  diaText: { fontWeight: '600', color: '#444', fontSize: 15 },
  horaText: { color: '#0066CC', fontWeight: 'bold', fontSize: 15 },
  
  bookBtn: { backgroundColor: '#0066CC', marginHorizontal: 25, marginBottom: 40, marginTop: 10, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  bookBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});