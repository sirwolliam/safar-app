/**
 * GroupDetailScreen.jsx — Safar
 * Single group — members, milestone feed, post/react/share, invite/rename/delete.
 *
 * Rebuilt 2026-07-23 alongside the GroupsScreen.jsx list-screen split.
 * Long-press replaces the old swipe-to-delete gesture (avoids the PanResponder
 * tap-stealing gotcha entirely). No per-group color — one consistent style,
 * per design decision this session.
 *
 * All modal backdrops use the absolute-fill-behind-sheet pattern, not
 * onStartShouldSetResponder — the old version of this file used the pattern
 * that kills ScrollViews; fixed here even though nothing currently scrolls
 * inside a sheet, so it doesn't bite later when something does.
 *
 * Coding rules: StyleSheet.create at module level, literal hex only.
 * No && in style arrays — ternaries only.
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  Modal, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
  Linking, Share, Image, Clipboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  CaretLeft, DotsThreeVertical, Plus, HandHeart, ShareFat, ImageSquare,
  LinkSimple, X, Copy, ShareNetwork, PencilSimple, Trash, Camera, UsersThree,
} from "phosphor-react-native";
import {
  getCurrentUser, subscribeToGroupMilestones, postMilestoneWithPhoto,
  addAmeen, generateInviteCode,
} from "../firebase";
import { getGroupMeta, setGroupMeta } from "../groupMetaStore";
import { UserAvatar } from "./ConnectionsScreen";

const SERIF = "SourceSerif4-Regular";
const MAX_CHARS = 280;

const PAGE_BG    = "#F5F0E8";
const CARD_BG    = "#FDFAF4";
const TEXT       = "#1A1410";
const TEXT_SEC   = "#8A7D6A";
const TEXT_MUTED = "#5C534A";
const BORDER     = "#DDD5C0";
const DIVIDER    = "#EDE4D4";
const SAGE       = "#4A5C48";
const DANGER     = "#C24A4A";
const CONNECT    = "#584260"; // Connect pillar identity color — same convention as GroupsScreen.jsx

// ── Demo data — mirrors GroupsScreen.jsx's example groups. firebase.js is
// fully stubbed right now, so this is what renders for any user until real
// Firebase groups/milestones exist. ─────────────────────────────────────────
const EX_MEMBERS = {
  u1: { uid: "u1", displayName: "Fatima Hassan" },
  u2: { uid: "u2", displayName: "Ahmed Al-Rashid" },
  u3: { uid: "u3", displayName: "Maryam Khan" },
  u4: { uid: "u4", displayName: "You" },
  u5: { uid: "u5", displayName: "Yusuf Ibrahim" },
  u6: { uid: "u6", displayName: "Amina Bello" },
};
const EX_MILESTONES = [
  { id: "m1", author: "Ahmed Al-Rashid", uid: "u2", text: "Completed Tawaf al-Qudum, alhamdulillah", time: "2h ago", ameen: ["u3", "u4"], link: null },
  { id: "m2", author: "Fatima Hassan",   uid: "u1", text: "Making dua at Maqam Ibrahim right now", time: "4h ago", ameen: ["u2"], link: "https://sunnah.com/bukhari:1613", linkTitle: "Dua for Tawaf" },
  { id: "m3", author: "Maryam Khan",     uid: "u3", text: "First time seeing the Kaaba. Subhanallah.", time: "6h ago", ameen: ["u1", "u2", "u4"], link: null },
];

function timeAgoFromTimestamp(ts) {
  if (!ts?.toMillis) return "";
  const diff = Date.now() - ts.toMillis();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Group avatar — icon (default), initials, or a chosen photo ────────────────
function GroupAvatar({ meta, name, size = 44 }) {
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
      <UsersThree size={size * 0.5} color="#C8A96A" weight="regular" />
    </View>
  );
}

// ── Milestone card ────────────────────────────────────────────────────────────
function MilestoneCard({ item, myUid, onAmeen, onDelete }) {
  const [busy, setBusy] = useState(false);
  const hasAmeen = item.ameen?.includes(myUid);
  const isMine = item.uid === myUid;
  const time = item.time ?? timeAgoFromTimestamp(item.createdAt);

  return (
    <TouchableOpacity
      style={styles.msCard}
      activeOpacity={1}
      delayLongPress={400}
      onLongPress={() => {
        if (!isMine) return;
        Alert.alert("Delete milestone", "Remove this from the feed?", [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) },
        ]);
      }}
    >
      <View style={styles.msTop}>
        <UserAvatar name={item.author} size={36} />
        <View style={{ flex:1 }}>
          <Text style={styles.msName}>{item.author}{isMine ? " (you)" : ""}</Text>
          <Text style={styles.msTime}>{time}</Text>
        </View>
      </View>
      <Text style={styles.msText}>{item.text}</Text>
      {item.photoUri ? (
        <Image source={{ uri: item.photoUri }} style={styles.msPhoto} resizeMode="cover" />
      ) : null}
      {item.link ? (
        <TouchableOpacity style={styles.msLink} onPress={() => Linking.openURL(item.link)} activeOpacity={0.85}>
          <LinkSimple size={13} color={SAGE} weight="regular" />
          <Text style={styles.msLinkTxt} numberOfLines={1}>{item.linkTitle || item.link.replace("https://", "")}</Text>
        </TouchableOpacity>
      ) : null}
      <View style={styles.msFooter}>
        <TouchableOpacity
          style={hasAmeen ? [styles.msBtn, styles.msBtnOn] : styles.msBtn}
          onPress={async () => {
            if (hasAmeen || busy) return;
            setBusy(true);
            await onAmeen(item.id);
            setBusy(false);
          }}
          disabled={hasAmeen || busy}
          activeOpacity={0.8}
        >
          {busy
            ? <ActivityIndicator size="small" color={hasAmeen ? "#fff" : SAGE} />
            : <>
                <HandHeart size={14} color={hasAmeen ? "#fff" : SAGE} weight={hasAmeen ? "fill" : "regular"} />
                <Text style={hasAmeen ? [styles.msBtnTxt, styles.msBtnTxtOn] : styles.msBtnTxt}>
                  {hasAmeen ? "\u0100meen" : "Say \u0100meen"}
                </Text>
              </>
          }
        </TouchableOpacity>
        {item.ameen?.length > 0 ? <Text style={styles.msCount}>{item.ameen.length} \u0100meen</Text> : null}
        <TouchableOpacity
          style={styles.shareIconBtn}
          onPress={async () => {
            try { await Share.share({ message: `${item.author} shared:\n${item.text}\n\nShared via Safar` }); } catch (_) {}
          }}
          activeOpacity={0.8}
        >
          <ShareFat size={16} color={TEXT_SEC} weight="regular" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GroupDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { group, allGroups = [] } = route?.params ?? {};
  const currentUser = getCurrentUser();
  const myUid = currentUser?.uid ?? "u4";
  const isEx = !!group?.isExample;

  // Display name + avatar now persist via groupMetaStore.js (AsyncStorage),
  // so a rename or avatar change here shows up on GroupsScreen's list too,
  // and survives an app reload — see groupMetaStore.js for why this exists.
  const [groupName, setGroupName] = useState(group?.name ?? "");
  const [meta, setMeta] = useState(null);

  const [realMilestones, setRealMilestones] = useState([]);
  const [exMilestones,   setExMilestones]   = useState(group?.id === "ex1" ? EX_MILESTONES : []);
  const [removedUids,    setRemovedUids]    = useState([]);

  const [showMenu,   setShowMenu]   = useState(false);
  const [showPost,   setShowPost]   = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);
  const [showMSheet, setShowMSheet] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [selMember,  setSelMember]  = useState(null);

  const [postText,  setPostText]  = useState("");
  const [postLink,  setPostLink]  = useState("");
  const [postPhoto, setPostPhoto] = useState(null);
  const [showLink,  setShowLink]  = useState(false);
  const [posting,   setPosting]   = useState(false);

  const [editName,   setEditName]   = useState(groupName);
  const [inviteCode, setInviteCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (!group?.id || isEx) return;
    return subscribeToGroupMilestones(group.id, setRealMilestones);
  }, [group?.id]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getGroupMeta(group?.id).then(m => {
        if (!active) return;
        setMeta(m);
        if (m?.name) setGroupName(m.name);
      });
      return () => { active = false; };
    }, [group?.id])
  );

  if (!group) return null;

  const milestones = isEx ? exMilestones : realMilestones;
  const members = isEx
    ? (group.memberUids ?? []).filter(u => !removedUids.includes(u)).map(u => EX_MEMBERS[u]).filter(Boolean)
    : (group.members ?? []).map(uid => ({ uid, displayName: uid === myUid ? currentUser.displayName : "Member" }));

  const doAmeen = async (id) => {
    if (isEx) {
      setExMilestones(p => p.map(m => m.id === id ? { ...m, ameen: [...(m.ameen ?? []), myUid] } : m));
    } else {
      await addAmeen(id, myUid).catch(() => {});
    }
  };

  const doDelete = (id) => {
    if (isEx) setExMilestones(p => p.filter(m => m.id !== id));
    // Real-milestone delete needs a Firestore delete call — wire once Firebase is live.
  };

  const doPost = async () => {
    if (!postText.trim() || posting) return;
    setPosting(true);
    const lnk = postLink.trim() ? (postLink.startsWith("http") ? postLink.trim() : "https://" + postLink.trim()) : null;
    if (isEx) {
      setExMilestones(p => [{
        id: `m${Date.now()}`, author: "You", uid: myUid, text: postText.trim(),
        time: "just now", ameen: [], link: lnk, linkTitle: lnk, photoUri: postPhoto ?? null,
      }, ...p]);
    } else {
      await postMilestoneWithPhoto(myUid, currentUser.displayName, group.id, postText.trim(), postPhoto).catch(() => {});
    }
    setPostText(""); setPostLink(""); setShowLink(false); setPostPhoto(null); setShowPost(false); setPosting(false);
  };

  const doPickPhoto = async () => {
    try {
      const ImagePicker = require("expo-image-picker");
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert("Permission needed", "Allow photo access to share images with your group."); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
      if (!result.canceled && result.assets?.[0]) setPostPhoto(result.assets[0].uri);
    } catch (_) {
      Alert.alert("Coming soon", "Photo sharing will be available in the full app release.");
    }
  };

  const doShowInvite = async () => {
    setShowMenu(false);
    try {
      const code = await generateInviteCode(group.id);
      setInviteCode(code);
      setShowInvite(true);
    } catch (_) {
      Alert.alert("Error", "Could not generate invite code. Please try again.");
    }
  };

  const doCopyCode = () => {
    Clipboard.setString(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const doShareCode = async () => {
    try {
      await Share.share({
        message: `Join my Safar pilgrimage group!\n\nGroup: ${groupName}\nInvite code: ${inviteCode}\n\nDownload Safar and enter this code to join.`,
        title: `Join ${groupName} on Safar`,
      });
    } catch (_) {}
  };

  const doDeleteGroup = () => {
    setShowMenu(false);
    Alert.alert("Delete group", `Delete ${groupName}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => navigation?.goBack?.() },
    ]);
  };

  const chooseIconAvatar = async () => {
    const m = await setGroupMeta(group.id, { avatarMode: "icon" });
    setMeta(m);
  };

  const chooseInitialsAvatar = async () => {
    const m = await setGroupMeta(group.id, { avatarMode: "initials" });
    setMeta(m);
  };

  const choosePhotoAvatar = async () => {
    try {
      const ImagePicker = require("expo-image-picker");
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert("Permission needed", "Allow photo access to set a group avatar."); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets?.[0]) {
        const m = await setGroupMeta(group.id, { avatarMode: "photo", photoUri: result.assets[0].uri });
        setMeta(m);
      }
    } catch (_) {
      Alert.alert("Coming soon", "Custom group photos will be available in the full app release.");
    }
  };

  return (
    <View style={styles.root}>
      {/* ── Sage Solid Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => { const returnToTab = route?.params?.returnToTab; if (returnToTab) { navigation?.getParent?.()?.navigate?.(returnToTab); } else { navigation?.goBack?.(); } }} hitSlop={{ top:12, bottom:12, left:12, right:24 }}>
          <CaretLeft size={20} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerCenter} onPress={() => setShowAvatar(true)} activeOpacity={0.85}>
          <GroupAvatar meta={meta} name={groupName} size={34} />
          <Text style={styles.headerTitle} numberOfLines={1}>{groupName}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => { setEditName(groupName); setShowMenu(true); }} activeOpacity={0.8}>
          <DotsThreeVertical size={20} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Members */}
        <View style={styles.membersCard}>
          <Text style={styles.membersTitle}>Members  ·  {members.length}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberRow}>
            {members.map(m => (
              <TouchableOpacity
                key={m.uid}
                style={styles.memberWrap}
                onPress={() => { if (m.uid !== myUid) { setSelMember(m); setShowMSheet(true); } }}
                activeOpacity={m.uid === myUid ? 1 : 0.75}
              >
                <UserAvatar name={m.displayName} size={50} />
                <Text style={styles.memberName} numberOfLines={1}>{m.uid === myUid ? "You" : m.displayName.split(" ")[0]}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addTile}
              onPress={() => navigation?.navigate?.("Connections", { mode: "pick", groupId: group.id, groupName })}
              activeOpacity={0.8}
            >
              <Plus size={20} color={SAGE} weight="bold" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Milestone feed */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Milestones</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={() => setShowPost(true)} activeOpacity={0.85}>
            <Text style={styles.shareBtnTxt}>+ Share</Text>
          </TouchableOpacity>
        </View>

        {milestones.length > 0 ? (
          milestones.map(m => (
            <MilestoneCard key={m.id} item={m} myUid={myUid} onAmeen={doAmeen} onDelete={doDelete} />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTxt}>No milestones yet.{"\n"}Be the first to share one.</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Overflow menu */}
      <Modal visible={showMenu} transparent animationType="fade">
        <View style={styles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowMenu(false)} />
          <View style={styles.menuSheet}>
            <TouchableOpacity style={styles.menuOption} onPress={doShowInvite} activeOpacity={0.8}>
              <ShareNetwork size={17} color={TEXT} weight="regular" />
              <Text style={styles.menuOptionTxt}>Invite people</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuOption} onPress={() => { setShowMenu(false); setShowEdit(true); }} activeOpacity={0.8}>
              <PencilSimple size={17} color={TEXT} weight="regular" />
              <Text style={styles.menuOptionTxt}>Rename group</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuOption} onPress={doDeleteGroup} activeOpacity={0.8}>
              <Trash size={17} color={DANGER} weight="regular" />
              <Text style={[styles.menuOptionTxt, { color: DANGER }]}>Delete group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Post modal */}
      <Modal visible={showPost} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.backdrop}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => { setShowPost(false); setPostText(""); setPostLink(""); setShowLink(false); }} />
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.mTitle}>Share a milestone</Text>
              <Text style={styles.mSub}>Sharing with {groupName}</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g. Completed Tawaf, alhamdulillah"
                placeholderTextColor={TEXT_MUTED}
                value={postText}
                onChangeText={t => setPostText(t.slice(0, MAX_CHARS))}
                multiline
                maxLength={MAX_CHARS}
                autoFocus
              />
              <Text style={styles.charCount}>{postText.length} / {MAX_CHARS}</Text>

              {postPhoto ? (
                <View style={styles.photoPreviewWrap}>
                  <Image source={{ uri: postPhoto }} style={styles.photoPreview} resizeMode="cover" />
                  <TouchableOpacity style={styles.photoRemove} onPress={() => setPostPhoto(null)} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
                    <X size={14} color="#fff" weight="bold" />
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.attachRow}>
                <TouchableOpacity style={styles.attachBtn} onPress={doPickPhoto} activeOpacity={0.8}>
                  <ImageSquare size={15} color={postPhoto ? SAGE : TEXT_MUTED} weight={postPhoto ? "fill" : "regular"} />
                  <Text style={postPhoto ? [styles.attachTxt, styles.attachTxtOn] : styles.attachTxt}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachBtn} onPress={() => setShowLink(v => !v)} activeOpacity={0.8}>
                  <LinkSimple size={15} color={showLink ? SAGE : TEXT_MUTED} weight={showLink ? "fill" : "regular"} />
                  <Text style={showLink ? [styles.attachTxt, styles.attachTxtOn] : styles.attachTxt}>Link</Text>
                </TouchableOpacity>
              </View>
              {showLink ? (
                <TextInput
                  style={styles.linkInput}
                  placeholder="https://..."
                  placeholderTextColor={TEXT_MUTED}
                  value={postLink}
                  onChangeText={setPostLink}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              ) : null}

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowPost(false); setPostText(""); setPostLink(""); setShowLink(false); }}>
                  <Text style={styles.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={(!postText.trim() || posting) ? [styles.submitBtn, styles.submitDim] : styles.submitBtn}
                  onPress={doPost}
                  disabled={posting || !postText.trim()}
                >
                  {posting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitTxt}>Share</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Invite modal */}
      <Modal visible={showInvite} transparent animationType="slide">
        <View style={styles.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowInvite(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.mTitle}>Invite to {groupName}</Text>
            <Text style={styles.mSub}>Share this code with anyone you want to invite. It stays active until you delete the group.</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{inviteCode}</Text>
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.cancelBtn, { flexDirection:"row", gap:6, justifyContent:"center" }]} onPress={doCopyCode} activeOpacity={0.85}>
                <Copy size={16} color={codeCopied ? SAGE : TEXT_MUTED} weight="regular" />
                <Text style={codeCopied ? [styles.cancelTxt, { color: SAGE, fontWeight: "600" }] : styles.cancelTxt}>
                  {codeCopied ? "Copied!" : "Copy code"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { flexDirection:"row", gap:6, justifyContent:"center" }]} onPress={doShareCode} activeOpacity={0.85}>
                <ShareNetwork size={16} color="#fff" weight="regular" />
                <Text style={styles.submitTxt}>Share</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ marginTop:16, alignItems:"center", paddingVertical:10 }} onPress={() => setShowInvite(false)}>
              <Text style={styles.doneTxt}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rename modal */}
      <Modal visible={showEdit} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.backdrop}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowEdit(false)} />
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.mTitle}>Rename group</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} autoFocus returnKeyType="done" />
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEdit(false)}>
                  <Text style={styles.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={!editName.trim() ? [styles.submitBtn, styles.submitDim] : styles.submitBtn}
                  onPress={async () => {
                    const trimmed = editName.trim();
                    setGroupName(trimmed);
                    setShowEdit(false);
                    const m = await setGroupMeta(group.id, { name: trimmed });
                    setMeta(m);
                  }}
                  disabled={!editName.trim()}
                >
                  <Text style={styles.submitTxt}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Avatar picker */}
      <Modal visible={showAvatar} transparent animationType="slide">
        <View style={styles.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowAvatar(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.mTitle}>Group avatar</Text>
            <View style={styles.avatarPreviewWrap}>
              <GroupAvatar meta={meta} name={groupName} size={72} />
            </View>

            <TouchableOpacity style={styles.avatarOption} onPress={chooseIconAvatar} activeOpacity={0.85}>
              <View style={styles.avatarOptionIcon}>
                <UsersThree size={19} color={SAGE} weight="regular" />
              </View>
              <Text style={styles.avatarOptionTxt}>Use group icon</Text>
              {(!meta?.avatarMode || meta.avatarMode === "icon") ? (
                <View style={styles.avatarCheck}><Text style={styles.avatarCheckTxt}>{"\u2713"}</Text></View>
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity style={styles.avatarOption} onPress={chooseInitialsAvatar} activeOpacity={0.85}>
              <View style={[styles.avatarOptionIcon, { backgroundColor: "#C8A96A" }]}>
                <Text style={styles.avatarOptionInitials}>
                  {(groupName || "").trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join("") || "S"}
                </Text>
              </View>
              <Text style={styles.avatarOptionTxt}>Use initials</Text>
              {meta?.avatarMode === "initials" ? (
                <View style={styles.avatarCheck}><Text style={styles.avatarCheckTxt}>{"\u2713"}</Text></View>
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.avatarOption, { borderBottomWidth:0 }]} onPress={choosePhotoAvatar} activeOpacity={0.85}>
              <View style={styles.avatarOptionIcon}>
                <Camera size={19} color={SAGE} weight="regular" />
              </View>
              <Text style={styles.avatarOptionTxt}>Choose a photo</Text>
              {meta?.avatarMode === "photo" ? (
                <View style={styles.avatarCheck}><Text style={styles.avatarCheckTxt}>{"\u2713"}</Text></View>
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop:16, alignItems:"center", paddingVertical:10 }} onPress={() => setShowAvatar(false)}>
              <Text style={styles.doneTxt}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Member action sheet */}
      <Modal visible={showMSheet} transparent animationType="slide">
        <View style={styles.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => { setShowMSheet(false); setSelMember(null); }} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.mshRow}>
              <UserAvatar name={selMember?.displayName} size={52} />
              <View>
                <Text style={styles.mshName}>{selMember?.displayName}</Text>
                <Text style={styles.mshSub}>Member of {groupName}</Text>
              </View>
            </View>
            <View style={styles.menuDivider} />
            {allGroups.filter(g => g.id !== group.id).length > 0 ? (
              <>
                <Text style={styles.secLbl}>ADD TO ANOTHER GROUP</Text>
                {allGroups.filter(g => g.id !== group.id).map(g => (
                  <TouchableOpacity key={g.id} style={styles.optRow} onPress={() => { setShowMSheet(false); setSelMember(null); }} activeOpacity={0.85}>
                    <Text style={styles.optTxt}>{g.name}</Text>
                    <Plus size={16} color={SAGE} weight="bold" />
                  </TouchableOpacity>
                ))}
                <View style={styles.menuDivider} />
              </>
            ) : null}
            <TouchableOpacity
              style={styles.removeRow}
              onPress={() => {
                setShowMSheet(false);
                if (isEx) setRemovedUids(p => [...p, selMember.uid]);
                setSelMember(null);
              }}
            >
              <Text style={styles.removeTxt}>Remove from {groupName}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelRow} onPress={() => { setShowMSheet(false); setSelMember(null); }}>
              <Text style={styles.doneTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex:1, backgroundColor:PAGE_BG },

  header: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:20, paddingBottom:16, backgroundColor:SAGE,
  },
  headerCenter: { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:10, marginHorizontal:8 },
  headerTitle: { fontSize:18, fontWeight:"700", color:"#FFFFFF", flexShrink:1 },
  menuBtn: { width:34, height:34, borderRadius:17, alignItems:"center", justifyContent:"center", backgroundColor:"rgba(255,255,255,0.16)" },

  scroll: { paddingHorizontal:16, paddingTop:16 },

  membersCard: {
    backgroundColor:CARD_BG, borderRadius:16, borderWidth:1, borderColor:BORDER,
    padding:16, marginBottom:20,
    shadowColor:"#2A1F0E", shadowOffset:{ width:0, height:2 }, shadowOpacity:0.08, shadowRadius:8, elevation:3,
  },
  membersTitle: { fontFamily:SERIF, fontSize:15, color:TEXT, marginBottom:12 },
  memberRow: { gap:14, paddingRight:4 },
  memberWrap: { alignItems:"center", gap:5, width:60 },
  memberName: { fontSize:12, color:TEXT, textAlign:"center" },
  addTile: { width:50, height:50, borderRadius:25, borderWidth:1.5, borderColor:BORDER, borderStyle:"dashed", alignItems:"center", justifyContent:"center", backgroundColor:PAGE_BG },

  feedHeader: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:12 },
  feedTitle: { fontFamily:SERIF, fontSize:18, color:TEXT },
  shareBtn: { backgroundColor:SAGE, borderRadius:999, paddingHorizontal:14, paddingVertical:8 },
  shareBtnTxt: { fontSize:13, color:"#fff", fontWeight:"600" },

  empty: { alignItems:"center", paddingVertical:36 },
  emptyTxt: { fontSize:15, color:TEXT_MUTED, textAlign:"center", lineHeight:22 },

  msCard: { backgroundColor:CARD_BG, borderRadius:14, borderWidth:1, borderColor:BORDER, padding:16, marginBottom:10, shadowColor:"#2A1F0E", shadowOffset:{ width:0, height:2 }, shadowOpacity:0.08, shadowRadius:8, elevation:3 },
  msTop: { flexDirection:"row", alignItems:"center", gap:10, marginBottom:8 },
  msName: { fontSize:17, fontWeight:"700", color:TEXT },
  msTime: { fontSize:12, color:TEXT_SEC },
  msText: { fontSize:15, color:TEXT, lineHeight:21, marginBottom:10 },
  msPhoto: { width:"100%", height:160, borderRadius:10, marginBottom:10 },
  msLink: { flexDirection:"row", alignItems:"center", gap:6, backgroundColor:PAGE_BG, borderRadius:8, borderWidth:1, borderColor:BORDER, padding:9, marginBottom:10 },
  msLinkTxt: { flex:1, fontSize:12, color:SAGE },
  msFooter: { flexDirection:"row", alignItems:"center", gap:10 },
  msBtn: { flexDirection:"row", alignItems:"center", gap:6, paddingHorizontal:12, paddingVertical:7, borderRadius:999, borderWidth:1, borderColor:BORDER },
  msBtnOn: { backgroundColor:SAGE, borderColor:SAGE },
  msBtnTxt: { fontSize:13, color:SAGE },
  msBtnTxtOn: { color:"#fff", fontWeight:"500" },
  msCount: { fontSize:12, color:TEXT_SEC },
  shareIconBtn: { marginLeft:"auto", padding:4 },

  overlay: { flex:1, backgroundColor:"rgba(26,20,16,0.4)", justifyContent:"flex-start", alignItems:"flex-end" },
  menuSheet: { marginTop:100, marginRight:16, backgroundColor:CARD_BG, borderRadius:14, borderWidth:1, borderColor:BORDER, width:200, overflow:"hidden" },
  menuOption: { flexDirection:"row", alignItems:"center", gap:10, paddingHorizontal:16, paddingVertical:13 },
  menuOptionTxt: { fontSize:15, color:TEXT },
  menuDivider: { height:1, backgroundColor:DIVIDER },

  backdrop: { flex:1, backgroundColor:"rgba(26,20,16,0.4)", justifyContent:"flex-end" },
  sheet: { backgroundColor:CARD_BG, borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom:32 },
  handle: { width:36, height:4, borderRadius:2, backgroundColor:BORDER, alignSelf:"center", marginBottom:16 },
  mTitle: { fontFamily:SERIF, fontSize:20, color:TEXT, marginBottom:4 },
  mSub: { fontSize:14, color:TEXT_MUTED, marginBottom:14 },
  input: { backgroundColor:PAGE_BG, borderRadius:12, borderWidth:1, borderColor:BORDER, padding:14, fontSize:16, color:TEXT, marginBottom:16 },
  textArea: { backgroundColor:PAGE_BG, borderRadius:12, borderWidth:1, borderColor:BORDER, padding:14, fontSize:16, color:TEXT, minHeight:90, textAlignVertical:"top", marginBottom:4 },
  charCount: { fontSize:12, color:TEXT_SEC, textAlign:"right", marginBottom:12 },

  photoPreviewWrap: { marginBottom:10, borderRadius:10, overflow:"hidden", position:"relative" },
  photoPreview: { width:"100%", height:150, borderRadius:10 },
  photoRemove: { position:"absolute", top:8, right:8, width:26, height:26, borderRadius:13, backgroundColor:"rgba(26,20,16,0.55)", alignItems:"center", justifyContent:"center" },

  attachRow: { flexDirection:"row", gap:10, marginBottom:10 },
  attachBtn: { flexDirection:"row", alignItems:"center", gap:6, paddingHorizontal:12, paddingVertical:7, borderRadius:999, borderWidth:1, borderColor:BORDER, backgroundColor:PAGE_BG },
  attachTxt: { fontSize:13, color:TEXT_MUTED },
  attachTxtOn: { color:SAGE, fontWeight:"600" },
  linkInput: { backgroundColor:PAGE_BG, borderRadius:8, borderWidth:1, borderColor:BORDER, paddingHorizontal:12, paddingVertical:10, fontSize:14, color:TEXT, marginBottom:12 },

  btnRow: { flexDirection:"row", gap:10 },
  cancelBtn: { flex:1, borderRadius:12, borderWidth:1, borderColor:BORDER, paddingVertical:14, alignItems:"center", backgroundColor:PAGE_BG },
  cancelTxt: { fontSize:16, color:TEXT },
  submitBtn: { flex:1, borderRadius:12, backgroundColor:SAGE, paddingVertical:14, alignItems:"center" },
  submitDim: { opacity:0.4 },
  submitTxt: { fontSize:16, color:"#FFFFFF", fontWeight:"600" },
  doneTxt: { fontSize:16, color:TEXT_MUTED },

  codeBox: { backgroundColor:PAGE_BG, borderRadius:14, borderWidth:1.5, borderColor:BORDER, paddingVertical:20, alignItems:"center", marginBottom:16 },
  codeText: { fontFamily:SERIF, fontSize:34, color:SAGE, letterSpacing:6 },

  avatarPreviewWrap: { alignItems:"center", marginBottom:20 },
  avatarOption: { flexDirection:"row", alignItems:"center", gap:12, paddingVertical:13, borderBottomWidth:1, borderBottomColor:DIVIDER },
  avatarOptionIcon: { width:40, height:40, borderRadius:20, backgroundColor:"#4A5C4826", alignItems:"center", justifyContent:"center" },
  avatarOptionInitials: { fontSize:13, fontWeight:"700", color:"#FFFFFF" },
  avatarOptionTxt: { flex:1, fontSize:15, color:TEXT },
  avatarCheck: { width:22, height:22, borderRadius:11, backgroundColor:SAGE, alignItems:"center", justifyContent:"center" },
  avatarCheckTxt: { fontSize:11, color:"#FFFFFF", fontWeight:"700" },

  mshRow: { flexDirection:"row", alignItems:"center", gap:12, marginBottom:16, marginTop:4 },
  mshName: { fontFamily:SERIF, fontSize:18, color:TEXT },
  mshSub: { fontSize:14, color:TEXT_MUTED },
  secLbl: { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:TEXT_SEC, marginBottom:8 },
  optRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingVertical:12, borderBottomWidth:1, borderBottomColor:DIVIDER },
  optTxt: { fontSize:16, color:TEXT },
  removeRow: { paddingVertical:16, alignItems:"center" },
  removeTxt: { fontSize:16, color:DANGER, fontWeight:"500" },
  cancelRow: { paddingVertical:12, alignItems:"center" },
});
