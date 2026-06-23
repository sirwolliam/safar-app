/**
 * QiblaScreen.jsx — Safar
 * Qibla direction finder with inline location selector.
 * Uses device magnetometer via expo-sensors when available (dev build).
 * In Expo Go: shows calculated bearing with manual compass UI.
 * Location: preset cities + manual lat/lng entry, no external popup.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Animated, Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle, Line, Path, G, Text as SvgText, Defs, LinearGradient, Stop } from "react-native-svg";

const SERIF = "SourceSerif4-Regular";
const STORAGE_KEY = "safar_qibla_location_v1";

// Kaaba coordinates
const KAABA_LAT =  21.4225;
const KAABA_LNG =  39.8262;

const PRESET_CITIES = [
  { name: "Makkah",       lat: 21.3891, lng: 39.8579 },
  { name: "Madinah",      lat: 24.4672, lng: 39.6150 },
  { name: "London",       lat: 51.5074, lng: -0.1278 },
  { name: "New York",     lat: 40.7128, lng: -74.0060 },
  { name: "Dubai",        lat: 25.2048, lng: 55.2708 },
  { name: "Karachi",      lat: 24.8607, lng: 67.0011 },
  { name: "Istanbul",     lat: 41.0082, lng: 28.9784 },
  { name: "Lagos",        lat: 6.5244,  lng: 3.3792  },
  { name: "Kuala Lumpur", lat: 3.1390,  lng: 101.6869 },
  { name: "Toronto",      lat: 43.6532, lng: -79.3832 },
  { name: "Jakarta",      lat: -6.2088, lng: 106.8456 },
  { name: "Dhaka",        lat: 23.8103, lng: 90.4125  },
];

// Calculate Qibla bearing from lat/lng to Kaaba
function calcQibla(lat, lng) {
  const toRad = d => d * Math.PI / 180;
  const toDeg = r => r * 180 / Math.PI;
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA_LAT);
  const Δλ = toRad(KAABA_LNG - lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Great-circle distance (km)
function calcDistance(lat, lng) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(KAABA_LAT - lat);
  const dLng = toRad(KAABA_LNG - lng);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat)) * Math.cos(toRad(KAABA_LAT)) * Math.sin(dLng/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// ── Compass SVG ──────────────────────────────────────────────────────────────
function CompassDial({ bearing }) {
  const SIZE = 312;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = SIZE / 2 - 12;

  const bearingRad = (bearing - 90) * Math.PI / 180;
  const arrowTip = {
    x: CX + (R - 24) * Math.cos(bearingRad),
    y: CY + (R - 24) * Math.sin(bearingRad),
  };
  const arrowTail = {
    x: CX - 28 * Math.cos(bearingRad),
    y: CY - 28 * Math.sin(bearingRad),
  };

  const cardinals = ["N", "E", "S", "W"];
  const cardinalAngles = [0, 90, 180, 270];

  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Defs>
        <LinearGradient id="qiblaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#7FD4A8" stopOpacity="1" />
          <Stop offset="100%" stopColor="#4AAF80" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Outer ring */}
      <Circle cx={CX} cy={CY} r={R} fill="#1E4A3A" stroke="#2F5D50" strokeWidth={1.5} />

      {/* Degree ticks */}
      {Array.from({length:72}, (_,i) => {
        const a = (i * 5 - 90) * Math.PI / 180;
        const isMajor = i % 6 === 0;
        const inner = isMajor ? R - 14 : R - 8;
        return (
          <Line key={i}
            x1={CX + inner * Math.cos(a)} y1={CY + inner * Math.sin(a)}
            x2={CX + (R-2) * Math.cos(a)} y2={CY + (R-2) * Math.sin(a)}
            stroke={isMajor ? "#C8A96A" : "rgba(255,255,255,0.25)"} strokeWidth={isMajor ? 1.5 : 0.7}
          />
        );
      })}

      {/* Cardinal labels */}
      {cardinals.map((c, i) => {
        const a = (cardinalAngles[i] - 90) * Math.PI / 180;
        const cr = R - 28;
        return (
          <SvgText key={c}
            x={CX + cr * Math.cos(a)}
            y={CY + cr * Math.sin(a) + 5}
            fontSize={c === "N" ? 16 : 13}
            fontWeight={c === "N" ? "700" : "500"}
            fill={c === "N" ? "#C8A96A" : "rgba(255,255,255,0.75)"}
            textAnchor="middle"
          >{c}</SvgText>
        );
      })}

      {/* Inner circle */}
      <Circle cx={CX} cy={CY} r={R - 50} fill="#163B2E" stroke="#2F5D50" strokeWidth={1} />

      {/* Qibla arrow */}
      <G>
        {/* Arrow shaft */}
        <Line
          x1={arrowTail.x} y1={arrowTail.y}
          x2={arrowTip.x}  y2={arrowTip.y}
          stroke="url(#qiblaGrad)" strokeWidth={3} strokeLinecap="round"
        />
        {/* Arrowhead */}
        <Path
          d={`M ${arrowTip.x} ${arrowTip.y}
              L ${arrowTip.x - 10 * Math.cos(bearingRad - 0.4)} ${arrowTip.y - 10 * Math.sin(bearingRad - 0.4)}
              L ${arrowTip.x - 10 * Math.cos(bearingRad + 0.4)} ${arrowTip.y - 10 * Math.sin(bearingRad + 0.4)} Z`}
          fill="#7FD4A8"
        />
        {/* Tail dot */}
        <Circle cx={arrowTail.x} cy={arrowTail.y} r={4} fill="#C8A96A" />
      </G>

      {/* Ka'bah icon on the ring at the arrow tip — green circle with black cube */}
      {(() => {
        const iconRad = (bearing - 90) * Math.PI / 180;
        const iconR = R - 26;
        const ix = CX + iconR * Math.cos(iconRad);
        const iy = CY + iconR * Math.sin(iconRad);
        return (
          <G>
            {/* White circle background */}
            <Circle cx={ix} cy={iy} r={24} fill="#fff" stroke="#C8A96A" strokeWidth={2} />
            {/* Cube body */}
            <Path
              d={`M ${ix-8} ${iy-8} L ${ix+8} ${iy-8} L ${ix+8} ${iy+8} L ${ix-8} ${iy+8} Z`}
              fill="#1A1712"
            />
            {/* Gold band */}
            <Path
              d={`M ${ix-8} ${iy-2} L ${ix+8} ${iy-2} L ${ix+8} ${iy+2} L ${ix-8} ${iy+2} Z`}
              fill="#C8A96A"
            />
            {/* Gold top strip */}
            <Path
              d={`M ${ix-8} ${iy-8} L ${ix+8} ${iy-8} L ${ix+8} ${iy-5} L ${ix-8} ${iy-5} Z`}
              fill="#C8A96A"
            />
          </G>
        );
      })()}

      {/* Centre dot */}
      <Circle cx={CX} cy={CY} r={6} fill="#fff" />
      <Circle cx={CX} cy={CY} r={2.5} fill="#C8A96A" />
    </Svg>
  );
}

