/**
 * JourneyScreen_v3.jsx — Safar (Refined Heritage)
 * Same soul as v1 — warmer, richer, more authoritative.
 * Deeper greens, stronger shadows, bolder type, Arabic calligraphic accent.
 * Completely separate — does not affect JourneyScreen.jsx.
 * To test: swap import in App.js JourneyStack.
 */
import React, { useState } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ImageBackground, Dimensions,
} from "react-native";

const { width: SW } = Dimensions.get("window");

// ── Design tokens — v3 refined heritage ──────────────────────────────────────
const V = {
  // Backgrounds — warmer and deeper than v1
  bg:         "#E8DDD0",   // deeper parchment
  bgCard:     "#F5EDE0",   // card surface — warmer than #FDFAF4
  bgCardAlt:  "#EEE4D4",   // alternate card — avoids flatness between cards

  // Primary green — richer, more authoritative than #2F5D50
  green:      "#1E3D30",
  greenMid:   "#2A5242",
  greenLight: "#3B6B58",

  // Gold — richer, deeper
  gold:       "#B8922A",
  goldLight:  "#C8A96A",
  goldDim:    "rgba(184,146,42,0.15)",
  goldBorder: "rgba(184,146,42,0.35)",

  // Text — stronger contrast
  text:       "#100E0A",   // near-black with warmth
  textMid:    "#3A3530",   // was #3D3935
  textSub:    "#5C534A",   // was #5A5650 — darker
  textFaint:  "#8A7D70",   // for truly secondary info

  // Borders
  border:     "#C8BFB2",   // warmer, slightly darker than #D4D0CA
  borderSoft: "#DDD5C8",

  // Shadows — warmer and stronger
  shadow:     "#4A2E10",
};

// ── Section divider — bolder than current ────────────────────────────────────
function SectionDivider({ label, sub }) {
  return (
    <View style={sd.wrap}>
      <View style={sd.row}>
        <View style={sd.bar} />
        <Text style={sd.label}>{label.toUpperCase()}</Text>
        <View style={sd.line} />
      </View>
      {sub ? <Text style={sd.sub}>{sub}</Text> : null}
    </View>
  );
}

const sd = StyleSheet.create({
  wrap:  { marginTop:8, marginBottom:18 },
  row:   { flexDirection:"row", alignItems:"center", gap:10, marginBottom:4 },
  bar:   { width:3, height:18, borderRadius:2, backgroundColor:V.green },
  label: { fontSize:10, fontWeight:"800", letterSpacing:2.5, color:V.green },
  line:  { flex:1, height:1, backgroundColor:V.border },
  sub:   { fontSize:13, color:V.textSub, fontWeight:"500", marginLeft:13 },
});

