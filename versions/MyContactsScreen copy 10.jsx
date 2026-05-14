/**
 * MyContactsScreen.jsx — Safar
 * Journey contacts: hotel, guide, driver, group members etc.
 * Tap to expand — reveals phone, email, WhatsApp.
 * Swipe left to delete, swipe right to edit.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, KeyboardAvoidingView,
  Platform, Animated, PanResponder, Linking, Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SERIF        = "SourceSerif4-Regular";
const CONTACTS_KEY = "safar_journey_contacts_v1";
const SWIPE_THRESHOLD = 70;

const CONTACT_COLORS = ["#1E3D30","#5B4A7A","#7A4A2F","#2F4A7A","#7A6B2F","#4A7A2F"];
const CONTACT_BG     = ["#E8F2EE","#EEE8F5","#F5EDE8","#E8EEF5","#F5F2E8","#EEF5E8"];
const CONTACT_ROLES  = ["Hotel","Guide","Driver","Travel Agent","Group Member","Family","Doctor","Emergency","Other"];

// ── Expandable contact card ───────────────────────────────────────────────────
function ContactCard({ contact, index, onDelete, onEdit, onStar }) {
  const [expanded, setExpanded] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const colorIdx = contact.colorIndex ?? 0;
  const cardBg = CONTACT_BG[colorIdx % CONTACT_BG.length];
  const accentColor = CONTACT_COLORS[colorIdx % CONTACT_COLORS.length];

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 8,
    onMoveShouldSetPanResponder:  (_, gs) => Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderMove: (_, gs) => {
      translateX.setValue(Math.max(-110, Math.min(80, gs.dx)));
    },
    onPanResponderRelease: (_, gs) => {
      if (gs.dx < -SWIPE_THRESHOLD) {
        Animated.spring(translateX, { toValue:-100, useNativeDriver:true }).start();
      } else if (gs.dx > SWIPE_THRESHOLD) {
        Animated.spring(translateX, { toValue:70, useNativeDriver:true }).start();
      } else {
        Animated.spring(translateX, { toValue:0, useNativeDriver:true }).start();
      }
    },
  })).current;

  const resetSwipe = () => Animated.spring(translateX, { toValue:0, useNativeDriver:true }).start();

  const handleDelete = () => {
    Alert.alert("Remove contact", "Remove " + contact.name + "?", [
      { text:"Cancel", style:"cancel", onPress:resetSwipe },
      { text:"Remove", style:"destructive", onPress:() => onDelete(contact.id) },
    ]);
  };

  const handlePress = () => {
    const v = translateX._value;
    if (Math.abs(v) > 10) { resetSwipe(); return; }
    setExpanded(e => !e);
  };

  const initials = contact.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <View style={cc.outer}>
      {/* Delete behind right */}
      <View style={cc.deleteBack}>
        <TouchableOpacity style={cc.actionBtn} onPress={handleDelete}>
          <Text style={cc.actionIcon}>{"🗑️"}</Text>
          <Text style={cc.actionTxt}>Delete</Text>
        </TouchableOpacity>
      </View>
      {/* Edit behind left */}
      <View style={cc.editBack}>
        <TouchableOpacity style={cc.actionBtn} onPress={() => { resetSwipe(); onEdit(contact); }}>
          <Text style={cc.actionIcon}>{"✏️"}</Text>
          <Text style={cc.actionTxt}>Edit</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ transform:[{ translateX }] }} {...panResponder.panHandlers}>
        <TouchableOpacity
          style={[cc.card, { backgroundColor: cardBg, borderColor: accentColor + "33" }]}
          onPress={handlePress}
          activeOpacity={0.92}
        >
          {/* ── Card face ── */}
          <View style={cc.cardFace}>
            {/* Avatar */}
            <View style={[cc.avatar, { backgroundColor: accentColor }]}>
              <Text style={cc.avatarText}>{initials}</Text>
            </View>

            {/* Name + phone */}
            <View style={cc.mainInfo}>
              <Text style={[cc.name, { color: accentColor }]}>{contact.name}</Text>
              {contact.phone
                ? <Text style={cc.phone}>{contact.phone}</Text>
                : <Text style={cc.phonePlaceholder}>No number saved</Text>
              }
            </View>

            {/* Right side: star + role pill stacked */}
            <View style={cc.rightCol}>
              <TouchableOpacity
                onPress={() => onStar(contact.id)}
                hitSlop={{top:8,bottom:8,left:8,right:8}}
                style={cc.starBtn}>
                <Text style={[cc.starIcon, contact.starred && cc.starIconOn]}>
                  {contact.starred ? "★" : "☆"}
                </Text>
              </TouchableOpacity>
              <View style={[cc.rolePill, { backgroundColor: accentColor + "22" }]}>
                <Text style={[cc.roleText, { color: accentColor }]}>{contact.role ?? "Contact"}</Text>
              </View>
            </View>
          </View>

          {/* ── Expanded section ── */}
          {expanded && (
            <View style={[cc.expandedSection, { borderTopColor: accentColor + "22" }]}>
              {/* Phone */}
              {contact.phone ? (
                <TouchableOpacity style={cc.expandRow} onPress={() => Linking.openURL("tel:" + contact.phone)} activeOpacity={0.8}>
                  <View style={[cc.expandIcon, { backgroundColor: accentColor + "18" }]}>
                    <Text style={cc.expandIconTxt}>{"📞"}</Text>
                  </View>
                  <View style={cc.expandInfo}>
                    <Text style={cc.expandLabel}>Phone</Text>
                    <Text style={[cc.expandValue, { color: accentColor }]}>{contact.phone}</Text>
                  </View>
                  <Text style={cc.expandArrow}>{"›"}</Text>
                </TouchableOpacity>
              ) : null}

              {/* WhatsApp */}
              {(contact.whatsapp || contact.phone) ? (
                <TouchableOpacity style={cc.expandRow} onPress={() => Linking.openURL("https://wa.me/" + (contact.whatsapp || contact.phone).replace(/[^0-9]/g, ""))} activeOpacity={0.8}>
                  <View style={[cc.expandIcon, { backgroundColor: "#25D36618" }]}>
                    <Text style={cc.expandIconTxt}>{"💬"}</Text>
                  </View>
                  <View style={cc.expandInfo}>
                    <Text style={cc.expandLabel}>WhatsApp</Text>
                    <Text style={[cc.expandValue, { color:"#25D366" }]}>{contact.whatsapp || contact.phone}</Text>
                  </View>
                  <Text style={cc.expandArrow}>{"›"}</Text>
                </TouchableOpacity>
              ) : null}

              {/* Email */}
              {contact.email ? (
                <TouchableOpacity style={cc.expandRow} onPress={() => Linking.openURL("mailto:" + contact.email)} activeOpacity={0.8}>
                  <View style={[cc.expandIcon, { backgroundColor: accentColor + "18" }]}>
                    <Text style={cc.expandIconTxt}>{"✉️"}</Text>
                  </View>
                  <View style={cc.expandInfo}>
                    <Text style={cc.expandLabel}>Email</Text>
                    <Text style={[cc.expandValue, { color: accentColor }]}>{contact.email}</Text>
                  </View>
                  <Text style={cc.expandArrow}>{"›"}</Text>
                </TouchableOpacity>
              ) : null}

              {/* Note */}
              {contact.note ? (
                <View style={[cc.expandRow, { borderBottomWidth:0 }]}>
                  <View style={[cc.expandIcon, { backgroundColor: accentColor + "18" }]}>
                    <Text style={cc.expandIconTxt}>{"📝"}</Text>
                  </View>
                  <View style={cc.expandInfo}>
                    <Text style={cc.expandLabel}>Note</Text>
                    <Text style={cc.expandNote}>{contact.note}</Text>
                  </View>
                </View>
              ) : null}

              {/* No details fallback */}
              {!contact.phone && !contact.email && !contact.note && (
                <Text style={cc.noDetails}>Tap edit to add phone, email or a note.</Text>
              )}
            </View>
          )}

          {/* Expand chevron */}
          <View style={[cc.chevronRow, { borderTopColor: accentColor + "22" }]}>
            <Text style={[cc.chevron, { color: accentColor }]}>{expanded ? "▲" : "▼"}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const cc = StyleSheet.create({
  outer:      { marginBottom:10 },
  deleteBack: { position:"absolute", right:0, top:0, bottom:0, width:100, backgroundColor:"#E05252", borderRadius:14, alignItems:"center", justifyContent:"center" },
  editBack:   { position:"absolute", left:0, top:0, bottom:0, width:80, backgroundColor:"#1E3D30", borderRadius:14, alignItems:"center", justifyContent:"center" },
  actionBtn:  { alignItems:"center", justifyContent:"center", width:"100%", height:"100%", gap:4 },
  actionIcon: { fontSize:18 },
  actionTxt:  { fontSize:11, color:"#fff", fontWeight:"600" },

  card:         { borderRadius:14, borderWidth:1.5, overflow:"hidden", shadowColor:"#100E0A", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:6, elevation:3 },
  cardFace:     { flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:14, gap:12 },
  avatar:       { width:48, height:48, borderRadius:24, alignItems:"center", justifyContent:"center", flexShrink:0 },
  avatarText:   { fontSize:17, color:"#fff", fontWeight:"700" },

  mainInfo:     { flex:1 },
  name:         { fontFamily:SERIF, fontSize:18, fontWeight:"500", marginBottom:3, lineHeight:22 },
  phone:        { fontSize:15, color:"#100E0A", fontWeight:"400" },
  phonePlaceholder: { fontSize:13, color:"#3A3530", fontStyle:"italic" },

  rightCol:     { alignItems:"flex-end", gap:6 },
  starBtn:      { },
  starIcon:     { fontSize:20, color:"#C8BFB2" },
  starIconOn:   { color:"#C8A96A" },
  rolePill:     { borderRadius:20, paddingHorizontal:10, paddingVertical:4, alignSelf:"flex-start" },
  roleText:     { fontSize:11, fontWeight:"600", letterSpacing:0.3 },

  expandedSection: { borderTopWidth:1, marginHorizontal:14, paddingTop:4, paddingBottom:6 },
  expandRow:    { flexDirection:"row", alignItems:"center", gap:10, paddingVertical:10, borderBottomWidth:1, borderBottomColor:"rgba(0,0,0,0.06)" },
  expandIcon:   { width:36, height:36, borderRadius:18, alignItems:"center", justifyContent:"center", flexShrink:0 },
  expandIconTxt:{ fontSize:16 },
  expandInfo:   { flex:1 },
  expandLabel:  { fontSize:11, color:"#3A3530", fontWeight:"500", marginBottom:1 },
  expandValue:  { fontSize:15, fontWeight:"400" },
  expandNote:   { fontSize:14, color:"#3A3530", lineHeight:20 },
  expandArrow:  { fontSize:18, color:"#C8BFB2" },
  noDetails:    { fontSize:13, color:"#3A3530", fontStyle:"italic", paddingVertical:10, textAlign:"center" },

  chevronRow:   { borderTopWidth:1, alignItems:"center", paddingVertical:6 },
  chevron:      { fontSize:10, fontWeight:"600" },
});

