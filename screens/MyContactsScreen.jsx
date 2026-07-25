/**
 * MyContactsScreen.jsx — Safar
 * Journey contacts: hotel, guide, driver, group members, etc.
 * Tap to expand — reveals phone, email, WhatsApp. Long-press for edit/delete.
 *
 * Rebuilt 2026-07-23: migrated off superseded palette (#E8DDD0/#100E0A/
 * #C8BFB2/#1E3D30/#C8DDD4), removed emoji, and replaced swipe-to-delete
 * with long-press — the old PanResponder-on-a-tappable-card was exactly
 * the tap-stealing gotcha the TDD documents.
 *
 * Color decision this session: dropped the per-contact custom color picker.
 * It let you pick any of 6 colors independent of role, which meant color
 * wasn't actually signaling a category — the role chip's text already did
 * that job. Kept color for exactly one case where it earns its place:
 * Emergency contacts get a distinct accent so they're spottable at a glance
 * without reading. Everyone else shares one consistent Connect-pillar style.
 *
 * Header was already on the real Ornate pattern (HeaderPatternBg) before
 * this rebuild — untouched here except for palette.
 *
 * Coding rules: StyleSheet.create at module level, literal hex only.
 * No && in style arrays — ternaries only.
 */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, KeyboardAvoidingView,
  Platform, Linking, Alert, Dimensions, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeaderPatternBg from "../HeaderPatternBg";
import SafarAssistCard from "../SafarAssistCard";
import {
  CaretLeft, Plus, MagnifyingGlass, X, Star, Phone, ChatCircle,
  EnvelopeSimple, Note, PencilSimple, Trash, Camera,
  AddressBook, CaretUp, CaretDown,
} from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";
const CONTACTS_KEY = "safar_journey_contacts_v1";
const { width: SW } = Dimensions.get("window");

// ── Palette (literal hex — never theme tokens) ─────────────────────────────
const PAGE_BG    = "#F5F0E8";
const CARD_BG    = "#FDFAF4";
const TEXT       = "#1A1410";
const TEXT_SEC   = "#8A7D6A";
const TEXT_MUTED = "#5C534A";
const BORDER     = "#DDD5C0";
const DIVIDER    = "#EDE4D4";
const SAGE       = "#4A5C48";
const GOLD       = "#C8A96A";
const CONNECT    = "#584260"; // Connect pillar identity color — same convention used in Groups
const DANGER     = "#C24A4A"; // reserved for Emergency contacts only

const CONTACT_ROLES = ["Hotel","Guide","Driver","Travel Agent","Group Member","Family","Doctor","Emergency","Other"];

function accentFor(role) {
  return role === "Emergency" ? DANGER : CONNECT;
}

