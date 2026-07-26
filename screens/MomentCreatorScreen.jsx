/**
 * MomentCreatorScreen.jsx — Safar
 * Create a Moments postcard or prayer card: pick a photo (photo cards
 * only), write a message, preview live, then share or save.
 *
 * Uses react-native-view-shot to bake the live PostcardTemplate render
 * into one PNG for sharing — confirmed working in Expo Go this session,
 * no dev build needed. Sharing uses React Native's core Share API with a
 * local file uri; this is known to work reliably on iOS. Android's
 * handling of local file:// uris through the share sheet is less
 * consistent — worth testing on an Android device specifically, and if
 * it's unreliable there, expo-sharing (not yet installed) handles the
 * content:// conversion Android wants and would be the fix.
 *
 * No crop/zoom/pan step — the photo just fills the frame (resizeMode
 * cover). A real crop UI needs gesture handling we haven't confirmed is
 * installed; deliberately deferred rather than half-built.
 *
 * Coding rules: StyleSheet.create at module level, literal hex only.
 * No && in style arrays — ternaries only.
 */
import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, Share, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";
import { CaretLeft, Camera, Image as ImageIcon } from "phosphor-react-native";
import PostcardTemplate from "../PostcardTemplate";
import { getTemplateById, saveMoment, getMoments, deleteMoment } from "../momentsStore";

const SERIF = "SourceSerif4-Regular";
const MAX_CHARS = 120;

