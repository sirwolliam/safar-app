/**
 * NotificationsScreen.jsx — Safar
 * Pending group invites — accept or decline.
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView,
  TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import { getCurrentUser, subscribeToConnections, acceptConnection } from "../firebase";
import { UserAvatar } from "./ConnectionsScreen";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";

export default function NotificationsScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const currentUser = getCurrentUser();
  const [connections, setConnections] = useState([
    {
      uid: "s1", displayName: "Yusuf Al-Farsi",
      email: "yusuf@example.com",
      status: "pending", direction: "incoming",
      avatarEmoji: null,
    },
    {
      uid: "s2", displayName: "Aisha Mahmood",
      email: "aisha@example.com",
      status: "pending", direction: "incoming",
      avatarEmoji: null,
    },
    {
      uid: "s3", displayName: "Fatima Hassan",
      email: "fatima@example.com",
      status: "accepted", direction: "incoming",
      avatarEmoji: null,
    },
    {
      uid: "s4", displayName: "Ahmed Al-Rashid",
      email: "ahmed@example.com",
      status: "accepted", direction: "outgoing",
      avatarEmoji: null,
    },
  ]);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToConnections(currentUser.uid, (live) => {
      if (live.length > 0) setConnections(live);
    });
  }, [currentUser?.uid]);

  // Pending incoming invites
  const pending  = connections.filter((c) => c.status === "pending" && c.direction === "incoming");
  const accepted = connections.filter((c) => c.status === "accepted");

  const handleAccept = async (conn) => {
    setAccepting(conn.uid);
    await acceptConnection(currentUser?.uid ?? "local", conn.uid).catch(() => {});
    // Update local state so it feels instant
    setConnections((prev) => prev.map((c) =>
      c.uid === conn.uid ? { ...c, status: "accepted" } : c
    ));
    setAccepting(null);
  };

  const handleDecline = (conn) => {
    setConnections((prev) => prev.filter((c) => c.uid !== conn.uid));
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Pending invites */}
        {pending.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>PENDING INVITES</Text>
            <View style={s.card}>
              {pending.map((conn, i) => (
                <View key={conn.uid} style={i < pending.length - 1  ? [s.row, s.rowBorder] : s.row}>
                  <UserAvatar name={conn.displayName} size={46} />
                  <View style={s.info}>
                    <Text style={s.name}>{conn.displayName}</Text>
                    <Text style={s.sub}>Wants to connect with you</Text>
                  </View>
                  <View style={s.actions}>
                    <TouchableOpacity
                      style={s.acceptBtn}
                      onPress={() => handleAccept(conn)}
                      disabled={accepting === conn.uid}
                    >
                      {accepting === conn.uid
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={s.acceptText}>Accept</Text>
                      }
                    </TouchableOpacity>
                    <TouchableOpacity style={s.declineBtn} onPress={() => handleDecline(conn)}>
                      <Text style={s.declineText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty state */}
        {pending.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🔔</Text>
            <Text style={s.emptyTitle}>No pending invites</Text>
            <Text style={s.emptyBody}>
              When someone invites you to connect or join a group, it will appear here.
            </Text>
          </View>
        )}

        {/* Accepted connections */}
        {accepted.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>CONNECTIONS  ·  {accepted.length}</Text>
            <View style={s.card}>
              {accepted.map((conn, i) => (
                <View key={conn.uid} style={i < accepted.length - 1  ? [s.row, s.rowBorder] : s.row}>
                  <UserAvatar name={conn.displayName} size={46} />
                  <View style={s.info}>
                    <Text style={s.name}>{conn.displayName}</Text>
                    <Text style={s.sub}>Connected</Text>
                  </View>
                  <Text style={s.connectedTick}>✓</Text>
                </View>
              ))}
            </View>
          </View>
        )}

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
  headerTitle: { fontFamily: SERIF, fontSize: typography.heading, color: colors.text },

  scroll: { paddingHorizontal: spacing(2.5), paddingTop: spacing(2) },
  section: { marginBottom: spacing(2) },
  sectionLabel: {
    fontSize: 10, fontWeight: "700", letterSpacing: 1.5,
    color: colors.subtext, marginBottom: spacing(1),
  },
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, paddingHorizontal: spacing(2), ...shadows.card,
  },
  row: {
    flexDirection: "row", alignItems: "center", gap: spacing(1.5),
    paddingVertical: spacing(1.75),
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  info: { flex: 1 },
  name: { fontFamily: SERIF, fontSize: typography.body, color: colors.text },
  sub: { fontSize: typography.tiny, color: colors.subtext, marginTop: 2 },
  actions: { flexDirection: "row", gap: spacing(0.75) },
  acceptBtn: {
    backgroundColor: colors.primary, borderRadius: radius.pill,
    paddingHorizontal: spacing(1.75), paddingVertical: spacing(0.875),
    minWidth: 70, alignItems: "center", ...shadows.button,
  },
  acceptText: { fontSize: typography.small, color: "#fff", fontWeight: "600" },
  declineBtn: {
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing(1.75), paddingVertical: spacing(0.875),
  },
  declineText: { fontSize: typography.small, color: colors.subtext },
  connectedTick: { fontSize: 18, color: colors.primary, fontWeight: "600" },

  empty: { alignItems: "center", paddingVertical: spacing(5), paddingHorizontal: spacing(3) },
  emptyEmoji: { fontSize: 44, marginBottom: spacing(1.5) },
  emptyTitle: { fontFamily: SERIF, fontSize: 20, color: colors.text, marginBottom: spacing(1) },
  emptyBody: { fontSize: typography.body, color: colors.subtext, textAlign: "center", lineHeight: 22 },
});