// ── Expandable contact card ───────────────────────────────────────────────────
function ContactCard({ contact, onDelete, onEdit, onStar }) {
  const [expanded, setExpanded] = useState(false);
  const accent = accentFor(contact.role);
  const initials = contact.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  const handleLongPress = () => {
    Alert.alert(contact.name, undefined, [
      { text: "Edit", onPress: () => onEdit(contact) },
      { text: "Delete", style: "destructive", onPress: () => {
        Alert.alert("Remove contact", `Remove ${contact.name}?`, [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: () => onDelete(contact.id) },
        ]);
      } },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={[cc.card, contact.role === "Emergency" ? cc.cardEmergency : null]}>
      <View style={[cc.stripe, { backgroundColor: accent }]} />
      <TouchableOpacity
        style={cc.touchArea}
        onPress={() => setExpanded(e => !e)}
        onLongPress={handleLongPress}
        delayLongPress={400}
        activeOpacity={0.92}
      >
        <View style={cc.cardFace}>
          <View style={[cc.avatar, { backgroundColor: accent }]}>
            {contact.photoUri ? (
              <Image source={{ uri: contact.photoUri }} style={cc.avatarImg} />
            ) : (
              <Text style={cc.avatarText}>{initials}</Text>
            )}
          </View>

          <View style={cc.mainInfo}>
            <Text style={cc.name}>{contact.name}</Text>
            {contact.phone
              ? <Text style={cc.phone}>{contact.phone}</Text>
              : <Text style={cc.phonePlaceholder}>No number saved</Text>
            }
          </View>

          <View style={cc.rightCol}>
            <TouchableOpacity
              onPress={() => onStar(contact.id)}
              hitSlop={{ top:8, bottom:8, left:8, right:8 }}
              style={cc.starBtn}
            >
              <Star size={20} color={contact.starred ? GOLD : BORDER} weight={contact.starred ? "fill" : "regular"} />
            </TouchableOpacity>
          </View>
        </View>
        {expanded ? (
          <View style={cc.expandedSection}>
            {contact.phone ? (
              <TouchableOpacity style={cc.expandRow} onPress={() => Linking.openURL("tel:" + contact.phone)} activeOpacity={0.8}>
                <View style={cc.expandIcon}><Phone size={16} color={accent} weight="regular" /></View>
                <View style={cc.expandInfo}>
                  <Text style={cc.expandLabel}>Phone</Text>
                  <Text style={[cc.expandValue, { color: accent }]}>{contact.phone}</Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {(contact.whatsapp || contact.phone) ? (
              <TouchableOpacity style={cc.expandRow} onPress={() => Linking.openURL("https://wa.me/" + (contact.whatsapp || contact.phone).replace(/[^0-9]/g, ""))} activeOpacity={0.8}>
                <View style={[cc.expandIcon, { backgroundColor:"#25D36618" }]}><ChatCircle size={16} color="#25D366" weight="regular" /></View>
                <View style={cc.expandInfo}>
                  <Text style={cc.expandLabel}>WhatsApp</Text>
                  <Text style={[cc.expandValue, { color:"#25D366" }]}>{contact.whatsapp || contact.phone}</Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {contact.email ? (
              <TouchableOpacity style={cc.expandRow} onPress={() => Linking.openURL("mailto:" + contact.email)} activeOpacity={0.8}>
                <View style={cc.expandIcon}><EnvelopeSimple size={16} color={accent} weight="regular" /></View>
                <View style={cc.expandInfo}>
                  <Text style={cc.expandLabel}>Email</Text>
                  <Text style={[cc.expandValue, { color: accent }]}>{contact.email}</Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {contact.note ? (
              <View style={[cc.expandRow, { borderBottomWidth:0 }]}>
                <View style={cc.expandIcon}><Note size={16} color={accent} weight="regular" /></View>
                <View style={cc.expandInfo}>
                  <Text style={cc.expandLabel}>Note</Text>
                  <Text style={cc.expandNote}>{contact.note}</Text>
                </View>
              </View>
            ) : null}

            {!contact.phone && !contact.email && !contact.note ? (
              <Text style={cc.noDetails}>Long-press to edit and add phone, email or a note.</Text>
            ) : null}
          </View>
        ) : null}

        <View style={cc.chevronRow}>
          {expanded ? <CaretUp size={12} color={TEXT_SEC} weight="bold" /> : <CaretDown size={12} color={TEXT_SEC} weight="bold" />}
        </View>
      </TouchableOpacity>
      <View style={[cc.rolePill, contact.role === "Emergency" ? cc.rolePillEmergency : null]}>
        <Text style={[cc.roleText, contact.role === "Emergency" ? cc.roleTextEmergency : null]}>
          {contact.role ?? "Contact"}
        </Text>
      </View>
    </View>
  );
}

const cc = StyleSheet.create({
  card:       { position:"relative", flexDirection:"row", borderRadius:14, borderWidth:1, borderColor:BORDER, backgroundColor:CARD_BG, marginBottom:10, overflow:"hidden", shadowColor:"#2A1F0E", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:8, elevation:3 },
  cardEmergency: { borderColor:"#C24A4A55" },
  stripe:     { width:4 },
  touchArea:  { flex:1 },

  cardFace:     { flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:14, gap:12 },
  avatar:       { width:48, height:48, borderRadius:24, alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" },
  avatarImg:    { width:48, height:48 },
  avatarText:   { fontSize:17, color:"#fff", fontWeight:"700" },

  mainInfo:     { flex:1 },
  name:         { fontSize:17, fontWeight:"700", color:TEXT, marginBottom:3, lineHeight:22 },
  phone:        { fontSize:15, color:TEXT, fontWeight:"400" },
  phonePlaceholder: { fontSize:13, color:TEXT_MUTED, fontStyle:"italic" },

  rightCol:     { alignItems:"flex-end", gap:6 },
  starBtn:      {},
  rolePill:     { position:"absolute", top:10, right:12, borderRadius:20, paddingHorizontal:10, paddingVertical:4, backgroundColor:DIVIDER },
  rolePillEmergency: { backgroundColor:"#C24A4A18" },
  roleText:     { fontSize:11, fontWeight:"600", letterSpacing:0.3, color:TEXT_MUTED },
  roleTextEmergency: { color:DANGER },

  expandedSection: { borderTopWidth:1, borderTopColor:DIVIDER, marginHorizontal:14, paddingTop:4, paddingBottom:6 },
  expandRow:    { flexDirection:"row", alignItems:"center", gap:10, paddingVertical:10, borderBottomWidth:1, borderBottomColor:DIVIDER },
  expandIcon:   { width:36, height:36, borderRadius:18, alignItems:"center", justifyContent:"center", flexShrink:0, backgroundColor:"#4A5C4814" },
  expandInfo:   { flex:1 },
  expandLabel:  { fontSize:11, color:TEXT_MUTED, fontWeight:"500", marginBottom:1 },
  expandValue:  { fontSize:15, fontWeight:"400" },
  expandNote:   { fontSize:14, color:TEXT_MUTED, lineHeight:20 },
  noDetails:    { fontSize:13, color:TEXT_MUTED, fontStyle:"italic", paddingVertical:10, textAlign:"center" },

  chevronRow:   { borderTopWidth:1, borderTopColor:DIVIDER, alignItems:"center", paddingVertical:6 },
});

// ── Add / Edit Contact Modal ──────────────────────────────────────────────────
function ContactModal({ visible, editContact, onSave, onClose }) {
  const [name,     setName]     = useState("");
  const [role,     setRole]     = useState("Hotel");
  const [phone,    setPhone]    = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email,    setEmail]    = useState("");
  const [note,     setNote]     = useState("");
  const [photoUri, setPhotoUri] = useState(null);

  useEffect(() => {
    if (editContact) {
      setName(editContact.name ?? "");
      setRole(editContact.role ?? "Hotel");
      setPhone(editContact.phone ?? "");
      setWhatsapp(editContact.whatsapp ?? "");
      setEmail(editContact.email ?? "");
      setNote(editContact.note ?? "");
      setPhotoUri(editContact.photoUri ?? null);
    } else {
      setName(""); setRole("Hotel"); setPhone(""); setWhatsapp(""); setEmail(""); setNote(""); setPhotoUri(null);
    }
  }, [editContact, visible]);

  const pickPhoto = async () => {
    try {
      const ImagePicker = require("expo-image-picker");
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert("Permission needed", "Allow photo access to add a contact photo."); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets?.[0]) setPhotoUri(result.assets[0].uri);
    } catch (_) {
      Alert.alert("Coming soon", "Contact photos will be available in the full app release.");
    }
  };

  const initials = (name || "").trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join("") || "?";

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: editContact?.id ?? Date.now().toString(),
      name: name.trim(), role, phone: phone.trim(),
      whatsapp: whatsapp.trim(), email: email.trim(),
      note: note.trim(), starred: editContact?.starred ?? false,
      photoUri,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={cm.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
          <View style={cm.sheet}>
            <View style={cm.handle} />
            <View style={cm.sheetHeader}>
              <View style={{ width:30 }} />
              <Text style={cm.sheetTitle}>{editContact ? "Edit Contact" : "Add Contact"}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                <X size={18} color={TEXT_MUTED} weight="bold" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={cm.avatarRow}>
                <TouchableOpacity onPress={pickPhoto} activeOpacity={0.85}>
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={cm.avatarImg} />
                  ) : (
                    <View style={[cm.avatarPlaceholder, { backgroundColor: accentFor(role) }]}>
                      <Text style={cm.avatarPlaceholderTxt}>{initials}</Text>
                    </View>
                  )}
                  <View style={cm.avatarBadge}>
                    <Camera size={12} color="#FFFFFF" weight="bold" />
                  </View>
                </TouchableOpacity>
                {photoUri ? (
                  <TouchableOpacity onPress={() => setPhotoUri(null)} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                    <Text style={cm.avatarRemoveTxt}>Remove photo</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={cm.avatarHint}>Tap to add a photo</Text>
                )}
              </View>

              <Text style={cm.fieldLabel}>NAME *</Text>
              <TextInput style={cm.input} placeholder="e.g. Al-Andalus Hotel" placeholderTextColor={TEXT_MUTED} value={name} onChangeText={setName} autoFocus />

              <Text style={cm.fieldLabel}>ROLE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cm.roleRow}>
                {CONTACT_ROLES.map(r => (
                  <TouchableOpacity key={r} style={role === r ? [cm.roleChip, cm.roleChipOn] : cm.roleChip} onPress={() => setRole(r)} activeOpacity={0.8}>
                    <Text style={role === r ? [cm.roleChipText, cm.roleChipTextOn] : cm.roleChipText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={cm.fieldLabel}>PHONE</Text>
              <TextInput style={cm.input} placeholder="+966 XX XXX XXXX" placeholderTextColor={TEXT_MUTED} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              <Text style={cm.fieldLabel}>WHATSAPP NUMBER</Text>
              <TextInput style={cm.input} placeholder="+966 XX XXX XXXX (if different)" placeholderTextColor={TEXT_MUTED} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />

              <Text style={cm.fieldLabel}>EMAIL</Text>
              <TextInput style={cm.input} placeholder="contact@example.com" placeholderTextColor={TEXT_MUTED} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

              <Text style={cm.fieldLabel}>NOTE</Text>
              <TextInput style={[cm.input, cm.inputMulti]} placeholder="e.g. Check-in 3pm, ask for Ibrahim at reception" placeholderTextColor={TEXT_MUTED} value={note} onChangeText={setNote} multiline />
              <View style={{ height:12 }} />
            </ScrollView>

            <View style={cm.footer}>
              <TouchableOpacity style={name.trim() ? cm.saveBtn : [cm.saveBtn, cm.saveBtnDim]} onPress={handleSave} disabled={!name.trim()} activeOpacity={0.88}>
                <Text style={cm.saveBtnText}>{editContact ? "Save changes" : "Add contact"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const cm = StyleSheet.create({
  overlay:       { flex:1, backgroundColor:"rgba(26,20,16,0.4)", justifyContent:"flex-end" },
  sheet:         { backgroundColor:CARD_BG, borderTopLeftRadius:24, borderTopRightRadius:24, paddingHorizontal:20, paddingTop:0, maxHeight:"90%", flexShrink:1 },
  footer:        { paddingTop:12, paddingBottom:Platform.OS === "ios" ? 28 : 16, backgroundColor:CARD_BG },
  handle:        { width:36, height:4, borderRadius:2, backgroundColor:BORDER, alignSelf:"center", marginTop:12, marginBottom:8 },
  sheetHeader:   { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:16 },
  sheetTitle:    { fontFamily:SERIF, fontSize:18, color:TEXT },
  fieldLabel:    { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:TEXT_MUTED, marginBottom:6 },
  avatarRow:     { flexDirection:"row", alignItems:"center", gap:12, marginBottom:18, marginTop:16 },
  avatarPlaceholder: { width:56, height:56, borderRadius:28, alignItems:"center", justifyContent:"center" },
  avatarPlaceholderTxt: { fontSize:19, color:"#FFFFFF", fontWeight:"700" },
  avatarImg:     { width:56, height:56, borderRadius:28 },
  avatarBadge:   { position:"absolute", bottom:-2, right:-2, width:22, height:22, borderRadius:11, backgroundColor:SAGE, borderWidth:2, borderColor:CARD_BG, alignItems:"center", justifyContent:"center" },
  avatarHint:    { fontSize:14, color:TEXT_MUTED },
  avatarRemoveTxt: { fontSize:14, color:DANGER, fontWeight:"500" },
  input:         { backgroundColor:PAGE_BG, borderRadius:10, borderWidth:1, borderColor:BORDER, paddingHorizontal:14, paddingVertical:12, fontSize:16, color:TEXT, marginBottom:14 },
  inputMulti:    { minHeight:72, textAlignVertical:"top" },
  roleRow:       { gap:8, paddingBottom:14 },
  roleChip:      { paddingHorizontal:14, paddingVertical:8, borderRadius:999, borderWidth:1, borderColor:BORDER, backgroundColor:PAGE_BG },
  roleChipOn:    { backgroundColor:SAGE, borderColor:SAGE },
  roleChipText:  { fontSize:14, color:TEXT_MUTED },
  roleChipTextOn:{ color:"#fff", fontWeight:"500" },
  saveBtn:       { backgroundColor:SAGE, borderRadius:10, paddingVertical:14, alignItems:"center", marginTop:8 },
  saveBtnDim:    { opacity:0.4 },
  saveBtnText:   { fontFamily:SERIF, fontSize:16, color:"#fff", fontWeight:"500" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MyContactsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [contacts,      setContacts]      = useState([]);
  const [showModal,     setShowModal]     = useState(false);
  const [editContact,   setEditContact]   = useState(null);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

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
  const updateContact = c  => { save(contacts.map(x => x.id === c.id ? c : x)); setEditContact(null); setShowModal(false); };
  const deleteContact = id => save(contacts.filter(c => c.id !== id));
  const starContact   = id => save(contacts.map(c => c.id === id ? { ...c, starred: !c.starred } : c));

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = !q ? contacts : contacts.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.role?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
    return [...list].sort((a, b) => {
      const starDiff = (b.starred ? 1 : 0) - (a.starred ? 1 : 0);
      if (starDiff !== 0) return starDiff;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [contacts, searchQuery]);

  return (
    <View style={s.safe}>
      {/* Header — already on the real Ornate pattern, palette fixed here */}
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => {
              const returnToTab = route?.params?.returnToTab;
              if (returnToTab) navigation?.getParent?.()?.navigate?.(returnToTab);
              else navigation?.goBack?.();
            }}
            activeOpacity={0.8}
          >
            <CaretLeft size={18} color="#1A1712" weight="bold" />
          </TouchableOpacity>
          <TouchableOpacity style={s.addBtn} onPress={() => { setEditContact(null); setShowModal(true); }} activeOpacity={0.85}>
            <Plus size={18} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
        </View>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>My Contacts</Text>
          <Text style={s.headerSub}>Hotel, guide, driver & travel companions</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <View style={searchFocused ? [s.searchBar, s.searchBarFocused] : s.searchBar}>
          <MagnifyingGlass size={16} color={TEXT_MUTED} weight="regular" />
          <TextInput
            style={s.searchInput}
            placeholder="Search by name, role or number…"
            placeholderTextColor={TEXT_MUTED}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
              <X size={14} color={TEXT_MUTED} weight="bold" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {contacts.length === 0 ? (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.emptyInline}>
            <AddressBook size={40} color={BORDER} weight="thin" />
            <Text style={s.emptyTitle}>No contacts yet</Text>
            <Text style={s.emptyBody}>Save your hotel, travel agent, guide, driver or group members so everything is in one place.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
              <Text style={s.emptyBtnText}>+ Add first contact</Text>
            </TouchableOpacity>
          </View>
          <SafarAssistCard
            title="Import with Safar Assist"
            subtitle="Bring in your contacts from your phone, Notes, or Google Docs"
            tagline="Speak it, scan it, or upload it"
            onPress={() => navigation.navigate("SafarAssist")}
          />
        </ScrollView>
      ) : filtered.length === 0 ? (
        <View style={s.empty}>
          <MagnifyingGlass size={40} color={BORDER} weight="thin" />
          <Text style={s.emptyTitle}>No results</Text>
          <Text style={s.emptyBody}>No contacts match "{searchQuery}"</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {filtered.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onDelete={deleteContact}
              onEdit={c => { setEditContact(c); setShowModal(true); }}
              onStar={starContact}
            />
          ))}
          <SafarAssistCard
            title="Import with Safar Assist"
            subtitle="Bring in your contacts from your phone, Notes, or Google Docs"
            tagline="Speak it, scan it, or upload it"
            onPress={() => navigation.navigate("SafarAssist")}
          />
          <View style={{ height:40 }} />
        </ScrollView>
      )}

      <ContactModal
        visible={showModal}
        editContact={editContact}
        onSave={editContact ? updateContact : addContact}
        onClose={() => { setShowModal(false); setEditContact(null); }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  safe:        { flex:1, backgroundColor:PAGE_BG },
  header:      { backgroundColor:SAGE, minHeight:160, position:"relative", overflow:"hidden", paddingHorizontal:20, paddingBottom:16 },
  headerTopRow:{ flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  backBtn:     { width:36, height:36, borderRadius:18, backgroundColor:CARD_BG, borderWidth:1, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center" },
  headerCenter:{ alignItems:"center", marginTop:16 },
  headerTitle: { fontFamily:SERIF, fontSize:38, color:CARD_BG },
  headerSub:   { fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:1 },
  addBtn:      { width:36, height:36, borderRadius:18, backgroundColor:"rgba(255,255,255,0.16)", alignItems:"center", justifyContent:"center" },

  scroll:      { paddingHorizontal:20, paddingTop:8 },

  searchWrap:   { paddingHorizontal:20, paddingTop:16, paddingBottom:8 },
  searchBar:    { flexDirection:"row", alignItems:"center", gap:10, backgroundColor:CARD_BG, borderRadius:14, borderWidth:1, borderColor:BORDER, paddingHorizontal:14, paddingVertical:11, shadowColor:"#2A1F0E", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:8, elevation:3 },
  searchBarFocused: { borderColor:SAGE },
  searchInput:  { flex:1, fontSize:16, color:TEXT, padding:0 },

  empty:       { flex:1, alignItems:"center", justifyContent:"center", padding:32, gap:4 },
  emptyInline: { alignItems:"center", padding:32, gap:4 },
  emptyTitle:  { fontFamily:SERIF, fontSize:20, color:TEXT, marginTop:12, marginBottom:4 },
  emptyBody:   { fontSize:15, color:TEXT_MUTED, textAlign:"center", lineHeight:22, marginBottom:16 },
  emptyBtn:    { backgroundColor:SAGE, borderRadius:10, paddingVertical:12, paddingHorizontal:24 },
  emptyBtnText:{ color:"#fff", fontWeight:"600" },
});