const PAGE_BG    = "#F5F0E8";
const CARD_BG    = "#FDFAF4";
const TEXT       = "#1A1410";
const TEXT_MUTED = "#5C534A";
const BORDER     = "#DDD5C0";
const SAGE       = "#4A5C48";
const DANGER     = "#C24A4A";

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function MomentCreatorScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { templateId, savedMomentId } = route?.params ?? {};
  const template = getTemplateById(templateId);
  const viewShotRef = useRef(null);

  const [step, setStep] = useState(savedMomentId || template?.category !== "photo" ? "compose" : "photo");
  const [mode, setMode] = useState(savedMomentId ? "view" : "edit"); // "view" | "edit"
  const [momentId, setMomentId] = useState(savedMomentId ?? null);
  const [photoUri, setPhotoUri] = useState(null);
  const [eyebrow,  setEyebrow]  = useState(template?.eyebrow ?? "");
  const [message,  setMessage]  = useState("");
  const [saving,   setSaving]   = useState(false);
  const [sharing,  setSharing]  = useState(false);

  const cameFromPhotoStep = !savedMomentId && template?.category === "photo";

  useEffect(() => {
    if (!savedMomentId) return;
    getMoments().then(list => {
      const m = list.find(x => x.id === savedMomentId);
      if (m) {
        setPhotoUri(m.photoUri ?? null);
        setEyebrow(m.eyebrow ?? "");
        setMessage(m.message ?? "");
        setStep("compose");
      }
    });
  }, [savedMomentId]);

  if (!template) {
    return (
      <View style={[s.root, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: TEXT_MUTED }}>Template not found.</Text>
      </View>
    );
  }

  const pickPhoto = async (fromCamera) => {
    try {
      const ImagePicker = require("expo-image-picker");
      const perm = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert("Permission needed", "Allow photo access to create a postcard."); return; }
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [9, 16], quality: 0.85 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [9, 16], quality: 0.85 });
      if (!result.canceled && result.assets?.[0]) {
        setPhotoUri(result.assets[0].uri);
        setStep("compose");
      }
    } catch (_) {
      Alert.alert("Error", "Couldn't open your photo library. Please try again.");
    }
  };

  const doSave = async () => {
    setSaving(true);
    const saved = await saveMoment({
      id: momentId, templateId: template.id, photoUri,
      eyebrow, message: message.trim(), dateLabel: todayLabel(),
    }).catch(() => null);
    if (saved) setMomentId(saved.id);
    setSaving(false);
    setMode("view");
    Alert.alert("Saved", "Find it anytime under My Postcards.");
  };

  const doShare = async () => {
    setSharing(true);
    try {
      const uri = await viewShotRef.current.capture();
      const saved = await saveMoment({
        id: momentId, templateId: template.id, photoUri,
        eyebrow, message: message.trim(), dateLabel: todayLabel(),
      }).catch(() => null);
      if (saved) setMomentId(saved.id);
      await Share.share(Platform.OS === "ios" ? { url: uri } : { message: uri });
    } catch (e) {
      Alert.alert("Couldn't share", "Something went wrong generating the image. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  const doDelete = () => {
    Alert.alert("Delete postcard", "Remove this from My Postcards?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        if (momentId) await deleteMoment(momentId).catch(() => {});
        navigation?.goBack?.();
      } },
    ]);
  };

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => (step === "compose" && cameFromPhotoStep ? setStep("photo") : navigation?.goBack?.())} hitSlop={{ top:12,bottom:12,left:12,right:24 }}>
          <CaretLeft size={20} color={TEXT} weight="bold" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{template.name}</Text>
        <View style={{ width: 20 }} />
      </View>

      {step === "photo" ? (
        <ScrollView contentContainerStyle={s.photoStep} showsVerticalScrollIndicator={false}>
          <View style={s.photoStepPreview}>
            <PostcardTemplate template={template} width={170} />
          </View>
          <Text style={s.photoStepTitle}>Choose a photo</Text>
          <Text style={s.photoStepSub}>Pick from your library or take a new one for this postcard.</Text>
          <TouchableOpacity style={s.photoOption} onPress={() => pickPhoto(false)} activeOpacity={0.85}>
            <ImageIcon size={20} color={SAGE} weight="regular" />
            <Text style={s.photoOptionTxt}>Photo Library</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.photoOption} onPress={() => pickPhoto(true)} activeOpacity={0.85}>
            <Camera size={20} color={SAGE} weight="regular" />
            <Text style={s.photoOptionTxt}>Take a Photo</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView contentContainerStyle={s.composeScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={s.previewWrap}>
              <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.95 }}>
                <PostcardTemplate
                  template={template}
                  photoUri={photoUri}
                  eyebrow={eyebrow}
                  message={message}
                  dateLabel={todayLabel()}
                  width={280}
                />
              </ViewShot>
            </View>

            {mode === "edit" ? (
              <>
                {template.category === "photo" && template.eyebrow !== "" ? (
                  <>
                    <Text style={s.fieldLabel}>LOCATION LABEL</Text>
                    <TextInput style={s.input} value={eyebrow} onChangeText={setEyebrow} placeholder="e.g. MAKKAH" placeholderTextColor={TEXT_MUTED} autoCapitalize="characters" />
                  </>
                ) : null}

                <Text style={s.fieldLabel}>MESSAGE</Text>
                <TextInput
                  style={[s.input, s.inputMulti]}
                  value={message}
                  onChangeText={t => setMessage(t.slice(0, MAX_CHARS))}
                  placeholder={template.placeholder}
                  placeholderTextColor={TEXT_MUTED}
                  multiline
                  maxLength={MAX_CHARS}
                />
                <Text style={s.charCount}>{message.length} / {MAX_CHARS}</Text>

                <View style={s.btnRow}>
                  <TouchableOpacity style={s.saveBtn} onPress={doSave} disabled={saving} activeOpacity={0.85}>
                    {saving ? <ActivityIndicator size="small" color={SAGE} /> : <Text style={s.saveBtnTxt}>Save</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={s.shareBtn} onPress={doShare} disabled={sharing} activeOpacity={0.88}>
                    {sharing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.shareBtnTxt}>Share</Text>}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <TouchableOpacity style={s.editLink} onPress={() => setMode("edit")} activeOpacity={0.8}>
                  <Text style={s.editLinkTxt}>Edit details</Text>
                </TouchableOpacity>
                <View style={s.btnRow}>
                  <TouchableOpacity style={s.deleteBtn} onPress={doDelete} activeOpacity={0.85}>
                    <Text style={s.deleteBtnTxt}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.shareBtn} onPress={doShare} disabled={sharing} activeOpacity={0.88}>
                    {sharing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.shareBtnTxt}>Share</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, backgroundColor: PAGE_BG, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle: { fontFamily: SERIF, fontSize: 18, color: TEXT },

  photoStep: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingVertical: 32, gap: 12 },
  photoStepPreview: { marginBottom: 12, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  photoStepTitle: { fontFamily: SERIF, fontSize: 22, color: TEXT, marginBottom: 4 },
  photoStepSub: { fontSize: 14, color: TEXT_MUTED, textAlign: "center", marginBottom: 12, lineHeight: 20 },
  photoOption: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 20, paddingVertical: 16, width: "100%" },
  photoOptionTxt: { fontSize: 16, color: TEXT, fontWeight: "500" },

  editLink: { alignSelf: "center", paddingVertical: 10, marginBottom: 8 },
  editLinkTxt: { fontSize: 14, color: SAGE, fontWeight: "600" },
  deleteBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: DANGER, paddingVertical: 14, alignItems: "center" },
  deleteBtnTxt: { fontSize: 16, color: DANGER, fontWeight: "600" },

  composeScroll: { padding: 20, alignItems: "center" },
  previewWrap: { marginBottom: 24, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },

  fieldLabel: { alignSelf: "flex-start", fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: TEXT_MUTED, marginBottom: 6, marginTop: 4 },
  input: { width: "100%", backgroundColor: CARD_BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: TEXT, marginBottom: 4 },
  inputMulti: { minHeight: 70, textAlignVertical: "top" },
  charCount: { alignSelf: "flex-end", fontSize: 12, color: TEXT_MUTED, marginBottom: 16 },

  btnRow: { flexDirection: "row", gap: 10, width: "100%", marginTop: 8 },
  saveBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: SAGE, paddingVertical: 14, alignItems: "center" },
  saveBtnTxt: { fontSize: 16, color: SAGE, fontWeight: "600" },
  shareBtn: { flex: 1, borderRadius: 12, backgroundColor: SAGE, paddingVertical: 14, alignItems: "center" },
  shareBtnTxt: { fontSize: 16, color: "#FFFFFF", fontWeight: "600" },
});
