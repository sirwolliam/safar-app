/**
 * MyContactsScreen.jsx — Safar
 * Journey contacts: hotel, guide, driver, group members etc.
 * Swipe left to delete, swipe right to edit, long press to reorder.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, KeyboardAvoidingView,
  Platform, Animated, PanResponder, Linking, Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius, typography, shadows } from "../theme";

const SERIF        = "SourceSerif4-Regular";
const CONTACTS_KEY = "safar_journey_contacts_v1";
const SWIPE_THRESHOLD = 80;

const CONTACT_COLORS = ["#4A7A60","#6B5B7A","#7A5B4A","#4A6B7A","#7A6B4A","#5B7A4A"];
const CONTACT_ROLES  = ["Hotel","Guide","Driver","Travel Agent","Group Member","Family","Doctor","Emergency","Other"];
const ROLE_COLORS    = {
  "Hotel":"rgba(74,106,80,0.12)","Guide":"rgba(107,91,122,0.12)",
  "Driver":"rgba(122,91,74,0.12)","Travel Agent":"rgba(74,107,122,0.12)",
  "Group Member":"rgba(47,93,80,0.12)","Family":"rgba(200,169,106,0.15)",
  "Doctor":"rgba(200,80,80,0.12)","Emergency":"rgba(200,80,80,0.18)",
};

// ── Swipeable contact row ─────────────────────────────────────────────────────
function SwipeableContact({ contact, index, onDelete, onEdit }) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 8,
    onMoveShouldSetPanResponder:  (_, gs) => Math.abs(gs.dx) > 8 ? Math.abs : null(gs.dx) > Math.abs(gs.dy),
    onPanResponderMove: (_, gs) => {
      translateX.setValue(Math.max(-140, Math.min(90, gs.dx)));
    },
    onPanResponderRelease: (_, gs) => {
      if (gs.dx < -SWIPE_THRESHOLD) {
        Animated.spring(translateX, { toValue:-120, useNativeDriver:true }).start();
      } else if (gs.dx > SWIPE_THRESHOLD) {
        Animated.spring(translateX, { toValue:80, useNativeDriver:true }).start();
      } else {
        Animated.spring(translateX, { toValue:0, useNativeDriver:true }).start();
      }
    },
  })).current;

  const resetSwipe = () => Animated.spring(translateX, { toValue:0, useNativeDriver:true }).start();

  const handleDelete = () => {
    Alert.alert("Remove contact", "Remove "+contact.name+"?", [
      { text:"Cancel", style:"cancel", onPress:resetSwipe },
      { text:"Remove", style:"destructive", onPress:() => onDelete(contact.id) },
    ]);
  };

  const handleEdit = () => { resetSwipe(); onEdit(contact); };

  return (
    <View style={sc.container}>
      {/* Delete (behind right) */}
      <View style={sc.deleteBack}>
        <TouchableOpacity style={sc.deleteBtn} onPress={handleDelete}>
          <Text style={sc.deleteBtnIcon}>{"\uD83D\uDDD1\uFE0F"}</Text>
          <Text style={sc.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
      {/* Edit (behind left) */}
      <View style={sc.editBack}>
        <TouchableOpacity style={sc.editBtn} onPress={handleEdit}>
          <Text style={sc.editBtnIcon}>{"\u270F\uFE0F"}</Text>
          <Text style={sc.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Card face */}
      <Animated.View style={[sc.face, { transform:[{ translateX }] }]}
        {...panResponder.panHandlers}>
        <TouchableOpacity
          style={sc.cardTouch}
          onPress={() => { const v = translateX._value; if (Math.abs(v) > 10) { resetSwipe(); } else if (contact.phone) { Linking.openURL("tel:"+contact.phone); } }}
          onLongPress={() => {}} // drag handled by reorder buttons
          activeOpacity={0.92}
        >
          <View style={[sc.avatar, { backgroundColor:CONTACT_COLORS[contact.colorIndex ?? 0] }]}>
            <Text style={sc.avatarText}>
              {contact.name?.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() ?? "?"}
            </Text>
          </View>
          <View style={sc.info}>
            <View style={sc.topRow}>
              <Text style={sc.name}>{contact.name}</Text>
              <View style={[sc.rolePill, { backgroundColor:ROLE_COLORS[contact.role] ?? "rgba(47,93,80,0.10)" }]}>
                <Text style={sc.roleText}>{contact.role}</Text>
              </View>
            </View>
            {contact.phone ? <Text style={sc.phone}>{"\uD83D\uDCDE"} {contact.phone}</Text> : null}
            {contact.note  ? <Text style={sc.note} numberOfLines={2}>{contact.note}</Text> : null}
          </View>
          <Text style={sc.drag}>{"\u2630"}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const sc = StyleSheet.create({
  container:    { marginBottom:spacing(1.25), borderRadius:radius.md, overflow:"hidden" },
  deleteBack:   { position:"absolute", right:0, top:0, bottom:0, width:120, backgroundColor:"#E05252", borderRadius:radius.md, alignItems:"center", justifyContent:"center" },
  deleteBtn:    { alignItems:"center", justifyContent:"center", width:"100%", height:"100%", gap:4 },
  deleteBtnIcon:{ fontSize:20 },
  deleteBtnText:{ fontSize:typography.tiny, color:"#fff", fontWeight:"600" },
  editBack:     { position:"absolute", left:0, top:0, bottom:0, width:80, backgroundColor:colors.primary, borderRadius:radius.md, alignItems:"center", justifyContent:"center" },
  editBtn:      { alignItems:"center", justifyContent:"center", width:"100%", height:"100%", gap:4 },
  editBtnIcon:  { fontSize:20 },
  editBtnText:  { fontSize:typography.tiny, color:"#fff", fontWeight:"600" },
  face:         { borderRadius:radius.md },
  cardTouch:    { flexDirection:"row", alignItems:"center", gap:spacing(1.25), backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.75), ...shadows.card },
  avatar:       { width:46, height:46, borderRadius:23, alignItems:"center", justifyContent:"center", flexShrink:0 },
  avatarText:   { fontSize:16, color:"#fff", fontWeight:"700" },
  info:         { flex:1 },
  topRow:       { flexDirection:"row", alignItems:"center", gap:spacing(0.75), marginBottom:3, flexWrap:"wrap" },
  name:         { fontFamily:SERIF, fontSize:typography.body, color:colors.text },
  rolePill:     { borderRadius:radius.pill, paddingHorizontal:spacing(0.875), paddingVertical:2 },
  roleText:     { fontSize:10, color:colors.primary, fontWeight:"600" },
  phone:        { fontSize:typography.small, color:colors.primary, marginBottom:2 },
  note:         { fontSize:typography.tiny, color:colors.subtext, fontWeight:"400", lineHeight:16 },
  drag:         { fontSize:16, color:colors.border, paddingLeft:spacing(0.5) },
});

