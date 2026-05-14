/**
 * BookmarksScreen.jsx — Safar
 * Saved duas grouped by stage + external links/notes the user adds manually.
 * Persisted via AsyncStorage.
 *
 * NOTE: True iOS Share Sheet integration ("Add Bookmark to Safar" appearing in
 * the system share menu) requires a Share Extension — a native module only
 * available in a development build (not Expo Go). The manual Add Link flow
 * below is the Expo Go-compatible equivalent.
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, KeyboardAvoidingView,
  Platform, Linking, Share,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DUAS } from "../dua-content";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";
const STORAGE_KEY       = "safar_bookmarks_v1";
const LINKS_STORAGE_KEY = "safar_bookmark_links_v1";

// ── Sample external links shown on first load ─────────────────────────────────
const SAMPLE_LINKS = [
  {
    id: "link-1",
    title: "Nusuk — Official Hajj & Umrah Platform",
    url: "https://www.nusuk.sa",
    note: "Official pilgrim services — permits, accommodation, transport",
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "link-2",
    title: "Saudi Ministry of Hajj",
    url: "https://www.haj.gov.sa",
    note: "Visa requirements and official guidance",
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "link-3",
    title: "Sunnah.com — Hadith Reference",
    url: "https://sunnah.com",
    note: "Verify hadith sources for duas",
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

function ScholarlyFootnote() {
  return (
    <View style={fn.wrap}>
      <Text style={fn.text}>
        <Text style={fn.bold}>Sources — </Text>
        Duas are from authenticated hadith collections. Wording may differ across
        the four madhabs. Consult a qualified scholar for rulings specific to your school of thought.
      </Text>
    </View>
  );
}
const fn = StyleSheet.create({
  wrap: { marginHorizontal:20, marginTop:16, marginBottom:8, backgroundColor:"#F5EDD8", borderRadius:10, borderWidth:1, borderColor:"#E8D9B8", padding:16 },
  text: { fontSize:12, color:"#7A6030", lineHeight:17 },
  bold: { fontWeight:"600" },
});

// ── Add Link Modal ────────────────────────────────────────────────────────────
function AddLinkModal({ visible, onSave, onClose }) {
  const [url,   setUrl]   = useState("");
  const [title, setTitle] = useState("");
  const [note,  setNote]  = useState("");

  const reset = () => { setUrl(""); setTitle(""); setNote(""); };

  const handleSave = () => {
    const trimUrl = url.trim();
    if (!trimUrl) return;
    const finalUrl = trimUrl.startsWith("http") ? trimUrl : "https://" + trimUrl;
    onSave({
      id: "link-" + Date.now(),
      title: title.trim() || finalUrl,
      url: finalUrl,
      note: note.trim(),
      addedAt: new Date().toISOString(),
    });
    reset();
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={ml.overlay}>
          <View style={ml.sheet}>
            <View style={ml.sheetHeader}>
              <TouchableOpacity onPress={handleClose}>
                <Text style={ml.cancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={ml.sheetTitle}>Add Bookmark</Text>
              <TouchableOpacity onPress={handleSave} disabled={!url.trim()}>
                <Text style={!url.trim() ? [ml.save, ml.saveDisabled] : ml.save}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={ml.tipCard}>
              <Text style={ml.tipIcon}>{"\uD83D\uDCA1"}</Text>
              <Text style={ml.tipText}>
                Paste any URL here. On iPhone you can also tap Share in Safari {"\u2192"} Copy Link,
                then paste it below. Native "Add to Safar" from the share sheet
                requires a development build.
              </Text>
            </View>

            <Text style={ml.fieldLabel}>URL *</Text>
            <TextInput
              style={ml.input}
              placeholder="https://example.com"
              placeholderTextColor={colors.subtext}
              value={url}
              onChangeText={setUrl}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />

            <Text style={ml.fieldLabel}>Title (optional)</Text>
            <TextInput
              style={ml.input}
              placeholder="e.g. Sunnah.com — Hadith Reference"
              placeholderTextColor={colors.subtext}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={ml.fieldLabel}>Note (optional)</Text>
            <TextInput
              style={[ml.input, ml.inputMulti]}
              placeholder="Why are you saving this?"
              placeholderTextColor={colors.subtext}
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const ml = StyleSheet.create({
  overlay:     { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
  sheet:       { backgroundColor:"#F0EBE0", borderTopLeftRadius:20, borderTopRightRadius:20, padding:20, paddingBottom:40 },
  sheetHeader: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:16 },
  cancel:      { fontSize:16, color:"#5A5650" },
  sheetTitle:  { fontFamily:SERIF, fontSize:16, color:"#1A1712" },
  save:        { fontSize:16, color:"#2F5D50", fontWeight:"600" },
  saveDisabled:{ opacity:0.35 },
  tipCard:     { flexDirection:"row", gap:8, backgroundColor:"#EBF2EE", borderRadius:10, borderWidth:1, borderColor:"#C8DDD0", padding:12, marginBottom:16 },
  tipIcon:     { fontSize:14, marginTop:1 },
  tipText:     { flex:1, fontSize:12, color:"#2F5D50", lineHeight:17 },
  fieldLabel:  { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:"#5A5650", marginBottom:6 },
  input:       { backgroundColor:"#E8DDD0", borderRadius:10, borderWidth:1, borderColor:"#D4D0CA", paddingHorizontal:14, paddingVertical:10, fontSize:16, color:"#1A1712", marginBottom:16,
    shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4,},
  inputMulti:  { minHeight:72, textAlignVertical:"top" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function BookmarksScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);

  const [bookmarkedIds, setBookmarkedIds] = useState([
    "talbiyah", "first-sight-kaaba", "tawaf-start",
    "tawaf-yemeni-corner", "zamzam", "safa-start",
    "safa-dua", "arafah", "farewell-tawaf",
  ]);
  const [links,      setLinks]      = useState(SAMPLE_LINKS);
  const [showModal,  setShowModal]  = useState(false);
  const [activeTab,  setActiveTab]  = useState("duas"); // "duas" | "links"

  // Load persisted data
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(v => { if (v) { const p = JSON.parse(v); if (p.length > 0) setBookmarkedIds(p); } })
      .catch(() => {});
    AsyncStorage.getItem(LINKS_STORAGE_KEY)
      .then(v => { if (v) { const p = JSON.parse(v); if (p.length > 0) setLinks(p); } })
      .catch(() => {});
  }, []);

  const removeDua = (id) => {
    const next = bookmarkedIds.filter(b => b !== id);
    setBookmarkedIds(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const addLink = (link) => {
    const next = [link, ...links];
    setLinks(next);
    setShowModal(false);
    AsyncStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const removeLink = (id) => {
    const next = links.filter(l => l.id !== id);
    setLinks(next);
    AsyncStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  // Group duas by stage
  const bookmarkedDuas = DUAS.filter(d => bookmarkedIds.includes(d.id));
  const grouped = bookmarkedDuas.reduce((acc, dua) => {
    const stage = dua.stage || "General";
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(dua);
    return acc;
  }, {});

  const formatDate = iso => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short" });
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top:12, bottom:12, left:12, right:24 }}>
          <Text style={s.back}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Bookmarks</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => activeTab === "links" ? setShowModal(true) : null}
          activeOpacity={activeTab === "links" ? 0.8 : 1}>
          {activeTab === "links" && <Text style={s.addBtnText}>+</Text>}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {[["duas","Saved Du\u02bf\u0101\u02beS"], ["links","Links"]].map(([key, label]) => (
          <TouchableOpacity key={key}
            style={activeTab === key ? [s.tab, s.tabActive] : s.tab}
            onPress={() => setActiveTab(key)} activeOpacity={0.8}>
            <Text style={activeTab === key ? [s.tabLabel, s.tabLabelActive] : s.tabLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Duas tab ── */}
      {activeTab === "duas" && (
        bookmarkedDuas.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>{"\u2661"}</Text>
            <Text style={s.emptyTitle}>{"No saved du\u02bf\u0101\u02beS yet"}</Text>
            <Text style={s.emptyBody}>{"Open any du\u02bf\u0101\u02be and tap the heart icon to save it here."}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            {Object.entries(grouped).map(([stage, duas]) => (
              <View key={stage} style={s.stageSection}>
                <Text style={s.stageLabel}>{stage}</Text>
                <View style={s.card}>
                  {duas.map((dua, i) => (
                    <TouchableOpacity key={dua.id}
                      style={i < duas.length - 1 ? [s.duaRow, s.duaRowBorder] : s.duaRow}
                      onPress={() => navigation?.navigate?.("DuaDetail", { dua, isBookmarked:true })}
                      activeOpacity={0.85}>
                      <View style={s.duaInfo}>
                        <Text style={s.duaTitle}>{dua.title}</Text>
                        <Text style={s.duaArabic} numberOfLines={1}>{dua.arabic}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeDua(dua.id)} style={s.removeBtn} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
                        <Text style={s.removeIcon}>{"\u2665"}</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
            <ScholarlyFootnote />
            <View style={{ height:spacing(4) }} />
          </ScrollView>
        )
      )}

      {/* ── Links tab ── */}
      {activeTab === "links" && (
        <>
          {/* Add bookmark tip */}
          <View style={s.shareHint}>
            <Text style={s.shareHintIcon}>{"\uD83D\uDCF1"}</Text>
            <View style={s.shareHintText}>
              <Text style={s.shareHintTitle}>Add from Safari</Text>
              <Text style={s.shareHintBody}>
                In Safari, tap Share {"\u2192"} Copy Link, then tap + to paste it here.
              </Text>
            </View>
            <TouchableOpacity style={s.shareHintBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
              <Text style={s.shareHintBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {links.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>{"\uD83D\uDD17"}</Text>
              <Text style={s.emptyTitle}>No links saved yet</Text>
              <Text style={s.emptyBody}>Save URLs to Islamic resources, scholarship pages, or anything useful for your journey.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
              <View style={s.card}>
                {links.map((link, i) => (
                  <View key={link.id} style={i < links.length - 1 ? [s.linkRow, s.linkRowBorder] : s.linkRow}>
                    <TouchableOpacity style={s.linkMain}
                      onPress={() => Linking.openURL(link.url)} activeOpacity={0.85}>
                      <View style={s.linkIconWrap}>
                        <Text style={s.linkIcon}>{"\uD83D\uDD17"}</Text>
                      </View>
                      <View style={s.linkInfo}>
                        <Text style={s.linkTitle} numberOfLines={1}>{link.title}</Text>
                        {link.note ? <Text style={s.linkNote} numberOfLines={1}>{link.note}</Text> : null}
                        <Text style={s.linkUrl} numberOfLines={1}>{link.url.replace("https://","")}</Text>
                      </View>
                      <Text style={s.linkArrow}>{"\u2197"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.linkDelete} onPress={() => removeLink(link.id)} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
                      <Text style={s.linkDeleteIcon}>{"\u2715"}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <Text style={s.linksFooter}>
                Tap + to add any URL. For full share sheet integration{"\n"}
                ("Add to Safar" appearing system-wide), a development build is required.
              </Text>
              <View style={{ height:spacing(4) }} />
            </ScrollView>
          )}
        </>
      )}

      <AddLinkModal visible={showModal} onSave={addLink} onClose={() => setShowModal(false)} />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe:   { flex:1, backgroundColor:"#E8DDD0" },
  header: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1.5) },
  back:        { fontSize:22, color:colors.text },
  headerTitle: { fontFamily:SERIF, fontSize:22, color:colors.text },
  addBtn:      { width:36, height:36, borderRadius:18, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center", ...shadows.button },
  addBtnText:  { fontSize:22, color:"#fff", lineHeight:26 },

  tabs: { flexDirection:"row", marginHorizontal:spacing(2.5), marginBottom:spacing(1.5), backgroundColor:"#E8DDD0", borderRadius:radius.md, padding:3, borderWidth:1, borderColor:colors.border,
    ...shadows.card,},
  tab:          { flex:1, paddingVertical:spacing(1.25), borderRadius:radius.sm, alignItems:"center" },
  tabActive:    { backgroundColor:colors.primary },
  tabLabel:     { fontSize:15, color:colors.subtext, fontWeight:"400" },
  tabLabelActive:{ color:"#fff", fontWeight:"500" },

  empty:      { flex:1, alignItems:"center", justifyContent:"center", padding:spacing(3) },
  emptyEmoji: { fontSize:48, color:colors.border, marginBottom:spacing(2) },
  emptyTitle: { fontFamily:SERIF, fontSize:22, color:colors.text, marginBottom:spacing(1) },
  emptyBody:  { fontSize:typography.body, color:colors.subtext, textAlign:"center", lineHeight:22 },

  scroll:       { paddingHorizontal:spacing(2.5) },
  stageSection: { marginBottom:spacing(2) },
  stageLabel:   { fontFamily:SERIF, fontSize:typography.small, fontWeight:"600", color:colors.accent, letterSpacing:1, marginBottom:spacing(1), marginTop:spacing(1.5) },
  card:         { backgroundColor:"#E8DDD0", borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, overflow:"hidden", ...shadows.card },

  duaRow:       { flexDirection:"row", alignItems:"center", gap:spacing(1.5), paddingHorizontal:spacing(2), paddingVertical:spacing(1.75) },
  duaRowBorder: { borderBottomWidth:1, borderBottomColor:colors.border },
  duaInfo:      { flex:1 },
  duaTitle:     { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:3 },
  duaArabic:    { fontSize:15, color:colors.subtext, textAlign:"right" },
  removeBtn:    { padding:spacing(0.5) },
  removeIcon:   { fontSize:20, color:colors.accent },

  // Share hint banner
  shareHint: {
    flexDirection:"row", alignItems:"center", gap:spacing(1.25),
    marginHorizontal:spacing(2.5), marginBottom:spacing(1.5),
    backgroundColor:"#EBF2EE", borderRadius:radius.md,
    borderWidth:1, borderColor:"#C8DDD0", padding:spacing(1.5),
  },
  shareHintIcon: { fontSize:20 },
  shareHintText: { flex:1 },
  shareHintTitle:{ fontFamily:SERIF, fontSize:typography.small, color:colors.text, marginBottom:2 },
  shareHintBody: { fontSize:typography.tiny, color:colors.subtext, lineHeight:16 },
  shareHintBtn:  { backgroundColor:colors.primary, borderRadius:radius.md, paddingHorizontal:spacing(1.5), paddingVertical:spacing(0.75), ...shadows.button },
  shareHintBtnText:{ fontSize:typography.small, color:"#fff", fontWeight:"600" },

  // Link rows
  linkRow:       { flexDirection:"row", alignItems:"center" },
  linkRowBorder: { borderBottomWidth:1, borderBottomColor:colors.border },
  linkMain:      { flex:1, flexDirection:"row", alignItems:"center", gap:spacing(1.5), paddingHorizontal:spacing(2), paddingVertical:spacing(1.75) },
  linkIconWrap:  { width:38, height:38, borderRadius:radius.sm, backgroundColor:"#E8DDD0", borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  linkIcon:      { fontSize:16 },
  linkInfo:      { flex:1 },
  linkTitle:     { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:2 },
  linkNote:      { fontSize:typography.tiny, color:colors.subtext, marginBottom:1 },
  linkUrl:       { fontSize:typography.tiny, color:colors.primary },
  linkArrow:     { fontSize:16, color:colors.primary },
  linkDelete:    { paddingHorizontal:spacing(2), paddingVertical:spacing(2) },
  linkDeleteIcon:{ fontSize:13, color:colors.border },

  linksFooter: { fontSize:typography.tiny, color:colors.subtext, textAlign:"center", lineHeight:18, marginTop:spacing(2), marginHorizontal:spacing(2.5) },
});
