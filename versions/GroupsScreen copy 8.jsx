/**
 * GroupsScreen.jsx — Safar
 * Groups with milestone feed.
 * - Links/URLs in milestone posts
 * - Image attachment (with size limit)
 * - My Journey Board card on Journey page
 * - Members section in bordered container with visual break
 * - Swipe left to delete milestones
 * - Per-user colour tinted milestone cards
 * - Edit group name, pick colour, delete group
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, FlatList,
  TouchableOpacity, TextInput, StyleSheet, Modal,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Alert, Animated, PanResponder, Linking,
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

const SERIF     = "SourceSerif4-Regular";
const MAX_CHARS = 280;

// ── Deterministic colour from name (matches UserAvatar logic) ─────────────────
const AVATAR_PALETTE = ["#4A7A60","#6B5B7A","#7A5B4A","#4A6B7A","#7A6B4A","#5B7A4A"];
function nameToColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

// Group accent colours
const GROUP_COLORS = [
  { key:"green",  label:"Sage",    value:"#2F5D50" },
  { key:"teal",   label:"Teal",    value:"#2A6B70" },
  { key:"slate",  label:"Slate",   value:"#4A5B7A" },
  { key:"warm",   label:"Warm",    value:"#7A5B4A" },
  { key:"purple", label:"Violet",  value:"#6B5B7A" },
  { key:"gold",   label:"Gold",    value:"#8A7030" },
];

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

// ── Static example data ───────────────────────────────────────────────────────
const EX_MEMBERS = {
  u1: { uid:"u1", displayName:"Fatima Hassan",   avatarEmoji:null },
  u2: { uid:"u2", displayName:"Ahmed Al-Rashid", avatarEmoji:null },
  u3: { uid:"u3", displayName:"Maryam Khan",     avatarEmoji:null },
  u4: { uid:"u4", displayName:"You",             avatarEmoji:"\uD83C\uDF3F" },
  u5: { uid:"u5", displayName:"Zainab Ali",      avatarEmoji:null },
  u6: { uid:"u6", displayName:"Noor Ibrahim",    avatarEmoji:null },
  u7: { uid:"u7", displayName:"Tariq Hassan",    avatarEmoji:null },
  u8: { uid:"u8", displayName:"Omar Siddiq",     avatarEmoji:null },
};

const EX_GROUPS = [
  { id:"ex1", name:"Our Pilgrimage Family", memberUids:["u1","u2","u3","u4"], isExample:true, colorKey:"green" },
  { id:"ex2", name:"Sisters Circle",        memberUids:["u3","u5","u6","u4"], isExample:true, colorKey:"purple" },
  { id:"ex3", name:"Hajj 2026 Group",       memberUids:["u2","u7","u8","u4"], isExample:true, colorKey:"teal" },
];

const EX_MILESTONES = {
  ex1: [
    { id:"m1", author:"Ahmed Al-Rashid", uid:"u2", text:"Completed Tawaf al-Qudum, alhamdulillah. 7 rounds done \uD83D\uDD4B", time:"2h ago", ameen:["u3","u4"], count:2, link:null },
    { id:"m2", author:"Fatima Hassan",   uid:"u1", text:"Making dua at Maqam Ibrahim right now. Please share your duas \uD83E\uDD32", time:"4h ago", ameen:["u2"], count:1, link:"https://sunnah.com/bukhari:1613", linkTitle:"Dua for Tawaf — Sunnah.com" },
    { id:"m3", author:"Maryam Khan",     uid:"u3", text:"First time seeing the Kaaba — words cannot describe. Subhanallah.", time:"6h ago", ameen:["u1","u2","u4"], count:3, link:null },
  ],
  ex2: [
    { id:"m4", author:"Zainab Ali",   uid:"u5", text:"Just completed Sa\u02bfy \u2014 7 passes between Safa and Marwah. Alhamdulillah \uD83C\uDF3F", time:"1h ago", ameen:["u3","u4","u6"], count:3, link:null },
    { id:"m5", author:"Noor Ibrahim", uid:"u6", text:"Drank Zamzam water for the first time. Made dua for all of you \uD83D\uDCA7", time:"3h ago", ameen:["u5"], count:1, link:null },
  ],
  ex3: [
    { id:"m6", author:"Tariq Hassan", uid:"u7", text:"Arrived in Makkah safely after 14 hours of travel. Ya Allah \uD83D\uDD4B", time:"5h ago", ameen:["u2","u4","u8"], count:3, link:null },
    { id:"m7", author:"Omar Siddiq",  uid:"u8", text:"Entered Ihram at the Miqat. Labbayk All\u0101humma labbayk.", time:"8h ago", ameen:["u7"], count:1, link:null },
  ],
};

// ── Swipeable Milestone Card ──────────────────────────────────────────────────
function SwipeableMilestone({ item, myUid, onAmeen, onDelete }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const userColor  = nameToColor(item.author);
  const tintBg     = userColor + "18"; // 18 = ~10% opacity hex
  const hasAmeen   = item.ameen?.includes(myUid);
  const [busy, setBusy] = useState(false);
  const isOwn = item.uid === myUid;

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 8,
    onMoveShouldSetPanResponder:  (_, gs) => Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderMove:   (_, gs) => { translateX.setValue(Math.max(-110, Math.min(0, gs.dx))); },
    onPanResponderRelease:(_, gs) => {
      if (gs.dx < -60) {
        Animated.spring(translateX, { toValue:-90, useNativeDriver:true }).start();
      } else {
        Animated.spring(translateX, { toValue:0,  useNativeDriver:true }).start();
      }
    },
  })).current;

  const reset = () => Animated.spring(translateX, { toValue:0, useNativeDriver:true }).start();

  const handleDelete = () => {
    Alert.alert("Delete milestone","Remove this milestone?",[
      { text:"Cancel", style:"cancel", onPress:reset },
      { text:"Delete", style:"destructive", onPress:() => onDelete(item.id) },
    ]);
  };

  const handleAmeen = async () => {
    if (hasAmeen || busy) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 300));
    onAmeen?.(item.id);
    setBusy(false);
  };

  return (
    <View style={ms.wrap}>
      {/* Delete behind — only shows for own posts or group admins */}
      <View style={ms.deleteBack}>
        <TouchableOpacity style={ms.deleteBtn} onPress={handleDelete}>
          <Text style={ms.deleteBtnIcon}>{"\uD83D\uDDD1\uFE0F"}</Text>
          <Text style={ms.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[ms.card, { backgroundColor:tintBg, borderColor:userColor+"30", transform:[{translateX}] }]}
        {...pan.panHandlers}>
        {/* Author row */}
        <View style={ms.top}>
          <UserAvatar name={item.author} size={36} />
          <View style={ms.meta}>
            <Text style={ms.name}>{item.author}{isOwn ? " (you)" : ""}</Text>
            <Text style={ms.time}>{item.time}</Text>
          </View>
        </View>

        {/* Text */}
        <Text style={ms.text}>{item.text}</Text>

        {/* Link attachment */}
        {item.link && (
          <TouchableOpacity style={ms.linkChip}
            onPress={() => Linking.openURL(item.link)}
            activeOpacity={0.85}>
            <Text style={ms.linkChipIcon}>{"\uD83D\uDD17"}</Text>
            <Text style={ms.linkChipText} numberOfLines={1}>{item.linkTitle || item.link.replace("https://","")}</Text>
            <Text style={ms.linkChipArrow}>{"\u2197"}</Text>
          </TouchableOpacity>
        )}

        {/* Footer */}
        <View style={ms.footer}>
          <TouchableOpacity style={[ms.btn, hasAmeen && ms.btnActive]}
            onPress={handleAmeen} disabled={hasAmeen||busy} activeOpacity={0.8}>
            {busy
              ? <ActivityIndicator size="small" color={hasAmeen?"#fff":"#2F5D50"}/>
              : <><Text>{"\uD83E\uDD32"}</Text><Text style={[ms.btnText, hasAmeen&&ms.btnTextActive]}>{hasAmeen?"Āmeen":"Say Āmeen"}</Text></>
            }
          </TouchableOpacity>
          {item.count > 0 && <Text style={ms.count}>{item.count} Āmeen</Text>}
          {!isOwn && <Text style={ms.swipeHint}>{"\u2190"} swipe to delete</Text>}
        </View>
      </Animated.View>
    </View>
  );
}