// ── Add / Edit Contact Modal ──────────────────────────────────────────────────
function ContactModal({ visible, editContact, onSave, onClose }) {
  const [name,       setName]       = useState("");
  const [role,       setRole]       = useState("Hotel");
  const [phone,      setPhone]      = useState("");
  const [note,       setNote]       = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const isEdit = !!editContact;

  useEffect(() => {
    if (editContact) {
      setName(editContact.name ?? "");
      setRole(editContact.role ?? "Hotel");
      setPhone(editContact.phone ?? "");
      setNote(editContact.note ?? "");
      setColorIndex(editContact.colorIndex ?? 0);
    }
  }, [editContact]);

  const reset = () => { setName(""); setRole("Hotel"); setPhone(""); setNote(""); setColorIndex(0); };
  const handleClose = () => { reset(); onClose(); };
  const handleSave = () => {
    if (!name.trim()) return;
    const contact = editContact
      ? { ...editContact, name:name.trim(), role, phone:phone.trim(), note:note.trim(), colorIndex }
      : { id:Date.now().toString(), name:name.trim(), role, phone:phone.trim(), note:note.trim(), colorIndex };
    onSave(contact);
    reset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios"?"padding":"height"}>
        <View style={cm.overlay}>
          <View style={cm.sheet}>
            <View style={cm.handle} />
            <View style={cm.header}>
              <View style={{ width:50 }} />
              <Text style={cm.title}>{isEdit ? "Edit contact" : "Add contact"}</Text>
              <TouchableOpacity onPress={handleClose}><Text style={cm.close}>{"\u2715"}</Text></TouchableOpacity>
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

              <Text style={cm.fieldLabel}>Name *</Text>
              <TextInput style={cm.input} placeholder="e.g. Al-Andalus Hotel" placeholderTextColor={colors.subtext} value={name} onChangeText={setName} autoFocus={!isEdit} />

              <Text style={cm.fieldLabel}>Role</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cm.roleRow}>
                {CONTACT_ROLES.map(r => (
                  <TouchableOpacity key={r} style={[cm.roleChip, role===r ? cm.roleChipOn : null]}
                    onPress={() => setRole(r)} activeOpacity={0.8}>
                    <Text style={[cm.roleChipText, role===r ? cm.roleChipTextOn : null]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={cm.fieldLabel}>Phone (optional)</Text>
              <TextInput style={cm.input} placeholder="+966 XX XXX XXXX" placeholderTextColor={colors.subtext} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              <Text style={cm.fieldLabel}>Note (optional)</Text>
              <TextInput style={[cm.input, cm.inputMulti]} placeholder="e.g. Check-in time 3pm, ask for Ibrahim" placeholderTextColor={colors.subtext} value={note} onChangeText={setNote} multiline />

              <TouchableOpacity style={cm.saveBtn} onPress={handleSave} activeOpacity={0.88}>
                <Text style={cm.saveBtnText}>{isEdit ? "Save changes" : "Save contact"}</Text>
              </TouchableOpacity>
              <View style={{ height:spacing(3) }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const cm = StyleSheet.create({
  overlay:       { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
  sheet:         { backgroundColor:"#D4E4DC", borderTopLeftRadius:24, borderTopRightRadius:24, paddingHorizontal:spacing(2.5), paddingBottom:spacing(2), maxHeight:"90%" },
  handle:        { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginTop:spacing(1.5), marginBottom:spacing(1) },
  header:        { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(2) },
  title:         { fontFamily:SERIF, fontSize:18, color:colors.text },
  close:         { fontSize:16, color:colors.subtext, width:50, textAlign:"right" },
  colorRow:      { flexDirection:"row", gap:spacing(1), marginBottom:spacing(2) },
  swatch:        { width:34, height:34, borderRadius:17, alignItems:"center", justifyContent:"center" },
  swatchActive:  { borderWidth:2.5, borderColor:colors.text },
  swatchCheck:   { fontSize:14, color:"#fff", fontWeight:"700" },
  fieldLabel:    { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:colors.subtext, marginBottom:spacing(0.75) },
  input:         { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, paddingHorizontal:spacing(1.75), paddingVertical:spacing(1.25), fontSize:typography.body, color:colors.text, marginBottom:spacing(1.75),
    ...shadows.card,},
  inputMulti:    { minHeight:72, textAlignVertical:"top" },
  roleRow:       { gap:spacing(0.75), paddingBottom:spacing(1.75) },
  roleChip:      { paddingHorizontal:spacing(1.5), paddingVertical:spacing(0.75), borderRadius:radius.pill, borderWidth:1, borderColor:colors.border, backgroundColor:colors.card },
  roleChipOn:    { backgroundColor:colors.primary, borderColor:colors.primary },
  roleChipText:  { fontSize:typography.small, color:colors.subtext },
  roleChipTextOn:{ color:"#fff", fontWeight:"500" },
  saveBtn:       { backgroundColor:colors.primary, borderRadius:radius.md, paddingVertical:spacing(1.75), alignItems:"center", marginTop:spacing(1), ...shadows.button },
  saveBtnText:   { fontFamily:SERIF, fontSize:typography.body, color:"#fff", fontWeight:"500" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MyContactsScreen({ navigation }) {
  const [contacts,     setContacts]     = useState([]);
  const [showModal,    setShowModal]    = useState(false);
  const [editContact,  setEditContact]  = useState(null);

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
  const moveContact   = (from, to) => {
    if (to < 0 || to >= contacts.length) return;
    const next = [...contacts];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    save(next);
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <Text style={s.backArrow}>{"\u2039"}</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>My Contacts</Text>
          <Text style={s.headerSub}>Hotel, guide, driver & travel companions</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => { setEditContact(null); setShowModal(true); }} activeOpacity={0.85}>
          <Text style={s.addBtnText}>{"+"}</Text>
        </TouchableOpacity>
      </View>

      {/* Hint */}
      {contacts.length > 0 && (
        <View style={s.hintRow}>
          <Text style={s.hint}>{"\u2190\u2192"} Swipe to edit or delete  {"  \u2630"} Drag handle to reorder</Text>
        </View>
      )}

      {/* Empty state */}
      {contacts.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>{"\uD83D\uDCDE"}</Text>
          <Text style={s.emptyTitle}>No contacts yet</Text>
          <Text style={s.emptyBody}>Pin your hotel, travel agent, guide, driver, or group members so everything is in one place when you need it.</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
            <Text style={s.emptyBtnText}>{"+ Add first contact"}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Reorder note */}
          <Text style={s.reorderNote}>Long press any card, then use the {"\u2630"} handle to drag it into position.</Text>

          {contacts.map((contact, index) => (
            <View key={contact.id}>
              <SwipeableContact
                contact={contact}
                index={index}
                onDelete={deleteContact}
                onEdit={c => { setEditContact(c); setShowModal(true); }}
              />
              {/* Reorder buttons — minimal, below each card */}
              <View style={s.reorderRow}>
                <TouchableOpacity style={s.reorderBtn} onPress={() => moveContact(index, index-1)} disabled={index===0} activeOpacity={0.7}>
                  <Text style={[s.reorderBtnText, index===0 ? s.reorderBtnDisabled : null]}>{"\u2191"} Move up</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.reorderBtn} onPress={() => moveContact(index, index+1)} disabled={index===contacts.length-1} activeOpacity={0.7}>
                  <Text style={[s.reorderBtnText, index===contacts.length-1 ? s.reorderBtnDisabled : null]}>Move down {"\u2193"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={{ height:spacing(4) }} />
        </ScrollView>
      )}

      <ContactModal
        visible={showModal}
        editContact={editContact}
        onSave={editContact ? updateContact : addContact}
        onClose={() => { setShowModal(false); setEditContact(null); }}
      />

      {contacts.length > 0 && (
        <TouchableOpacity style={s.fab} onPress={() => { setEditContact(null); setShowModal(true); }} activeOpacity={0.88}>
          <Text style={s.fabText}>{"+"}</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:              { flex:1, backgroundColor:colors.background },
  header:            { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1.5), backgroundColor:colors.background },
  backBtn:           { width:36, height:36, borderRadius:18, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center", ...shadows.card },
  backArrow:         { fontSize:22, color:colors.text, lineHeight:26 },
  headerTitle:       { fontFamily:SERIF, fontSize:22, color:colors.text },
  headerSub:         { fontSize:12, color:colors.subtext, fontWeight:"400", marginTop:1 },
  addBtn:            { width:36, height:36, borderRadius:18, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center", ...shadows.button },
  addBtnText:        { fontSize:22, color:"#fff", lineHeight:26 },
  hintRow:           { paddingHorizontal:spacing(2.5), marginBottom:spacing(1) },
  hint:              { fontSize:typography.tiny, color:colors.subtext, fontWeight:"400" },
  scroll:            { paddingHorizontal:spacing(2.5), paddingTop:spacing(0.5) },
  reorderNote:       { fontSize:typography.tiny, color:colors.subtext, fontWeight:"400", marginBottom:spacing(1.5), lineHeight:17 },
  reorderRow:        { flexDirection:"row", justifyContent:"flex-end", gap:spacing(2), marginTop:-spacing(0.75), marginBottom:spacing(0.75), paddingHorizontal:spacing(0.5) },
  reorderBtn:        {},
  reorderBtnText:    { fontSize:typography.tiny, color:colors.primary, fontWeight:"500" },
  reorderBtnDisabled:{ color:colors.border },
  empty:             { flex:1, alignItems:"center", justifyContent:"center", padding:spacing(3) },
  emptyEmoji:        { fontSize:44, marginBottom:spacing(1.5) },
  emptyTitle:        { fontFamily:SERIF, fontSize:20, color:colors.text, marginBottom:spacing(1) },
  emptyBody:         { fontSize:typography.body, color:colors.subtext, textAlign:"center", lineHeight:22, marginBottom:spacing(2.5) },
  emptyBtn:          { backgroundColor:colors.primary, borderRadius:radius.md, paddingVertical:spacing(1.5), paddingHorizontal:spacing(3), ...shadows.button },
  emptyBtnText:      { color:"#fff", fontWeight:"500" },
  fab:               { position:"absolute", bottom:spacing(3), right:spacing(2.5), width:52, height:52, borderRadius:26, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center", ...shadows.button },
  fabText:           { fontSize:28, color:"#fff", lineHeight:34, marginTop:-2 },
});
