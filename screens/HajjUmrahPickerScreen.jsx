/**
 * HajjUmrahPickerScreen.jsx — Safar
 * Gateway shown when user taps "Hajj & Umrah" in the du'ā library.
 * Two large image cards — Umrah and Hajj — each leading to PilgrimageDuasScreen.
 */
import React from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity,
  StyleSheet, ImageBackground,
} from "react-native";
import { spacing, shadows } from "../theme";

const SERIF  = "SourceSerif4-Regular";
const BG     = "#F5F0E8";
const BORDER = "#EAE4DC";

export default function HajjUmrahPickerScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.8}
        >
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{"Ḥajj & Umrah Du\u02bfās"}</Text>
          <Text style={s.headerSub}>Choose your pilgrimage</Text>
        </View>
        <View style={{ width:36 }} />
      </View>

      <View style={s.body}>
        <Text style={s.intro}>
          {"Select the du\u02bfās for your pilgrimage. Each collection is arranged by stage so you always know when to say each one."}
        </Text>

        {/* Umrah */}
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.88}
          onPress={() => navigation.navigate("PilgrimageDuas", { mode:"umrah" })}
        >
          <ImageBackground
            source={require("../assets/tawaf.jpg")}
            style={s.cardBg}
            imageStyle={{ borderRadius:16 }}
            resizeMode="cover"
          >
            <View style={s.cardScrim} />
            <View style={s.cardContent}>
              <Text style={s.cardEyebrow}>UMRAH</Text>
              <Text style={s.cardTitle}>{"Umrah Du\u02bfās"}</Text>
              <Text style={s.cardSub}>{"8 stages · Ihrām through Farewell"}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Hajj */}
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.88}
          onPress={() => navigation.navigate("PilgrimageDuas", { mode:"hajj" })}
        >
          <ImageBackground
            source={require("../assets/arafah.jpg")}
            style={s.cardBg}
            imageStyle={{ borderRadius:16 }}
            resizeMode="cover"
          >
            <View style={s.cardScrim} />
            <View style={s.cardContent}>
              <Text style={s.cardEyebrow}>HAJJ</Text>
              <Text style={s.cardTitle}>{"Ḥajj Du\u02bfās"}</Text>
              <Text style={s.cardSub}>{"13 stages · Ihrām through Farewell"}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  header: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingHorizontal:spacing(2.5),
    paddingTop:spacing(2),
    paddingBottom:spacing(1.5),
    borderBottomWidth:1,
    borderBottomColor:BORDER,
    backgroundColor:BG,
  },
  backBtn:      { width:36, height:36, borderRadius:18, backgroundColor:"#fff", borderWidth:1, borderColor:BORDER, alignItems:"center", justifyContent:"center" },
  backArrow:    { fontSize:24, color:"#1C1A14", lineHeight:28 },
  headerCenter: { flex:1, alignItems:"center", paddingHorizontal:spacing(1) },
  headerTitle:  { fontFamily:SERIF, fontSize:22, color:"#1C1A14", fontWeight:"400" },
  headerSub:    { fontSize:12, color:"#7A7060", marginTop:2 },

  body:  { flex:1, padding:spacing(2.5), gap:spacing(2) },
  intro: { fontSize:15, color:"#5C5040", lineHeight:23 },

  card:       { height:180, borderRadius:16, overflow:"hidden", ...shadows.card },
  cardBg:     { flex:1, justifyContent:"flex-end" },
  cardScrim:  { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(8,14,6,0.42)", borderRadius:16 },
  cardContent:{ padding:20 },
  cardEyebrow:{ fontSize:10, color:"rgba(255,255,255,0.72)", fontWeight:"700", letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 },
  cardTitle:  { fontFamily:SERIF, fontSize:28, color:"#fff", fontWeight:"600", marginBottom:4 },
  cardSub:    { fontSize:13, color:"rgba(255,255,255,0.78)" },
});