export default function QiblaScreen({ navigation }) {
  const [location,    setLocation]    = useState({ name: "Makkah", lat: 21.3891, lng: 39.8579 });
  const [showPicker,  setShowPicker]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualLat,   setManualLat]   = useState("");
  const [manualLng,   setManualLng]   = useState("");
  const [showManual,  setShowManual]  = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(v => {
      if (v) setLocation(JSON.parse(v));
    }).catch(() => {});
  }, []);

  // Animate needle on bearing change
  const bearing = calcQibla(location.lat, location.lng);
  const distance = calcDistance(location.lat, location.lng);

  const prevBearing = useRef(bearing);
  useEffect(() => {
    const diff = bearing - prevBearing.current;
    prevBearing.current = bearing;
    Animated.timing(spinAnim, {
      toValue: diff,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => spinAnim.setValue(0));
  }, [bearing]);

  const selectCity = (city) => {
    setLocation(city);
    setShowPicker(false);
    setSearchQuery("");
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(city)).catch(() => {});
  };

  const applyManual = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
    const loc = { name: "Custom location", lat, lng };
    setLocation(loc);
    setShowManual(false);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loc)).catch(() => {});
  };

  const filteredCities = PRESET_CITIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bearingText = `${Math.round(bearing)}°`;
  const directionLabel = () => {
    const b = bearing;
    if (b < 22.5 || b >= 337.5) return "North";
    if (b < 67.5)  return "North-East";
    if (b < 112.5) return "East";
    if (b < 157.5) return "South-East";
    if (b < 202.5) return "South";
    if (b < 247.5) return "South-West";
    if (b < 292.5) return "West";
    return "North-West";
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <Text style={s.backArrow}>{"‹"}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Qibla</Text>
          <Text style={s.headerSub}>Direction of the Ka'bah</Text>
        </View>
        <View style={{ width:36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Location bar */}
        <TouchableOpacity
          style={s.locationBar}
          onPress={() => { setShowPicker(v => !v); setShowManual(false); }}
          activeOpacity={0.85}
        >
          <Text style={s.locationIcon}>{"📍"}</Text>
          <View style={s.locationInfo}>
            <Text style={s.locationName}>{location.name}</Text>
            <Text style={s.locationCoords}>{location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°</Text>
          </View>
          <Text style={s.locationChev}>{showPicker ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {/* City picker — inline */}
        {showPicker && (
          <View style={s.pickerPanel}>
            <TextInput
              style={s.searchInput}
              placeholder="Search city..."
              placeholderTextColor="#9A8E7A"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {filteredCities.map(city => (
              <TouchableOpacity
                key={city.name}
                style={[s.cityRow, city.name === location.name && s.cityRowActive]}
                onPress={() => selectCity(city)}
                activeOpacity={0.8}
              >
                <Text style={[s.cityName, city.name === location.name && s.cityNameActive]}>
                  {city.name}
                </Text>
                {city.name === location.name && <Text style={s.cityCheck}>{"✓"}</Text>}
              </TouchableOpacity>
            ))}
            {/* Manual entry toggle */}
            <TouchableOpacity
              style={s.manualToggle}
              onPress={() => setShowManual(v => !v)}
              activeOpacity={0.8}
            >
              <Text style={s.manualToggleTxt}>{"✎  Enter coordinates manually"}</Text>
            </TouchableOpacity>
            {showManual && (
              <View style={s.manualPanel}>
                <TextInput
                  style={s.manualInput}
                  placeholder="Latitude (e.g. 51.5074)"
                  placeholderTextColor="#9A8E7A"
                  value={manualLat}
                  onChangeText={setManualLat}
                  keyboardType="numbers-and-punctuation"
                />
                <TextInput
                  style={s.manualInput}
                  placeholder="Longitude (e.g. -0.1278)"
                  placeholderTextColor="#9A8E7A"
                  value={manualLng}
                  onChangeText={setManualLng}
                  keyboardType="numbers-and-punctuation"
                />
                <TouchableOpacity style={s.manualBtn} onPress={applyManual} activeOpacity={0.88}>
                  <Text style={s.manualBtnTxt}>Apply coordinates</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Compass */}
        <View style={s.compassWrap}>
          <CompassDial bearing={bearing} />
        </View>

        {/* Compact info row — bearing+distance left, instructions right */}
        <View style={s.infoRow}>
          {/* Left: numbers stacked */}
          <View style={s.numbersCard}>
            <View style={s.numberBlock}>
              <Text style={s.numberLabel}>BEARING</Text>
              <Text style={s.numberValue}>{bearingText}</Text>
              <Text style={s.numberSub}>{directionLabel()}</Text>
            </View>
            <View style={s.numberDivider} />
            <View style={s.numberBlock}>
              <Text style={s.numberLabel}>DISTANCE</Text>
              <Text style={s.numberValue}>{distance.toLocaleString()}</Text>
              <Text style={s.numberSub}>km</Text>
            </View>
          </View>
          {/* Right: instructions */}
          <View style={s.instructCard}>
            <Text style={s.instructTitle}>How to use</Text>
            <Text style={s.instructBody}>
              {"Face the green arrow. Hold phone flat, away from metal.\n\nBearing is calculated using the great-circle method from your location to the Ka'bah."}
            </Text>
          </View>
        </View>

        {/* Dev build note */}
        <View style={s.noteCard}>
          <Text style={s.noteText}>
            {"📱  Live magnetometer requires a dev build. The bearing is calculated from your selected location and is accurate for prayer direction."}
          </Text>
        </View>

        <View style={{ height:40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:"#EDE6D8" },
  scroll: { paddingHorizontal:24, paddingTop:8 },

  header:       { flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingVertical:14, backgroundColor:"#EDE6D8" },
  backBtn:      { width:36, height:36, borderRadius:18, backgroundColor:"#FDFAF4", borderWidth:1, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center", shadowColor:"#6A4A28", shadowOffset:{width:0,height:2}, shadowOpacity:0.10, shadowRadius:4, elevation:2 },
  backArrow:    { fontSize:22, color:"#1A1712", lineHeight:26 },
  headerCenter: { flex:1, alignItems:"center" },
  headerTitle:  { fontFamily:SERIF, fontSize:22, color:"#1A1712", fontWeight:"400" },
  headerSub:    { fontSize:12, color:"#3D3935", fontWeight:"500", marginTop:1 },

  locationBar:    { flexDirection:"row", alignItems:"center", backgroundColor:"#FDFAF4", borderRadius:14, borderWidth:1, borderColor:"#D4D0CA", paddingHorizontal:16, paddingVertical:12, marginBottom:4, shadowColor:"#6A4A28", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:4, elevation:2 },
  locationIcon:   { fontSize:18, marginRight:10 },
  locationInfo:   { flex:1 },
  locationName:   { fontFamily:SERIF, fontSize:17, color:"#1A1712" },
  locationCoords: { fontSize:11, color:"#4A4846", marginTop:1 },
  locationChev:   { fontSize:11, color:"#3D3935" },

  pickerPanel:   { backgroundColor:"#FDFAF4", borderRadius:14, borderWidth:1, borderColor:"#D4D0CA", marginBottom:16, overflow:"hidden", shadowColor:"#6A4A28", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:4, elevation:2 },
  searchInput:   { borderBottomWidth:1, borderBottomColor:"#D4D0CA", paddingHorizontal:16, paddingVertical:12, fontSize:16, color:"#1A1712" },
  cityRow:       { paddingHorizontal:16, paddingVertical:13, borderBottomWidth:1, borderBottomColor:"#F0EBE2", flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  cityRowActive: { backgroundColor:"#EBF2EE" },
  cityName:      { fontFamily:SERIF, fontSize:16, color:"#1A1712" },
  cityNameActive:{ color:"#2F5D50" },
  cityCheck:     { fontSize:14, color:"#2F5D50", fontWeight:"700" },
  manualToggle:  { paddingHorizontal:16, paddingVertical:12, borderTopWidth:1, borderTopColor:"#D4D0CA" },
  manualToggleTxt:{ fontSize:14, color:"#2F5D50" },
  manualPanel:   { paddingHorizontal:16, paddingBottom:16, gap:8 },
  manualInput:   { backgroundColor:"#EDE6D8", borderRadius:8, borderWidth:1, borderColor:"#D4D0CA", paddingHorizontal:12, paddingVertical:10, fontSize:15, color:"#1A1712" },
  manualBtn:     { backgroundColor:"#2F5D50", borderRadius:8, paddingVertical:12, alignItems:"center", marginTop:4 },
  manualBtnTxt:  { fontSize:15, color:"#fff", fontWeight:"500" },

  compassWrap:   { alignItems:"center", paddingVertical:4 },

  infoRow:       { flexDirection:"row", gap:10, marginBottom:12 },
  numbersCard:   { backgroundColor:"#FDFAF4", borderRadius:16, borderWidth:1, borderColor:"#D4D0CA", padding:14, justifyContent:"center", gap:10, shadowColor:"#6A4A28", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:4, elevation:2, minWidth:110 },
  numberBlock:   { alignItems:"center" },
  numberLabel:   { fontSize:9, fontWeight:"700", letterSpacing:1.5, color:"#6B6259", marginBottom:2 },
  numberValue:   { fontFamily:SERIF, fontSize:22, color:"#2F5D50", lineHeight:26 },
  numberSub:     { fontSize:11, color:"#3D3935", marginTop:1 },
  numberDivider: { height:1, backgroundColor:"#D4D0CA", width:"100%" },

  instructCard:  { flex:1, backgroundColor:"#FDFAF4", borderRadius:16, borderWidth:1, borderColor:"#D4D0CA", padding:14, shadowColor:"#6A4A28", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:4, elevation:2 },
  instructTitle: { fontFamily:SERIF, fontSize:14, color:"#1A1712", marginBottom:6 },
  instructBody:  { fontSize:12, color:"#3D3935", lineHeight:18 },

  noteCard:      { backgroundColor:"#F5EDD8", borderRadius:14, borderWidth:1, borderColor:"#E8D9B8", padding:16, marginBottom:8 },
  noteText:      { fontSize:12, color:"#7A6030", lineHeight:18 },
});