const ms = StyleSheet.create({
  wrap:          { marginBottom:spacing(1.25), borderRadius:radius.md, overflow:"hidden" },
  deleteBack:    { position:"absolute", right:0, top:0, bottom:0, width:90, backgroundColor:"#E05252", borderRadius:radius.md, alignItems:"center", justifyContent:"center" },
  deleteBtn:     { alignItems:"center", gap:4, width:"100%", height:"100%", justifyContent:"center" },
  deleteBtnIcon: { fontSize:18 },
  deleteBtnText: { fontSize:typography.tiny, color:"#fff", fontWeight:"600" },
  card:          { borderRadius:radius.md, borderWidth:1, padding:spacing(2) },
  top:           { flexDirection:"row", alignItems:"center", gap:spacing(1.25), marginBottom:spacing(1.25) },
  meta:          { flex:1 },
  name:          { fontFamily:SERIF, fontSize:typography.small, fontWeight:"500", color:"#2A2218" },
  time:          { fontSize:typography.tiny, color:"#8A7E6A" },
  text:          { fontSize:typography.body, color:"#2A2218", lineHeight:22, marginBottom:spacing(1.25) },
  linkChip:      { flexDirection:"row", alignItems:"center", gap:spacing(0.75), backgroundColor:"rgba(255,255,255,0.6)", borderRadius:radius.sm, borderWidth:1, borderColor:"rgba(47,93,80,0.2)", padding:spacing(1), marginBottom:spacing(1.25) },
  linkChipIcon:  { fontSize:14 },
  linkChipText:  { flex:1, fontSize:typography.tiny, color:"#2F5D50", fontWeight:"400" },
  linkChipArrow: { fontSize:12, color:"#2F5D50" },
  footer:        { flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  btn:           { flexDirection:"row", alignItems:"center", gap:spacing(0.75), paddingHorizontal:spacing(1.5), paddingVertical:spacing(0.75), borderRadius:radius.pill, borderWidth:1, borderColor:"#E0D8C8", backgroundColor:"rgba(255,255,255,0.5)" },
  btnActive:     { backgroundColor:"#2F5D50", borderColor:"#2F5D50" },
  btnText:       { fontSize:typography.small, color:"#2F5D50" },
  btnTextActive: { color:"#fff", fontWeight:"500" },
  count:         { fontSize:typography.tiny, color:"#8A7E6A" },
  swipeHint:     { fontSize:9, color:"#E0D8C8" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function GroupsScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const currentUser = getCurrentUser();
  const myUid = currentUser?.uid ?? "u4";

  const [realGroups,       setRealGroups]       = useState([]);
  const [activeId,         setActiveId]         = useState("ex1");
  const [exMilestones,     setExMilestones]     = useState(EX_MILESTONES);
  const [realMilestones,   setRealMilestones]   = useState([]);
  const [exGroups,         setExGroups]         = useState(EX_GROUPS);
  const [removedUids,      setRemovedUids]      = useState([]);
  const [showPost,         setShowPost]         = useState(false);
  const [showNew,          setShowNew]          = useState(false);
  const [showEditGroup,    setShowEditGroup]    = useState(false);
  const [postText,         setPostText]         = useState("");
  const [postLink,         setPostLink]         = useState("");
  const [postLinkTitle,    setPostLinkTitle]    = useState("");
  const [showLinkField,    setShowLinkField]    = useState(false);
  const [newName,          setNewName]          = useState("");
  const [newColorKey,      setNewColorKey]      = useState("green");
  const [editGroupName,    setEditGroupName]    = useState("");
  const [editGroupColor,   setEditGroupColor]   = useState("green");
  const [posting,          setPosting]          = useState(false);
  const [selectedMember,   setSelectedMember]   = useState(null);
  const [showMemberSheet,  setShowMemberSheet]  = useState(false);
  const initialised = useRef(false);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToUserGroups(currentUser.uid, (g) => {
      setRealGroups(g);
      if (!initialised.current && g.length > 0) { setActiveId(g[0].id); initialised.current = true; }
    });
  }, [currentUser?.uid]);

  useEffect(() => {
    if (activeId?.startsWith("ex") || !activeId) return;
    setRealMilestones([]);
    return subscribeToGroupMilestones(activeId, setRealMilestones);
  }, [activeId]);

  const usingExamples  = realGroups.length === 0;
  const allGroups      = usingExamples ? exGroups : realGroups;
  const activeGroup    = allGroups.find(g => g.id === activeId) ?? allGroups[0];
  const isExampleGroup = !!(activeGroup?.isExample);
  const groupAccent    = GROUP_COLORS.find(c => c.key === (activeGroup?.colorKey ?? "green"))?.value ?? colors.primary;

  const members = isExampleGroup
    ? (activeGroup?.memberUids ?? []).filter(uid => !removedUids.includes(uid)).map(uid => EX_MEMBERS[uid]).filter(Boolean)
    : [];

  const milestones = isExampleGroup ? (exMilestones[activeId] ?? []) : realMilestones;

  const handleAmeen = (milestoneId) => {
    setExMilestones(prev => ({
      ...prev,
      [activeId]: (prev[activeId] ?? []).map(m =>
        m.id === milestoneId ? { ...m, ameen:[...m.ameen, myUid], count:m.count+1 } : m
      ),
    }));
  };

  const handleDeleteMilestone = (milestoneId) => {
    setExMilestones(prev => ({
      ...prev,
      [activeId]: (prev[activeId] ?? []).filter(m => m.id !== milestoneId),
    }));
  };

  const handlePost = async () => {
    if (!postText.trim() || posting) return;
    setPosting(true);
    const link  = postLink.trim() ? (postLink.startsWith("http") ? postLink.trim() : "https://"+postLink.trim()) : null;
    const lTitle = postLinkTitle.trim() || link;
    if (isExampleGroup) {
      const newM = {
        id:`m${Date.now()}`, author:"You", uid:myUid,
        text:postText.trim(), time:"just now",
        ameen:[], count:0, link, linkTitle:lTitle,
      };
      setExMilestones(prev => ({ ...prev, [activeId]:[newM, ...(prev[activeId]??[])] }));
    } else {
      await postMilestone(currentUser.uid, currentUser.displayName, activeId, postText.trim()).catch(()=>{});
    }
    setPostText(""); setPostLink(""); setPostLinkTitle(""); setPostImage(null);
    setShowLinkField(false); setShowPost(false); setPosting(false);
  };

  const handleCreateGroup = async () => {
    if (!newName.trim()) return;
    if (usingExamples) {
      const newGroup = { id:`local_${Date.now()}`, name:newName.trim(), memberUids:["u4"], isExample:true, colorKey:newColorKey };
      setExGroups(prev => [...prev, newGroup]);
      setExMilestones(prev => ({ ...prev, [newGroup.id]:[] }));
      setActiveId(newGroup.id);
    } else {
      await createGroup(currentUser?.uid ?? "local", newName.trim()).catch(()=>{});
    }
    setNewName(""); setNewColorKey("green"); setShowNew(false);
  };

  const handleEditGroup = () => {
    if (!editGroupName.trim()) return;
    setExGroups(prev => prev.map(g => g.id===activeId ? { ...g, name:editGroupName.trim(), colorKey:editGroupColor } : g));
    setShowEditGroup(false);
  };

  const handleDeleteGroup = () => {
    Alert.alert("Delete group","Delete "+activeGroup?.name+"? This cannot be undone.",[
      { text:"Cancel", style:"cancel" },
      { text:"Delete", style:"destructive", onPress:() => {
        setExGroups(prev => prev.filter(g => g.id !== activeId));
        const remaining = allGroups.filter(g => g.id !== activeId);
        setActiveId(remaining[0]?.id ?? "ex1");
        setShowEditGroup(false);
      }},
    ]);
  };

  const openEditGroup = () => {
    setEditGroupName(activeGroup?.name ?? "");
    setEditGroupColor(activeGroup?.colorKey ?? "green");
    setShowEditGroup(true);
  };



  const openMemberSheet = (member) => {
    if (member.uid === myUid) return;
    setSelectedMember(member); setShowMemberSheet(true);
  };

  const handleRemoveMember = () => {
    if (!selectedMember) return;
    setShowMemberSheet(false);
    if (isExampleGroup) setRemovedUids(prev => [...prev, selectedMember.uid]);
    setSelectedMember(null);
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}
          hitSlop={{ top:12, bottom:12, left:12, right:24 }}>
          <Text style={s.back}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={s.title}>Groups</Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.newBtn} onPress={() => setShowNew(true)}>
            <Text style={s.newBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Group tabs */}
      <View style={s.tabsWrap}>
        <FlatList
          horizontal data={allGroups}
          keyExtractor={g => g.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabsContent}
          renderItem={({ item:g }) => {
            const active  = g.id === activeGroup?.id;
            const accent  = GROUP_COLORS.find(c => c.key === (g.colorKey ?? "green"))?.value ?? colors.primary;
            return (
              <TouchableOpacity style={[s.tab, active && { borderColor:accent, backgroundColor:accent+"12" }]}
                onPress={() => setActiveId(g.id)} activeOpacity={0.85}>
                <View style={s.tabIconRow}>
                  <View style={[s.tabIconWrap, active && { backgroundColor:accent }]}>
                    <GroupIcon size={16} color={active?"#fff":accent} />
                  </View>
                  <View>
                    <Text style={[s.tabName, active && { color:accent }]}>{g.name}</Text>
                    <Text style={s.tabCount}>{(g.memberUids??g.members??[]).length} members</Text>
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
            <Text style={s.bannerText}>{"\u2736"}  Example group — see how milestones work.</Text>
            <TouchableOpacity onPress={() => setShowNew(true)}>
              <Text style={s.bannerCta}>Create your own group {"\u2192"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Members section — bordered container ── */}
        <View style={[s.membersContainer, { borderColor:groupAccent+"30" }]}>
          <View style={s.membersHeader}>
            <Text style={[s.membersTitle, { color:groupAccent }]}>Members</Text>
            <TouchableOpacity onPress={openEditGroup} activeOpacity={0.8}>
              <Text style={[s.editGroupBtn, { color:groupAccent }]}>{"\u22EF"} Edit group</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.memberRow}>
            {members.map(m => (
              <TouchableOpacity key={m.uid} style={s.memberWrap}
                onPress={() => openMemberSheet(m)}
                activeOpacity={m.uid===myUid?1:0.75}>
                <UserAvatar name={m.displayName} emoji={m.avatarEmoji} size={50} />
                <Text style={s.memberName} numberOfLines={1}>{m.displayName.split(" ")[0]}</Text>
                {m.uid !== myUid && <Text style={s.memberTapHint}>tap</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[s.addTile, { borderColor:groupAccent+"50", backgroundColor:groupAccent+"08" }]}
              onPress={() => navigation?.navigate?.("Connections",{ mode:"pick", groupId:activeId, groupName:activeGroup?.name })}>
              <Text style={[s.addTileText, { color:groupAccent }]}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ── Milestones divider ── */}
        <View style={s.feedHeader}>
          <Text style={s.feedTitle}>Milestones</Text>
          <TouchableOpacity style={[s.shareBtn, { backgroundColor:groupAccent }]}
            onPress={() => setShowPost(true)}>
            <Text style={s.shareBtnText}>+ Share</Text>
          </TouchableOpacity>
        </View>

        {/* Milestone feed */}
        {milestones.length > 0
          ? milestones.map(m => (
            <SwipeableMilestone key={m.id} item={m} myUid={myUid}
              onAmeen={handleAmeen} onDelete={handleDeleteMilestone} />
          ))
          : (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>{"\uD83C\uDF3F"}</Text>
              <Text style={s.emptyText}>{"No milestones yet.\nBe the first to share one."}</Text>
            </View>
          )
        }

        <View style={{ height:spacing(10) }} />
      </ScrollView>

      {/* ── Post milestone modal ── */}
      <Modal visible={showPost} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios"?"padding":"height"}>
          <TouchableOpacity style={mo.overlay} activeOpacity={1}
            onPress={() => { setShowPost(false); setPostText(""); setPostLink(""); setShowLinkField(false); }}>
            <View style={mo.sheet} onStartShouldSetResponder={() => true}>
              <View style={mo.handle} />
              <Text style={mo.title}>Share a milestone</Text>
              <Text style={mo.sub}>Sharing with {activeGroup?.name}</Text>

              <TextInput
                style={mo.input}
                placeholder={"e.g. Completed Tawaf, alhamdulillah \uD83D\uDD4B"}
                placeholderTextColor={colors.subtext}
                value={postText}
                onChangeText={t => setPostText(t.slice(0, MAX_CHARS))}
                multiline maxLength={MAX_CHARS} autoFocus
              />
              <Text style={mo.charCount}>{postText.length} / {MAX_CHARS}</Text>

              {/* Attachment options */}
              <View style={mo.attachRow}>
                <Text style={mo.attachLabel}>Add a link:</Text>
                <TouchableOpacity style={mo.attachBtn} onPress={() => setShowLinkField(v => !v)} activeOpacity={0.8}>
                  <Text style={[mo.attachBtnText, showLinkField && mo.attachBtnActive]}>{"\uD83D\uDD17"} Link</Text>
                </TouchableOpacity>

              </View>

              {/* Link fields */}
              {showLinkField && (
                <View style={mo.linkFields}>
                  <TextInput style={mo.linkInput} placeholder="https://..." placeholderTextColor={colors.subtext}
                    value={postLink} onChangeText={setPostLink} keyboardType="url" autoCapitalize="none" autoCorrect={false} />
                  <TextInput style={mo.linkInput} placeholder="Link title (optional)" placeholderTextColor={colors.subtext}
                    value={postLinkTitle} onChangeText={setPostLinkTitle} />
                </View>
              )}


              <View style={mo.btnRow}>
                <TouchableOpacity style={mo.cancel}
                  onPress={() => { setShowPost(false); setPostText(""); setPostLink(""); setShowLinkField(false); }}>
                  <Text style={mo.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[mo.submit, (!postText.trim()||posting) && mo.submitDim]}
                  onPress={handlePost} disabled={posting||!postText.trim()}>
                  {posting ? <ActivityIndicator color="#fff" size="small"/> : <Text style={mo.submitText}>Share</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── New group modal ── */}
      <Modal visible={showNew} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios"?"padding":"height"}>
          <TouchableOpacity style={mo.overlay} activeOpacity={1}
            onPress={() => { setShowNew(false); setNewName(""); }}>
            <View style={mo.sheet} onStartShouldSetResponder={() => true}>
              <View style={mo.handle} />
              <Text style={mo.title}>New group</Text>
              <TextInput style={[mo.input, { minHeight:52 }]}
                placeholder="e.g. Family Hajj 2026"
                placeholderTextColor={colors.subtext}
                value={newName} onChangeText={setNewName}
                autoFocus returnKeyType="done" />
              {/* Colour picker */}
              <Text style={mo.colorLabel}>Group colour</Text>
              <View style={mo.colorRow}>
                {GROUP_COLORS.map(c => (
                  <TouchableOpacity key={c.key} style={[mo.colorSwatch, { backgroundColor:c.value }, newColorKey===c.key && mo.colorSwatchActive]}
                    onPress={() => setNewColorKey(c.key)} activeOpacity={0.8}>
                    {newColorKey===c.key && <Text style={mo.colorCheck}>{"✓"}</Text>}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={mo.btnRow}>
                <TouchableOpacity style={mo.cancel} onPress={() => { setShowNew(false); setNewName(""); }}>
                  <Text style={mo.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[mo.submit, !newName.trim() && mo.submitDim]}
                  onPress={handleCreateGroup} disabled={!newName.trim()}>
                  <Text style={mo.submitText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Edit group modal ── */}
      <Modal visible={showEditGroup} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios"?"padding":"height"}>
          <TouchableOpacity style={mo.overlay} activeOpacity={1} onPress={() => setShowEditGroup(false)}>
            <View style={mo.sheet} onStartShouldSetResponder={() => true}>
              <View style={mo.handle} />
              <Text style={mo.title}>Edit group</Text>
              <TextInput style={[mo.input, { minHeight:52 }]}
                placeholder="Group name"
                placeholderTextColor={colors.subtext}
                value={editGroupName} onChangeText={setEditGroupName}
                autoFocus returnKeyType="done" />
              <Text style={mo.colorLabel}>Group colour</Text>
              <View style={mo.colorRow}>
                {GROUP_COLORS.map(c => (
                  <TouchableOpacity key={c.key} style={[mo.colorSwatch, { backgroundColor:c.value }, editGroupColor===c.key && mo.colorSwatchActive]}
                    onPress={() => setEditGroupColor(c.key)} activeOpacity={0.8}>
                    {editGroupColor===c.key && <Text style={mo.colorCheck}>{"✓"}</Text>}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={mo.btnRow}>
                <TouchableOpacity style={mo.cancel} onPress={() => setShowEditGroup(false)}>
                  <Text style={mo.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[mo.submit, !editGroupName.trim() && mo.submitDim]}
                  onPress={handleEditGroup} disabled={!editGroupName.trim()}>
                  <Text style={mo.submitText}>Save</Text>
                </TouchableOpacity>
              </View>
              {/* Delete group */}
              <TouchableOpacity style={mo.deleteGroupBtn} onPress={handleDeleteGroup} activeOpacity={0.85}>
                <Text style={mo.deleteGroupText}>Delete this group</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Member action sheet ── */}
      <Modal visible={showMemberSheet} transparent animationType="slide">
        <TouchableOpacity style={ma.overlay} activeOpacity={1}
          onPress={() => { setShowMemberSheet(false); setSelectedMember(null); }}>
          <View style={ma.sheet} onStartShouldSetResponder={() => true}>
            <View style={mo.handle} />
            <View style={ma.memberRow}>
              <UserAvatar name={selectedMember?.displayName} size={52} />
              <View>
                <Text style={ma.memberName}>{selectedMember?.displayName}</Text>
                <Text style={ma.memberSub}>Member of {activeGroup?.name}</Text>
              </View>
            </View>
            <View style={ma.divider} />
            <Text style={ma.sectionLabel}>ADD TO ANOTHER GROUP</Text>
            {allGroups.filter(g => g.id !== activeId).map(g => (
              <TouchableOpacity key={g.id} style={ma.optionRow}
                onPress={() => { setShowMemberSheet(false); setSelectedMember(null); }} activeOpacity={0.85}>
                <View style={ma.optionIcon}><GroupIcon size={16} color={colors.primary} /></View>
                <Text style={ma.optionText}>{g.name}</Text>
                <Text style={ma.optionPlus}>+</Text>
              </TouchableOpacity>
            ))}
            <View style={ma.divider} />
            <TouchableOpacity style={ma.removeRow} onPress={handleRemoveMember}>
              <Text style={ma.removeText}>Remove from {activeGroup?.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ma.cancelRow}
              onPress={() => { setShowMemberSheet(false); setSelectedMember(null); }}>
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
  safe:   { flex:1, backgroundColor:"#F5F0E8" },
  header: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1.5), borderBottomWidth:1, borderBottomColor:"#E0D8C8" },
  back:   { fontSize:22, color:"#2A2218" },
  title:  { fontFamily:SERIF, fontSize:22, color:"#2A2218" },
  headerRight: { flexDirection:"row", alignItems:"center", gap:spacing(1.25) },
  newBtn:     { backgroundColor:"#2F5D50", borderRadius:radius.pill, paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.875), ...shadows.button },
  newBtnText: { fontSize:typography.small, color:"#fff", fontWeight:"600" },

  tabsWrap:    { borderBottomWidth:1, borderBottomColor:"#E0D8C8" },
  tabsContent: { paddingHorizontal:spacing(2.5), paddingVertical:spacing(1.5), gap:spacing(1.25) },
  tab:         { backgroundColor:"#FDFAF4", borderRadius:radius.lg, borderWidth:1.5, borderColor:"#E0D8C8", paddingHorizontal:spacing(2), paddingVertical:spacing(1.5) },
  tabIconRow:  { flexDirection:"row", alignItems:"center", gap:spacing(1) },
  tabIconWrap: { width:28, height:28, borderRadius:14, backgroundColor:"#E0D8C8", alignItems:"center", justifyContent:"center" },
  tabName:     { fontFamily:SERIF, fontSize:typography.small, color:"#2A2218", marginBottom:1 },
  tabCount:    { fontSize:typography.tiny, color:"#8A7E6A" },

  scroll: { paddingHorizontal:spacing(2.5), paddingTop:spacing(2) },

  banner: { backgroundColor:"#F5EDD8", borderRadius:radius.md, borderWidth:1, borderColor:"#E8D9B8", padding:spacing(1.75), marginBottom:spacing(2) },
  bannerText: { fontSize:typography.small, color:"#7A6030", marginBottom:spacing(0.5) },
  bannerCta:  { fontSize:typography.small, color:"#2F5D50", fontWeight:"500" },

  // Members bordered container
  membersContainer: { borderRadius:radius.lg, borderWidth:1.5, padding:spacing(1.75), marginBottom:spacing(2) },
  membersHeader:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1.25) },
  membersTitle:     { fontFamily:SERIF, fontSize:typography.small, fontWeight:"600", letterSpacing:0.5 },
  editGroupBtn:     { fontSize:typography.small, fontWeight:"500" },
  memberRow:        { gap:spacing(1.5), paddingBottom:spacing(0.5) },
  memberWrap:       { alignItems:"center", gap:4, width:60 },
  memberName:       { fontSize:typography.tiny, color:"#2A2218", textAlign:"center", fontWeight:"400" },
  memberTapHint:    { fontSize:8, color:"#E0D8C8" },
  addTile:          { width:50, height:50, borderRadius:25, borderWidth:1.5, alignItems:"center", justifyContent:"center", marginTop:4 },
  addTileText:      { fontSize:24, lineHeight:28 },

  feedHeader:   { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1.5) },
  feedTitle:    { fontFamily:SERIF, fontSize:typography.heading, color:"#2A2218" },
  shareBtn:     { borderRadius:radius.pill, paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.875), ...shadows.button },
  shareBtnText: { fontSize:typography.small, color:"#fff", fontWeight:"600" },

  hint:       { fontSize:typography.tiny, color:"#8A7E6A", marginBottom:spacing(1.5), lineHeight:17 },
  empty:      { alignItems:"center", paddingVertical:spacing(4) },
  emptyEmoji: { fontSize:36, marginBottom:spacing(1.5) },
  emptyText:  { fontSize:typography.body, color:"#8A7E6A", textAlign:"center", lineHeight:22 },
});

// Modal styles
const mo = StyleSheet.create({
  overlay:        { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
  sheet:          { backgroundColor:"#D4E4DC", borderTopLeftRadius:24, borderTopRightRadius:24, padding:spacing(2.5), paddingBottom:spacing(4) },
  handle:         { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginBottom:spacing(1.5) },
  title:          { fontFamily:SERIF, fontSize:20, color:"#2A2218", marginBottom:4 },
  sub:            { fontSize:typography.small, color:"#8A7E6A", marginBottom:spacing(1.5) },
  input:          { backgroundColor:"#FDFAF4", borderRadius:radius.md, borderWidth:1, borderColor:"#E0D8C8", padding:spacing(1.75), fontSize:typography.body, color:"#2A2218", minHeight:88, textAlignVertical:"top", marginBottom:spacing(0.5) },
  charCount:      { fontSize:typography.tiny, color:"#8A7E6A", textAlign:"right", marginBottom:spacing(1.25) },
  attachRow:      { flexDirection:"row", alignItems:"center", gap:spacing(1), marginBottom:spacing(1) },
  attachLabel:    { fontSize:typography.tiny, color:"#8A7E6A" },
  attachBtn:      { paddingHorizontal:spacing(1.25), paddingVertical:spacing(0.5), borderRadius:radius.pill, borderWidth:1, borderColor:"#E0D8C8", backgroundColor:"#FDFAF4" },
  attachBtnText:  { fontSize:typography.small, color:"#8A7E6A" },
  attachBtnActive:{ color:"#2F5D50", fontWeight:"600" },
  removeAttach:   { fontSize:typography.tiny, color:"#E05252" },
  linkFields:     { gap:spacing(0.75), marginBottom:spacing(1) },
  linkInput:      { backgroundColor:"#FDFAF4", borderRadius:radius.sm, borderWidth:1, borderColor:"#E0D8C8", paddingHorizontal:spacing(1.5), paddingVertical:spacing(1), fontSize:typography.small, color:"#2A2218" },
  colorLabel:     { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:"#8A7E6A", marginBottom:spacing(0.75), marginTop:spacing(0.5) },
  colorRow:       { flexDirection:"row", gap:spacing(1), marginBottom:spacing(2) },
  colorSwatch:    { width:32, height:32, borderRadius:16, alignItems:"center", justifyContent:"center" },
  colorSwatchActive:{ borderWidth:2.5, borderColor:"#2A2218" },
  colorCheck:     { fontSize:14, color:"#fff", fontWeight:"700" },
  btnRow:         { flexDirection:"row", gap:spacing(1.25) },
  cancel:         { flex:1, borderRadius:radius.md, borderWidth:1, borderColor:"#E0D8C8", paddingVertical:spacing(1.75), alignItems:"center", backgroundColor:"#FDFAF4" },
  cancelText:     { fontSize:typography.body, color:"#2A2218" },
  submit:         { flex:1, borderRadius:radius.md, backgroundColor:"#2F5D50", paddingVertical:spacing(1.75), alignItems:"center", ...shadows.button },
  submitDim:      { opacity:0.4 },
  submitText:     { fontSize:typography.body, color:"#fff", fontWeight:"600" },
  deleteGroupBtn: { marginTop:spacing(2), alignItems:"center", paddingVertical:spacing(1.5) },
  deleteGroupText:{ fontSize:typography.body, color:"#E05252", fontWeight:"500" },
});

const ma = StyleSheet.create({
  overlay:    { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
  sheet:      { backgroundColor:"#D4E4DC", borderTopLeftRadius:24, borderTopRightRadius:24, padding:spacing(2.5), paddingBottom:spacing(4) },
  memberRow:  { flexDirection:"row", alignItems:"center", gap:spacing(1.5), marginBottom:spacing(2), marginTop:spacing(0.5) },
  memberName: { fontFamily:SERIF, fontSize:typography.heading, color:"#2A2218" },
  memberSub:  { fontSize:typography.small, color:"#8A7E6A" },
  divider:    { height:1, backgroundColor:"#E0D8C8", marginBottom:spacing(1.5) },
  sectionLabel:{ fontSize:10, fontWeight:"700", letterSpacing:1.5, color:"#8A7E6A", marginBottom:spacing(1) },
  optionRow:  { flexDirection:"row", alignItems:"center", gap:spacing(1.5), paddingVertical:spacing(1.5), borderBottomWidth:1, borderBottomColor:"#E0D8C8" },
  optionIcon: { width:32, height:32, borderRadius:16, backgroundColor:"rgba(47,93,80,0.10)", alignItems:"center", justifyContent:"center" },
  optionText: { flex:1, fontFamily:SERIF, fontSize:typography.body, color:"#2A2218" },
  optionPlus: { fontSize:20, color:"#2F5D50" },
  removeRow:  { paddingVertical:spacing(2), alignItems:"center" },
  removeText: { fontSize:typography.body, color:"#E05252", fontWeight:"500" },
  cancelRow:  { paddingVertical:spacing(1.5), alignItems:"center" },
  cancelText: { fontSize:typography.body, color:"#8A7E6A" },
});
