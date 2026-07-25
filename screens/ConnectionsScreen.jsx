/**
 * ConnectionsScreen.jsx — Safar
 * Your Safar address book — people you've connected with on the app.
 * Connections are built when someone accepts your invite.
 * Used as a picker when adding members to a Group.
 *
 * Rebuilt 2026-07-23 to match MyContactsScreen's visual language: literal
 * hex (was theme./useAccessibility() tokens — the exact pattern the TDD
 * flags as the root cause of past crashes), real Ornate header, Phosphor
 * icons instead of emoji, card-per-row instead of one flat list-in-a-card.
 *
 * Back button now checks returnToTab the same way MyContactsScreen does —
 * it previously always called goBack() unconditionally, which is half of
 * the reported "back button lands on the wrong screen" bug. The other half
 * is on ConnectHubScreen's side (it doesn't pass returnToTab on its
 * cross-tab navigate calls) — pending a fresh copy of that file + App.js
 * to fix without guessing the tab name.
 *
 * Coding rules: StyleSheet.create at module level, literal hex only.
 * No && in style arrays — ternaries only.
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator, Alert, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderPatternBg from "../HeaderPatternBg";
import {
  CaretLeft, MagnifyingGlass, X, UsersThree,
} from "phosphor-react-native";
import {
  getCurrentUser, findUserByEmail, sendConnectionRequest,
  subscribeToConnections,
} from "../firebase";

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

// ── Avatar component — initials, deterministic color from name ────────────────
// Exported and reused by GroupDetailScreen's milestone cards — keep the
// nameToColor logic exactly as-is so avatars stay consistent across screens.
export function UserAvatar({ name, emoji, size = 44, style }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  const bg = nameToColor(name);
  return (
    <View style={[av.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }, style]}>
      {emoji
        ? <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
        : <Text style={[av.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
      }
    </View>
  );
}

function nameToColor(name = "") {
  const palette = ["#4A7A60","#6B5B7A","#7A5B4A","#4A6B7A","#7A6B4A","#5B7A4A"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

const av = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", flexShrink: 0 },
  initials: { color: "#fff", fontWeight: "600" },
});

// ── Connection row ────────────────────────────────────────────────────────────
function ConnectionRow({ conn, onPress, actionLabel }) {
  return (
    <TouchableOpacity style={cr.card} onPress={onPress} activeOpacity={actionLabel ? 0.85 : 1}>
      <UserAvatar name={conn.displayName} emoji={conn.avatarEmoji} size={48} />
      <View style={cr.info}>
        <Text style={cr.name}>{conn.displayName}</Text>
        <Text style={cr.email}>{conn.email ?? ""}</Text>
      </View>
      {actionLabel ? (
        <View style={cr.actionBtn}>
          <Text style={cr.actionText}>{actionLabel}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const cr = StyleSheet.create({
  card: {
    flexDirection:"row", alignItems:"center", gap:12, backgroundColor:CARD_BG,
    borderRadius:14, borderWidth:1, borderColor:BORDER, padding:14, marginBottom:10,
    shadowColor:"#2A1F0E", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:8, elevation:3,
  },
  info: { flex:1 },
  name: { fontSize:17, fontWeight:"700", color:TEXT, marginBottom:2 },
  email: { fontSize:13, color:TEXT_MUTED },
  actionBtn: { paddingHorizontal:14, paddingVertical:8, borderRadius:999, backgroundColor:SAGE },
  actionText: { fontSize:13, color:"#fff", fontWeight:"600" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ConnectionsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  // mode: "manage" (view/add connections) | "pick" (select for group)
  const mode      = route?.params?.mode ?? "manage";
  const groupName = route?.params?.groupName;

  const currentUser = getCurrentUser();
  const [connections, setConnections] = useState([]);
  const [query,        setQuery]        = useState("");
  const [searchFocused,setSearchFocused]= useState(false);
  const [inviteEmail,  setInviteEmail]  = useState("");
  const [searching,    setSearching]    = useState(false);
  const [sendingTo,    setSendingTo]    = useState(null);
  const [successMsg,   setSuccessMsg]   = useState("");

  useEffect(() => {
    if (!currentUser) return;
    return subscribeToConnections(currentUser.uid, setConnections);
  }, [currentUser?.uid]);

  const filtered = connections.filter((c) =>
    c.displayName?.toLowerCase().includes(query.toLowerCase()) ||
    c.email?.toLowerCase().includes(query.toLowerCase())
  );

  const shareInviteLink = () => {
    Alert.alert("Invite link", "Invite link sharing will be available in the next update.");
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSearching(true);
    try {
      const found = await findUserByEmail(inviteEmail.trim());
      if (!found) {
        Alert.alert(
          "Not found",
          `No Safar account found for ${inviteEmail}.\n\nWould you like to send them an invite link?`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Share invite", onPress: shareInviteLink },
          ]
        );
        return;
      }
      if (found.uid === currentUser.uid) {
        Alert.alert("That's you!", "You can't add yourself as a connection.");
        return;
      }
      const alreadyConnected = connections.some((c) => c.uid === found.uid);
      if (alreadyConnected) {
        Alert.alert("Already connected", `${found.displayName} is already in your connections.`);
        return;
      }
      setSendingTo(found.uid);
      await sendConnectionRequest(currentUser.uid, found.uid, found.displayName);
      setSuccessMsg(`Invitation sent to ${found.displayName}`);
      setInviteEmail("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setSearching(false);
      setSendingTo(null);
    }
  };

  return (
    <View style={s.root}>
      {/* ── Sage Ornate Header ── */}
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
            hitSlop={{ top:12, bottom:12, left:12, right:24 }}
            activeOpacity={0.8}
          >
            <CaretLeft size={18} color="#1A1712" weight="bold" />
          </TouchableOpacity>
        </View>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{mode === "pick" ? `Add to ${groupName}` : "Connections"}</Text>
          <Text style={s.headerSub}>
            {mode === "pick" ? "Choose someone to add" : "People you've connected with on Safar"}
          </Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <View style={searchFocused ? [s.searchBar, s.searchBarFocused] : s.searchBar}>
          <MagnifyingGlass size={16} color={TEXT_MUTED} weight="regular" />
          <TextInput
            style={s.searchInput}
            placeholder="Search connections…"
            placeholderTextColor={TEXT_MUTED}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
              <X size={14} color={TEXT_MUTED} weight="bold" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionLabel}>YOUR CONNECTIONS</Text>
            {filtered.map((conn) => (
              <ConnectionRow
                key={conn.uid}
                conn={conn}
                actionLabel={mode === "pick" ? "Add" : undefined}
                onPress={() => {
                  if (mode === "pick") {
                    route?.params?.onSelect?.(conn);
                    navigation?.goBack?.();
                  }
                }}
              />
            ))}
          </View>
        ) : (
          <View style={s.empty}>
            <UsersThree size={40} color={BORDER} weight="thin" />
            <Text style={s.emptyTitle}>No connections yet</Text>
            <Text style={s.emptyBody}>
              Invite someone by email below. Once they accept, they'll appear here and you can add them to any group instantly.
            </Text>
          </View>
        )}

        {/* Invite by email */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>INVITE BY EMAIL</Text>
          <View style={s.inviteCard}>
            <Text style={s.inviteHint}>
              Enter their email address. If they have a Safar account, they'll receive an invite. If not, you can share an invite link.
            </Text>
            <View style={s.inviteRow}>
              <TextInput
                style={s.inviteInput}
                placeholder="their@email.com"
                placeholderTextColor={TEXT_MUTED}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={inviteEmail.trim() ? s.inviteBtn : [s.inviteBtn, s.inviteBtnDim]}
                onPress={handleInvite}
                disabled={searching || !inviteEmail.trim()}
                activeOpacity={0.88}
              >
                {searching
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.inviteBtnText}>Invite</Text>
                }
              </TouchableOpacity>
            </View>
            {successMsg ? <Text style={s.successMsg}>{successMsg}</Text> : null}
          </View>
        </View>

        <View style={{ height:40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex:1, backgroundColor:PAGE_BG },

  header:      { backgroundColor:SAGE, minHeight:150, position:"relative", overflow:"hidden", paddingHorizontal:20, paddingBottom:16 },
  headerTopRow:{ flexDirection:"row", alignItems:"center" },
  backBtn:     { width:36, height:36, borderRadius:18, backgroundColor:CARD_BG, borderWidth:1, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center" },
  headerCenter:{ alignItems:"center", marginTop:14 },
  headerTitle: { fontFamily:SERIF, fontSize:32, color:CARD_BG, textAlign:"center" },
  headerSub:   { fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:2, textAlign:"center" },

  searchWrap:   { paddingHorizontal:20, paddingTop:16, paddingBottom:8 },
  searchBar:    { flexDirection:"row", alignItems:"center", gap:10, backgroundColor:CARD_BG, borderRadius:14, borderWidth:1, borderColor:BORDER, paddingHorizontal:14, paddingVertical:11, shadowColor:"#2A1F0E", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:8, elevation:3 },
  searchBarFocused: { borderColor:SAGE },
  searchInput:  { flex:1, fontSize:16, color:TEXT, padding:0 },

  scroll:  { paddingHorizontal:20, paddingTop:8 },
  section: { marginBottom:20 },
  sectionLabel: { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:TEXT_SEC, marginBottom:10 },

  empty:       { alignItems:"center", paddingVertical:32, paddingHorizontal:16, marginBottom:8 },
  emptyTitle:  { fontFamily:SERIF, fontSize:19, color:TEXT, marginTop:12, marginBottom:8 },
  emptyBody:   { fontSize:14, color:TEXT_MUTED, textAlign:"center", lineHeight:20 },

  inviteCard: {
    backgroundColor:CARD_BG, borderRadius:16, borderWidth:1, borderColor:BORDER, padding:16,
    shadowColor:"#2A1F0E", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:8, elevation:3,
  },
  inviteHint: { fontSize:12, color:TEXT_MUTED, lineHeight:18, marginBottom:14 },
  inviteRow:  { flexDirection:"row", gap:10 },
  inviteInput: { flex:1, backgroundColor:PAGE_BG, borderRadius:10, borderWidth:1, borderColor:BORDER, paddingHorizontal:14, paddingVertical:12, fontSize:15, color:TEXT },
  inviteBtn:  { backgroundColor:SAGE, borderRadius:10, paddingHorizontal:18, alignItems:"center", justifyContent:"center" },
  inviteBtnDim: { opacity:0.4 },
  inviteBtnText: { color:"#fff", fontWeight:"600", fontSize:14 },
  successMsg: { fontSize:13, color:SAGE, fontWeight:"500", marginTop:10, textAlign:"center" },
});
