/**
 * GroupsScreen.jsx — Safar
 * All StyleSheet objects are created inside the component via useMemo
 * to avoid module-load-time crashes with spacing/radius/typography/colors.
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
import Svg, { Path, Circle } from "react-native-svg";
import { colors as themeColors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";
const MAX_CHARS = 280;

const AVATAR_PALETTE = ["#4A7A60","#6B5B7A","#7A5B4A","#4A6B7A","#7A6B4A","#5B7A4A"];
function nameToColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

const GROUP_COLORS = [
  { key:"green",  label:"Sage",   value:"#2F5D50" },
  { key:"teal",   label:"Teal",   value:"#2A6B70" },
  { key:"slate",  label:"Slate",  value:"#4A5B7A" },
  { key:"warm",   label:"Warm",   value:"#7A5B4A" },
  { key:"purple", label:"Violet", value:"#6B5B7A" },
  { key:"gold",   label:"Gold",   value:"#8A7030" },
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

const EX_MEMBERS = {
  u1:{ uid:"u1", displayName:"Fatima Hassan",   avatarEmoji:null },
  u2:{ uid:"u2", displayName:"Ahmed Al-Rashid", avatarEmoji:null },
  u3:{ uid:"u3", displayName:"Maryam Khan",     avatarEmoji:null },
  u4:{ uid:"u4", displayName:"You",             avatarEmoji:"\uD83C\uDF3F" },
  u5:{ uid:"u5", displayName:"Zainab Ali",      avatarEmoji:null },
  u6:{ uid:"u6", displayName:"Noor Ibrahim",    avatarEmoji:null },
  u7:{ uid:"u7", displayName:"Tariq Hassan",    avatarEmoji:null },
  u8:{ uid:"u8", displayName:"Omar Siddiq",     avatarEmoji:null },
};
const EX_GROUPS_INIT = [
  { id:"ex1", name:"Our Pilgrimage Family", memberUids:["u1","u2","u3","u4"], isExample:true, colorKey:"green" },
  { id:"ex2", name:"Sisters Circle",        memberUids:["u3","u5","u6","u4"], isExample:true, colorKey:"purple" },
  { id:"ex3", name:"Hajj 2026 Group",       memberUids:["u2","u7","u8","u4"], isExample:true, colorKey:"teal" },
];
const EX_MILESTONES_INIT = {
  ex1:[
    { id:"m1", author:"Ahmed Al-Rashid", uid:"u2", text:"Completed Tawaf al-Qudum, alhamdulillah. 7 rounds done \uD83D\uDD4B", time:"2h ago", ameen:["u3","u4"], count:2, link:null, linkTitle:null },
    { id:"m2", author:"Fatima Hassan",   uid:"u1", text:"Making dua at Maqam Ibrahim right now. Please share your duas \uD83E\uDD32", time:"4h ago", ameen:["u2"], count:1, link:"https://sunnah.com/bukhari:1613", linkTitle:"Dua for Tawaf \u2014 Sunnah.com" },
    { id:"m3", author:"Maryam Khan",     uid:"u3", text:"First time seeing the Kaaba \u2014 words cannot describe. Subhanallah.", time:"6h ago", ameen:["u1","u2","u4"], count:3, link:null, linkTitle:null },
  ],
  ex2:[
    { id:"m4", author:"Zainab Ali",   uid:"u5", text:"Just completed Sa\u02bfy \u2014 7 passes between Safa and Marwah. Alhamdulillah \uD83C\uDF3F", time:"1h ago", ameen:["u3","u4","u6"], count:3, link:null, linkTitle:null },
    { id:"m5", author:"Noor Ibrahim", uid:"u6", text:"Drank Zamzam water for the first time. Made dua for all of you \uD83D\uDCA7", time:"3h ago", ameen:["u5"], count:1, link:null, linkTitle:null },
  ],
  ex3:[
    { id:"m6", author:"Tariq Hassan", uid:"u7", text:"Arrived in Makkah safely after 14 hours of travel. Ya Allah \uD83D\uDD4B", time:"5h ago", ameen:["u2","u4","u8"], count:3, link:null, linkTitle:null },
    { id:"m7", author:"Omar Siddiq",  uid:"u8", text:"Entered Ihram at the Miqat. Labbayk All\u0101humma labbayk.", time:"8h ago", ameen:["u7"], count:1, link:null, linkTitle:null },
  ],
};

// ── Milestone row with swipe-to-delete ───────────────────────────────────────
function MilestoneRow({ item, myUid, onAmeen, onDelete, st }) {
  const tx       = useRef(new Animated.Value(0)).current;
  const hasAmeen = item.ameen?.includes(myUid);
  const [busy, setBusy] = useState(false);
  const userColor = nameToColor(item.author);
  const tintBg    = userColor + "18";

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (_,gs) => Math.abs(gs.dx) > 8,
    onMoveShouldSetPanResponder:  (_,gs) => Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderMove:   (_,gs) => tx.setValue(Math.max(-100, Math.min(0, gs.dx))),
    onPanResponderRelease:(_,gs) => {
      if (gs.dx < -60) Animated.spring(tx,{toValue:-85,useNativeDriver:true}).start();
      else             Animated.spring(tx,{toValue:0, useNativeDriver:true}).start();
    },
  })).current;

  const reset = () => Animated.spring(tx,{toValue:0,useNativeDriver:true}).start();

  const handleAmeen = async () => {
    if (hasAmeen || busy) return;
    setBusy(true);
    await new Promise(r => setTimeout(r,300));
    onAmeen?.(item.id);
    setBusy(false);
  };

  return (
    <View style={st.msWrap}>
      <View style={st.msDeleteBack}>
        <TouchableOpacity style={st.msDeleteBtn} onPress={() => Alert.alert("Delete","Remove this milestone?",[
          {text:"Cancel",style:"cancel",onPress:reset},
          {text:"Delete",style:"destructive",onPress:()=>onDelete(item.id)},
        ])}>
          <Text style={st.msDeleteIcon}>{"\uD83D\uDDD1\uFE0F"}</Text>
          <Text style={st.msDeleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Animated.View style={[st.msCard,{backgroundColor:tintBg,borderColor:userColor+"30",transform:[{translateX:tx}]}]}
        {...pan.panHandlers}>
        <View style={st.msTop}>
          <UserAvatar name={item.author} size={36} />
          <View style={st.msMeta}>
            <Text style={st.msName}>{item.author}{item.uid===myUid?" (you)":""}</Text>
            <Text style={st.msTime}>{item.time}</Text>
          </View>
        </View>
        <Text style={st.msText}>{item.text}</Text>
        {item.link && (
          <TouchableOpacity style={st.msLink} onPress={()=>Linking.openURL(item.link)} activeOpacity={0.85}>
            <Text style={st.msLinkIcon}>{"\uD83D\uDD17"}</Text>
            <Text style={st.msLinkText} numberOfLines={1}>{item.linkTitle||item.link.replace("https://","")}</Text>
            <Text style={st.msLinkArrow}>{"\u2197"}</Text>
          </TouchableOpacity>
        )}
        <View style={st.msFooter}>
          <TouchableOpacity style={[st.msBtn,hasAmeen&&st.msBtnActive]}
            onPress={handleAmeen} disabled={hasAmeen||busy} activeOpacity={0.8}>
            {busy
              ? <ActivityIndicator size="small" color={hasAmeen?"#fff":themeColors.primary}/>
              : <><Text>{"\uD83E\uDD32"}</Text><Text style={[st.msBtnText,hasAmeen&&st.msBtnTextActive]}>{hasAmeen?"Āmeen":"Say Āmeen"}</Text></>
            }
          </TouchableOpacity>
          {item.count>0 && <Text style={st.msCount}>{item.count} Āmeen</Text>}
          {item.uid!==myUid && <Text style={st.msHint}>{"\u2190"} swipe to delete</Text>}
        </View>
      </Animated.View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function GroupsScreen({ navigation }) {
  const { colors } = useAccessibility();

  // All styles created inside component — safe from load-time crashes
  const st = useMemo(() => StyleSheet.create({
    safe:   { flex:1, backgroundColor:colors.background },
    header: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1.5), borderBottomWidth:1, borderBottomColor:colors.border },
    back:   { fontSize:22, color:colors.text },
    title:  { fontFamily:SERIF, fontSize:22, color:colors.text },
    headerRight: { flexDirection:"row", alignItems:"center", gap:spacing(1.25) },
    newBtn:     { backgroundColor:colors.primary, borderRadius:radius.pill, paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.875) },
    newBtnText: { fontSize:typography.small, color:"#fff", fontWeight:"600" },
    tabsWrap:    { borderBottomWidth:1, borderBottomColor:colors.border },
    tabsContent: { paddingHorizontal:spacing(2.5), paddingVertical:spacing(1.5), gap:spacing(1.25) },
    tab:         { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1.5, borderColor:colors.border, paddingHorizontal:spacing(2), paddingVertical:spacing(1.5) },
    tabIconRow:  { flexDirection:"row", alignItems:"center", gap:spacing(1) },
    tabIconWrap: { width:28, height:28, borderRadius:14, backgroundColor:colors.border, alignItems:"center", justifyContent:"center" },
    tabName:     { fontFamily:SERIF, fontSize:typography.small, color:colors.text, marginBottom:1 },
    tabCount:    { fontSize:typography.tiny, color:colors.subtext },
    scroll:      { paddingHorizontal:spacing(2.5), paddingTop:spacing(2) },
    banner:      { backgroundColor:"#F5EDD8", borderRadius:radius.md, borderWidth:1, borderColor:"#E8D9B8", padding:spacing(1.75), marginBottom:spacing(2) },
    bannerText:  { fontSize:typography.small, color:"#7A6030", marginBottom:spacing(0.5) },
    bannerCta:   { fontSize:typography.small, color:colors.primary, fontWeight:"500" },
    membersBox:  { borderRadius:radius.lg, borderWidth:1.5, padding:spacing(1.75), marginBottom:spacing(2) },
    membersHead: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1.25) },
    membersTitle:{ fontFamily:SERIF, fontSize:typography.small, fontWeight:"600", letterSpacing:0.5 },
    editGroupBtn:{ fontSize:typography.small, fontWeight:"500" },
    memberRow:   { gap:spacing(1.5), paddingBottom:spacing(0.5) },
    memberWrap:  { alignItems:"center", gap:4, width:60 },
    memberName:  { fontSize:typography.tiny, color:colors.text, textAlign:"center" },
    memberHint:  { fontSize:8, color:colors.border },
    addTile:     { width:50, height:50, borderRadius:25, borderWidth:1.5, alignItems:"center", justifyContent:"center", marginTop:4 },
    addTileText: { fontSize:24, lineHeight:28 },
    feedHeader:  { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1.5) },
    feedTitle:   { fontFamily:SERIF, fontSize:typography.heading, color:colors.text },
    shareBtn:    { borderRadius:radius.pill, paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.875) },
    shareBtnText:{ fontSize:typography.small, color:"#fff", fontWeight:"600" },
    empty:       { alignItems:"center", paddingVertical:spacing(4) },
    emptyEmoji:  { fontSize:36, marginBottom:spacing(1.5) },
    emptyText:   { fontSize:typography.body, color:colors.subtext, textAlign:"center", lineHeight:22 },
    // Milestone card
    msWrap:       { marginBottom:spacing(1.25), borderRadius:radius.md, overflow:"hidden" },
    msDeleteBack: { position:"absolute", right:0, top:0, bottom:0, width:85, backgroundColor:"#E05252", borderRadius:radius.md, alignItems:"center", justifyContent:"center" },
    msDeleteBtn:  { alignItems:"center", gap:4, width:"100%", height:"100%", justifyContent:"center" },
    msDeleteIcon: { fontSize:18 },
    msDeleteText: { fontSize:typography.tiny, color:"#fff", fontWeight:"600" },
    msCard:       { borderRadius:radius.md, borderWidth:1, padding:spacing(2) },
    msTop:        { flexDirection:"row", alignItems:"center", gap:spacing(1.25), marginBottom:spacing(1.25) },
    msMeta:       { flex:1 },
    msName:       { fontFamily:SERIF, fontSize:typography.small, fontWeight:"500", color:colors.text },
    msTime:       { fontSize:typography.tiny, color:colors.subtext },
    msText:       { fontSize:typography.body, color:colors.text, lineHeight:22, marginBottom:spacing(1.25) },
    msLink:       { flexDirection:"row", alignItems:"center", gap:spacing(0.75), backgroundColor:"rgba(255,255,255,0.6)", borderRadius:radius.sm, borderWidth:1, borderColor:"rgba(47,93,80,0.2)", padding:spacing(1), marginBottom:spacing(1.25) },
    msLinkIcon:   { fontSize:14 },
    msLinkText:   { flex:1, fontSize:typography.tiny, color:colors.primary, fontWeight:"400" },
    msLinkArrow:  { fontSize:12, color:colors.primary },
    msFooter:     { flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
    msBtn:        { flexDirection:"row", alignItems:"center", gap:spacing(0.75), paddingHorizontal:spacing(1.5), paddingVertical:spacing(0.75), borderRadius:radius.pill, borderWidth:1, borderColor:colors.border, backgroundColor:"rgba(255,255,255,0.5)" },
    msBtnActive:  { backgroundColor:colors.primary, borderColor:colors.primary },
    msBtnText:    { fontSize:typography.small, color:colors.primary },
    msBtnTextActive:{ color:"#fff", fontWeight:"500" },
    msCount:      { fontSize:typography.tiny, color:colors.subtext },
    msHint:       { fontSize:9, color:colors.border },
    // Modals
    overlay:      { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
    sheet:        { backgroundColor:"#D4E4DC", borderTopLeftRadius:24, borderTopRightRadius:24, padding:spacing(2.5), paddingBottom:spacing(4) },
    handle:       { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginBottom:spacing(1.5) },
    modalTitle:   { fontFamily:SERIF, fontSize:20, color:colors.text, marginBottom:4 },
    modalSub:     { fontSize:typography.small, color:colors.subtext, marginBottom:spacing(1.5) },
    input:        { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.75), fontSize:typography.body, color:colors.text, minHeight:88, textAlignVertical:"top", marginBottom:spacing(0.5) },
    inputSingle:  { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.75), fontSize:typography.body, color:colors.text, minHeight:52, marginBottom:spacing(0.5) },
    charCount:    { fontSize:typography.tiny, color:colors.subtext, textAlign:"right", marginBottom:spacing(1.25) },
    attachRow:    { flexDirection:"row", alignItems:"center", gap:spacing(1), marginBottom:spacing(1) },
    attachLabel:  { fontSize:typography.tiny, color:colors.subtext },
    attachBtn:    { paddingHorizontal:spacing(1.25), paddingVertical:spacing(0.5), borderRadius:radius.pill, borderWidth:1, borderColor:colors.border, backgroundColor:colors.card },
    attachBtnText:{ fontSize:typography.small, color:colors.subtext },
    attachBtnOn:  { color:colors.primary, fontWeight:"600" },
    linkFields:   { gap:spacing(0.75), marginBottom:spacing(1) },
    linkInput:    { backgroundColor:colors.card, borderRadius:radius.sm, borderWidth:1, borderColor:colors.border, paddingHorizontal:spacing(1.5), paddingVertical:spacing(1), fontSize:typography.small, color:colors.text },
    colorLabel:   { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:colors.subtext, marginBottom:spacing(0.75), marginTop:spacing(0.5) },
    colorRow:     { flexDirection:"row", gap:spacing(1), marginBottom:spacing(2) },
    colorSwatch:  { width:32, height:32, borderRadius:16, alignItems:"center", justifyContent:"center" },
    colorSwatchOn:{ borderWidth:2.5, borderColor:colors.text },
    colorCheck:   { fontSize:14, color:"#fff", fontWeight:"700" },
    btnRow:       { flexDirection:"row", gap:spacing(1.25) },
    cancelBtn:    { flex:1, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, paddingVertical:spacing(1.75), alignItems:"center", backgroundColor:colors.card },
    cancelBtnText:{ fontSize:typography.body, color:colors.text },
    submitBtn:    { flex:1, borderRadius:radius.md, backgroundColor:colors.primary, paddingVertical:spacing(1.75), alignItems:"center" },
    submitDim:    { opacity:0.4 },
    submitText:   { fontSize:typography.body, color:"#fff", fontWeight:"600" },
    deleteBtn:    { marginTop:spacing(2), alignItems:"center", paddingVertical:spacing(1.5) },
    deleteBtnText:{ fontSize:typography.body, color:"#E05252", fontWeight:"500" },
    // Member sheet
    memberSheetRow: { flexDirection:"row", alignItems:"center", gap:spacing(1.5), marginBottom:spacing(2), marginTop:spacing(0.5) },
    memberSheetName:{ fontFamily:SERIF, fontSize:typography.heading, color:colors.text },
    memberSheetSub: { fontSize:typography.small, color:colors.subtext },
    divider:        { height:1, backgroundColor:colors.border, marginBottom:spacing(1.5) },
    secLabel:       { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:colors.subtext, marginBottom:spacing(1) },
    optionRow:      { flexDirection:"row", alignItems:"center", gap:spacing(1.5), paddingVertical:spacing(1.5), borderBottomWidth:1, borderBottomColor:colors.border },
    optionIconWrap: { width:32, height:32, borderRadius:16, backgroundColor:"rgba(47,93,80,0.10)", alignItems:"center", justifyContent:"center" },
    optionText:     { flex:1, fontFamily:SERIF, fontSize:typography.body, color:colors.text },
    optionPlus:     { fontSize:20, color:colors.primary },
    removeRow:      { paddingVertical:spacing(2), alignItems:"center" },
    removeText:     { fontSize:typography.body, color:"#E05252", fontWeight:"500" },
    sheetCancelRow: { paddingVertical:spacing(1.5), alignItems:"center" },
    sheetCancelText:{ fontSize:typography.body, color:colors.subtext },
  }), [colors]);

  const currentUser = getCurrentUser();
  const myUid = currentUser?.uid ?? "u4";

  const [realGroups,     setRealGroups]     = useState([]);
  const [activeId,       setActiveId]       = useState("ex1");
  const [exGroups,       setExGroups]       = useState(EX_GROUPS_INIT);
  const [exMilestones,   setExMilestones]   = useState(EX_MILESTONES_INIT);
  const [realMilestones, setRealMilestones] = useState([]);
  const [removedUids,    setRemovedUids]    = useState([]);
  const [showPost,       setShowPost]       = useState(false);
  const [showNew,        setShowNew]        = useState(false);
  const [showEdit,       setShowEdit]       = useState(false);
  const [postText,       setPostText]       = useState("");
  const [postLink,       setPostLink]       = useState("");
  const [postLinkTitle,  setPostLinkTitle]  = useState("");
  const [showLinkField,  setShowLinkField]  = useState(false);
  const [newName,        setNewName]        = useState("");
  const [newColorKey,    setNewColorKey]    = useState("green");
  const [editName,       setEditName]       = useState("");
  const [editColorKey,   setEditColorKey]   = useState("green");
  const [posting,        setPosting]        = useState(false);
  const [selMember,      setSelMember]      = useState(null);
  const [showMemberSheet,setShowMemberSheet]= useState(false);
  const initialised = useRef(false);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToUserGroups(currentUser.uid, g => {
      setRealGroups(g);
      if (!initialised.current && g.length > 0) { setActiveId(g[0].id); initialised.current = true; }
    });
  }, [currentUser?.uid]);

  useEffect(() => {
    if (activeId?.startsWith("ex") || !activeId) return;
    setRealMilestones([]);
    return subscribeToGroupMilestones(activeId, setRealMilestones);
  }, [activeId]);

  const usingExamples = realGroups.length === 0;
  const allGroups     = usingExamples ? exGroups : realGroups;
  const activeGroup   = allGroups.find(g => g.id === activeId) ?? allGroups[0];
  const isExample     = !!(activeGroup?.isExample);
  const accent        = GROUP_COLORS.find(c => c.key === (activeGroup?.colorKey ?? "green"))?.value ?? themeColors.primary;

  const members = isExample
    ? (activeGroup?.memberUids ?? []).filter(uid => !removedUids.includes(uid)).map(uid => EX_MEMBERS[uid]).filter(Boolean)
    : [];

  const milestones = isExample ? (exMilestones[activeId] ?? []) : realMilestones;

  const handleAmeen = id => setExMilestones(prev => ({
    ...prev,
    [activeId]: (prev[activeId]??[]).map(m => m.id===id ? {...m, ameen:[...m.ameen,myUid], count:m.count+1} : m),
  }));

  const handleDeleteMilestone = id => setExMilestones(prev => ({
    ...prev,
    [activeId]: (prev[activeId]??[]).filter(m => m.id!==id),
  }));

  const handlePost = async () => {
    if (!postText.trim() || posting) return;
    setPosting(true);
    const link   = postLink.trim() ? (postLink.startsWith("http") ? postLink.trim() : "https://"+postLink.trim()) : null;
    const lTitle = postLinkTitle.trim() || link;
    if (isExample) {
      setExMilestones(prev => ({
        ...prev,
        [activeId]: [{ id:`m${Date.now()}`, author:"You", uid:myUid, text:postText.trim(), time:"just now", ameen:[], count:0, link, linkTitle:lTitle }, ...(prev[activeId]??[])],
      }));
    } else {
      await postMilestone(currentUser.uid, currentUser.displayName, activeId, postText.trim()).catch(()=>{});
    }
    setPostText(""); setPostLink(""); setPostLinkTitle(""); setShowLinkField(false); setShowPost(false); setPosting(false);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    if (usingExamples) {
      const g = { id:`local_${Date.now()}`, name:newName.trim(), memberUids:["u4"], isExample:true, colorKey:newColorKey };
      setExGroups(prev => [...prev, g]);
      setExMilestones(prev => ({ ...prev, [g.id]:[] }));
      setActiveId(g.id);
    } else {
      await createGroup(currentUser?.uid ?? "local", newName.trim()).catch(()=>{});
    }
    setNewName(""); setNewColorKey("green"); setShowNew(false);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    setExGroups(prev => prev.map(g => g.id===activeId ? {...g, name:editName.trim(), colorKey:editColorKey} : g));
    setShowEdit(false);
  };

  const handleDeleteGroup = () => {
    Alert.alert("Delete group", "Delete "+activeGroup?.name+"? This cannot be undone.",[
      {text:"Cancel",style:"cancel"},
      {text:"Delete",style:"destructive",onPress:() => {
        setExGroups(prev => { const next=prev.filter(g=>g.id!==activeId); setActiveId(next[0]?.id??"ex1"); return next; });
        setShowEdit(false);
      }},
    ]);
  };

  const openEdit = () => { setEditName(activeGroup?.name??""); setEditColorKey(activeGroup?.colorKey??"green"); setShowEdit(true); };

  return (
    <SafeAreaView style={st.safe}>

      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{top:12,bottom:12,left:12,right:24}}>
          <Text style={st.back}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={st.title}>Groups</Text>
        <TouchableOpacity style={st.newBtn} onPress={() => setShowNew(true)}>
          <Text style={st.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={st.tabsWrap}>
        <FlatList horizontal data={allGroups} keyExtractor={g=>g.id}
          showsHorizontalScrollIndicator={false} contentContainerStyle={st.tabsContent}
          renderItem={({item:g}) => {
            const active = g.id===activeGroup?.id;
            const ac = GROUP_COLORS.find(c=>c.key===(g.colorKey??"green"))?.value ?? themeColors.primary;
            return (
              <TouchableOpacity style={[st.tab, active && {borderColor:ac, backgroundColor:ac+"12"}]}
                onPress={()=>setActiveId(g.id)} activeOpacity={0.85}>
                <View style={st.tabIconRow}>
                  <View style={[st.tabIconWrap, active&&{backgroundColor:ac}]}>
                    <GroupIcon size={16} color={active?"#fff":ac}/>
                  </View>
                  <View>
                    <Text style={[st.tabName, active&&{color:ac}]}>{g.name}</Text>
                    <Text style={st.tabCount}>{(g.memberUids??g.members??[]).length} members</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        {isExample && (
          <View style={st.banner}>
            <Text style={st.bannerText}>{"\u2736"}  Example group \u2014 see how milestones work.</Text>
            <TouchableOpacity onPress={()=>setShowNew(true)}>
              <Text style={st.bannerCta}>Create your own group {"\u2192"}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[st.membersBox,{borderColor:accent+"30"}]}>
          <View style={st.membersHead}>
            <Text style={[st.membersTitle,{color:accent}]}>Members</Text>
            <TouchableOpacity onPress={openEdit} activeOpacity={0.8}>
              <Text style={[st.editGroupBtn,{color:accent}]}>{"\u22EF"} Edit group</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.memberRow}>
            {members.map(m => (
              <TouchableOpacity key={m.uid} style={st.memberWrap}
                onPress={()=>{ if(m.uid!==myUid){setSelMember(m);setShowMemberSheet(true);} }}
                activeOpacity={m.uid===myUid?1:0.75}>
                <UserAvatar name={m.displayName} emoji={m.avatarEmoji} size={50}/>
                <Text style={st.memberName} numberOfLines={1}>{m.displayName.split(" ")[0]}</Text>
                {m.uid!==myUid && <Text style={st.memberHint}>tap</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[st.addTile,{borderColor:accent+"50",backgroundColor:accent+"08"}]}
              onPress={()=>navigation?.navigate?.("Connections",{mode:"pick",groupId:activeId,groupName:activeGroup?.name})}>
              <Text style={[st.addTileText,{color:accent}]}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={st.feedHeader}>
          <Text style={st.feedTitle}>Milestones</Text>
          <TouchableOpacity style={[st.shareBtn,{backgroundColor:accent}]} onPress={()=>setShowPost(true)}>
            <Text style={st.shareBtnText}>+ Share</Text>
          </TouchableOpacity>
        </View>

        {milestones.length > 0
          ? milestones.map(m => (
            <MilestoneRow key={m.id} item={m} myUid={myUid} st={st}
              onAmeen={handleAmeen} onDelete={handleDeleteMilestone}/>
          ))
          : <View style={st.empty}>
              <Text style={st.emptyEmoji}>{"\uD83C\uDF3F"}</Text>
              <Text style={st.emptyText}>{"No milestones yet.\nBe the first to share one."}</Text>
            </View>
        }
        <View style={{height:spacing(10)}}/>
      </ScrollView>

      {/* Post modal */}
      <Modal visible={showPost} transparent animationType="slide">
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
          <TouchableOpacity style={st.overlay} activeOpacity={1}
            onPress={()=>{setShowPost(false);setPostText("");setPostLink("");setShowLinkField(false);}}>
            <View style={st.sheet} onStartShouldSetResponder={()=>true}>
              <View style={st.handle}/>
              <Text style={st.modalTitle}>Share a milestone</Text>
              <Text style={st.modalSub}>Sharing with {activeGroup?.name}</Text>
              <TextInput style={st.input} placeholder={"e.g. Completed Tawaf, alhamdulillah \uD83D\uDD4B"}
                placeholderTextColor={themeColors.subtext} value={postText}
                onChangeText={t=>setPostText(t.slice(0,MAX_CHARS))} multiline maxLength={MAX_CHARS} autoFocus/>
              <Text style={st.charCount}>{postText.length} / {MAX_CHARS}</Text>
              <View style={st.attachRow}>
                <Text style={st.attachLabel}>Add a link:</Text>
                <TouchableOpacity style={st.attachBtn} onPress={()=>setShowLinkField(v=>!v)} activeOpacity={0.8}>
                  <Text style={[st.attachBtnText, showLinkField&&st.attachBtnOn]}>{"\uD83D\uDD17"} Link</Text>
                </TouchableOpacity>
              </View>
              {showLinkField && (
                <View style={st.linkFields}>
                  <TextInput style={st.linkInput} placeholder="https://..." placeholderTextColor={themeColors.subtext}
                    value={postLink} onChangeText={setPostLink} keyboardType="url" autoCapitalize="none" autoCorrect={false}/>
                  <TextInput style={st.linkInput} placeholder="Link title (optional)" placeholderTextColor={themeColors.subtext}
                    value={postLinkTitle} onChangeText={setPostLinkTitle}/>
                </View>
              )}
              <View style={st.btnRow}>
                <TouchableOpacity style={st.cancelBtn} onPress={()=>{setShowPost(false);setPostText("");setPostLink("");setShowLinkField(false);}}>
                  <Text style={st.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[st.submitBtn,(!postText.trim()||posting)&&st.submitDim]}
                  onPress={handlePost} disabled={posting||!postText.trim()}>
                  {posting?<ActivityIndicator color="#fff" size="small"/>:<Text style={st.submitText}>Share</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* New group modal */}
      <Modal visible={showNew} transparent animationType="slide">
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
          <TouchableOpacity style={st.overlay} activeOpacity={1} onPress={()=>{setShowNew(false);setNewName("");}}>
            <View style={st.sheet} onStartShouldSetResponder={()=>true}>
              <View style={st.handle}/>
              <Text style={st.modalTitle}>New group</Text>
              <TextInput style={st.inputSingle} placeholder="e.g. Family Hajj 2026"
                placeholderTextColor={themeColors.subtext} value={newName} onChangeText={setNewName}
                autoFocus returnKeyType="done"/>
              <Text style={st.colorLabel}>Group colour</Text>
              <View style={st.colorRow}>
                {GROUP_COLORS.map(c=>(
                  <TouchableOpacity key={c.key} style={[st.colorSwatch,{backgroundColor:c.value},newColorKey===c.key&&st.colorSwatchOn]}
                    onPress={()=>setNewColorKey(c.key)} activeOpacity={0.8}>
                    {newColorKey===c.key&&<Text style={st.colorCheck}>{"✓"}</Text>}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={st.btnRow}>
                <TouchableOpacity style={st.cancelBtn} onPress={()=>{setShowNew(false);setNewName("");}}>
                  <Text style={st.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[st.submitBtn,!newName.trim()&&st.submitDim]} onPress={handleCreate} disabled={!newName.trim()}>
                  <Text style={st.submitText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit group modal */}
      <Modal visible={showEdit} transparent animationType="slide">
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
          <TouchableOpacity style={st.overlay} activeOpacity={1} onPress={()=>setShowEdit(false)}>
            <View style={st.sheet} onStartShouldSetResponder={()=>true}>
              <View style={st.handle}/>
              <Text style={st.modalTitle}>Edit group</Text>
              <TextInput style={st.inputSingle} placeholder="Group name"
                placeholderTextColor={themeColors.subtext} value={editName} onChangeText={setEditName}
                autoFocus returnKeyType="done"/>
              <Text style={st.colorLabel}>Group colour</Text>
              <View style={st.colorRow}>
                {GROUP_COLORS.map(c=>(
                  <TouchableOpacity key={c.key} style={[st.colorSwatch,{backgroundColor:c.value},editColorKey===c.key&&st.colorSwatchOn]}
                    onPress={()=>setEditColorKey(c.key)} activeOpacity={0.8}>
                    {editColorKey===c.key&&<Text style={st.colorCheck}>{"✓"}</Text>}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={st.btnRow}>
                <TouchableOpacity style={st.cancelBtn} onPress={()=>setShowEdit(false)}>
                  <Text style={st.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[st.submitBtn,!editName.trim()&&st.submitDim]} onPress={handleSaveEdit} disabled={!editName.trim()}>
                  <Text style={st.submitText}>Save</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={st.deleteBtn} onPress={handleDeleteGroup}>
                <Text style={st.deleteBtnText}>Delete this group</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Member sheet */}
      <Modal visible={showMemberSheet} transparent animationType="slide">
        <TouchableOpacity style={st.overlay} activeOpacity={1}
          onPress={()=>{setShowMemberSheet(false);setSelMember(null);}}>
          <View style={st.sheet} onStartShouldSetResponder={()=>true}>
            <View style={st.handle}/>
            <View style={st.memberSheetRow}>
              <UserAvatar name={selMember?.displayName} size={52}/>
              <View>
                <Text style={st.memberSheetName}>{selMember?.displayName}</Text>
                <Text style={st.memberSheetSub}>Member of {activeGroup?.name}</Text>
              </View>
            </View>
            <View style={st.divider}/>
            <Text style={st.secLabel}>ADD TO ANOTHER GROUP</Text>
            {allGroups.filter(g=>g.id!==activeId).map(g=>(
              <TouchableOpacity key={g.id} style={st.optionRow}
                onPress={()=>{setShowMemberSheet(false);setSelMember(null);}} activeOpacity={0.85}>
                <View style={st.optionIconWrap}><GroupIcon size={16} color={themeColors.primary}/></View>
                <Text style={st.optionText}>{g.name}</Text>
                <Text style={st.optionPlus}>+</Text>
              </TouchableOpacity>
            ))}
            <View style={st.divider}/>
            <TouchableOpacity style={st.removeRow} onPress={()=>{
              setShowMemberSheet(false);
              if(isExample) setRemovedUids(prev=>[...prev,selMember.uid]);
              setSelMember(null);
            }}>
              <Text style={st.removeText}>Remove from {activeGroup?.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.sheetCancelRow} onPress={()=>{setShowMemberSheet(false);setSelMember(null);}}>
              <Text style={st.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}
