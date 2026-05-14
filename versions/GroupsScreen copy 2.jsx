/**
 * GroupsScreen.jsx — Safar
 * Clean rewrite. FlatList for group tabs, example groups with avatars + milestones.
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, FlatList,
  TouchableOpacity, TextInput, StyleSheet, Modal,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import {
  createGroup, subscribeToUserGroups, subscribeToGroupMilestones,
  postMilestone, addAmeen, getCurrentUser,
} from "../firebase";
import { UserAvatar } from "./ConnectionsScreen";
import { Bell } from "phosphor-react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";

// ── Groups SVG icon — 3 person silhouettes ────────────────────────────────────

function GroupIcon({ size = 22, color = "#fff" }) {
  return (
    <Svg width={size} height={size * 0.8} viewBox="0 0 24 20">
      <Circle cx={5}  cy={5}  r={3}   fill={color} opacity={0.7}/>
      <Path d="M0 18 C0 14 2.5 12 5 12 C6.2 12 7.3 12.5 8.1 13.3 C6.8 14.5 6 16.2 6 18 Z" fill={color} opacity={0.7}/>
      <Circle cx={19} cy={5}  r={3}   fill={color} opacity={0.7}/>
      <Path d="M24 18 C24 14 21.5 12 19 12 C17.8 12 16.7 12.5 15.9 13.3 C17.2 14.5 18 16.2 18 18 Z" fill={color} opacity={0.7}/>
      <Circle cx={12} cy={4}  r={3.5} fill={color}/>
      <Path d="M5.5 18 C5.5 13.8 8.5 11 12 11 C15.5 11 18.5 13.8 18.5 18 Z" fill={color}/>
    </Svg>
  );
}
const MAX_CHARS = 100;

// ── Static example data ───────────────────────────────────────────────────────

const EX_MEMBERS = {
  u1: { uid: "u1", displayName: "Fatima Hassan",   avatarEmoji: null },
  u2: { uid: "u2", displayName: "Ahmed Al-Rashid", avatarEmoji: null },
  u3: { uid: "u3", displayName: "Maryam Khan",     avatarEmoji: null },
  u4: { uid: "u4", displayName: "You",             avatarEmoji: "🌿" },
  u5: { uid: "u5", displayName: "Zainab Ali",      avatarEmoji: null },
  u6: { uid: "u6", displayName: "Noor Ibrahim",    avatarEmoji: null },
  u7: { uid: "u7", displayName: "Tariq Hassan",    avatarEmoji: null },
  u8: { uid: "u8", displayName: "Omar Siddiq",     avatarEmoji: null },
};

const EX_GROUPS = [
  { id: "ex1", name: "Our Pilgrimage Family", memberUids: ["u1","u2","u3","u4"], isExample: true },
  { id: "ex2", name: "Sisters Circle",        memberUids: ["u3","u5","u6","u4"], isExample: true },
  { id: "ex3", name: "Hajj 2026 Group",       memberUids: ["u2","u7","u8","u4"], isExample: true },
];

const EX_MILESTONES = {
  ex1: [
    { id:"m1", author:"Ahmed Al-Rashid", uid:"u2", text:"Completed Tawaf al-Qudum, alhamdulillah. 7 rounds done 🕋", time:"2h ago", ameen:["u3","u4"], count:2 },
    { id:"m2", author:"Fatima Hassan",   uid:"u1", text:"Making dua at Maqam Ibrahim right now. Please share your duas 🤲", time:"4h ago", ameen:["u2"], count:1 },
    { id:"m3", author:"Maryam Khan",     uid:"u3", text:"First time seeing the Kaaba — words cannot describe. Subhanallah.", time:"6h ago", ameen:["u1","u2","u4"], count:3 },
  ],
  ex2: [
    { id:"m4", author:"Zainab Ali",   uid:"u5", text:"Just completed Saʿy — 7 passes between Safa and Marwah. Alhamdulillah 🌿", time:"1h ago", ameen:["u3","u4","u6"], count:3 },
    { id:"m5", author:"Noor Ibrahim", uid:"u6", text:"Drank Zamzam water for the first time. Made dua for all of you 💧", time:"3h ago", ameen:["u5"], count:1 },
  ],
  ex3: [
    { id:"m6", author:"Tariq Hassan", uid:"u7", text:"Arrived in Makkah safely after 14 hours of travel. Ya Allah 🕋", time:"5h ago", ameen:["u2","u4","u8"], count:3 },
    { id:"m7", author:"Omar Siddiq",  uid:"u8", text:"Entered Ihram at the Miqat. Labbayk Allāhumma labbayk.", time:"8h ago", ameen:["u7"], count:1 },
  ],
};

// ── Milestone card ────────────────────────────────────────────────────────────

function MilestoneCard({ item, myUid, onAmeen }) {
  const hasAmeen = item.ameen?.includes(myUid);
  const [busy, setBusy] = useState(false);

  const tap = async () => {
    if (hasAmeen || busy) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 350));
    onAmeen?.(item.id);
    setBusy(false);
  };

  return (
    <View style={mc.card}>
      <View style={mc.top}>
        <UserAvatar name={item.author} size={38} />
        <View style={mc.meta}>
          <Text style={mc.name}>{item.author}</Text>
          <Text style={mc.time}>{item.time}</Text>
        </View>
      </View>
      <Text style={mc.text}>{item.text}</Text>
      <View style={mc.footer}>
        <TouchableOpacity
          style={[mc.btn, hasAmeen && mc.btnActive]}
          onPress={tap}
          disabled={hasAmeen || busy}
          activeOpacity={0.8}
        >
          {busy
            ? <ActivityIndicator size="small" color={hasAmeen ? "#fff" : colors.primary} />
            : <>
                <Text>🤲</Text>
                <Text style={[mc.btnText, hasAmeen && mc.btnTextActive]}>
                  {hasAmeen ? "Āmeen" : "Say Āmeen"}
                </Text>
              </>
          }
        </TouchableOpacity>
        {item.count > 0 && <Text style={mc.count}>{item.count} Āmeen</Text>}
      </View>
    </View>
  );
}

const create_mc = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing(2), marginBottom: spacing(1.25), ...shadows.card,
  },
  top: { flexDirection:"row", alignItems:"center", gap: spacing(1.25), marginBottom: spacing(1.25) },
  meta: { flex: 1 },
  name: { fontSize: typography.small, fontWeight:"500", color: colors.text },
  time: { fontSize: typography.tiny, color: colors.subtext },
  text: { fontSize: typography.body, color: colors.text, lineHeight: 22, marginBottom: spacing(1.5) },
  footer: { flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  btn: {
    flexDirection:"row", alignItems:"center", gap: spacing(0.75),
    paddingHorizontal: spacing(1.5), paddingVertical: spacing(0.75),
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  btnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  btnText: { fontSize: typography.small, color: colors.primary },
  btnTextActive: { color:"#fff", fontWeight:"500" },
  count: { fontSize: typography.tiny, color: colors.subtext },
});
const mc = create_mc(require("../theme").colors);

// ── Main ──────────────────────────────────────────────────────────────────────

export default function GroupsScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const currentUser = getCurrentUser();
  const myUid = currentUser?.uid ?? "u4";

  const [realGroups,  setRealGroups]  = useState([]);
  const [activeId,    setActiveId]    = useState("ex1");
  const [exMilestones, setExMilestones] = useState(EX_MILESTONES);
  const [realMilestones, setRealMilestones] = useState([]);
  const [showPost,    setShowPost]    = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [postText,    setPostText]    = useState("");
  const [newName,     setNewName]     = useState("");
  const [posting,      setPosting]      = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberSheet, setShowMemberSheet] = useState(false);
  const [removedUids, setRemovedUids] = useState([]);
  const initialised = useRef(false);

  // Subscribe to real groups
  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToUserGroups(currentUser.uid, (g) => {
      setRealGroups(g);
      if (!initialised.current && g.length > 0) {
        setActiveId(g[0].id);
        initialised.current = true;
      }
    });
  }, [currentUser?.uid]);

  // Subscribe to real group milestones
  useEffect(() => {
    const isExample = activeId?.startsWith("ex");
    if (isExample || !activeId) return;
    setRealMilestones([]);
    return subscribeToGroupMilestones(activeId, setRealMilestones);
  }, [activeId]);

  // Computed
  const usingExamples  = realGroups.length === 0;
  const allGroups      = usingExamples ? EX_GROUPS : realGroups;
  const activeGroup    = allGroups.find(g => g.id === activeId) ?? allGroups[0];
  const isExampleGroup = !!(activeGroup?.isExample);

  const members = isExampleGroup
    ? (activeGroup?.memberUids ?? [])
        .filter(uid => !removedUids.includes(uid))
        .map(uid => EX_MEMBERS[uid]).filter(Boolean)
    : [];

  const milestones = isExampleGroup
    ? (exMilestones[activeId] ?? [])
    : realMilestones;

  const handleAmeen = (milestoneId) => {
    setExMilestones(prev => ({
      ...prev,
      [activeId]: (prev[activeId] ?? []).map(m =>
        m.id === milestoneId
          ? { ...m, ameen: [...m.ameen, myUid], count: m.count + 1 }
          : m
      ),
    }));
  };

  const handlePost = async () => {
    if (!postText.trim() || posting) return;
    setPosting(true);
    if (isExampleGroup) {
      const newM = {
        id: `m${Date.now()}`, author: "You", uid: myUid,
        text: postText.trim(), time: "just now", ameen: [], count: 0,
      };
      setExMilestones(prev => ({
        ...prev,
        [activeId]: [newM, ...(prev[activeId] ?? [])],
      }));
    } else {
      await postMilestone(currentUser.uid, currentUser.displayName, activeId, postText.trim()).catch(()=>{});
    }
    setPostText(""); setShowPost(false); setPosting(false);
  };

  const handleCreateGroup = async () => {
    if (!newName.trim()) return;
    await createGroup(currentUser?.uid ?? "local", newName.trim()).catch(()=>{});
    setNewName(""); setShowNew(false);
  };

  const openMemberSheet = (member) => {
    if (member.uid === myUid) return; // can't act on yourself
    setSelectedMember(member);
    setShowMemberSheet(true);
  };

  const handleRemoveMember = () => {
    if (!selectedMember) return;
    setShowMemberSheet(false);
    // For example groups — filter from local state
    if (isExampleGroup) {
      const updated = EX_GROUPS.map(g => {
        if (g.id === activeId) {
          return { ...g, memberUids: g.memberUids.filter(uid => uid !== selectedMember.uid) };
        }
        return g;
      });
      // Update local display — re-derive from updated EX_GROUPS
      // Since EX_GROUPS is const we just track removed UIDs in state
      setRemovedUids(prev => [...prev, selectedMember.uid]);
    }
    setSelectedMember(null);
  };

  const handleAddToGroup = (targetGroupId) => {
    setShowMemberSheet(false);
    if (isExampleGroup) {
      // Show a success message for example groups
      alert(`${selectedMember?.displayName} would be added to that group.`);
    }
    setSelectedMember(null);
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Groups</Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.bellWrap} onPress={() => navigation?.navigate?.("Notifications")}>
            <Bell size={22} color={colors.text} weight="regular" />
            <View style={s.badge} />
          </TouchableOpacity>
          <TouchableOpacity style={s.newBtn} onPress={() => setShowNew(true)}>
            <Text style={s.newBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Group tabs — FlatList */}
      <View style={s.tabsWrap}>
        <FlatList
          horizontal
          data={allGroups}
          keyExtractor={g => g.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabsContent}
          renderItem={({ item: g }) => {
            const active = g.id === activeGroup?.id;
            return (
              <TouchableOpacity
                style={[s.tab, active && s.tabActive]}
                onPress={() => setActiveId(g.id)}
                activeOpacity={0.85}
              >
                <View style={s.tabIconRow}>
                  <View style={[s.tabIconWrap, active && s.tabIconWrapActive]}>
                    <GroupIcon size={16} color={active ? "#fff" : colors.primary} />
                  </View>
                  <View>
                    <Text style={[s.tabName, active && s.tabNameActive]}>{g.name}</Text>
                    <Text style={[s.tabCount, active && s.tabCountActive]}>
                      {(g.memberUids ?? g.members ?? []).length} members
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Example banner */}
        {isExampleGroup && (
          <View style={s.banner}>
            <Text style={s.bannerText}>
              ✦  This is an example group showing you how milestones and Āmeen reactions work.
            </Text>
            <TouchableOpacity onPress={() => setShowNew(true)}>
              <Text style={s.bannerCta}>Create your own group →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Member avatars */}
        {members.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.memberRow}>
            {members.map(m => (
              <TouchableOpacity
                key={m.uid}
                style={s.memberWrap}
                onPress={() => openMemberSheet(m)}
                activeOpacity={m.uid === myUid ? 1 : 0.75}
              >
                <UserAvatar name={m.displayName} emoji={m.avatarEmoji} size={52} />
                <Text style={s.memberName} numberOfLines={1}>
                  {m.displayName.split(" ")[0]}
                </Text>
                {m.uid !== myUid && (
                  <Text style={s.memberTapHint}>tap</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={s.addTile}
              onPress={() => navigation?.navigate?.("Connections", { mode:"pick", groupId: activeId, groupName: activeGroup?.name })}
            >
              <Text style={s.addTileText}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Hint for real groups */}
        {!isExampleGroup && (
          <Text style={s.hint}>Tap a member to add them to another group or remove them</Text>
        )}

        {/* Feed header */}
        <View style={s.feedHeader}>
          <Text style={s.feedTitle}>Milestones</Text>
          <TouchableOpacity style={s.shareBtn} onPress={() => setShowPost(true)}>
            <Text style={s.shareBtnText}>+ Share</Text>
          </TouchableOpacity>
        </View>

        {/* Milestones */}
        {milestones.length > 0
          ? milestones.map(m => (
              <MilestoneCard
                key={m.id}
                item={m}
                myUid={myUid}
                onAmeen={handleAmeen}
              />
            ))
          : (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🌿</Text>
              <Text style={s.emptyText}>No milestones yet.{"\n"}Be the first to share one.</Text>
            </View>
          )
        }

        <View style={{ height: spacing(10) }} />
      </ScrollView>

      {/* Post milestone modal */}
      <Modal visible={showPost} transparent animationType="slide">
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
          <TouchableOpacity style={mo.overlay} activeOpacity={1} onPress={()=>{setShowPost(false);setPostText("");}}>
            <View style={mo.sheet} onStartShouldSetResponder={()=>true}>
              <Text style={mo.title}>Share a milestone</Text>
              <Text style={mo.sub}>Sharing with {activeGroup?.name}</Text>
              <TextInput
                style={mo.input}
                placeholder="e.g. Completed Tawaf, alhamdulillah 🕋"
                placeholderTextColor={colors.placeholder}
                value={postText}
                onChangeText={t => setPostText(t.slice(0, MAX_CHARS))}
                multiline maxLength={MAX_CHARS} autoFocus
              />
              <Text style={mo.charCount}>{postText.length} / {MAX_CHARS}</Text>
              <View style={mo.btnRow}>
                <TouchableOpacity style={mo.cancel} onPress={()=>{setShowPost(false);setPostText("");}}>
                  <Text style={mo.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[mo.submit, (!postText.trim()||posting) && mo.submitDim]}
                  onPress={handlePost} disabled={posting||!postText.trim()}
                >
                  {posting ? <ActivityIndicator color="#fff" size="small"/> : <Text style={mo.submitText}>Share</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* New group modal */}
      <Modal visible={showNew} transparent animationType="slide">
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
          <TouchableOpacity style={mo.overlay} activeOpacity={1} onPress={()=>{setShowNew(false);setNewName("");}}>
            <View style={mo.sheet} onStartShouldSetResponder={()=>true}>
              <Text style={mo.title}>New group</Text>
              <TextInput
                style={[mo.input, {minHeight:52}]}
                placeholder="e.g. Family Hajj 2026"
                placeholderTextColor={colors.placeholder}
                value={newName}
                onChangeText={setNewName}
                autoFocus returnKeyType="done"
                onSubmitEditing={handleCreateGroup}
              />
              <View style={mo.btnRow}>
                <TouchableOpacity style={mo.cancel} onPress={()=>{setShowNew(false);setNewName("");}}>
                  <Text style={mo.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[mo.submit, !newName.trim() && mo.submitDim]}
                  onPress={handleCreateGroup} disabled={!newName.trim()}
                >
                  <Text style={mo.submitText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Member action sheet */}
      <Modal visible={showMemberSheet} transparent animationType="slide">
        <TouchableOpacity
          style={ma.overlay}
          activeOpacity={1}
          onPress={() => { setShowMemberSheet(false); setSelectedMember(null); }}
        >
          <View style={ma.sheet} onStartShouldSetResponder={() => true}>
            {/* Member info */}
            <View style={ma.memberRow}>
              <UserAvatar name={selectedMember?.displayName} size={52} />
              <View>
                <Text style={ma.memberName}>{selectedMember?.displayName}</Text>
                <Text style={ma.memberSub}>Member of {activeGroup?.name}</Text>
              </View>
            </View>

            <View style={ma.divider} />

            {/* Add to another group */}
            <Text style={ma.sectionLabel}>ADD TO ANOTHER GROUP</Text>
            {allGroups
              .filter(g => g.id !== activeId)
              .map(g => (
                <TouchableOpacity
                  key={g.id}
                  style={ma.optionRow}
                  onPress={() => handleAddToGroup(g.id)}
                  activeOpacity={0.85}
                >
                  <View style={ma.optionIcon}>
                    <GroupIcon size={16} color={colors.primary} />
                  </View>
                  <Text style={ma.optionText}>{g.name}</Text>
                  <Text style={ma.optionPlus}>+</Text>
                </TouchableOpacity>
              ))
            }

            <View style={ma.divider} />

            {/* Remove */}
            <TouchableOpacity style={ma.removeRow} onPress={handleRemoveMember}>
              <Text style={ma.removeText}>Remove from {activeGroup?.name}</Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity style={ma.cancelRow} onPress={() => { setShowMemberSheet(false); setSelectedMember(null); }}>
              <Text style={ma.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors) => StyleSheet.create({
  safe: { flex:1, backgroundColor: colors.background },

  header: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(1.5),
    borderBottomWidth:1, borderBottomColor: colors.border,
  },
  back: { fontSize: 22, color: colors.text },
  title: { fontFamily: SERIF, fontSize:22, color: colors.text },
  headerRight: { flexDirection:"row", alignItems:"center", gap: spacing(1.25) },
  bellWrap: { position:"relative", padding: spacing(0.5) },
  badge: {
    position:"absolute", top:2, right:2, width:8, height:8,
    borderRadius:4, backgroundColor: colors.error,
    borderWidth:1.5, borderColor: colors.background,
  },
  newBtn: {
    backgroundColor: colors.primary, borderRadius: radius.pill,
    paddingHorizontal: spacing(1.75), paddingVertical: spacing(0.875),
    ...shadows.button,
  },
  newBtnText: { fontSize: typography.small, color:"#fff", fontWeight:"600" },

  // Tabs
  tabsWrap: { borderBottomWidth:1, borderBottomColor: colors.border },
  tabsContent: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1.5),
    gap: spacing(1.25),
  },
  tab: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth:1, borderColor: colors.border,
    paddingHorizontal: spacing(2.5), paddingVertical: spacing(1.75),
  },
  tabIconRow: {
    flexDirection: "row", alignItems: "center", gap: spacing(1), marginBottom: 3,
  },
  tabIconWrap: {
    width: 28, height: 28, borderRadius: radius.sm,
    backgroundColor: "#EBF2EE",
    alignItems: "center", justifyContent: "center",
  },
  tabIconWrapActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabName:  { fontSize: typography.body, fontWeight:"500", color: colors.text },
  tabNameActive: { color:"#fff" },
  tabCount: { fontSize: typography.small, color: colors.subtext, marginTop:3 },
  tabCountActive: { color:"rgba(255,255,255,0.75)" },

  scroll: { paddingHorizontal: spacing(2.5), paddingTop: spacing(1.5) },

  // Banner
  banner: {
    backgroundColor:"#F5EDD8", borderRadius: radius.md, borderWidth:1,
    borderColor:"#E8D9B8", padding: spacing(2),
    marginBottom: spacing(1.5), gap: spacing(1),
  },
  bannerText: { fontSize: typography.small, color:"#7A6030", lineHeight:20 },
  bannerCta:  { fontSize: typography.small, color: colors.primary, fontWeight:"600" },

  // Members
  memberRow: {
    paddingVertical: spacing(1.5),
    gap: spacing(2), marginBottom: spacing(1),
  },
  memberWrap: { alignItems:"center", gap: spacing(0.75), width:68 },
  memberName: { fontSize: typography.tiny, color: colors.text, textAlign:"center", width:68 },
  addTile: {
    width:52, height:52, borderRadius:26, borderWidth:2,
    borderStyle:"dashed", borderColor: colors.border,
    alignItems:"center", justifyContent:"center",
  },
  addTileText: { fontSize:22, color: colors.border },
  memberTapHint: {
    fontSize: 9, color: colors.subtext, marginTop: 1,
    fontStyle: "italic",
  },

  hint: {
    fontSize: typography.tiny, color: colors.subtext,
    fontStyle:"italic", marginBottom: spacing(1),
  },

  // Feed
  feedHeader: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    marginBottom: spacing(1.25), marginTop: spacing(0.5),
  },
  feedTitle: { fontFamily: SERIF, fontSize: typography.heading, color: colors.text },
  shareBtn: {
    backgroundColor: colors.primary, borderRadius: radius.pill,
    paddingHorizontal: spacing(1.75), paddingVertical: spacing(0.875),
    ...shadows.button,
  },
  shareBtnText: { fontSize: typography.small, color:"#fff", fontWeight:"600" },

  empty: { alignItems:"center", paddingVertical: spacing(4), gap: spacing(1) },
  emptyEmoji: { fontSize:36 },
  emptyText: { fontSize: typography.body, color: colors.subtext, textAlign:"center", lineHeight:22 },
});

const create_mo = (colors) => StyleSheet.create({
  overlay: { flex:1, backgroundColor:"transparent", justifyContent:"flex-end" },
  sheet: {
    backgroundColor: "#E8F0EC",
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing(3), paddingBottom: spacing(5),
  },
  title: { fontFamily: SERIF, fontSize: typography.title, color: colors.text, marginBottom:4 },
  sub:   { fontSize: typography.small, color: colors.subtext, marginBottom: spacing(2) },
  input: {
    backgroundColor: colors.background, borderRadius: radius.md, borderWidth:1,
    borderColor: colors.border, padding: spacing(2),
    fontSize: typography.body, color: colors.text,
    minHeight:90, textAlignVertical:"top", marginBottom: spacing(0.75),
  },
  charCount: { fontSize: typography.tiny, color: colors.subtext, textAlign:"right", marginBottom: spacing(2) },
  btnRow:   { flexDirection:"row", gap: spacing(1.5) },
  cancel:   { flex:1, paddingVertical: spacing(1.75), borderRadius: radius.md, borderWidth:1, borderColor: colors.border, alignItems:"center" },
  cancelText: { fontSize: typography.body, color: colors.subtext },
  submit:   { flex:1, paddingVertical: spacing(1.75), borderRadius: radius.md, backgroundColor: colors.primary, alignItems:"center", ...shadows.button },
  submitDim:  { opacity:0.45 },
  submitText: { fontSize: typography.body, color:"#fff", fontWeight:"500" },
});
const mo = create_mo(require("../theme").colors);

const create_ma = (colors) => StyleSheet.create({
  overlay: { flex:1, backgroundColor:"transparent", justifyContent:"flex-end" },
  sheet: {
    backgroundColor: "#E8F0EC",
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    paddingTop: spacing(2), paddingBottom: spacing(5),
  },
  memberRow: {
    flexDirection:"row", alignItems:"center", gap: spacing(1.5),
    paddingHorizontal: spacing(2.5), paddingVertical: spacing(1.75),
  },
  memberName: { fontFamily: SERIF, fontSize: typography.heading + 5, color: colors.text },
  memberSub:  { fontSize: typography.tiny, color: colors.subtext, marginTop:2 },
  divider: { height:1, backgroundColor: colors.border, marginVertical: spacing(0.5) },
  sectionLabel: {
    fontSize:10, fontWeight:"700", letterSpacing:1.5, color: colors.subtext,
    paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(1.5),
  },
  optionRow: {
    flexDirection:"row", alignItems:"center", gap: spacing(1.5),
    paddingHorizontal: spacing(2.5), paddingVertical: spacing(1.75),
  },
  optionIcon: {
    width:36, height:36, borderRadius: radius.sm,
    backgroundColor:"#EBF2EE", alignItems:"center", justifyContent:"center",
  },
  optionText: { flex:1, fontSize: typography.body, color: colors.text },
  optionPlus: { fontSize:22, color: colors.primary, fontWeight:"700" },
  removeRow: {
    paddingHorizontal: spacing(2.5), paddingVertical: spacing(1.75),
    alignItems: "center",
  },
  removeText: { fontSize: typography.body, color: colors.error, textAlign: "center" },
  cancelRow: {
    paddingHorizontal: spacing(2.5), paddingVertical: spacing(1.75),
    marginTop: spacing(0.5),
  },
  cancelText: { fontSize: typography.body, color: colors.subtext, textAlign:"center" },
});
const ma = create_ma(require("../theme").colors);