// ── Wide image card — stronger scrim, richer shadow ──────────────────────────
function WideCard({ source, eyebrow, title, sub, badge, countNum, countLbl, onPress, height = 168 }) {
  return (
    <TouchableOpacity style={[wc.wrap, { height }]} onPress={onPress} activeOpacity={0.88}>
      <ImageBackground source={source} style={wc.bg} imageStyle={wc.bgImg}>
        {/* Stronger two-layer scrim */}
        <View style={wc.scrimBase} />
        <View style={wc.scrimGrad} />
        <View style={wc.content}>
          {/* Top */}
          <View style={wc.topRow}>
            {badge ? (
              <View style={wc.badge}>
                <Text style={wc.badgeTxt}>{badge}</Text>
              </View>
            ) : null}
            {countNum ? (
              <View style={wc.countWrap}>
                <Text style={wc.countNum}>{countNum}</Text>
                <Text style={wc.countLbl}>{countLbl}</Text>
              </View>
            ) : null}
            <View style={{ flex:1 }} />
            <Text style={wc.arrow}>{"›"}</Text>
          </View>
          {/* Bottom */}
          <View>
            {eyebrow ? <Text style={wc.eyebrow}>{eyebrow}</Text> : null}
            <Text style={wc.title}>{title}</Text>
            {sub ? <Text style={wc.sub}>{sub}</Text> : null}
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const wc = StyleSheet.create({
  wrap:      { borderRadius:18, overflow:"hidden", marginBottom:12,
               shadowColor:V.shadow, shadowOffset:{width:0,height:5}, shadowOpacity:0.22, shadowRadius:12, elevation:7 },
  bg:        { flex:1 },
  bgImg:     { resizeMode:"cover" },
  scrimBase: { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(6,14,8,0.18)" },
  scrimGrad: { position:"absolute", bottom:0, left:0, right:0, height:"72%", backgroundColor:"rgba(6,14,8,0.68)" },
  content:   { position:"absolute", inset:0, padding:18, justifyContent:"space-between" },
  topRow:    { flexDirection:"row", alignItems:"flex-start" },
  badge:     { backgroundColor:"rgba(255,255,255,0.18)", borderRadius:999, borderWidth:1, borderColor:"rgba(255,255,255,0.28)", paddingHorizontal:13, paddingVertical:5 },
  badgeTxt:  { fontSize:10, fontWeight:"800", color:"#fff", letterSpacing:1.5 },
  countWrap: { },
  countNum:  { fontSize:26, fontWeight:"800", color:"#fff", lineHeight:30 },
  countLbl:  { fontSize:9, color:"rgba(255,255,255,0.7)", fontWeight:"700", letterSpacing:1.2 },
  arrow:     { fontSize:26, color:"rgba(255,255,255,0.8)" },
  eyebrow:   { fontSize:9, fontWeight:"800", letterSpacing:2.2, color:V.goldLight, marginBottom:4 },
  title:     { fontSize:21, fontWeight:"700", color:"#fff", marginBottom:3, letterSpacing:-0.2 },
  sub:       { fontSize:13, color:"rgba(255,255,255,0.82)", fontWeight:"500" },
});

// ── Mode toggle — more authoritative ─────────────────────────────────────────
function ModeToggle({ mode, onSelect }) {
  return (
    <View style={mt.wrap}>
      {[
        { key:"umrah", label:"Umrah", sub:"Any time of year" },
        { key:"hajj",  label:"Hajj",  sub:"Dhul Hijjah" },
      ].map(m => {
        const active = mode === m.key;
        return (
          <TouchableOpacity key={m.key}
            style={active ? [mt.btn, mt.btnActive] : mt.btn}
            onPress={() => onSelect(m.key)} activeOpacity={0.8}>
            <Text style={active ? [mt.label, mt.labelActive] : mt.label}>{m.label}</Text>
            <Text style={active ? [mt.sub, mt.subActive] : mt.sub}>{m.sub}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const mt = StyleSheet.create({
  wrap:        { flexDirection:"row", backgroundColor:V.bgCard, borderRadius:14, borderWidth:1, borderColor:V.border, padding:3, marginBottom:20,
                 shadowColor:V.shadow, shadowOffset:{width:0,height:3}, shadowOpacity:0.12, shadowRadius:8, elevation:4 },
  btn:         { flex:1, paddingVertical:14, borderRadius:11, alignItems:"center", gap:3 },
  btnActive:   { backgroundColor:V.green },
  label:       { fontSize:17, fontWeight:"700", color:V.textSub, letterSpacing:-0.2 },
  labelActive: { color:"#fff" },
  sub:         { fontSize:12, color:V.textFaint, fontWeight:"500" },
  subActive:   { color:"rgba(255,255,255,0.72)" },
});

// ── Dates card — richer ───────────────────────────────────────────────────────
function DatesCard({ dayNum, monthYr, daysAway, onPress }) {
  return (
    <TouchableOpacity style={dc.wrap} onPress={onPress} activeOpacity={0.88}>
      <View style={dc.left}>
        <Text style={dc.eyebrow}>CALENDAR</Text>
        <Text style={dc.title}>Mark Your Dates</Text>
        <Text style={dc.sub}>{"Set departure, Hajj days\n& key milestones"}</Text>
      </View>
      <View style={dc.divider} />
      <View style={dc.right}>
        <Text style={dc.dayNum}>{dayNum}</Text>
        <Text style={dc.monthYr}>{monthYr}</Text>
        <View style={dc.pill}>
          <Text style={dc.pillTxt}>{daysAway} days away</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const dc = StyleSheet.create({
  wrap:    { backgroundColor:V.bgCard, borderRadius:18, borderWidth:1, borderColor:V.border,
             flexDirection:"row", alignItems:"center", padding:18, marginBottom:12, gap:14,
             shadowColor:V.shadow, shadowOffset:{width:0,height:4}, shadowOpacity:0.14, shadowRadius:10, elevation:5 },
  left:    { flex:1 },
  eyebrow: { fontSize:9, fontWeight:"800", letterSpacing:2.2, color:V.greenLight, marginBottom:6 },
  title:   { fontSize:20, fontWeight:"700", color:V.text, marginBottom:4, letterSpacing:-0.2 },
  sub:     { fontSize:13, color:V.textSub, lineHeight:18, fontWeight:"500" },
  divider: { width:1, height:64, backgroundColor:V.border },
  right:   { alignItems:"center", minWidth:76 },
  dayNum:  { fontSize:52, fontWeight:"800", color:V.green, lineHeight:56, letterSpacing:-2 },
  monthYr: { fontSize:12, color:V.textSub, fontWeight:"600", textAlign:"center", marginTop:1 },
  pill:    { backgroundColor:V.goldDim, borderRadius:999, paddingHorizontal:10, paddingVertical:4, marginTop:6, borderWidth:1, borderColor:V.goldBorder },
  pillTxt: { fontSize:10, fontWeight:"700", color:V.gold },
});

// ── Checklist card — deeper, more structured ──────────────────────────────────
function ChecklistCard({ mode, onPress }) {
  const items = mode === "umrah"
    ? ["Umrah visa obtained","Ihram garments packed","Vaccinations complete","Accommodation booked","Talbiyah memorised"]
    : ["Hajj visa & operator","Ihram garments packed","Vaccinations complete","Qurbani arranged","Arafah du'a memorised"];

  return (
    <TouchableOpacity style={cc.wrap} onPress={onPress} activeOpacity={0.88}>
      <View style={cc.header}>
        <View>
          <Text style={cc.eyebrow}>PREPARATION</Text>
          <Text style={cc.title}>{mode === "umrah" ? "Umrah Checklist" : "Hajj Checklist"}</Text>
        </View>
        <View style={cc.counter}>
          <Text style={cc.counterNum}>0</Text>
          <Text style={cc.counterOf}>{"/ " + items.length}</Text>
        </View>
      </View>
      {/* Progress bar */}
      <View style={cc.track}>
        <View style={[cc.fill, { width:"0%" }]} />
      </View>
      {/* Preview items */}
      <View style={cc.items}>
        {items.slice(0, 3).map((item, i) => (
          <View key={i} style={cc.row}>
            <View style={cc.box} />
            <Text style={cc.itemTxt}>{item}</Text>
          </View>
        ))}
        <Text style={cc.more}>{"View all " + items.length + " items  ›"}</Text>
      </View>
    </TouchableOpacity>
  );
}

const cc = StyleSheet.create({
  wrap:        { backgroundColor:V.bgCard, borderRadius:18, borderWidth:1, borderColor:V.border, padding:18, marginBottom:12,
                 shadowColor:V.shadow, shadowOffset:{width:0,height:4}, shadowOpacity:0.14, shadowRadius:10, elevation:5 },
  header:      { flexDirection:"row", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 },
  eyebrow:     { fontSize:9, fontWeight:"800", letterSpacing:2.2, color:V.greenLight, marginBottom:4 },
  title:       { fontSize:20, fontWeight:"700", color:V.text, letterSpacing:-0.2 },
  counter:     { flexDirection:"row", alignItems:"baseline", gap:2 },
  counterNum:  { fontSize:28, fontWeight:"800", color:V.green, lineHeight:32 },
  counterOf:   { fontSize:14, color:V.textSub, fontWeight:"600" },
  track:       { height:3, backgroundColor:V.borderSoft, borderRadius:2, marginBottom:14, overflow:"hidden" },
  fill:        { height:"100%", backgroundColor:V.green, borderRadius:2 },
  items:       { gap:10 },
  row:         { flexDirection:"row", alignItems:"center", gap:10 },
  box:         { width:18, height:18, borderRadius:5, borderWidth:1.5, borderColor:V.border, flexShrink:0 },
  itemTxt:     { fontSize:14, color:V.textMid, fontWeight:"500", flex:1 },
  more:        { fontSize:13, color:V.green, fontWeight:"700", marginTop:4 },
});

// ── Pair cards ────────────────────────────────────────────────────────────────
function PairCard({ source, eyebrow, title, sub, onPress, dark }) {
  return (
    <TouchableOpacity style={pp.wrap} onPress={onPress} activeOpacity={0.88}>
      <ImageBackground source={source} style={pp.bg} imageStyle={pp.bgImg}>
        <View style={[pp.scrim, dark && pp.scrimDark]} />
        <View style={pp.content}>
          <Text style={pp.eyebrow}>{eyebrow}</Text>
          <Text style={pp.title}>{title}</Text>
          <Text style={pp.sub}>{sub}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const pp = StyleSheet.create({
  wrap:     { flex:1, borderRadius:16, overflow:"hidden", height:148,
              shadowColor:V.shadow, shadowOffset:{width:0,height:4}, shadowOpacity:0.18, shadowRadius:10, elevation:6 },
  bg:       { flex:1 },
  bgImg:    { resizeMode:"cover" },
  scrim:    { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(6,14,8,0.38)" },
  scrimDark:{ backgroundColor:"rgba(6,14,8,0.56)" },
  content:  { position:"absolute", bottom:0, left:0, right:0, padding:14 },
  eyebrow:  { fontSize:8, fontWeight:"800", letterSpacing:2, color:V.goldLight, marginBottom:3 },
  title:    { fontSize:16, fontWeight:"700", color:"#fff", marginBottom:2, letterSpacing:-0.2 },
  sub:      { fontSize:12, color:"rgba(255,255,255,0.78)", fontWeight:"500" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function JourneyScreen_v3({ navigation }) {
  const [mode, setMode] = useState("umrah");

  const departureDateStr = "2025-11-15";
  const dDate   = new Date(departureDateStr + "T00:00:00");
  const dayNum  = dDate.getDate().toString();
  const monthYr = dDate.toLocaleDateString("en-GB", { month:"long", year:"numeric" });
  const daysAway = Math.max(0, Math.ceil((dDate - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >

        {/* ── Header — Arabic word as graphic accent ── */}
        <View style={s.header}>
          {/* Faded Arabic "safar" (سَفَر) as background texture */}
          <Text style={s.arabicBg} allowFontScaling={false}>{"سَفَر"}</Text>
          <View style={s.headerContent}>
            <Text style={s.headerEyebrow}>MY SAFAR</Text>
            <Text style={s.headerTitle}>My Journey</Text>
            <Text style={s.headerSub}>
              {"Your hub to plan and prepare\nevery step with confidence."}
            </Text>
          </View>
        </View>

        {/* ── Mode toggle ── */}
        <ModeToggle mode={mode} onSelect={setMode} />

        {/* ════ BEFORE YOU GO ════ */}
        <SectionDivider label="Before You Go" sub="Plan and prepare before you travel" />

        <DatesCard
          dayNum={dayNum}
          monthYr={monthYr}
          daysAway={daysAway}
          onPress={() => {}}
        />

        <ChecklistCard mode={mode} onPress={() => {}} />

        <WideCard
          source={require("../assets/myboard.jpg")}
          eyebrow="YOUR BOARD"
          title="My Journey Board"
          sub="Notes, duas, links & reminders"
          onPress={() => navigation?.navigate?.("MyBoard")}
          height={152}
        />

        {/* ════ DURING YOUR JOURNEY ════ */}
        <SectionDivider label="During Your Journey" sub="Step-by-step guidance and sacred references" />

        <WideCard
          source={require("../assets/kaaba_mixed.png")}
          badge={mode === "umrah" ? "UMRAH 101" : "HAJJ 101"}
          title={mode === "umrah" ? "Umrah Guide" : "Hajj Guide"}
          sub={"Complete step-by-step " + (mode === "umrah" ? "Umrah" : "Hajj") + " walkthrough"}
          onPress={() => {}}
          height={188}
        />

        <WideCard
          source={require("../assets/kaaba_map.png")}
          eyebrow="LOCATIONS"
          title="Sacred Places"
          sub={"Du'as for each location"}
          countNum="14"
          countLbl="SITES"
          onPress={() => navigation?.navigate?.("Map")}
        />

        <WideCard
          source={require("../assets/tab_shared_duas.jpg")}
          eyebrow={"DU'AS"}
          title={mode === "umrah" ? "Umrah Du'as" : "Hajj Du'as"}
          sub={"Authenticated du'as for every step"}
          countNum={mode === "umrah" ? "9" : "11"}
          countLbl={"DU'ĀS"}
          onPress={() => navigation?.navigate?.("DuaList", { filter: mode === "umrah" ? "Umrah" : "Hajj" })}
        />

        {/* ════ YOUR PEOPLE ════ */}
        <SectionDivider label="Your People" sub="Contacts, companions and group updates" />

        <View style={s.pairRow}>
          <PairCard
            source={require("../assets/contacts2.png")}
            eyebrow="CONTACTS"
            title="My Contacts"
            sub="Hotel, guide & emergency"
            dark
            onPress={() => navigation?.navigate?.("MyContacts")}
          />
          <PairCard
            source={require("../assets/myboard.jpg")}
            eyebrow="COMMUNITY"
            title="My Groups"
            sub="Share milestones & updates"
            onPress={() => navigation?.navigate?.("Groups")}
          />
        </View>

        <View style={{ height:48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:V.bg },
  scroll: { paddingHorizontal:20, paddingTop:4 },

  // Header with Arabic calligraphic accent
  header:        { position:"relative", paddingTop:16, paddingBottom:20, overflow:"hidden" },
  arabicBg:      { position:"absolute", right:-10, top:-8, fontSize:110, color:V.green,
                   opacity:0.055, fontWeight:"400", letterSpacing:4, lineHeight:130 },
  headerContent: { },
  headerEyebrow: { fontSize:9, fontWeight:"800", letterSpacing:3, color:V.greenLight, marginBottom:6 },
  headerTitle:   { fontSize:30, fontWeight:"800", color:V.text, letterSpacing:-0.8, marginBottom:5, lineHeight:35 },
  headerSub:     { fontSize:14, color:V.textSub, fontWeight:"500", lineHeight:20, maxWidth:"72%" },

  pairRow:       { flexDirection:"row", gap:10, marginBottom:12 },
});
