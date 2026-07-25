/**
 * GroupsScreen.jsx — Safar
 * Groups list — calm card list, one row per group with member count and
 * latest milestone preview. Tap a group to open GroupDetailScreen.
 *
 * Rebuilt 2026-07-23: separated from the old single-screen tabs+feed layout
 * (which is now GroupDetailScreen's job). No per-group color — one
 * consistent style, per design decision this session.
 *
 * Coding rules: StyleSheet.create at module level, literal hex only.
 * No && in style arrays — ternaries only. Phosphor icons used here
 * (CaretLeft, CaretRight, Plus, UsersThree) are already proven elsewhere
 * in this codebase (ConnectHubScreen.jsx).
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  Modal, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { CaretLeft, CaretRight, Plus, UsersThree } from "phosphor-react-native";
import HeaderPatternBg from "../HeaderPatternBg";
import {
  getCurrentUser, subscribeToUserGroups, createGroup, joinGroupByCode,
} from "../firebase";
import { getAllGroupMeta } from "../groupMetaStore";

const SERIF = "SourceSerif4-Regular";
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
const CONNECT    = "#584260"; // Connect pillar identity color — used for the
                               // solid default group-icon box, same convention
                               // Tools uses its own pillar color for row icons

// ── Demo data — shown until real Firebase groups exist. firebase.js is
// currently fully stubbed (subscribeToUserGroups always returns []), so
// this is what every user sees today, not just an empty-state fallback.
// Two groups here on purpose: one you own, one you were added to, so the
// My Groups / Shared with Me toggle actually has something to filter. ──────
const EX_MILESTONES = [
  { author: "Ahmed Al-Rashid", text: "Completed Tawaf al-Qudum, alhamdulillah", time: "2h ago" },
  { author: "Fatima Hassan",   text: "Making dua at Maqam Ibrahim right now", time: "4h ago" },
  { author: "Maryam Khan",     text: "First time seeing the Kaaba. Subhanallah.", time: "6h ago" },
];
const INIT_GROUPS = [
  { id: "ex1", name: "Our Pilgrimage Family", memberUids: ["u1","u2","u3","u4"], isExample: true, ownerUid: "u4" },
  { id: "ex2", name: "Riyadh Travel Group",   memberUids: ["u2","u4","u5","u6"], isExample: true, ownerUid: "u2" },
];

// ── Group avatar — icon (default), initials, or a chosen photo. Mirrors
// GroupDetailScreen's GroupAvatar; duplicated rather than shared since it's
// ~15 lines and both files already read from the same groupMetaStore. ────────
function GroupAvatar({ meta, name, size = 48 }) {
  if (meta?.avatarMode === "photo" && meta?.photoUri) {
    return <Image source={{ uri: meta.photoUri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  if (meta?.avatarMode === "initials") {
    const initials = (name || "").trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join("") || "S";
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#C8A96A", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: size * 0.38, fontWeight: "700", color: "#FFFFFF" }}>{initials}</Text>
      </View>
    );
  }
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: CONNECT, alignItems: "center", justifyContent: "center" }}>
      <UsersThree size={size * 0.46} color="#C8A96A" weight="regular" />
    </View>
  );
}

// ── Group card ──────────────────────────────────────────────────────────────
function GroupCard({ group, meta, name, memberCount, latest, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardIcon}>
        <GroupAvatar meta={meta} name={name} size={48} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
        {latest ? (
          <Text style={styles.cardPreview} numberOfLines={1}>
            {latest.author.split(" ")[0]}: {latest.text}
          </Text>
        ) : (
          <Text style={styles.cardPreviewEmpty}>No milestones yet</Text>
        )}
        <Text style={styles.cardMeta}>
          {memberCount} member{memberCount === 1 ? "" : "s"}{latest ? `  ·  ${latest.time}` : ""}
        </Text>
      </View>
      <CaretRight size={18} color={BORDER} weight="bold" />
    </TouchableOpacity>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GroupsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const currentUser = getCurrentUser();

  const [realGroups, setRealGroups] = useState([]);
  const [exGroups,   setExGroups]   = useState(INIT_GROUPS);
  const [metaMap,    setMetaMap]    = useState({});
  const [filter,     setFilter]     = useState("mine"); // "mine" | "shared"
  const [showAdd,    setShowAdd]    = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin,   setShowJoin]   = useState(false);
  const [newName,    setNewName]    = useState("");
  const [joinCode,   setJoinCode]   = useState("");
  const [joinLoading,setJoinLoading]= useState(false);
  const [joinError,  setJoinError]  = useState("");
  const [creating,   setCreating]   = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToUserGroups(currentUser.uid, setRealGroups);
  }, [currentUser?.uid]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAllGroupMeta().then(m => { if (active) setMetaMap(m); });
      return () => { active = false; };
    }, [])
  );

  const usingEx = realGroups.length === 0;
  const allGroups = usingEx ? exGroups : realGroups;
  const groups = allGroups.filter(g =>
    filter === "mine" ? g.ownerUid === (currentUser?.uid ?? "u4") : g.ownerUid !== (currentUser?.uid ?? "u4")
  );

  const memberCountFor = (g) => (g.memberUids ?? g.members ?? []).length;
  // Real groups don't have a fetched "latest milestone" on the list screen
  // yet — that would mean subscribing per group here, which is wasteful.
  // Shows once a group has actually been opened and posted to, or once
  // real Firebase is wired with a proper "latest milestone" query.
  const latestFor = (g) => (g.id === "ex1" ? EX_MILESTONES[0] : null);

  const doCreate = async () => {
    if (!newName.trim() || creating) return;
    setCreating(true);
    if (usingEx) {
      const g = { id: `local_${Date.now()}`, name: newName.trim(), memberUids: ["u4"], isExample: false, ownerUid: currentUser?.uid ?? "u4" };
      setExGroups(p => [...p, g]);
    } else {
      await createGroup(currentUser?.uid ?? "local", newName.trim()).catch(() => {});
    }
    setNewName("");
    setCreating(false);
    setShowCreate(false);
  };

  const doJoin = async () => {
    if (!joinCode.trim() || joinLoading) return;
    setJoinLoading(true);
    setJoinError("");
    try {
      const result = await joinGroupByCode(joinCode, currentUser?.uid, currentUser?.displayName);
      setJoinCode("");
      setShowJoin(false);
      Alert.alert("Joined!", `You've joined "${result.name}". Welcome to the group.`);
    } catch (e) {
      setJoinError(e.message ?? "Code not found. Check and try again.");
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* ── Sage Ornate Header — matches CalendarScreen's real implementation ── */}
      <View style={styles.header}>
        <HeaderPatternBg width={SW} />
        <View style={[styles.headerTopRow, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation?.goBack?.()} hitSlop={{ top:12, bottom:12, left:12, right:24 }} activeOpacity={0.8}>
            <CaretLeft size={20} color="#1A1712" weight="bold" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setShowAdd(true)} hitSlop={{ top:12, bottom:12, left:24, right:12 }} activeOpacity={0.8}>
            <Plus size={20} color="#1A1712" weight="bold" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Groups</Text>
      </View>

      {/* ── My Groups / Shared with Me ── */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={filter === "mine" ? [styles.filterPill, styles.filterPillActive] : styles.filterPill}
          onPress={() => setFilter("mine")}
          activeOpacity={0.8}
        >
          <Text style={filter === "mine" ? [styles.filterTxt, styles.filterTxtActive] : styles.filterTxt}>My Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={filter === "shared" ? [styles.filterPill, styles.filterPillActive] : styles.filterPill}
          onPress={() => setFilter("shared")}
          activeOpacity={0.8}
        >
          <Text style={filter === "shared" ? [styles.filterTxt, styles.filterTxtActive] : styles.filterTxt}>Shared with Me</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {usingEx ? (
          <View style={styles.notice}>
            <Text style={styles.noticeTxt}>Sample groups shown. Create your own to get started.</Text>
          </View>
        ) : null}

        {groups.length === 0 ? (
          <View style={styles.emptyFilter}>
            <Text style={styles.emptyFilterTxt}>
              {filter === "mine" ? "You haven't created any groups yet." : "No groups have been shared with you yet."}
            </Text>
          </View>
        ) : null}

        {groups.map(g => (
          <GroupCard
            key={g.id}
            group={g}
            meta={metaMap[g.id]}
            name={metaMap[g.id]?.name ?? g.name}
            memberCount={memberCountFor(g)}
            latest={latestFor(g)}
            onPress={() => navigation?.navigate?.("GroupDetail", { group: g, allGroups })}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add action sheet — Create or Join */}
      <Modal visible={showAdd} transparent animationType="fade">
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowAdd(false)} />
          <View style={styles.addSheet}>
            <TouchableOpacity style={styles.addOption} onPress={() => { setShowAdd(false); setShowCreate(true); }} activeOpacity={0.8}>
              <Text style={styles.addOptionTxt}>Create a group</Text>
            </TouchableOpacity>
            <View style={styles.addDivider} />
            <TouchableOpacity style={styles.addOption} onPress={() => { setShowAdd(false); setShowJoin(true); }} activeOpacity={0.8}>
              <Text style={styles.addOptionTxt}>Join with a code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create group modal */}
      <Modal visible={showCreate} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.backdrop}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => { setShowCreate(false); setNewName(""); }} />
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.mTitle}>New group</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Family Hajj 2026"
                placeholderTextColor={TEXT_MUTED}
                value={newName}
                onChangeText={setNewName}
                autoFocus
                returnKeyType="done"
              />
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowCreate(false); setNewName(""); }}>
                  <Text style={styles.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={(!newName.trim() || creating) ? [styles.submitBtn, styles.submitDim] : styles.submitBtn}
                  onPress={doCreate}
                  disabled={!newName.trim() || creating}
                >
                  {creating ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitTxt}>Create</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Join group modal */}
      <Modal visible={showJoin} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.backdrop}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => { setShowJoin(false); setJoinCode(""); setJoinError(""); }} />
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.mTitle}>Join a group</Text>
              <Text style={styles.mSub}>Enter the 6-character invite code shared with you.</Text>
              <TextInput
                style={joinError ? [styles.input, styles.codeInput, styles.inputError] : [styles.input, styles.codeInput]}
                placeholder="e.g. A4BK7R"
                placeholderTextColor={TEXT_MUTED}
                value={joinCode}
                onChangeText={t => { setJoinCode(t.toUpperCase().slice(0, 6)); setJoinError(""); }}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                autoFocus
                returnKeyType="join"
                onSubmitEditing={doJoin}
              />
              {joinError ? <Text style={styles.joinError}>{joinError}</Text> : null}
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowJoin(false); setJoinCode(""); setJoinError(""); }}>
                  <Text style={styles.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={(!joinCode.trim() || joinLoading) ? [styles.submitBtn, styles.submitDim] : styles.submitBtn}
                  onPress={doJoin}
                  disabled={!joinCode.trim() || joinLoading}
                >
                  {joinLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitTxt}>Join group</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex:1, backgroundColor:PAGE_BG },

  header: { backgroundColor:SAGE, minHeight:160, position:"relative", overflow:"hidden", paddingHorizontal:16, paddingBottom:20 },
  headerTopRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  headerBtn: { width:36, height:36, borderRadius:18, backgroundColor:CARD_BG, borderWidth:1, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center" },
  headerTitle: { fontFamily:SERIF, fontSize:38, color:CARD_BG, textAlign:"center", marginTop:12 },

  filterRow: { flexDirection:"row", gap:8, backgroundColor:PAGE_BG, paddingHorizontal:16, paddingTop:16, paddingBottom:4 },
  filterPill: { flex:1, alignItems:"center", paddingVertical:10, borderRadius:20, backgroundColor:CARD_BG, borderWidth:1, borderColor:BORDER },
  filterPillActive: { backgroundColor:SAGE, borderColor:SAGE },
  filterTxt: { fontSize:14, fontWeight:"600", color:TEXT_MUTED },
  filterTxtActive: { color:"#FFFFFF" },

  scroll: { paddingHorizontal:16, paddingTop:16 },

  notice: { backgroundColor:"#EEE4CB", borderRadius:12, borderWidth:1, borderColor:"#DDD0A8", padding:14, marginBottom:12 },
  noticeTxt: { fontSize:13, color:"#6B5020", fontWeight:"500", lineHeight:19 },

  emptyFilter: { alignItems:"center", paddingVertical:36 },
  emptyFilterTxt: { fontSize:15, color:TEXT_MUTED, textAlign:"center" },

  card: {
    flexDirection:"row", alignItems:"center", backgroundColor:CARD_BG, borderRadius:16,
    borderWidth:1, borderColor:BORDER, padding:14, marginBottom:10,
    shadowColor:"#2A1F0E", shadowOffset:{ width:0, height:2 }, shadowOpacity:0.08, shadowRadius:8, elevation:3,
  },
  cardIcon: { marginRight:14 },
  cardInfo: { flex:1, marginRight:8 },
  cardName: { fontSize:17, fontWeight:"700", color:TEXT, marginBottom:3 },
  cardPreview: { fontSize:14, color:TEXT_MUTED, marginBottom:3 },
  cardPreviewEmpty: { fontSize:14, color:TEXT_SEC, fontStyle:"italic", marginBottom:3 },
  cardMeta: { fontSize:12, color:TEXT_SEC },

  overlay: { flex:1, backgroundColor:"rgba(26,20,16,0.4)", justifyContent:"center", alignItems:"center" },
  addSheet: { backgroundColor:CARD_BG, borderRadius:16, borderWidth:1, borderColor:BORDER, width:240, overflow:"hidden" },
  addOption: { paddingVertical:16, alignItems:"center" },
  addOptionTxt: { fontSize:16, color:TEXT, fontWeight:"500" },
  addDivider: { height:1, backgroundColor:DIVIDER },

  backdrop: { flex:1, backgroundColor:"rgba(26,20,16,0.4)", justifyContent:"flex-end" },
  sheet: { backgroundColor:CARD_BG, borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom:32 },
  handle: { width:36, height:4, borderRadius:2, backgroundColor:BORDER, alignSelf:"center", marginBottom:16 },
  mTitle: { fontFamily:SERIF, fontSize:20, color:TEXT, marginBottom:4 },
  mSub: { fontSize:14, color:TEXT_MUTED, marginBottom:14 },
  input: { backgroundColor:PAGE_BG, borderRadius:12, borderWidth:1, borderColor:BORDER, padding:14, fontSize:16, color:TEXT, marginBottom:16 },
  codeInput: { fontFamily:SERIF, fontSize:22, textAlign:"center", letterSpacing:6 },
  inputError: { borderColor:"#C24A4A" },
  joinError: { fontSize:13, color:"#C24A4A", textAlign:"center", marginTop:-8, marginBottom:14 },
  btnRow: { flexDirection:"row", gap:10 },
  cancelBtn: { flex:1, borderRadius:12, borderWidth:1, borderColor:BORDER, paddingVertical:14, alignItems:"center", backgroundColor:PAGE_BG },
  cancelTxt: { fontSize:16, color:TEXT },
  submitBtn: { flex:1, borderRadius:12, backgroundColor:SAGE, paddingVertical:14, alignItems:"center" },
  submitDim: { opacity:0.4 },
  submitTxt: { fontSize:16, color:"#FFFFFF", fontWeight:"600" },
});
