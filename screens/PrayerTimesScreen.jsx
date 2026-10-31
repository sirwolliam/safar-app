/**
 * PrayerTimesScreen.jsx — Safar
 * Prayer times with location selector inline.
 * Uses Aladhan API (free, no key needed).
 * Big numbers, generous space, calm layout.
 */
import React, { useState, useCallback, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator, Platform, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeaderPatternBg from "../HeaderPatternBg";
import { PRAYER_METHODS, PRAYER_SCHOOLS } from "../prayerSettings";
import {
  DEFAULT_METHOD, DEFAULT_SCHOOL, DEFAULT_LOCATION,
  loadPrayerSettings, refreshPrayerData, getToday, getNextPrayer,
} from "../prayerTimes";

const SERIF = "SourceSerif4-Regular";
const STORAGE_KEY = "safar_prayer_location_v1";

const PRAYERS = [
  { key: "Fajr",    arabic: "الفجر",   label: "Fajr"    },
  { key: "Sunrise", arabic: "الشروق",  label: "Sunrise", dim: true },
  { key: "Dhuhr",   arabic: "الظهر",   label: "Dhuhr"   },
  { key: "Asr",     arabic: "العصر",   label: "Asr"     },
  { key: "Maghrib", arabic: "المغرب",  label: "Maghrib" },
  { key: "Isha",    arabic: "العشاء",  label: "Isha"    },
];

const PRESET_CITIES = [
  { name: "Makkah",   lat: 21.3891, lng: 39.8579 },
  { name: "Madinah",  lat: 24.4672, lng: 39.6150 },
  { name: "London",   lat: 51.5074, lng: -0.1278 },
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "Dubai",    lat: 25.2048, lng: 55.2708 },
  { name: "Karachi",  lat: 24.8607, lng: 67.0011 },
  { name: "Istanbul", lat: 41.0082, lng: 28.9784 },
  { name: "Lagos",    lat: 6.5244,  lng: 3.3792  },
  { name: "Kuala Lumpur", lat: 3.1390, lng: 101.6869 },
];

function formatTime(t) {
  if (!t) return "--:--";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  const ampm = hr >= 12 ? "pm" : "am";
  const hr12 = hr % 12 === 0 ? 12 : hr % 12;
  return `${hr12}:${m} ${ampm}`;
}

