/**
 * GroupsScreen.jsx — Safar
 * Single StyleSheet inside useMemo. Clean uniform milestone cards.
 * All conditional styles use ternary, not &&.
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
  postMilestone, getCurrentUser,
} from "../firebase";
import { UserAvatar } from "./ConnectionsScreen";
import Svg, { Path, Circle } from "react-native-svg";
import { colors as TC, spacing, radius, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";
const MAX_CHARS = 280;

const PALETTE = ["#4A7A60","#6B5B7A","#7A5B4A","#4A6B7A","#7A6B4A","#5B7A4A"];
function nameColor(name) {
  let h = 0;
  for (let i = 0; i < (name||"").length; i++) h = name.charCodeAt(i) + ((h<<5)-h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

const GROUP_COLORS = [
  { key:"green",  value:"#1E3D30" },
  { key:"teal",   value:"#2A6B70" },
  { key:"slate",  value:"#4A5B7A" },
  { key:"warm",   value:"#7A5B4A" },
  { key:"purple", value:"#6B5B7A" },
  { key:"gold",   value:"#8A7030" },
];

function GroupIcon({ size=22, color="#fff" }) {
  return (
    <Svg width={size} height={size*0.8} viewBox="0 0 24 20">
      <Circle cx={5}  cy={5}  r={3}   fill={color} opacity={0.7}/>
      <Path d="M0 18 C0 14 2.5 12 5 12 C6.2 12 7.3 12.5 8.1 13.3 C6.8 14.5 6 16.2 6 18 Z" fill={color} opacity={0.7}/>
      <Circle cx={19} cy={5}  r={3}   fill={color} opacity={0.7}/>
      <Path d="M24 18 C24 14 21.5 12 19 12 C17.8 12 16.7 12.5 15.9 13.3 C17.2 14.5 18 16.2 18 18 Z" fill={color} opacity={0.7}/>
      <Circle cx={12} cy={4}  r={3.5} fill={color}/>
      <Path d="M5.5 18 C5.5 13.8 8.5 11 12 11 C15.5 11 18.5 13.8 18.5 18 Z" fill={color}/>
    </Svg>
  );
}

const INIT_GROUPS = [
  { id:"ex1", name:"Our Pilgrimage Family", memberUids:["u1","u2","u3","u4"], isExample:true, colorKey:"green" },
];
const EXAMPLE_NOTICE = "Sample group shown. Create your own group.";
const EX_MEMBERS = {
  u1:{ uid:"u1", displayName:"Fatima Hassan" },
  u2:{ uid:"u2", displayName:"Ahmed Al-Rashid" },
  u3:{ uid:"u3", displayName:"Maryam Khan" },
  u4:{ uid:"u4", displayName:"You", avatarEmoji:"\uD83C\uDF3F" },
  u5:{ uid:"u5", displayName:"Zainab Ali" },
  u6:{ uid:"u6", displayName:"Noor Ibrahim" },
  u7:{ uid:"u7", displayName:"Tariq Hassan" },
  u8:{ uid:"u8", displayName:"Omar Siddiq" },
};
const INIT_MILESTONES = {
  ex1:[
    { id:"m1", author:"Ahmed Al-Rashid", uid:"u2", text:"Completed Tawaf al-Qudum, alhamdulillah \uD83D\uDD4B", time:"2h ago", ameen:["u3","u4"], count:2, link:null },
    { id:"m2", author:"Fatima Hassan",   uid:"u1", text:"Making dua at Maqam Ibrahim right now \uD83E\uDD32", time:"4h ago", ameen:["u2"], count:1, link:"https://sunnah.com/bukhari:1613", linkTitle:"Dua for Tawaf" },
    { id:"m3", author:"Maryam Khan",     uid:"u3", text:"First time seeing the Kaaba. Subhanallah.", time:"6h ago", ameen:["u1","u2","u4"], count:3, link:null },
  ],
  ex2:[
    { id:"m4", author:"Zainab Ali",   uid:"u5", text:"Completed Sa\u02bfy \u2014 alhamdulillah \uD83C\uDF3F", time:"1h ago", ameen:["u3","u4","u6"], count:3, link:null },
    { id:"m5", author:"Noor Ibrahim", uid:"u6", text:"Drank Zamzam water for the first time \uD83D\uDCA7", time:"3h ago", ameen:["u5"], count:1, link:null },
  ],
  ex3:[
    { id:"m6", author:"Tariq Hassan", uid:"u7", text:"Arrived in Makkah safely. Ya Allah \uD83D\uDD4B", time:"5h ago", ameen:["u2","u4","u8"], count:3, link:null },
    { id:"m7", author:"Omar Siddiq",  uid:"u8", text:"Entered Ihram at the Miqat. Labbayk All\u0101humma labbayk.", time:"8h ago", ameen:["u7"], count:1, link:null },
  ],
};

// ── Milestone row — clean white card, coloured left border per author ─────────
function MilestoneRow({ item, myUid, onAmeen, onDelete, s }) {
  const tx = useRef(new Animated.Value(0)).current;
  const [busy, setBusy] = useState(false);
  const hasAmeen = item.ameen?.includes(myUid);
  const uc = nameColor(item.author);

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (_,gs) => Math.abs(gs.dx) > 10,
    onMoveShouldSetPanResponder:  (_,gs) => Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderMove:    (_,gs) => tx.setValue(Math.max(-110, Math.min(0, gs.dx))),
    onPanResponderRelease: (_,gs) => {
      Animated.spring(tx, { toValue: gs.dx < -55 ? -90 : 0, useNativeDriver:true }).start();
    },
  })).current;

  const reset = () => Animated.spring(tx, { toValue:0, useNativeDriver:true }).start();

  return (
    <View style={s.msWrap}>
      <View style={s.msBack}>
        <TouchableOpacity style={s.msBackBtn} onPress={() =>
          Alert.alert("Delete","Remove this milestone?",[
            { text:"Cancel", style:"cancel", onPress:reset },
            { text:"Delete", style:"destructive", onPress:() => onDelete(item.id) },
          ])}>
          <Text style={{ fontSize:18 }}>{"\uD83D\uDDD1\uFE0F"}</Text>
          <Text style={s.msBackTxt}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[s.msCard, { borderLeftWidth:3, borderLeftColor:uc, transform:[{translateX:tx}] }]}
        {...pan.panHandlers}>
        <View style={s.msTop}>
          <UserAvatar name={item.author} size={34} />
          <View style={{ flex:1 }}>
            <Text style={s.msName}>{item.author}{item.uid===myUid ? " (you)" : ""}</Text>
            <Text style={s.msTime}>{item.time}</Text>
          </View>
        </View>
        <Text style={s.msText}>{item.text}</Text>
        {item.link ? (
          <TouchableOpacity style={s.msLink} onPress={() => Linking.openURL(item.link)} activeOpacity={0.85}>
            <Text style={{ fontSize:13 }}>{"\uD83D\uDD17"}</Text>
            <Text style={s.msLinkTxt} numberOfLines={1}>{item.linkTitle || item.link.replace("https://","")}</Text>
            <Text style={s.msLinkArrow}>{"\u2197"}</Text>
          </TouchableOpacity>
        ) : null}
        <View style={s.msFooter}>
          <TouchableOpacity
            style={hasAmeen ? s.msBtnOn : s.msBtn}
            onPress={async () => {
              if (hasAmeen || busy) return;
              setBusy(true);
              await new Promise(r => setTimeout(r,300));
              onAmeen(item.id);
              setBusy(false);
            }}
            disabled={hasAmeen || busy} activeOpacity={0.8}>
            {busy
              ? <ActivityIndicator size="small" color={hasAmeen ? "#fff" : TC.primary}/>
              : <><Text style={{ fontSize:13 }}>{"\uD83E\uDD32"}</Text><Text style={hasAmeen ? s.msBtnTxtOn : s.msBtnTxt}>{hasAmeen ? "\u0100meen" : "Say \u0100meen"}</Text></>
            }
          </TouchableOpacity>
          {item.count > 0 ? <Text style={s.msCount}>{item.count} \u0100meen</Text> : null}
        </View>
      </Animated.View>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GroupsScreen({ navigation }) {
  const { colors: AC } = useAccessibility();
  const C = AC ?? TC;

  const s = useMemo(() => StyleSheet.create({

  exampleNotice:    { backgroundColor:"#EEE4CB", borderRadius:12, borderWidth:1, borderColor:"#DDD0A8", padding:14, marginHorizontal:20, marginBottom:12 },
  exampleNoticeTxt: { fontSize:14, color:"#6B5020", fontWeight:"500", lineHeight:20 },    safe:        { flex:1, backgroundColor:"#E8DDD0" },
    header:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1.5), borderBottomWidth:1, borderBottomColor:C.border },
    back:        { fontSize:22, color:C.text },
    title:       { fontFamily:SERIF, fontSize:22, color:C.text },
    newBtn:      { backgroundColor:C.primary, borderRadius:radius.pill, paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.875) },
    newBtnTxt:   { fontSize:14, color:"#fff", fontWeight:"600" },
    tabsWrap:    { borderBottomWidth:1, borderBottomColor:C.border },
    tabsContent: { paddingHorizontal:spacing(2.5), paddingVertical:spacing(1.5), gap:spacing(1.25) },
    tab:         { backgroundColor:C.card, borderRadius:radius.lg, borderWidth:1.5, borderColor:C.border, paddingHorizontal:spacing(2), paddingVertical:spacing(1.5) },
    tabIconRow:  { flexDirection:"row", alignItems:"center", gap:spacing(1) },
    tabIconWrap: { width:28, height:28, borderRadius:14, backgroundColor:C.border, alignItems:"center", justifyContent:"center" },
    tabName:     { fontFamily:SERIF, fontSize:14, color:C.text, marginBottom:1 },
    tabCount:    { fontSize:12, color:C.subtext },
    scroll:      { paddingHorizontal:spacing(2.5), paddingTop:spacing(2) },
    banner:      { backgroundColor:"#EEE4CB", borderRadius:radius.md, borderWidth:1, borderColor:"#DDD0A8", padding:spacing(1.75), marginBottom:spacing(2) },
    bannerTxt:   { fontSize:14, color:"#6B5020", marginBottom:spacing(0.5) },
    bannerCta:   { fontSize:14, color:C.primary, fontWeight:"500" },
    membersBox:  { borderRadius:radius.lg, borderWidth:1.5, padding:spacing(1.75), marginBottom:spacing(2) },
    membersHead: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1.25) },
    membersTtl:  { fontFamily:SERIF, fontSize:14, fontWeight:"600" },
    editGrpBtn:  { fontSize:14, fontWeight:"500" },
    memberRow:   { gap:spacing(1.5), paddingBottom:spacing(0.5) },
    memberWrap:  { alignItems:"center", gap:4, width:60 },
    memberName:  { fontSize:12, color:C.text, textAlign:"center" },
    memberHint:  { fontSize:10, color:C.border },
    addTile:     { width:50, height:50, borderRadius:25, borderWidth:1.5, alignItems:"center", justifyContent:"center", marginTop:4 },
    addTileTxt:  { fontSize:24, lineHeight:28 },
    feedHeader:  { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1.5) },
    feedTitle:   { fontFamily:SERIF, fontSize:18, color:C.text },
    shareBtn:    { borderRadius:radius.pill, paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.875) },
    shareBtnTxt: { fontSize:14, color:"#fff", fontWeight:"600" },
    empty:       { alignItems:"center", paddingVertical:spacing(4) },
    emptyEmoji:  { fontSize:36, marginBottom:spacing(1.5) },
    emptyTxt:    { fontSize:16, color:C.subtext, textAlign:"center", lineHeight:22 },
    // milestone — clean white card, left border accent per author
    msWrap:      { marginBottom:spacing(1), borderRadius:radius.md, overflow:"hidden" },
    msBack:      { position:"absolute", right:0, top:0, bottom:0, width:90, backgroundColor:"#D94F4F", borderRadius:radius.md, alignItems:"center", justifyContent:"center" },
    msBackBtn:   { alignItems:"center", gap:4, width:"100%", height:"100%", justifyContent:"center" },
    msBackTxt:   { fontSize:11, color:"#fff", fontWeight:"600" },
    msCard:      { borderRadius:radius.md, borderWidth:1, borderColor:C.border, backgroundColor:C.card, padding:spacing(2) },
    msTop:       { flexDirection:"row", alignItems:"center", gap:spacing(1.25), marginBottom:spacing(1) },
    msName:      { fontFamily:SERIF, fontSize:14, fontWeight:"500", color:C.text },
    msTime:      { fontSize:12, color:C.subtext },
    msText:      { fontSize:16, color:C.text, lineHeight:22, marginBottom:spacing(1.25) },
    msLink:      { flexDirection:"row", alignItems:"center", gap:spacing(0.75), backgroundColor:"#E8DDD0", borderRadius:radius.sm, borderWidth:1, borderColor:C.border, padding:spacing(1), marginBottom:spacing(1.25) },
    msLinkTxt:   { flex:1, fontSize:12, color:C.primary },
    msLinkArrow: { fontSize:12, color:C.primary },
    msFooter:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
    msBtn:       { flexDirection:"row", alignItems:"center", gap:spacing(0.75), paddingHorizontal:spacing(1.5), paddingVertical:spacing(0.75), borderRadius:radius.pill, borderWidth:1, borderColor:C.border },
    msBtnOn:     { flexDirection:"row", alignItems:"center", gap:spacing(0.75), paddingHorizontal:spacing(1.5), paddingVertical:spacing(0.75), borderRadius:radius.pill, backgroundColor:C.primary },
    msBtnTxt:    { fontSize:14, color:C.primary },
    msBtnTxtOn:  { fontSize:14, color:"#fff", fontWeight:"500" },
    msCount:     { fontSize:12, color:C.subtext },
    // modals
    overlay:     { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
    sheet:       { backgroundColor:"#C8DDD4", borderTopLeftRadius:24, borderTopRightRadius:24, padding:spacing(2.5), paddingBottom:spacing(4) },
    handle:      { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginBottom:spacing(1.5) },
    mTitle:      { fontFamily:SERIF, fontSize:20, color:C.text, marginBottom:4 },
    mSub:        { fontSize:14, color:C.subtext, marginBottom:spacing(1.5) },
    mInput:      { backgroundColor:C.card, borderRadius:radius.md, borderWidth:1, borderColor:C.border, padding:spacing(1.75), fontSize:16, color:C.text, minHeight:88, textAlignVertical:"top", marginBottom:spacing(0.5) },
    mInputSm:    { backgroundColor:C.card, borderRadius:radius.md, borderWidth:1, borderColor:C.border, padding:spacing(1.75), fontSize:16, color:C.text, minHeight:52, marginBottom:spacing(0.5) },
    mCharCount:  { fontSize:12, color:C.subtext, textAlign:"right", marginBottom:spacing(1.25) },
    attachRow:   { flexDirection:"row", alignItems:"center", gap:spacing(1), marginBottom:spacing(1) },
    attachLbl:   { fontSize:12, color:C.subtext },
    attachBtn:   { paddingHorizontal:spacing(1.25), paddingVertical:spacing(0.5), borderRadius:radius.pill, borderWidth:1, borderColor:C.border, backgroundColor:C.card },
    attachTxt:   { fontSize:14, color:C.subtext },
    attachTxtOn: { fontSize:14, color:C.primary, fontWeight:"600" },
    linkBox:     { gap:spacing(0.75), marginBottom:spacing(1) },
    linkIn:      { backgroundColor:C.card, borderRadius:radius.sm, borderWidth:1, borderColor:C.border, paddingHorizontal:spacing(1.5), paddingVertical:spacing(1), fontSize:14, color:C.text },
    clrLbl:      { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:C.subtext, marginBottom:spacing(0.75), marginTop:spacing(0.5) },
    clrRow:      { flexDirection:"row", gap:spacing(1), marginBottom:spacing(2) },
    clrSwatch:   { width:32, height:32, borderRadius:16, alignItems:"center", justifyContent:"center" },
    clrSwatchOn: { borderWidth:2.5, borderColor:C.text },
    clrCheck:    { fontSize:14, color:"#fff", fontWeight:"700" },
    btnRow:      { flexDirection:"row", gap:spacing(1.25) },
    cancelBtn:   { flex:1, borderRadius:radius.md, borderWidth:1, borderColor:C.border, paddingVertical:spacing(1.75), alignItems:"center", backgroundColor:C.card },
    cancelTxt:   { fontSize:16, color:C.text },
    submitBtn:   { flex:1, borderRadius:radius.md, backgroundColor:C.primary, paddingVertical:spacing(1.75), alignItems:"center" },
    submitDim:   { opacity:0.4 },
    submitTxt:   { fontSize:16, color:"#fff", fontWeight:"600" },
    delBtn:      { marginTop:spacing(2), alignItems:"center", paddingVertical:spacing(1.5) },
    delTxt:      { fontSize:16, color:"#E05252", fontWeight:"500" },
    mshRow:      { flexDirection:"row", alignItems:"center", gap:spacing(1.5), marginBottom:spacing(2), marginTop:spacing(0.5) },
    mshName:     { fontFamily:SERIF, fontSize:18, color:C.text },
    mshSub:      { fontSize:14, color:C.subtext },
    divider:     { height:1, backgroundColor:C.border, marginBottom:spacing(1.5) },
    secLbl:      { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:C.subtext, marginBottom:spacing(1) },
    optRow:      { flexDirection:"row", alignItems:"center", gap:spacing(1.5), paddingVertical:spacing(1.5), borderBottomWidth:1, borderBottomColor:C.border },
    optIcon:     { width:32, height:32, borderRadius:16, backgroundColor:"rgba(47,93,80,0.1)", alignItems:"center", justifyContent:"center" },
    optTxt:      { flex:1, fontFamily:SERIF, fontSize:16, color:C.text },
    optPlus:     { fontSize:20, color:C.primary },
    removeRow:   { paddingVertical:spacing(2), alignItems:"center" },
    removeTxt:   { fontSize:16, color:"#E05252", fontWeight:"500" },
    cancelRow:   { paddingVertical:spacing(1.5), alignItems:"center" },
    cancelRowTxt:{ fontSize:16, color:C.subtext },
  }), [C]);

  const currentUser = getCurrentUser();
  const myUid = currentUser?.uid ?? "u4";
  const [realGroups,     setRealGroups]     = useState([]);
  const [activeId,       setActiveId]       = useState("ex1");
  const [exGroups,       setExGroups]       = useState(INIT_GROUPS);
  const [exMilestones,   setExMilestones]   = useState(INIT_MILESTONES);
  const [realMilestones, setRealMilestones] = useState([]);
  const [removedUids,    setRemovedUids]    = useState([]);
  const [showPost,       setShowPost]       = useState(false);
  const [showNew,        setShowNew]        = useState(false);
  const [showEdit,       setShowEdit]       = useState(false);
  const [postText,       setPostText]       = useState("");
  const [postLink,       setPostLink]       = useState("");
  const [postLinkTitle,  setPostLinkTitle]  = useState("");
  const [showLink,       setShowLink]       = useState(false);
  const [newName,        setNewName]        = useState("");
  const [newColor,       setNewColor]       = useState("green");
  const [editName,       setEditName]       = useState("");
  const [editColor,      setEditColor]      = useState("green");
  const [posting,        setPosting]        = useState(false);
  const [selMember,      setSelMember]      = useState(null);
  const [showMSheet,     setShowMSheet]     = useState(false);
  const init = useRef(false);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToUserGroups(currentUser.uid, g => {
      setRealGroups(g);
      if (!init.current && g.length > 0) { setActiveId(g[0].id); init.current = true; }
    });
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!activeId || activeId.startsWith("ex")) return;
    setRealMilestones([]);
    return subscribeToGroupMilestones(activeId, setRealMilestones);
  }, [activeId]);

  const usingEx    = realGroups.length === 0;
  const allGroups  = usingEx ? exGroups : realGroups;
  const activeG    = allGroups.find(g => g.id===activeId) ?? allGroups[0];
  const isEx       = !!activeG?.isExample;
  const accent     = GROUP_COLORS.find(g => g.key===(activeG?.colorKey??"green"))?.value ?? TC.primary;
  const members    = isEx ? (activeG?.memberUids??[]).filter(u=>!removedUids.includes(u)).map(u=>EX_MEMBERS[u]).filter(Boolean) : [];
  const milestones = isEx ? (exMilestones[activeId]??[]) : realMilestones;

  const doAmeen  = id => setExMilestones(p => ({ ...p, [activeId]:(p[activeId]??[]).map(m => m.id===id ? {...m,ameen:[...m.ameen,myUid],count:m.count+1} : m) }));
  const doDelete = id => setExMilestones(p => ({ ...p, [activeId]:(p[activeId]??[]).filter(m => m.id!==id) }));

  const doPost = async () => {
    if (!postText.trim() || posting) return;
    setPosting(true);
    const lnk  = postLink.trim() ? (postLink.startsWith("http") ? postLink.trim() : "https://"+postLink.trim()) : null;
    const ltxt = postLinkTitle.trim() || lnk;
    if (isEx) {
      setExMilestones(p => ({ ...p, [activeId]:[{ id:`m${Date.now()}`,author:"You",uid:myUid,text:postText.trim(),time:"just now",ameen:[],count:0,link:lnk,linkTitle:ltxt }, ...(p[activeId]??[])] }));
    } else {
      await postMilestone(currentUser.uid, currentUser.displayName, activeId, postText.trim()).catch(()=>{});
    }
    setPostText(""); setPostLink(""); setPostLinkTitle(""); setShowLink(false); setShowPost(false); setPosting(false);
  };

  const doCreate = async () => {
    if (!newName.trim()) return;
    if (usingEx) {
      const g = { id:`local_${Date.now()}`, name:newName.trim(), memberUids:["u4"], isExample:false, colorKey:newColor };
      setExGroups(p => [...p, g]); setExMilestones(p => ({ ...p, [g.id]:[] })); setActiveId(g.id);
    } else {
      await createGroup(currentUser?.uid??"local", newName.trim()).catch(()=>{});
    }
    setNewName(""); setNewColor("green"); setShowNew(false);
  };

  const doSaveEdit = () => {
    if (!editName.trim()) return;
    setExGroups(p => p.map(g => g.id===activeId ? {...g,name:editName.trim(),colorKey:editColor} : g));
    setShowEdit(false);
  };

  const doDeleteGroup = () => Alert.alert("Delete group","Delete "+activeG?.name+"? Cannot be undone.",[
    { text:"Cancel", style:"cancel" },
    { text:"Delete", style:"destructive", onPress:() => {
      setExGroups(p => { const n=p.filter(g=>g.id!==activeId); setActiveId(n[0]?.id??"ex1"); return n; });
      setShowEdit(false);
    }},
  ]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{top:12,bottom:12,left:12,right:24}}>
          <Text style={s.back}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={s.title}>Groups</Text>
        <TouchableOpacity style={s.newBtn} onPress={() => setShowNew(true)}>
          <Text style={s.newBtnTxt}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={s.tabsWrap}>
        <FlatList horizontal data={allGroups} keyExtractor={g=>g.id}
          showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsContent}
          renderItem={({item:g}) => {
            const on = g.id===activeG?.id;
            const ac = GROUP_COLORS.find(x=>x.key===(g.colorKey??"green"))?.value ?? TC.primary;
            return (
              <TouchableOpacity
                style={on ? [s.tab,{borderColor:ac,backgroundColor:ac+"12"}] : s.tab}
                onPress={() => setActiveId(g.id)} activeOpacity={0.85}>
                <View style={s.tabIconRow}>
                  <View style={on ? [s.tabIconWrap,{backgroundColor:ac}] : s.tabIconWrap}>
                    <GroupIcon size={16} color={on?"#fff":ac}/>
                  </View>
                  <View>
                    <Text style={on ? [s.tabName,{color:ac}] : s.tabName}>{g.name}</Text>
                    <Text style={s.tabCount}>{(g.memberUids??g.members??[]).length} members</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {isEx ? (
          <View style={s.banner}>
            <Text style={s.bannerTxt}>{"\u2736"}  Example group \u2014 see how milestones work.</Text>
            <TouchableOpacity onPress={() => setShowNew(true)}>
              <Text style={s.bannerCta}>Create your own group {"\u2192"}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={[s.membersBox,{borderColor:accent+"40"}]}>
          <View style={s.membersHead}>
            <Text style={[s.membersTtl,{color:accent}]}>Members</Text>
            <TouchableOpacity onPress={() => { setEditName(activeG?.name??""); setEditColor(activeG?.colorKey??"green"); setShowEdit(true); }} activeOpacity={0.8}>
              <Text style={[s.editGrpBtn,{color:accent}]}>{"\u22EF"} Edit group</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.memberRow}>
            {members.map(m => (
              <TouchableOpacity key={m.uid} style={s.memberWrap}
                onPress={() => { if (m.uid!==myUid) { setSelMember(m); setShowMSheet(true); } }}
                activeOpacity={m.uid===myUid?1:0.75}>
                <UserAvatar name={m.displayName} emoji={m.avatarEmoji} size={50}/>
                <Text style={s.memberName} numberOfLines={1}>{m.displayName.split(" ")[0]}</Text>
                {m.uid!==myUid ? <Text style={s.memberHint}>tap</Text> : null}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[s.addTile,{borderColor:accent+"50",backgroundColor:accent+"08"}]}
              onPress={() => navigation?.navigate?.("Connections",{mode:"pick",groupId:activeId,groupName:activeG?.name})}>
              <Text style={[s.addTileTxt,{color:accent}]}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={s.feedHeader}>
          <Text style={s.feedTitle}>Milestones</Text>
          <TouchableOpacity style={[s.shareBtn,{backgroundColor:accent}]} onPress={() => setShowPost(true)}>
            <Text style={s.shareBtnTxt}>+ Share</Text>
          </TouchableOpacity>
        </View>

        {milestones.length > 0
          ? milestones.map(m => <MilestoneRow key={m.id} item={m} myUid={myUid} s={s} onAmeen={doAmeen} onDelete={doDelete}/>)
          : <View style={s.empty}><Text style={s.emptyEmoji}>{"\uD83C\uDF3F"}</Text><Text style={s.emptyTxt}>{"No milestones yet.\nBe the first to share one."}</Text></View>
        }
        <View style={{height:spacing(10)}}/>
      </ScrollView>

      {/* Post modal */}
      <Modal visible={showPost} transparent animationType="slide">
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
          <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => { setShowPost(false); setPostText(""); setPostLink(""); setShowLink(false); }}>
            <View style={s.sheet} onStartShouldSetResponder={() => true}>
              <View style={s.handle}/>
              <Text style={s.mTitle}>Share a milestone</Text>
              <Text style={s.mSub}>Sharing with {activeG?.name}</Text>
              <TextInput style={s.mInput} placeholder={"e.g. Completed Tawaf \uD83D\uDD4B"}
                placeholderTextColor={TC.subtext} value={postText}
                onChangeText={t=>setPostText(t.slice(0,MAX_CHARS))} multiline maxLength={MAX_CHARS} autoFocus/>
              <Text style={s.mCharCount}>{postText.length} / {MAX_CHARS}</Text>
              <View style={s.attachRow}>
                <Text style={s.attachLbl}>Add a link:</Text>
                <TouchableOpacity style={s.attachBtn} onPress={() => setShowLink(v=>!v)} activeOpacity={0.8}>
                  <Text style={showLink ? s.attachTxtOn : s.attachTxt}>{"\uD83D\uDD17"} Link</Text>
                </TouchableOpacity>
              </View>
              {showLink ? (
                <View style={s.linkBox}>
                  <TextInput style={s.linkIn} placeholder="https://..." placeholderTextColor={TC.subtext}
                    value={postLink} onChangeText={setPostLink} keyboardType="url" autoCapitalize="none" autoCorrect={false}/>
                  <TextInput style={s.linkIn} placeholder="Link title (optional)" placeholderTextColor={TC.subtext}
                    value={postLinkTitle} onChangeText={setPostLinkTitle}/>
                </View>
              ) : null}
              <View style={s.btnRow}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowPost(false); setPostText(""); setPostLink(""); setShowLink(false); }}>
                  <Text style={s.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={(!postText.trim()||posting) ? [s.submitBtn,s.submitDim] : s.submitBtn} onPress={doPost} disabled={posting||!postText.trim()}>
                  {posting ? <ActivityIndicator color="#fff" size="small"/> : <Text style={s.submitTxt}>Share</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* New group modal */}
      <Modal visible={showNew} transparent animationType="slide">
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
          <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => { setShowNew(false); setNewName(""); }}>
            <View style={s.sheet} onStartShouldSetResponder={() => true}>
              <View style={s.handle}/>
              <Text style={s.mTitle}>New group</Text>
              <TextInput style={s.mInputSm} placeholder="e.g. Family Hajj 2026" placeholderTextColor={TC.subtext}
                value={newName} onChangeText={setNewName} autoFocus returnKeyType="done"/>
              <Text style={s.clrLbl}>Group colour</Text>
              <View style={s.clrRow}>
                {GROUP_COLORS.map(c => (
                  <TouchableOpacity key={c.key}
                    style={newColor===c.key ? [s.clrSwatch,{backgroundColor:c.value},s.clrSwatchOn] : [s.clrSwatch,{backgroundColor:c.value}]}
                    onPress={() => setNewColor(c.key)} activeOpacity={0.8}>
                    {newColor===c.key ? <Text style={s.clrCheck}>{"✓"}</Text> : null}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.btnRow}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowNew(false); setNewName(""); }}>
                  <Text style={s.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={!newName.trim() ? [s.submitBtn,s.submitDim] : s.submitBtn} onPress={doCreate} disabled={!newName.trim()}>
                  <Text style={s.submitTxt}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit group modal */}
      <Modal visible={showEdit} transparent animationType="slide">
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
          <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setShowEdit(false)}>
            <View style={s.sheet} onStartShouldSetResponder={() => true}>
              <View style={s.handle}/>
              <Text style={s.mTitle}>Edit group</Text>
              <TextInput style={s.mInputSm} placeholder="Group name" placeholderTextColor={TC.subtext}
                value={editName} onChangeText={setEditName} autoFocus returnKeyType="done"/>
              <Text style={s.clrLbl}>Group colour</Text>
              <View style={s.clrRow}>
                {GROUP_COLORS.map(c => (
                  <TouchableOpacity key={c.key}
                    style={editColor===c.key ? [s.clrSwatch,{backgroundColor:c.value},s.clrSwatchOn] : [s.clrSwatch,{backgroundColor:c.value}]}
                    onPress={() => setEditColor(c.key)} activeOpacity={0.8}>
                    {editColor===c.key ? <Text style={s.clrCheck}>{"✓"}</Text> : null}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.btnRow}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setShowEdit(false)}>
                  <Text style={s.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={!editName.trim() ? [s.submitBtn,s.submitDim] : s.submitBtn} onPress={doSaveEdit} disabled={!editName.trim()}>
                  <Text style={s.submitTxt}>Save</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={s.delBtn} onPress={doDeleteGroup}>
                <Text style={s.delTxt}>Delete this group</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Member sheet */}
      <Modal visible={showMSheet} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => { setShowMSheet(false); setSelMember(null); }}>
          <View style={s.sheet} onStartShouldSetResponder={() => true}>
            <View style={s.handle}/>
            <View style={s.mshRow}>
              <UserAvatar name={selMember?.displayName} size={52}/>
              <View>
                <Text style={s.mshName}>{selMember?.displayName}</Text>
                <Text style={s.mshSub}>Member of {activeG?.name}</Text>
              </View>
            </View>
            <View style={s.divider}/>
            <Text style={s.secLbl}>ADD TO ANOTHER GROUP</Text>
            {allGroups.filter(g=>g.id!==activeId).map(g => (
              <TouchableOpacity key={g.id} style={s.optRow}
                onPress={() => { setShowMSheet(false); setSelMember(null); }} activeOpacity={0.85}>
                <View style={s.optIcon}><GroupIcon size={16} color={TC.primary}/></View>
                <Text style={s.optTxt}>{g.name}</Text>
                <Text style={s.optPlus}>+</Text>
              </TouchableOpacity>
            ))}
            <View style={s.divider}/>
            <TouchableOpacity style={s.removeRow} onPress={() => {
              setShowMSheet(false);
              if (isEx) setRemovedUids(p=>[...p,selMember.uid]);
              setSelMember(null);
            }}>
              <Text style={s.removeTxt}>Remove from {activeG?.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelRow} onPress={() => { setShowMSheet(false); setSelMember(null); }}>
              <Text style={s.cancelRowTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
