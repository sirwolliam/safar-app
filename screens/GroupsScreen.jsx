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
  Alert, Animated, PanResponder, Linking, Share, Image,
  Clipboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createGroup, subscribeToUserGroups, subscribeToGroupMilestones,
  postMilestone, postMilestoneWithPhoto, getCurrentUser,
  generateInviteCode, joinGroupByCode,
} from "../firebase";
import { UserAvatar } from "./ConnectionsScreen";
import Svg, { Path, Circle } from "react-native-svg";
import { colors as TC, spacing, radius, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";
import {
  Copy, ShareNetwork, QrCode, ImageSquare, X,
  LinkSimple, Camera,
} from "phosphor-react-native";

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
        {item.photoUri ? (
          <Image source={{ uri:item.photoUri }} style={s.msPhoto} resizeMode="cover"/>
        ) : null}
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
              ? <ActivityIndicator size="small" color={hasAmeen ? "#fff" : "#1E3D30"}/>
              : <><Text style={{ fontSize:13 }}>{"\uD83E\uDD32"}</Text><Text style={hasAmeen ? s.msBtnTxtOn : s.msBtnTxt}>{hasAmeen ? "\u0100meen" : "Say \u0100meen"}</Text></>
            }
          </TouchableOpacity>
          {item.count > 0 ? <Text style={s.msCount}>{item.count} \u0100meen</Text> : null}
          <TouchableOpacity
            style={s.msBtn}
            onPress={async () => {
              try {
                await Share.share({ message: `${item.author} shared:\n${item.text}\n\nShared via Safar` });
              } catch (_) {}
            }}
            activeOpacity={0.8}
          >
            <ShareNetwork size={14} color="#5C534A" weight="regular" />
          </TouchableOpacity>
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
    header:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingTop:16, paddingBottom:12, borderBottomWidth:1, borderBottomColor:"#C8BFB2" },
    back:        { fontSize:22, color:"#100E0A" },
    title:       { fontFamily:SERIF, fontSize:22, color:"#100E0A" },
    newBtn:      { backgroundColor:"#1E3D30", borderRadius:999, paddingHorizontal:14, paddingVertical:7 },
    newBtnTxt:   { fontSize:14, color:"#fff", fontWeight:"600" },
    tabsWrap:    { borderBottomWidth:1, borderBottomColor:"#C8BFB2" },
    tabsContent: { paddingHorizontal:20, paddingVertical:12, gap:10 },
    tab:         { backgroundColor:"#F5EDE0", borderRadius:16, borderWidth:1.5, borderColor:"#C8BFB2", paddingHorizontal:16, paddingVertical:12 },
    tabIconRow:  { flexDirection:"row", alignItems:"center", gap:8 },
    tabIconWrap: { width:28, height:28, borderRadius:14, backgroundColor:"#C8BFB2", alignItems:"center", justifyContent:"center" },
    tabName:     { fontFamily:SERIF, fontSize:14, color:"#100E0A", marginBottom:1 },
    tabCount:    { fontSize:12, color:"#5C534A" },
    scroll:      { paddingHorizontal:20, paddingTop:16 },
    banner:      { backgroundColor:"#EEE4CB", borderRadius:10, borderWidth:1, borderColor:"#DDD0A8", padding:14, marginBottom:16 },
    bannerTxt:   { fontSize:14, color:"#6B5020", marginBottom:4 },
    bannerCta:   { fontSize:14, color:"#1E3D30", fontWeight:"500" },
    membersBox:  { borderRadius:16, borderWidth:1.5, padding:14, marginBottom:16 },
    membersHead: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:10 },
    membersTtl:  { fontFamily:SERIF, fontSize:14, fontWeight:"600" },
    editGrpBtn:  { fontSize:14, fontWeight:"500" },
    memberRow:   { gap:12, paddingBottom:4 },
    memberWrap:  { alignItems:"center", gap:4, width:60 },
    memberName:  { fontSize:12, color:"#100E0A", textAlign:"center" },
    memberHint:  { fontSize:10, color:"#C8BFB2" },
    addTile:     { width:50, height:50, borderRadius:25, borderWidth:1.5, alignItems:"center", justifyContent:"center", marginTop:4 },
    addTileTxt:  { fontSize:24, lineHeight:28 },
    feedHeader:  { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:12 },
    feedTitle:   { fontFamily:SERIF, fontSize:18, color:"#100E0A" },
    shareBtn:    { borderRadius:999, paddingHorizontal:14, paddingVertical:7 },
    shareBtnTxt: { fontSize:14, color:"#fff", fontWeight:"600" },
    empty:       { alignItems:"center", paddingVertical:32 },
    emptyEmoji:  { fontSize:36, marginBottom:12 },
    shareHint:    { fontSize:12, color:"#5C534A", fontWeight:"500", marginHorizontal:20, marginBottom:8, fontStyle:"italic" },
  emptyTxt:    { fontSize:16, color:"#5C534A", textAlign:"center", lineHeight:22 },
    // milestone — clean white card, left border accent per author
    msWrap:      { marginBottom:8, borderRadius:10, overflow:"hidden" },
    msBack:      { position:"absolute", right:0, top:0, bottom:0, width:90, backgroundColor:"#D94F4F", borderRadius:10, alignItems:"center", justifyContent:"center" },
    msBackBtn:   { alignItems:"center", gap:4, width:"100%", height:"100%", justifyContent:"center" },
    msBackTxt:   { fontSize:11, color:"#fff", fontWeight:"600" },
    msCard:      { borderRadius:10, borderWidth:1, borderColor:"#C8BFB2", backgroundColor:"#F5EDE0", padding:16 },
    msTop:       { flexDirection:"row", alignItems:"center", gap:10, marginBottom:8 },
    msName:      { fontFamily:SERIF, fontSize:14, fontWeight:"500", color:"#100E0A" },
    msTime:      { fontSize:12, color:"#5C534A" },
    msText:      { fontSize:16, color:"#100E0A", lineHeight:22, marginBottom:10 },
    msLink:      { flexDirection:"row", alignItems:"center", gap:6, backgroundColor:"#E8DDD0", borderRadius:6, borderWidth:1, borderColor:"#C8BFB2", padding:8, marginBottom:10 },
    msLinkTxt:   { flex:1, fontSize:12, color:"#1E3D30" },
    msLinkArrow: { fontSize:12, color:"#1E3D30" },
    msFooter:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
    msBtn:       { flexDirection:"row", alignItems:"center", gap:6, paddingHorizontal:12, paddingVertical:6, borderRadius:999, borderWidth:1, borderColor:"#C8BFB2" },
    msBtnOn:     { flexDirection:"row", alignItems:"center", gap:6, paddingHorizontal:12, paddingVertical:6, borderRadius:999, backgroundColor:"#1E3D30" },
    msBtnTxt:    { fontSize:14, color:"#1E3D30" },
    msBtnTxtOn:  { fontSize:14, color:"#fff", fontWeight:"500" },
    msCount:     { fontSize:12, color:"#5C534A" },
    // modals
    overlay:     { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
    sheet:       { backgroundColor:"#C8DDD4", borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom:32 },
    handle:      { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginBottom:12 },
    mTitle:      { fontFamily:SERIF, fontSize:20, color:"#100E0A", marginBottom:4 },
    mSub:        { fontSize:14, color:"#5C534A", marginBottom:12 },
    mInput:      { backgroundColor:"#F5EDE0", borderRadius:10, borderWidth:1, borderColor:"#C8BFB2", padding:14, fontSize:16, color:"#100E0A", minHeight:88, textAlignVertical:"top", marginBottom:4 },
    mInputSm:    { backgroundColor:"#F5EDE0", borderRadius:10, borderWidth:1, borderColor:"#C8BFB2", padding:14, fontSize:16, color:"#100E0A", minHeight:52, marginBottom:4 },
    mCharCount:  { fontSize:12, color:"#5C534A", textAlign:"right", marginBottom:10 },
    attachRow:   { flexDirection:"row", alignItems:"center", gap:8, marginBottom:8 },
    attachLbl:   { fontSize:12, color:"#5C534A" },
    attachBtn:   { paddingHorizontal:10, paddingVertical:4, borderRadius:999, borderWidth:1, borderColor:"#C8BFB2", backgroundColor:"#F5EDE0" },
    attachTxt:   { fontSize:14, color:"#5C534A" },
    attachTxtOn: { fontSize:14, color:"#1E3D30", fontWeight:"600" },
    linkBox:     { gap:6, marginBottom:8 },
    linkIn:      { backgroundColor:"#F5EDE0", borderRadius:6, borderWidth:1, borderColor:"#C8BFB2", paddingHorizontal:12, paddingVertical:8, fontSize:14, color:"#100E0A" },
    clrLbl:      { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:"#5C534A", marginBottom:6, marginTop:4 },
    clrRow:      { flexDirection:"row", gap:8, marginBottom:16 },
    clrSwatch:   { width:32, height:32, borderRadius:16, alignItems:"center", justifyContent:"center" },
    clrSwatchOn: { borderWidth:2.5, borderColor:"#100E0A" },
    clrCheck:    { fontSize:14, color:"#fff", fontWeight:"700" },
    btnRow:      { flexDirection:"row", gap:10 },
    cancelBtn:   { flex:1, borderRadius:10, borderWidth:1, borderColor:"#C8BFB2", paddingVertical:14, alignItems:"center", backgroundColor:"#F5EDE0" },
    cancelTxt:   { fontSize:16, color:"#100E0A" },
    submitBtn:   { flex:1, borderRadius:10, backgroundColor:"#1E3D30", paddingVertical:14, alignItems:"center" },
    submitDim:   { opacity:0.4 },
    submitTxt:   { fontSize:16, color:"#fff", fontWeight:"600" },
    delBtn:      { marginTop:16, alignItems:"center", paddingVertical:12 },
    delTxt:      { fontSize:16, color:"#E05252", fontWeight:"500" },
    mshRow:      { flexDirection:"row", alignItems:"center", gap:12, marginBottom:16, marginTop:4 },
    mshName:     { fontFamily:SERIF, fontSize:18, color:"#100E0A" },
    mshSub:      { fontSize:14, color:"#5C534A" },
    divider:     { height:1, backgroundColor:"#C8BFB2", marginBottom:12 },
    secLbl:      { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:"#5C534A", marginBottom:8 },
    optRow:      { flexDirection:"row", alignItems:"center", gap:12, paddingVertical:12, borderBottomWidth:1, borderBottomColor:"#C8BFB2" },
    optIcon:     { width:32, height:32, borderRadius:16, backgroundColor:"rgba(47,93,80,0.1)", alignItems:"center", justifyContent:"center" },
    optTxt:      { flex:1, fontFamily:SERIF, fontSize:16, color:"#100E0A" },
    optPlus:     { fontSize:20, color:"#1E3D30" },
    removeRow:   { paddingVertical:16, alignItems:"center" },
    removeTxt:   { fontSize:16, color:"#E05252", fontWeight:"500" },
    cancelRow:   { paddingVertical:12, alignItems:"center" },
    cancelRowTxt:{ fontSize:16, color:"#5C534A" },

    // Invite button in members header
    inviteBtn:    { flexDirection:"row", alignItems:"center", gap:5, paddingHorizontal:10, paddingVertical:5, borderRadius:50, borderWidth:1 },
    inviteBtnTxt: { fontSize:12, fontWeight:"600" },

    // Invite code display
    codeBox:      { backgroundColor:"#F5EDE0", borderRadius:14, borderWidth:1.5, borderColor:"#C8BFB2", paddingVertical:20, paddingHorizontal:24, alignItems:"center", marginBottom:16 },
    codeText:     { fontFamily:SERIF, fontSize:36, color:"#1E3D30", letterSpacing:6, fontWeight:"400" },

    // Join code input
    codeInput:    { fontFamily:SERIF, fontSize:24, textAlign:"center", letterSpacing:6, color:"#1E3D30" },
    joinError:    { fontSize:13, color:"#D94F4F", textAlign:"center", marginBottom:10, marginTop:-4 },

    // Photo in post modal
    photoPreviewWrap:{ marginBottom:10, borderRadius:10, overflow:"hidden", position:"relative" },
    photoPreview:    { width:"100%", height:160, borderRadius:10 },
    photoRemove:     { position:"absolute", top:8, right:8, width:28, height:28, borderRadius:14, backgroundColor:"rgba(0,0,0,0.55)", alignItems:"center", justifyContent:"center" },

    // Photo in milestone card
    msPhoto:      { width:"100%", height:180, borderRadius:8, marginBottom:10 },
  }), [C]);

  const currentUser = getCurrentUser();
  const myUid = currentUser?.uid ?? "u4";
  const [realGroups,     setRealGroups]     = useState([]);
  const [activeId,       setActiveId]       = useState("ex1");
  const shareMilestone = async (text, author) => {
    try {
      await Share.share({
        message: text + "\n\n— shared via Safar | My Hajj & Umrah companion",
        title: "Milestone from " + author,
      });
    } catch (_) {}
  };

    const [exGroups,       setExGroups]       = useState(INIT_GROUPS);
  const [exMilestones,   setExMilestones]   = useState(INIT_MILESTONES);
  const [realMilestones, setRealMilestones] = useState([]);
  const [removedUids,    setRemovedUids]    = useState([]);
  const [showPost,       setShowPost]       = useState(false);
  const [showNew,        setShowNew]        = useState(false);
  const [showEdit,       setShowEdit]       = useState(false);
  const [showInvite,     setShowInvite]     = useState(false);
  const [showJoin,       setShowJoin]       = useState(false);
  const [inviteCode,     setInviteCode]     = useState("");
  const [joinCode,       setJoinCode]       = useState("");
  const [joinLoading,    setJoinLoading]    = useState(false);
  const [joinError,      setJoinError]      = useState("");
  const [codeCopied,     setCodeCopied]     = useState(false);
  const [postText,       setPostText]       = useState("");
  const [postLink,       setPostLink]       = useState("");
  const [postLinkTitle,  setPostLinkTitle]  = useState("");
  const [postPhoto,      setPostPhoto]      = useState(null);
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
  const accent     = GROUP_COLORS.find(g => g.key===(activeG?.colorKey??"green"))?.value ?? "#1E3D30";
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
      setExMilestones(p => ({ ...p, [activeId]:[{
        id:`m${Date.now()}`, author:"You", uid:myUid,
        text:postText.trim(), time:"just now",
        ameen:[], count:0, link:lnk, linkTitle:ltxt,
        photoUri:postPhoto ?? null,
      }, ...(p[activeId]??[])] }));
    } else {
      await postMilestoneWithPhoto(currentUser.uid, currentUser.displayName, activeId, postText.trim(), postPhoto).catch(()=>{});
    }
    setPostText(""); setPostLink(""); setPostLinkTitle(""); setShowLink(false);
    setPostPhoto(null); setShowPost(false); setPosting(false);
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

  // ── Invite code ──────────────────────────────────────────────────────────────
  const doGenerateCode = async () => {
    try {
      const code = await generateInviteCode(activeId);
      // Store code on the group object locally
      setExGroups(p => p.map(g => g.id===activeId ? {...g, inviteCode:code} : g));
      setInviteCode(code);
      setShowInvite(true);
    } catch(e) {
      Alert.alert("Error", "Could not generate invite code. Please try again.");
    }
  };

  const doShowInvite = () => {
    const existing = activeG?.inviteCode;
    if (existing) { setInviteCode(existing); setShowInvite(true); }
    else doGenerateCode();
  };

  const doCopyCode = () => {
    Clipboard.setString(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const doShareCode = async () => {
    try {
      await Share.share({
        message: `Join my Safar pilgrimage group!\n\nGroup: ${activeG?.name}\nInvite code: ${inviteCode}\n\nDownload Safar and enter this code to join.`,
        title: `Join ${activeG?.name} on Safar`,
      });
    } catch(_) {}
  };

  // ── Join group ───────────────────────────────────────────────────────────────
  const doJoinGroup = async () => {
    if (!joinCode.trim() || joinLoading) return;
    setJoinLoading(true);
    setJoinError("");
    try {
      const result = await joinGroupByCode(joinCode, currentUser?.uid, currentUser?.displayName);
      setJoinCode("");
      setShowJoin(false);
      Alert.alert("Joined!", `You've joined "${result.name}". Welcome to the group.`);
    } catch(e) {
      setJoinError(e.message ?? "Code not found. Check and try again.");
    } finally {
      setJoinLoading(false);
    }
  };

  // ── Photo picker ─────────────────────────────────────────────────────────────
  const doPickPhoto = async () => {
    // expo-image-picker — requires dev build
    try {
      const ImagePicker = require("expo-image-picker");
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Allow photo access to share images with your group.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, aspect:[4,3], quality:0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setPostPhoto(result.assets[0].uri);
      }
    } catch(_) {
      // expo-image-picker not available in Expo Go
      Alert.alert("Coming soon", "Photo sharing will be available in the full app release.");
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{top:12,bottom:12,left:12,right:24}}>
          <Text style={s.back}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={s.title}>Groups</Text>
        <View style={{ flexDirection:"row", gap:8 }}>
          <TouchableOpacity style={[s.newBtn, { backgroundColor:"transparent", borderWidth:1, borderColor:"#1E3D30" }]} onPress={() => setShowJoin(true)}>
            <Text style={[s.newBtnTxt, { color:"#1E3D30" }]}>Join</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.newBtn} onPress={() => setShowNew(true)}>
            <Text style={s.newBtnTxt}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.tabsWrap}>
        <FlatList horizontal data={allGroups} keyExtractor={g=>g.id}
          showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsContent}
          renderItem={({item:g}) => {
            const on = g.id===activeG?.id;
            const ac = GROUP_COLORS.find(x=>x.key===(g.colorKey??"green"))?.value ?? "#1E3D30";
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
            <TouchableOpacity onLongPress={() => shareMilestone(item.text, item.author)} onPress={() => setShowNew(true)}>
              <Text style={s.bannerCta}>Create your own group {"\u2192"}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={[s.membersBox,{borderColor:accent+"40"}]}>
          <View style={s.membersHead}>
            <Text style={[s.membersTtl,{color:accent}]}>Members</Text>
            <View style={{ flexDirection:"row", gap:10 }}>
              <TouchableOpacity
                style={[s.inviteBtn, { borderColor:accent }]}
                onPress={doShowInvite} activeOpacity={0.8}>
                <ShareNetwork size={13} color={accent} weight="regular"/>
                <Text style={[s.inviteBtnTxt, { color:accent }]}>Invite</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditName(activeG?.name??""); setEditColor(activeG?.colorKey??"green"); setShowEdit(true); }} activeOpacity={0.8}>
                <Text style={[s.editGrpBtn,{color:accent}]}>{"\u22EF"} Edit</Text>
              </TouchableOpacity>
            </View>
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
        <View style={{height:80}}/>
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
                placeholderTextColor={"#5C534A"} value={postText}
                onChangeText={t=>setPostText(t.slice(0,MAX_CHARS))} multiline maxLength={MAX_CHARS} autoFocus/>
              <Text style={s.mCharCount}>{postText.length} / {MAX_CHARS}</Text>

              {/* Photo preview */}
              {postPhoto ? (
                <View style={s.photoPreviewWrap}>
                  <Image source={{ uri:postPhoto }} style={s.photoPreview} resizeMode="cover"/>
                  <TouchableOpacity style={s.photoRemove} onPress={() => setPostPhoto(null)} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                    <X size={14} color="#fff" weight="bold"/>
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={s.attachRow}>
                <Text style={s.attachLbl}>Add:</Text>
                <TouchableOpacity style={s.attachBtn} onPress={doPickPhoto} activeOpacity={0.8}>
                  <ImageSquare size={14} color={postPhoto ? "#1E3D30" : "#5C534A"} weight={postPhoto?"fill":"regular"}/>
                  <Text style={postPhoto ? s.attachTxtOn : s.attachTxt}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.attachBtn} onPress={() => setShowLink(v=>!v)} activeOpacity={0.8}>
                  <LinkSimple size={14} color={showLink ? "#1E3D30" : "#5C534A"} weight={showLink?"fill":"regular"}/>
                  <Text style={showLink ? s.attachTxtOn : s.attachTxt}>Link</Text>
                </TouchableOpacity>
              </View>
              {showLink ? (
                <View style={s.linkBox}>
                  <TextInput style={s.linkIn} placeholder="https://..." placeholderTextColor={"#5C534A"}
                    value={postLink} onChangeText={setPostLink} keyboardType="url" autoCapitalize="none" autoCorrect={false}/>
                  <TextInput style={s.linkIn} placeholder="Link title (optional)" placeholderTextColor={"#5C534A"}
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
              <TextInput style={s.mInputSm} placeholder="e.g. Family Hajj 2026" placeholderTextColor={"#5C534A"}
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
              <TextInput style={s.mInputSm} placeholder="Group name" placeholderTextColor={"#5C534A"}
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
                <View style={s.optIcon}><GroupIcon size={16} color={"#1E3D30"}/></View>
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
      {/* ── Invite Code modal ── */}
      <Modal visible={showInvite} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setShowInvite(false)}>
          <View style={s.sheet} onStartShouldSetResponder={() => true}>
            <View style={s.handle}/>
            <Text style={s.mTitle}>Invite to {activeG?.name}</Text>
            <Text style={s.mSub}>Share this code with anyone you want to invite. It stays active until you delete the group.</Text>

            {/* Code display */}
            <View style={s.codeBox}>
              <Text style={s.codeText}>{inviteCode}</Text>
            </View>

            {/* Action buttons */}
            <View style={s.btnRow}>
              <TouchableOpacity style={[s.cancelBtn, { flex:1 }]} onPress={doCopyCode} activeOpacity={0.85}>
                <View style={{ flexDirection:"row", alignItems:"center", gap:6 }}>
                  <Copy size={16} color={codeCopied ? "#1E3D30" : "#5C534A"} weight="regular"/>
                  <Text style={[s.cancelTxt, codeCopied && { color:"#1E3D30", fontWeight:"600" }]}>
                    {codeCopied ? "Copied!" : "Copy code"}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={[s.submitBtn, { flex:1 }]} onPress={doShareCode} activeOpacity={0.85}>
                <View style={{ flexDirection:"row", alignItems:"center", gap:6 }}>
                  <ShareNetwork size={16} color="#fff" weight="regular"/>
                  <Text style={s.submitTxt}>Share</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={{ marginTop:16, alignItems:"center", paddingVertical:10 }} onPress={() => setShowInvite(false)}>
              <Text style={s.cancelRowTxt}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Join Group modal ── */}
      <Modal visible={showJoin} transparent animationType="slide">
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
          <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => { setShowJoin(false); setJoinCode(""); setJoinError(""); }}>
            <View style={s.sheet} onStartShouldSetResponder={() => true}>
              <View style={s.handle}/>
              <Text style={s.mTitle}>Join a group</Text>
              <Text style={s.mSub}>Enter the 6-character invite code shared with you.</Text>

              <TextInput
                style={[s.mInputSm, s.codeInput, joinError ? { borderColor:"#D94F4F" } : null]}
                placeholder="e.g. A4BK7R"
                placeholderTextColor="#5C534A"
                value={joinCode}
                onChangeText={t => { setJoinCode(t.toUpperCase().slice(0,6)); setJoinError(""); }}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                autoFocus
                returnKeyType="join"
                onSubmitEditing={doJoinGroup}
              />

              {joinError ? <Text style={s.joinError}>{joinError}</Text> : null}

              <View style={s.btnRow}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowJoin(false); setJoinCode(""); setJoinError(""); }}>
                  <Text style={s.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={(!joinCode.trim()||joinLoading) ? [s.submitBtn,s.submitDim] : s.submitBtn}
                  onPress={doJoinGroup}
                  disabled={!joinCode.trim()||joinLoading}
                >
                  {joinLoading
                    ? <ActivityIndicator color="#fff" size="small"/>
                    : <Text style={s.submitTxt}>Join group</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}