export default function PrayerTimesScreen({ navigation, route }) {
  const SW = Dimensions.get("window").width;
  const insets = useSafeAreaInsets();
  const [times,        setTimes]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [location,     setLocation]     = useState(DEFAULT_LOCATION);
  const [showPicker,   setShowPicker]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [cityDate,     setCityDate]     = useState(null); // "YYYY-MM-DD" in the city's time zone
  const [nextInfo,     setNextInfo]     = useState(null);
  const [offline,      setOffline]      = useState(false);
  const [method,       setMethod]       = useState(DEFAULT_METHOD); // 4 = Umm al-Qura (Makkah)
  const [school,       setSchool]       = useState(DEFAULT_SCHOOL); // 0 = Standard, 1 = Hanafi
  const loadId = useRef(0);

  // Settings are re-read on every load so changes made in Settings show up on return
  const load = useCallback(async ({ force = false } = {}) => {
    const id = ++loadId.current;
    setLoading(true); setError(null);
    const settings = await loadPrayerSettings();
    if (id !== loadId.current) return;
    setLocation(settings.location);
    setMethod(settings.method);
    setSchool(settings.school);
    const res  = await refreshPrayerData(settings, { force });
    const day  = await getToday(settings);
    const next = await getNextPrayer(settings);
    if (id !== loadId.current) return;
    if (day) {
      setTimes(day.timings);
      setCityDate(day.dateStr);
      setNextInfo(next);
      setOffline(res.offline);
    } else {
      setTimes(null);
      setNextInfo(null);
      setOffline(false);
      setError("Prayer times need an internet connection the first time. After that they are saved on your phone.");
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const selectCity = (city) => {
    setLocation(city);
    setShowPicker(false);
    setSearchQuery("");
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(city)).catch(() => {}).then(() => load());
  };

  const nextPrayer = nextInfo ? nextInfo.next : null;
  const nextTime   = nextInfo ? nextInfo.nextTime : null;
  const minsLeft   = nextInfo ? nextInfo.minutesUntil : null;
  const hoursLeft  = minsLeft !== null ? Math.floor(minsLeft / 60) : null;
  const minsRem    = minsLeft !== null ? minsLeft % 60 : null;

  // Header date is the city's local date (falls back to the phone's before first load)
  const [cy, cm, cd] = cityDate ? cityDate.split("-").map(Number) : [];
  const labelDate = cityDate ? new Date(cy, cm - 1, cd) : new Date();
  const dayLabel = labelDate.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" });

  const filteredCities = PRESET_CITIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => { const returnToTab = route?.params?.returnToTab; if (returnToTab) { navigation?.getParent?.()?.navigate?.(returnToTab); } else { navigation?.goBack?.(); } }} activeOpacity={0.8}>
            <Text style={s.backArrow}>{"‹"}</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity style={s.refreshBtn} onPress={() => load({ force: true })} activeOpacity={0.8}>
              <Text style={s.refreshIcon}>↺</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Prayer Times</Text>
          <Text style={s.headerSub}>{dayLabel}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Location selector */}
        <TouchableOpacity
          style={s.locationBar}
          onPress={() => setShowPicker(v => !v)}
          activeOpacity={0.85}
        >
          <Text style={s.locationIcon}>{"📍"}</Text>
          <View style={s.locationInfo}>
            <Text style={s.locationName}>{location.name}</Text>
            <Text style={s.locationCoords}>{location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°</Text>
          </View>
          <Text style={s.locationChev}>{showPicker ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {/* City picker — inline, no popup */}
        {showPicker && (
          <View style={s.pickerPanel}>
            <TextInput
              style={s.searchInput}
              placeholder="Search city..."
              placeholderTextColor="#5C534A"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {filteredCities.map(city => (
              <TouchableOpacity
                key={city.name}
                style={city.name === location.name ? [s.cityRow, s.cityRowActive] : s.cityRow}
                onPress={() => selectCity(city)}
                activeOpacity={0.8}
              >
                <Text style={city.name === location.name ? [s.cityName, s.cityNameActive] : s.cityName}>
                  {city.name}
                </Text>
                {city.name === location.name && <Text style={s.cityCheck}>{"✓"}</Text>}
              </TouchableOpacity>
            ))}
            <Text style={s.pickerNote}>
              More cities coming. For full location support, update to a dev build.
            </Text>
          </View>
        )}

        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color="#1E3D30" />
            <Text style={s.loadingText}>Loading prayer times…</Text>
          </View>
        ) : error ? (
          <View style={s.errorWrap}>
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={() => load({ force: true })}>
              <Text style={s.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Next prayer — compact horizontal row */}
            {nextPrayer && (
              <View style={s.nextHero}>
                <View style={s.nextLeft}>
                  <Text style={s.nextLabel}>NEXT PRAYER</Text>
                  <Text style={s.nextName}>{nextPrayer}</Text>
                  <Text style={s.nextArabic}>{PRAYERS.find(p => p.key === nextPrayer)?.arabic}</Text>
                  {hoursLeft !== null && (
                    <Text style={s.nextCountdown}>
                      {hoursLeft > 0 ? `${hoursLeft}h ${minsRem}m away` : `${minsRem} minutes away`}
                    </Text>
                  )}
                </View>
                <Text style={s.nextTime}>{formatTime(nextTime)}</Text>
              </View>
            )}

            {/* Prayer times list */}
            <View style={s.timesCard}>
              {PRAYERS.map((p, i) => {
                const isNext = p.key === nextPrayer;
                const timeStr = times?.[p.key];
                return (
                  <View
                    key={p.key}
                    style={[s.timeRow, i < PRAYERS.length - 1 ? s.timeRowBorder : null, isNext ? s.timeRowActive : null, p.dim ? s.timeRowDim : null]}
                  >
                    <View style={s.timeLeft}>
                      <Text style={p.dim ? [s.prayerArabic, s.dimText] : s.prayerArabic}>{p.arabic}</Text>
                      <Text style={isNext ? [s.prayerName, s.activeText] : (p.dim ? [s.prayerName, s.dimText] : s.prayerName)}>{p.label}</Text>
                    </View>
                    <Text style={isNext ? [s.prayerTime, s.activeTimeText] : (p.dim ? [s.prayerTime, s.dimText] : s.prayerTime)}>
                      {formatTime(timeStr)}
                    </Text>
                    {isNext && <View style={s.nextDot} />}
                  </View>
                );
              })}
            </View>

            {/* Method note */}
            <Text style={s.methodNote}>
              {`Calculation: ${PRAYER_METHODS.find(m => m.code === method)?.label ?? "Umm al-Qura University, Makkah"} · Asr: ${PRAYER_SCHOOLS.find(sc => sc.code === school)?.label ?? "Standard"} · Times are indicative — verify locally.`}
            </Text>
            {offline ? (
              <Text style={s.methodNote}>Offline. Using saved times.</Text>
            ) : null}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:"#E8DDD0" },
  scroll: { paddingHorizontal:20, paddingTop:2 },

  // Header
  header:       { backgroundColor:"#4A5C48", minHeight:170, position:"relative", overflow:"hidden", paddingHorizontal:20, paddingBottom:14 },
  headerTopRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  backBtn:      { width:36, height:36, borderRadius:18, backgroundColor:"#FDFAF4", alignItems:"center", justifyContent:"center", shadowColor:"#4A2E10", shadowOffset:{width:0,height:2}, shadowOpacity:0.10, shadowRadius:4, elevation:2 },
  backArrow:    { fontSize:22, color:"#100E0A", lineHeight:26 },
  headerCenter: { alignItems:"center", marginTop:16 },
  headerRow:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  headerTitle:  { fontFamily:SERIF, fontSize:38, color:"#FDFAF4", fontWeight:"400" },
  headerSub:    { fontSize:15, color:"#FDFAF4", fontWeight:"500", marginTop:11 },
  refreshBtn:   { width:36, height:36, borderRadius:18, backgroundColor:"#FDFAF4", alignItems:"center", justifyContent:"center" },
  refreshIcon:  { fontSize:20, color:"#1E3D30" },

  // Location bar
  locationBar:    { flexDirection:"row", alignItems:"center", backgroundColor:"#F5EDE0", borderRadius:14, borderWidth:1, borderColor:"#C8BFB2", paddingHorizontal:18, paddingVertical:12, marginBottom:8, marginTop:16, shadowColor:"#4A2E10", shadowOffset:{width:0,height:2}, shadowOpacity:0.14, shadowRadius:6, elevation:3 },
  locationIcon:   { fontSize:18, marginRight:10 },
  locationInfo:   { flex:1 },
  locationName:   { fontFamily:SERIF, fontSize:17, color:"#100E0A" },
  locationCoords: { fontSize:11, color:"#3A3530", marginTop:1 },
  locationChev:   { fontSize:11, color:"#3A3530" },

  // City picker
  pickerPanel:  { backgroundColor:"#F5EDE0", borderRadius:14, borderWidth:1, borderColor:"#C8BFB2", marginBottom:16, overflow:"hidden", shadowColor:"#4A2E10", shadowOffset:{width:0,height:2}, shadowOpacity:0.14, shadowRadius:6, elevation:3 },
  searchInput:  { borderBottomWidth:1, borderBottomColor:"#C8BFB2", paddingHorizontal:16, paddingVertical:12, fontSize:16, color:"#100E0A" },
  cityRow:      { paddingHorizontal:16, paddingVertical:13, borderBottomWidth:1, borderBottomColor:"#E8E0D4", flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  cityRowActive:{ backgroundColor:"#E2EDE6" },
  cityName:     { fontFamily:SERIF, fontSize:16, color:"#100E0A" },
  cityNameActive:{ color:"#1E3D30" },
  cityCheck:    { fontSize:14, color:"#1E3D30", fontWeight:"700" },
  pickerNote:   { fontSize:11, color:"#5C534A", padding:14, textAlign:"center", lineHeight:16 },

  // Loading / error
  loadingWrap:  { alignItems:"center", paddingVertical:60, gap:16 },
  loadingText:  { fontSize:15, color:"#3A3530" },
  errorWrap:    { alignItems:"center", paddingVertical:40, gap:16 },
  errorText:    { fontSize:15, color:"#3A3530", textAlign:"center", lineHeight:22 },
  retryBtn:     { backgroundColor:"#1E3D30", borderRadius:10, paddingHorizontal:24, paddingVertical:12 },
  retryText:    { fontSize:15, color:"#fff", fontWeight:"500" },

  // Next prayer — compact horizontal row
  nextHero:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", backgroundColor:"#E2EDE6", borderRadius:14, borderWidth:1, borderColor:"#C8DDD0", paddingHorizontal:18, paddingVertical:12, marginBottom:8, shadowColor:"#4A2E10", shadowOffset:{width:0,height:2}, shadowOpacity:0.14, shadowRadius:6, elevation:3 },
  nextLeft:      { flex:1 },
  nextLabel:     { fontSize:9, fontWeight:"700", letterSpacing:2, color:"#1E3D30", marginBottom:4 },
  nextName:      { fontFamily:SERIF, fontSize:22, color:"#100E0A", fontWeight:"400", lineHeight:26, marginBottom:1 },
  nextArabic:    { fontSize:14, color:"#1E3D30", marginBottom:2 },
  nextTime:      { fontFamily:SERIF, fontSize:30, color:"#1E3D30", fontWeight:"300", letterSpacing:0.5 },
  nextCountdown: { fontSize:12, color:"#3A3530" },

  // Times card
  timesCard:    { backgroundColor:"#F5EDE0", borderRadius:16, borderWidth:1, borderColor:"#C8BFB2", overflow:"hidden", marginBottom:8, shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.18, shadowRadius:10, elevation:5 },
  timeRow:      { flexDirection:"row", alignItems:"center", paddingHorizontal:18, paddingVertical:9 },
  timeRowBorder:{ borderBottomWidth:1, borderBottomColor:"#E8E0D4" },
  timeRowActive:{ backgroundColor:"#E2EDE6" },
  timeRowDim:   { opacity:0.55 },
  timeLeft:     { flex:1 },
  prayerArabic: { fontSize:12, color:"#1E3D30", marginBottom:1 },
  prayerName:   { fontFamily:SERIF, fontSize:14, color:"#100E0A" },
  prayerTime:   { fontSize:18, color:"#100E0A", fontWeight:"300", letterSpacing:0.5 },
  dimText:      { color:"#5C534A" },
  activeText:   { color:"#1E3D30", fontWeight:"500" },
  activeTimeText:{ color:"#1E3D30", fontWeight:"400" },
  nextDot:      { width:6, height:6, borderRadius:3, backgroundColor:"#1E3D30", marginLeft:10 },

  methodNote:   { fontSize:11, color:"#5C534A", fontWeight:"500", textAlign:"center", lineHeight:17, marginBottom:8 },
});
