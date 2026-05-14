/**
 * GroupDetailScreen.jsx — Safar
 * Single group: members list, add from connections, avatar action sheet,
 * milestone feed, post milestone, say Ameen.
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Modal, ActivityIndicator,
  Alert, FlatList,
} from "react-native";
import {
  getCurrentUser, subscribeToGroupMilestones, subscribeToConnections,
  postMilestone, addAmeen, addGroupMember,
} from "../firebase";
import { UserAvatar } from "./ConnectionsScreen";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";
const MAX_CHARS = 100;

// ── Milestone card ────────────────────────────────────────────────────────────

function MilestoneCard({ milestone, currentUid }) {
  const hasAmeen = milestone.ameen?.includes(currentUid);
  const [adding, setAdding] = useState(false);

  const handleAmeen = async () => {
    if (hasAmeen || adding) return;
    setAdding(true);
    await addAmeen(milestone.id, currentUid).catch(() => {});
    setAdding(false);
  };

  const timeAgo = (ts) => {
    if (!ts?.toMillis) return "";
    const diff = Date.now() - ts.toMillis();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <View style={mc.card}>
      <View style={mc.top}>
        <UserAvatar name={milestone.authorName} size={38} />
        <View style={mc.info}>
          <Text style={mc.name}>{milestone.authorName}</Text>
          <Text style={mc.time}>{timeAgo(milestone.createdAt)}</Text>
        </View>
      </View>
      <Text style={mc.text}>{milestone.text}</Text>
      <View style={mc.footer}>
        <TouchableOpacity
          style={[mc.ameenBtn, hasAmeen && mc.ameenBtnActive]}
          onPress={handleAmeen}
          disabled={hasAmeen || adding}
          activeOpacity={0.8}
        >
          {adding
            ? <ActivityIndicator size="small" color={hasAmeen ? "#fff" : colors.primary} />
            : <>
                <Text style={mc.ameenIcon}>🤲</Text>
                <Text style={[mc.ameenText, hasAmeen && mc.ameenTextActive]}>
                  {hasAmeen ? "Āmeen" : "Say Āmeen"}
                </Text>
              </>
          }
        </TouchableOpacity>
        {(milestone.ameenCount ?? 0) > 0 && (
          <Text style={mc.ameenCount}>{milestone.ameenCount} Āmeen</Text>
        )}
      </View>
    </View>
  );
}

const create_mc = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, padding: spacing(2), marginBottom: spacing(1.25), ...shadows.card,
  },
  top: { flexDirection: "row", alignItems: "center", gap: spacing(1.25), marginBottom: spacing(1.25) },
  info: { flex: 1 },
  name: { fontSize: typography.small, fontWeight: "500", color: colors.text },
  time: { fontSize: typography.tiny, color: colors.subtext },
  text: { fontSize: typography.body, color: colors.text, lineHeight: 22, marginBottom: spacing(1.5) },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ameenBtn: {
    flexDirection: "row", alignItems: "center", gap: spacing(0.75),
    paddingHorizontal: spacing(1.5), paddingVertical: spacing(0.75),
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  ameenBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  ameenIcon: { fontSize: 14 },
  ameenText: { fontSize: typography.small, color: colors.primary },
  ameenTextActive: { color: "#fff", fontWeight: "500" },
  ameenCount: { fontSize: typography.tiny, color: colors.subtext },
});
const mc = create_mc(require("../theme").colors);

// ── Member avatar with tap action ─────────────────────────────────────────────

function MemberAvatar({ member, isCurrentUser, onPress, groups }) {
  return (
    <TouchableOpacity style={ma.wrap} onPress={onPress} activeOpacity={0.8}>
      <UserAvatar name={member.displayName} emoji={member.avatarEmoji} size={52} />
      <Text style={ma.name} numberOfLines={1}>
        {isCurrentUser ? "You" : member.displayName?.split(" ")[0]}
      </Text>
    </TouchableOpacity>
  );
}

const ma = (colors) => StyleSheet.create({
  wrap: { alignItems: "center", gap: 5, width: 64 },
  name: { fontSize: typography.tiny, color: colors.text, textAlign: "center" },
});

// ── Member action sheet ───────────────────────────────────────────────────────

function MemberActionSheet({ member, visible, onClose, onAddToGroup, onRemove, isCurrentUser, groups }) {
  if (!member) return null;
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={as.overlay} onPress={onClose} activeOpacity={1}>
        <View style={as.sheet}>
          <View style={as.memberRow}>
            <UserAvatar name={member.displayName} emoji={member.avatarEmoji} size={56} />
            <View>
              <Text style={as.memberName}>{member.displayName}</Text>
              <Text style={as.memberEmail}>{member.email ?? ""}</Text>
            </View>
          </View>

          <View style={as.divider} />

          {/* Add to another group */}
          {!isCurrentUser && groups?.length > 0 && (
            <>
              <Text style={as.sectionLabel}>ADD TO ANOTHER GROUP</Text>
              {groups.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={as.optionRow}
                  onPress={() => { onAddToGroup(member, g); onClose(); }}
                  activeOpacity={0.85}
                >
                  <Text style={as.optionIcon}>👥</Text>
                  <Text style={as.optionText}>{g.name}</Text>
                  <Text style={as.optionArrow}>+</Text>
                </TouchableOpacity>
              ))}
              <View style={as.divider} />
            </>
          )}

          {/* Remove */}
          {!isCurrentUser && (
            <TouchableOpacity style={as.dangerRow} onPress={() => { onRemove(member); onClose(); }}>
              <Text style={as.dangerText}>Remove from group</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={as.cancelRow} onPress={onClose}>
            <Text style={as.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const create_as = (colors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#D4E4DC", borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl, paddingBottom: spacing(4), paddingTop: spacing(2),
  },
  memberRow: {
    flexDirection: "row", alignItems: "center", gap: spacing(1.5),
    paddingHorizontal: spacing(2.5), paddingVertical: spacing(1.5),
  },
  memberName: { fontFamily: SERIF, fontSize: typography.heading, color: colors.text },
  memberEmail: { fontSize: typography.tiny, color: colors.subtext, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing(0.5) },
  sectionLabel: {
    fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: colors.subtext,
    paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(1.5),
  },
  optionRow: {
    flexDirection: "row", alignItems: "center", gap: spacing(1.5),
    paddingHorizontal: spacing(2.5), paddingVertical: spacing(1.75),
  },
  optionIcon: { fontSize: 18 },
  optionText: { flex: 1, fontSize: typography.body, color: colors.text },
  optionArrow: { fontSize: 20, color: colors.primary, fontWeight: "700" },
  dangerRow: { paddingHorizontal: spacing(2.5), paddingVertical: spacing(1.75) },
  dangerText: { fontSize: typography.body, color: colors.error },
  cancelRow: {
    paddingHorizontal: spacing(2.5), paddingVertical: spacing(1.75),
    marginTop: spacing(0.5),
  },
  cancelText: { fontSize: typography.body, color: colors.subtext, textAlign: "center" },
});
const as = create_as(require("../theme").colors);

// ── Main screen ───────────────────────────────────────────────────────────────

export default function GroupDetailScreen({ route, navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { group, allGroups = [] } = route?.params ?? {};
  const currentUser = getCurrentUser();

  const [milestones,    setMilestones]    = useState([]);
  const [connections,   setConnections]   = useState([]);
  const [showPost,      setShowPost]      = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [postText,      setPostText]      = useState("");
  const [posting,       setPosting]       = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const initialised = useRef(false);

  useEffect(() => {
    if (!group?.id) return;
    return subscribeToGroupMilestones(group.id, setMilestones);
  }, [group?.id]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToConnections(currentUser.uid, setConnections);
  }, [currentUser?.uid]);

  // Members — group.members is array of uids; we enrich with connection data
  const members = (group?.members ?? []).map((uid) => {
    const conn = connections.find((c) => c.uid === uid);
    return conn ?? { uid, displayName: uid === currentUser?.uid ? currentUser.displayName : "Member" };
  });

  const handlePost = async () => {
    if (!postText.trim() || posting) return;
    setPosting(true);
    try {
      await postMilestone(currentUser.uid, currentUser.displayName, group.id, postText.trim());
      setPostText("");
      setShowPost(false);
    } catch (e) { console.error(e); }
    finally { setPosting(false); }
  };

  const handleAddToGroup = async (member, targetGroup) => {
    try {
      await addGroupMember(targetGroup.id, member.uid);
      Alert.alert("Added ✓", `${member.displayName} added to ${targetGroup.name}.`);
    } catch { Alert.alert("Error", "Could not add member. Please try again."); }
  };

  const handleRemove = (member) => {
    Alert.alert(
      "Remove member",
      `Remove ${member.displayName} from ${group.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => {
          // Firebase removeGroupMember call goes here
          Alert.alert("Removed", `${member.displayName} has been removed.`);
        }},
      ]
    );
  };

  if (!group) return null;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{group.name}</Text>
        <TouchableOpacity style={s.postBtn} onPress={() => setShowPost(true)}>
          <Text style={s.postBtnText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Members row */}
        <View style={s.membersCard}>
          <View style={s.membersHeader}>
            <Text style={s.membersTitle}>Members  ·  {members.length}</Text>
            <TouchableOpacity
              style={s.addMemberBtn}
              onPress={() => navigation?.navigate?.("Connections", {
                mode: "pick",
                groupId: group.id,
                groupName: group.name,
                onSelect: async (conn) => {
                  await addGroupMember(group.id, conn.uid);
                  Alert.alert("Added ✓", `${conn.displayName} added to ${group.name}.`);
                },
              })}
            >
              <Text style={s.addMemberBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.avatarRow}>
            {members.map((member) => (
              <MemberAvatar
                key={member.uid}
                member={member}
                isCurrentUser={member.uid === currentUser?.uid}
                groups={allGroups.filter((g) => g.id !== group.id)}
                onPress={() => {
                  if (member.uid === currentUser?.uid) return;
                  setSelectedMember(member);
                  setShowActionSheet(true);
                }}
              />
            ))}
            {/* Add member tile */}
            <TouchableOpacity
              style={s.addTile}
              onPress={() => navigation?.navigate?.("Connections", {
                mode: "pick",
                groupId: group.id,
                groupName: group.name,
                onSelect: async (conn) => {
                  await addGroupMember(group.id, conn.uid);
                },
              })}
            >
              <Text style={s.addTileIcon}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Milestone feed */}
        <Text style={s.feedLabel}>MILESTONES</Text>
        {milestones.length === 0 ? (
          <View style={s.feedEmpty}>
            <Text style={s.feedEmptyEmoji}>🌿</Text>
            <Text style={s.feedEmptyText}>
              No milestones yet.{"\n"}Be the first to share one.
            </Text>
          </View>
        ) : (
          milestones.map((m) => (
            <MilestoneCard key={m.id} milestone={m} currentUid={currentUser?.uid} />
          ))
        )}

        <View style={{ height: spacing(10) }} />
      </ScrollView>

      {/* Post modal */}
      <Modal visible={showPost} transparent animationType="slide">
        <View style={pm.overlay}>
          <View style={pm.sheet}>
            <Text style={pm.title}>Share a milestone</Text>
            <Text style={pm.sub}>Sharing with {group.name}</Text>
            <TextInput
              style={pm.input}
              placeholder="e.g. Completed Tawaf, alhamdulillah 🕋"
              placeholderTextColor={colors.placeholder}
              value={postText}
              onChangeText={(t) => setPostText(t.slice(0, MAX_CHARS))}
              multiline
              maxLength={MAX_CHARS}
              autoFocus
            />
            <View style={pm.charRow}>
              <Text style={pm.charCount}>{postText.length} / {MAX_CHARS}</Text>
            </View>
            <View style={pm.btnRow}>
              <TouchableOpacity style={pm.cancelBtn} onPress={() => { setShowPost(false); setPostText(""); }}>
                <Text style={pm.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[pm.submitBtn, (!postText.trim() || posting) && pm.submitBtnDisabled]}
                onPress={handlePost}
                disabled={posting || !postText.trim()}
              >
                {posting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={pm.submitText}>Share</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Member action sheet */}
      <MemberActionSheet
        member={selectedMember}
        visible={showActionSheet}
        onClose={() => { setShowActionSheet(false); setSelectedMember(null); }}
        onAddToGroup={handleAddToGroup}
        onRemove={handleRemove}
        isCurrentUser={selectedMember?.uid === currentUser?.uid}
        groups={allGroups.filter((g) => g.id !== group.id)}
      />
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
  headerTitle: { fontFamily: SERIF, fontSize: 22, color: colors.text, flex: 1, textAlign: "center" },
  postBtn: {
    backgroundColor: colors.primary, borderRadius: radius.pill,
    paddingHorizontal: spacing(1.75), paddingVertical: spacing(0.75), ...shadows.button,
  },
  postBtnText: { fontSize: typography.small, color: "#fff", fontWeight: "600" },

  scroll: { paddingHorizontal: spacing(2.5), paddingTop: spacing(1.5) },

  // Members
  membersCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, padding: spacing(2), marginBottom: spacing(2), ...shadows.card,
  },
  membersHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: spacing(1.5),
  },
  membersTitle: { fontFamily: SERIF, fontSize: typography.body, color: colors.text },
  addMemberBtn: {
    backgroundColor: "#EBF2EE", borderRadius: radius.pill, borderWidth: 1,
    borderColor: "#C8DDD0", paddingHorizontal: spacing(1.5), paddingVertical: spacing(0.5),
  },
  addMemberBtnText: { fontSize: typography.tiny, color: colors.primary, fontWeight: "600" },
  avatarRow: { gap: spacing(1.5), paddingRight: spacing(1) },

  addTile: {
    width: 52, height: 52, borderRadius: 26, borderWidth: 2,
    borderColor: colors.border, borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.background,
  },
  addTileIcon: { fontSize: 22, color: colors.border },

  feedLabel: {
    fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: colors.subtext,
    marginBottom: spacing(1.25),
  },
  feedEmpty: { alignItems: "center", paddingVertical: spacing(4), gap: spacing(1) },
  feedEmptyEmoji: { fontSize: 36 },
  feedEmptyText: { fontSize: typography.body, color: colors.subtext, textAlign: "center", lineHeight: 22 },
});

const create_pm = (colors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#D4E4DC", borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl, padding: spacing(3), paddingBottom: spacing(5),
  },
  title: { fontFamily: SERIF, fontSize: typography.title, color: colors.text, marginBottom: 4 },
  sub: { fontSize: typography.small, color: colors.subtext, marginBottom: spacing(2) },
  input: {
    backgroundColor: colors.background, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, padding: spacing(2), fontSize: typography.body,
    color: colors.text, minHeight: 90, textAlignVertical: "top", marginBottom: spacing(0.75),
  },
  charRow: { alignItems: "flex-end", marginBottom: spacing(2) },
  charCount: { fontSize: typography.tiny, color: colors.subtext },
  btnRow: { flexDirection: "row", gap: spacing(1.5) },
  cancelBtn: {
    flex: 1, paddingVertical: spacing(1.75), borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: "center",
  },
  cancelText: { fontSize: typography.body, color: colors.subtext },
  submitBtn: {
    flex: 1, paddingVertical: spacing(1.75), borderRadius: radius.md,
    backgroundColor: colors.primary, alignItems: "center", ...shadows.button,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: typography.body, color: "#fff", fontWeight: "500" },
});
const pm = create_pm(require("../theme").colors);