// ── Add / Edit Contact Modal ──────────────────────────────────────────────────
function ContactModal({ visible, editContact, onSave, onClose }) {
  const [name,       setName]       = useState("");
  const [role,       setRole]       = useState("Hotel");
  const [phone,      setPhone]      = useState("");
  const [whatsapp,   setWhatsapp]   = useState("");
  const [email,      setEmail]      = useState("");
  const [note,       setNote]       = useState("");
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    if (editContact) {
      setName(editContact.name ?? "");
      setRole(editContact.role ?? "Hotel");
      setPhone(editContact.phone ?? "");
      setWhatsapp(editContact.whatsapp ?? "");
      setEmail(editContact.email ?? "");
      setNote(editContact.note ?? "");
      setColorIndex(editContact.colorIndex ?? 0);
    } else {
      setName(""); setRole("Hotel"); setPhone(""); setWhatsapp(""); setEmail(""); setNote(""); setColorIndex(0);
    }
  }, [editContact, visible]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: editContact?.id ?? Date.now().toString(),
      name: name.trim(), role, phone: phone.trim(),
      whatsapp: whatsapp.trim(), email: email.trim(),
      note: note.trim(), colorIndex,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios" ? "padding" : "height"}>
        <View style={cm.overlay}>
          <View style={cm.sheet}>
            <View style={cm.handle} />
            <View style={cm.sheetHeader}>
              <View style={{ width:50 }} />
              <Text style={cm.sheetTitle}>{editContact ? "Edit Contact" : "Add Contact"}</Text>
              <TouchableOpacity onPress={onClose}><Text style={cm.closeBtn}>{"✕"}</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Colour picker */}
              <View style={cm.colorRow}>
                {CONTACT_COLORS.map((col, i) => (
                  <TouchableOpacity key={i} style={[cm.swatch, { backgroundColor:col }, colorIndex===i ? cm.swatchActive : null]}
                    onPress={() => setColorIndex(i)} activeOpacity={0.8}>
                    {colorIndex===i && <Text style={cm.swatchCheck}>{"✓"}</Text>}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={cm.fieldLabel}>NAME *</Text>
              <TextInput style={cm.input} placeholder="e.g. Al-Andalus Hotel" placeholderTextColor="#5C534A" value={name} onChangeText={setName} autoFocus />

              <Text style={cm.fieldLabel}>ROLE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cm.roleRow}>
                {CONTACT_ROLES.map(r => (
                  <TouchableOpacity key={r} style={role===r ? [cm.roleChip, cm.roleChipOn] : cm.roleChip}
                    onPress={() => setRole(r)} activeOpacity={0.8}>
                    <Text style={role===r ? [cm.roleChipText, cm.roleChipTextOn] : cm.roleChipText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={cm.fieldLabel}>PHONE</Text>
              <TextInput style={cm.input} placeholder="+966 XX XXX XXXX" placeholderTextColor="#5C534A" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              <Text style={cm.fieldLabel}>WHATSAPP NUMBER</Text>
              <TextInput style={cm.input} placeholder="+966 XX XXX XXXX (if different)" placeholderTextColor="#5C534A" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />

              <Text style={cm.fieldLabel}>EMAIL</Text>
              <TextInput style={cm.input} placeholder="contact@example.com" placeholderTextColor="#5C534A" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

              <Text style={cm.fieldLabel}>NOTE</Text>
              <TextInput style={[cm.input, cm.inputMulti]} placeholder="e.g. Check-in 3pm, ask for Ibrahim at reception" placeholderTextColor="#5C534A" value={note} onChangeText={setNote} multiline />

              <TouchableOpacity style={cm.saveBtn} onPress={handleSave} activeOpacity={0.88}>
                <Text style={cm.saveBtnText}>{editContact ? "Save changes" : "Add contact"}</Text>
              </TouchableOpacity>
              <View style={{ height:32 }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const cm = StyleSheet.create({
  overlay:       { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
  sheet:         { backgroundColor:"#C8DDD4", borderTopLeftRadius:24, borderTopRightRadius:24, paddingHorizontal:20, paddingBottom:16, maxHeight:"90%" },
  handle:        { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginTop:12, marginBottom:8 },
  sheetHeader:   { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:16 },
  sheetTitle:    { fontFamily:SERIF, fontSize:18, color:"#100E0A" },
  closeBtn:      { fontSize:16, color:"#3A3530", width:50, textAlign:"right" },
  colorRow:      { flexDirection:"row", gap:8, marginBottom:16 },
  swatch:        { width:34, height:34, borderRadius:17, alignItems:"center", justifyContent:"center" },
  swatchActive:  { borderWidth:2.5, borderColor:"#100E0A" },
  swatchCheck:   { fontSize:14, color:"#fff", fontWeight:"700" },
  fieldLabel:    { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:"#3A3530", marginBottom:6 },
  input:         { backgroundColor:"#F5EDE0", borderRadius:10, borderWidth:1, borderColor:"#C8BFB2", paddingHorizontal:14, paddingVertical:12, fontSize:16, color:"#100E0A", marginBottom:14, shadowColor:"#4A2E10", shadowOffset:{width:0,height:2}, shadowOpacity:0.14, shadowRadius:6, elevation:3 },
  inputMulti:    { minHeight:72, textAlignVertical:"top" },
  roleRow:       { gap:8, paddingBottom:14 },
  roleChip:      { paddingHorizontal:14, paddingVertical:8, borderRadius:999, borderWidth:1, borderColor:"#C8BFB2", backgroundColor:"#F5EDE0" },
  roleChipOn:    { backgroundColor:"#1E3D30", borderColor:"#1E3D30" },
  roleChipText:  { fontSize:14, color:"#3A3530" },
  roleChipTextOn:{ color:"#fff", fontWeight:"500" },
  saveBtn:       { backgroundColor:"#1E3D30", borderRadius:10, paddingVertical:14, alignItems:"center", marginTop:8, shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5 },
  saveBtnText:   { fontFamily:SERIF, fontSize:16, color:"#fff", fontWeight:"500" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MyContactsScreen({ navigation }) {
  const [contacts,    setContacts]    = useState([]);
  const [showModal,   setShowModal]   = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showImportTip, setShowImportTip] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CONTACTS_KEY)
      .then(v => { if (v) setContacts(JSON.parse(v)); })
      .catch(() => {});
  }, []);

  const save = useCallback(list => {
    setContacts(list);
    AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(list)).catch(() => {});
  }, []);

  const addContact    = c  => { save([...contacts, c]); setShowModal(false); };
  const updateContact = c  => { save(contacts.map(x => x.id===c.id ? c : x)); setEditContact(null); setShowModal(false); };
  const deleteContact = id => save(contacts.filter(c => c.id!==id));
  const starContact   = id => save(contacts.map(c => c.id===id ? { ...c, starred:!c.starred } : c));

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = !q ? contacts : contacts.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.role?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
    // Starred contacts always float to top
    return [...list].sort((a,b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
  }, [contacts, searchQuery]);

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <Text style={s.backArrow}>{"‹"}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>My Contacts</Text>
          <Text style={s.headerSub}>Hotel, guide, driver & travel companions</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => { setEditContact(null); setShowModal(true); }} activeOpacity={0.85}>
          <Text style={s.addBtnText}>{"+"}</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <View style={[s.searchBar, searchFocused && s.searchFocused]}>
          <Text style={s.searchIcon}>{"🔍"}</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search by name, role or number…"
            placeholderTextColor="#5C534A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}
              hitSlop={{top:8,bottom:8,left:8,right:8}}>
              <Text style={s.searchClear}>{"✕"}</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Import contacts hint */}
        <TouchableOpacity style={s.importBtn} onPress={() => setShowImportTip(v => !v)} activeOpacity={0.85}>
          <Text style={s.importBtnIcon}>{"📱"}</Text>
          <Text style={s.importBtnTxt}>Import Contacts</Text>
        </TouchableOpacity>
        {showImportTip && (
          <View style={s.importTipPanel}>
            <Text style={s.importTipText}>
              {"Full phone contacts import requires a dev build with expo-contacts.\n\nFor now, tap + to add contacts manually \u2014 it takes under a minute per contact."}
            </Text>
          </View>
        )}
      </View>

      {/* Starred section label */}
      {contacts.some(c => c.starred) && !searchQuery && (
        <View style={s.sectionLabel}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabelTxt}>VIP CONTACTS</Text>
          <View style={s.sectionLine} />
        </View>
      )}

      {/* Empty state */}
      {contacts.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>{"📞"}</Text>
          <Text style={s.emptyTitle}>No contacts yet</Text>
          <Text style={s.emptyBody}>Save your hotel, travel agent, guide, driver or group members so everything is in one place.</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
            <Text style={s.emptyBtnText}>{"+ Add first contact"}</Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>{"🔍"}</Text>
          <Text style={s.emptyTitle}>No results</Text>
          <Text style={s.emptyBody}>No contacts match "{searchQuery}"</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {filtered.map((contact, index) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              index={index}
              onDelete={deleteContact}
              onEdit={c => { setEditContact(c); setShowModal(true); }}
              onStar={starContact}
            />
          ))}
          <View style={{ height:40 }} />
        </ScrollView>
      )}

      <ContactModal
        visible={showModal}
        editContact={editContact}
        onSave={editContact ? updateContact : addContact}
        onClose={() => { setShowModal(false); setEditContact(null); }}
      />

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex:1, backgroundColor:"#E8DDD0" },
  header:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingTop:16, paddingBottom:14, backgroundColor:"#E8DDD0" },
  backBtn:     { width:36, height:36, borderRadius:18, backgroundColor:"#F5EDE0", borderWidth:1, borderColor:"#C8BFB2", alignItems:"center", justifyContent:"center", shadowColor:"#4A2E10", shadowOffset:{width:0,height:2}, shadowOpacity:0.10, shadowRadius:4, elevation:2 },
  backArrow:   { fontSize:22, color:"#100E0A", lineHeight:26 },
  headerCenter:{ flex:1, paddingHorizontal:12 },
  headerTitle: { fontFamily:SERIF, fontSize:22, color:"#100E0A" },
  headerSub:   { fontSize:12, color:"#3A3530", marginTop:1 },
  addBtn:      { width:36, height:36, borderRadius:18, backgroundColor:"#1E3D30", alignItems:"center", justifyContent:"center", shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5 },
  addBtnText:  { fontSize:22, color:"#fff", lineHeight:26 },

  scroll:      { paddingHorizontal:20, paddingTop:8 },

  // Search
  searchWrap:   { paddingHorizontal:20, paddingBottom:8 },
  searchBar:    { flexDirection:"row", alignItems:"center", gap:10, backgroundColor:"#F5EDE0", borderRadius:14, borderWidth:1.5, borderColor:"#C8BFB2", paddingHorizontal:14, paddingVertical:11, shadowColor:"#4A2E10", shadowOffset:{width:0,height:2}, shadowOpacity:0.14, shadowRadius:6, elevation:3 },
  searchFocused:{ borderColor:"#1E3D30" },
  searchIcon:   { fontSize:15, opacity:0.5 },
  searchInput:  { flex:1, fontSize:16, color:"#100E0A", padding:0 },
  searchClear:  { fontSize:14, color:"#5C534A" },

  // Import row
  importRow:      { flexDirection:"row", alignItems:"center", gap:8, paddingVertical:10, paddingHorizontal:4 },
  importIcon:     { fontSize:16 },
  importTxt:      { flex:1, fontSize:14, color:"#1E3D30", fontWeight:"500" },
  importChev:     { fontSize:11, color:"#3A3530" },
  importTipPanel: { backgroundColor:"#EEE4CB", borderRadius:12, borderWidth:1, borderColor:"#DDD0A8", padding:14, marginTop:2 },
  importTipText:  { fontSize:13, color:"#6B5020", lineHeight:20 },

  // Section label (VIP)
  sectionLabel:    { flexDirection:"row", alignItems:"center", gap:10, paddingHorizontal:20, paddingBottom:10, paddingTop:4 },
  sectionBar:      { width:3, height:18, borderRadius:2, backgroundColor:"#1E3D30" },
  sectionLabelTxt: { fontSize:10, fontWeight:"800", letterSpacing:2.5, color:"#1E3D30" },
  sectionLine:     { flex:1, height:1, backgroundColor:"#C8BFB2" },

  empty:       { flex:1, alignItems:"center", justifyContent:"center", padding:32 },
  emptyEmoji:  { fontSize:44, marginBottom:16 },
  emptyTitle:  { fontFamily:SERIF, fontSize:20, color:"#100E0A", marginBottom:8 },
  emptyBody:   { fontSize:16, color:"#3A3530", textAlign:"center", lineHeight:22, marginBottom:20 },
  emptyBtn:    { backgroundColor:"#1E3D30", borderRadius:10, paddingVertical:12, paddingHorizontal:24, shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5 },
  emptyBtnText:{ color:"#fff", fontWeight:"500" },
});
