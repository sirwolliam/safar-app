/**
 * ConnectionsScreen.jsx — Safar
 * Your Safar address book — people you've connected with.
 * Connections are built when someone accepts your invite.
 * Used as a picker when adding members to groups.
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import {
  getCurrentUser, findUserByEmail, sendConnectionRequest,
  subscribeToConnections,
} from "../firebase";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";

// ── Avatar component — initials or icon ──────────────────────────────────────

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

// Deterministic colour from name
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

function ConnectionRow({ conn, onPress, actionLabel, actionStyle }) {
  return (
    <TouchableOpacity style={cr.row} onPress={onPress} activeOpacity={0.85}>
      <UserAvatar name={conn.displayName} emoji={conn.avatarEmoji} size={46} />
      <View style={cr.info}>
        <Text style={cr.name}>{conn.displayName}</Text>
        <Text style={cr.email}>{conn.email ?? ""}</Text>
      </View>
      {actionLabel && (
        <TouchableOpacity style={[cr.actionBtn, actionStyle]} onPress={onPress}>
          <Text style={cr.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const cr = (colors) => StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: spacing(1.5),
    paddingVertical: spacing(1.5), borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  info: { flex: 1 },
  name: { fontFamily: SERIF, fontSize: typography.body, color: colors.text },
  email: { fontSize: typography.tiny, color: colors.subtext, marginTop: 2 },
  actionBtn: {
    paddingHorizontal: spacing(1.5), paddingVertical: spacing(0.75),
    borderRadius: radius.pill, backgroundColor: colors.primary,
  },
  actionText: { fontSize: typography.tiny, color: "#fff", fontWeight: "600" },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ConnectionsScreen({ navigation, route }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  // mode: "manage" (view/add connections) | "pick" (select for group)
  const mode      = route?.params?.mode ?? "manage";
  const groupId   = route?.params?.groupId;
  const groupName = route?.params?.groupName;
  const onSelect  = route?.params?.onSelect;

  const currentUser = getCurrentUser();
  const [connections, setConnections] = useState([]);
  const [query,       setQuery]       = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [searching,   setSearching]   = useState(false);
  const [sendingTo,   setSendingTo]   = useState(null);
  const [successMsg,  setSuccessMsg]  = useState("");

  useEffect(() => {
    if (!currentUser) return;
    return subscribeToConnections(currentUser.uid, setConnections);
  }, [currentUser?.uid]);

  const filtered = connections.filter((c) =>
    c.displayName?.toLowerCase().includes(query.toLowerCase()) ||
    c.email?.toLowerCase().includes(query.toLowerCase())
  );

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
      setSuccessMsg(`Invitation sent to ${found.displayName} ✓`);
      setInviteEmail("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setSearching(false);
      setSendingTo(null);
    }
  };

  const shareInviteLink = () => {
    // In production: use expo-sharing + deep link
    Alert.alert("Invite link", "Invite link sharing will be available in the next update.");
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {mode === "pick" ? `Add to ${groupName}` : "Connections"}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Search bar */}
      <View style={s.searchBar}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search connections..."
          placeholderTextColor={colors.subtext}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Connections list */}
        {filtered.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionLabel}>YOUR CONNECTIONS</Text>
            <View style={s.card}>
              {filtered.map((conn, i) => (
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
          </View>
        ) : (
          <View style={s.emptyConnections}>
            <Text style={s.emptyIcon}>🤝</Text>
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
                placeholderTextColor={colors.subtext}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={s.inviteBtn}
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

        <View style={{ height: spacing(4) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(1.5),
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  back: { fontSize: 22, color: colors.text },
  headerTitle: { fontFamily: SERIF, fontSize: 22, color: colors.text },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: spacing(1),
    backgroundColor: colors.card, borderRadius: radius.pill,
    paddingHorizontal: spacing(2), paddingVertical: spacing(1.25),
    marginHorizontal: spacing(2.5), marginVertical: spacing(1.25),
    borderWidth: 1, borderColor: colors.border, ...shadows.card,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: typography.body, color: colors.text, padding: 0 },

  scroll: { paddingHorizontal: spacing(2.5) },
  section: { marginBottom: spacing(2) },
  sectionLabel: {
    fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: colors.subtext,
    marginBottom: spacing(1),
  },
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, paddingHorizontal: spacing(2), ...shadows.card,
  },

  emptyConnections: {
    alignItems: "center", paddingVertical: spacing(4), paddingHorizontal: spacing(2),
    marginBottom: spacing(2),
  },
  emptyIcon: { fontSize: 44, marginBottom: spacing(1.5) },
  emptyTitle: { fontFamily: SERIF, fontSize: 20, color: colors.text, marginBottom: spacing(1) },
  emptyBody: {
    fontSize: typography.small, color: colors.subtext, textAlign: "center", lineHeight: 20,
  },

  inviteCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, padding: spacing(2), ...shadows.card,
  },
  inviteHint: {
    fontSize: typography.tiny, color: colors.subtext, lineHeight: 18, marginBottom: spacing(1.5),
  },
  inviteRow: { flexDirection: "row", gap: spacing(1) },
  inviteInput: {
    flex: 1, backgroundColor: colors.background, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing(1.75), paddingVertical: spacing(1.25),
    fontSize: typography.body, color: colors.text,
  },
  inviteBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingHorizontal: spacing(2), paddingVertical: spacing(1.25),
    alignItems: "center", justifyContent: "center", ...shadows.button,
  },
  inviteBtnText: { color: "#fff", fontWeight: "600", fontSize: typography.small },
  successMsg: {
    fontSize: typography.small, color: colors.primary,
    fontWeight: "500", marginTop: spacing(1), textAlign: "center",
  },
});
