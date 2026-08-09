import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CalendarBlank, CaretRight, Sparkle } from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";
const SW = Dimensions.get("window").width;

// ── Pillar colors (locked from HubContainerScreen's PILLAR_CONFIG) ──
const PILLAR_COLORS = {
  plan:     "#2E4560",
  learn:    "#2D4F32",
  practice: "#4E3414",
  connect:  "#3D2240",
};

// ── Phase definitions ──
const PHASES = [
  { key: "early",    label: "Early",       fullLabel: "Early Preparation",     description: "You have time to plan carefully. Visas, flights, and accommodation are usually the first priorities." },
  { key: "focused",  label: "Focused",     fullLabel: "Focused Preparation",   description: "A good stretch for learning the steps, memorizing key duas, and shaping your packing list." },
  { key: "final",    label: "Final",       fullLabel: "Final Preparation",     description: "The trip is getting close. Packing, guides, and a word with family often come into focus around now." },
  { key: "onway",    label: "On your way", fullLabel: "On Your Way",           description: "Almost there. Documents, essentials, and a check-in with your group are worth a last look." },
  { key: "onsite",   label: "Pilgrimage",  fullLabel: "Pilgrimage",            description: "You are here. The duas and guides are ready when you need them." },
];

function phaseIndexForDays(daysOut) {
  if (daysOut > 90) return 0;
  if (daysOut > 30) return 1;
  if (daysOut > 7)  return 2;
  if (daysOut > 0)  return 3;
  return 4;
}

// ── Static test data (weekly framing + tasks remain hardcoded until Phase 3b) ──
const TEST_WEEKLY_FRAMING = "Start your visa application";
const TEST_TASKS = [
  { id: "visa",      label: "Book your visa appointment",       pillar: "plan"     },
  { id: "ihram",     label: "Read the guide to Ihram",          pillar: "learn"    },
  { id: "insurance", label: "Confirm your travel insurance",    pillar: "plan"     },
  { id: "niyyah",    label: "Memorize the intention (niyyah)",  pillar: "practice" },
];

export default function HomeCountdownCard({ navigation }) {
  const [tripDate, setTripDate] = React.useState(null);
  const [pilgrimageType, setPilgrimageType] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [draftDate, setDraftDate] = React.useState(new Date());
  const [draftType, setDraftType] = React.useState("umrah");

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [dateStr, typeStr] = await Promise.all([
          AsyncStorage.getItem("safar_departure_date_v1"),
          AsyncStorage.getItem("safar_journey_type_v1"),
        ]);
        if (cancelled) return;
        if (dateStr) setTripDate(dateStr);
        if (typeStr) setPilgrimageType(typeStr);
      } catch (e) {
        // If storage read fails, treat as no trip set
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const hasDate = tripDate !== null && (pilgrimageType === "umrah" || pilgrimageType === "hajj");
  const pilgrimageLabel = pilgrimageType === "hajj" ? "Hajj" : "Umrah";

  let daysOut = 0;
  if (hasDate) {
    const now = new Date();
    const trip = new Date(tripDate);
    const ms = trip.getTime() - now.getTime();
    daysOut = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  const formattedDate = hasDate
    ? new Date(tripDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  const [checked, setChecked] = React.useState({});

  const toggleCheck = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const openPillarTab = (pillar) => {
    const tabMap = { plan: "Plan", learn: "Learn", practice: "Practice", connect: "Connect" };
    const targetTab = tabMap[pillar];
    if (targetTab) {
      navigation?.getParent?.()?.navigate?.(targetTab);
    }
  };

  const openTripModal = () => {
    setDraftDate(tripDate ? new Date(tripDate) : new Date());
    setDraftType(pilgrimageType || "umrah");
    setModalOpen(true);
  };

  const saveTripModal = async () => {
    try {
      await AsyncStorage.setItem("safar_departure_date_v1", draftDate.toISOString());
      await AsyncStorage.setItem("safar_journey_type_v1", draftType);
      setTripDate(draftDate.toISOString());
      setPilgrimageType(draftType);
      setModalOpen(false);
    } catch (e) {
      // Save failed silently
    }
  };

  const cancelTripModal = () => {
    setModalOpen(false);
  };

  if (!loaded) return null;

  const phaseIdx = hasDate ? phaseIndexForDays(daysOut) : 0;
  const phase = PHASES[phaseIdx];

  return (
    <>
      {hasDate ? (
        <View style={s.wrap}>
          {/* ─── CARD 1: PHASE HEADER ─── */}
          <View style={s.headerCard}>
            <View style={s.topRow}>
              <View style={s.eyebrowPill}>
                <Text style={s.eyebrowText}>YOUR JOURNEY</Text>
              </View>
              <View style={s.phaseTagBox}>
                <Text style={s.phaseTagText}>Phase {phaseIdx + 1} of 5</Text>
              </View>
            </View>

            <Text style={s.phaseName}>{phase.fullLabel}</Text>
            <Text style={s.phaseDescription}>{phase.description}</Text>

            <View style={s.middleRow}>
              <View style={s.daysBoxColumn}>
                <Text style={s.departureLine}>Departure · {formattedDate}</Text>
                <TouchableOpacity
                  style={s.daysBox}
                  onPress={openTripModal}
                  activeOpacity={0.85}
                >
                  <View style={s.daysIconWrap}>
                    <CalendarBlank size={36} color="#C8A96A" weight="regular" />
                  </View>
                  <Text style={s.daysNum}>{daysOut}</Text>
                  <View style={s.daysLabelStack}>
                    <Text style={s.daysLabel}>days until</Text>
                    <Text style={s.daysLabel}>your {pilgrimageLabel}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={s.kaabaWrap} pointerEvents="none">
                <Image source={require("../assets/kaaba_framed.png")} style={s.kaabaImage} resizeMode="contain" />
              </View>
            </View>

            <View style={s.timelineRow}>
              {PHASES.map((p, i) => (
                <View key={p.key} style={s.timelineCell}>
                  <View style={[s.timelineDot, i === phaseIdx && s.timelineDotActive, i < phaseIdx && s.timelineDotPast]} />
                  <Text style={[s.timelineLabel, i === phaseIdx && s.timelineLabelActive]}>{p.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ─── CARD 2: CHECKLIST MECHANIC ─── */}
          <View style={s.checklistCard}>
            <View style={s.checklistHeaderStrip}>
              <View style={s.checklistTopRow}>
                <View style={s.checklistLabelGroup}>
                  <Text style={s.thisWeekLabel}>This week</Text>
                  <Text style={s.thisWeekSub}>Things to focus on</Text>
                </View>
                <TouchableOpacity
                  style={s.viewAllBtn}
                  onPress={() => navigation?.getParent?.()?.navigate?.("Plan", { screen: "Checklists" })}
                  activeOpacity={0.7}
                >
                  <Text style={s.viewAllText}>View all</Text>
                  <CaretRight size={14} color="#5C534A" weight="regular" />
                </TouchableOpacity>
              </View>
              <Text style={s.thisWeekFraming}>{TEST_WEEKLY_FRAMING}</Text>
            </View>
            <View style={s.checklistBody}>
              {TEST_TASKS.map((task) => {
                const isChecked = !!checked[task.id];
                return (
                  <TouchableOpacity
                    key={task.id}
                    style={s.taskRow}
                    onPress={() => openPillarTab(task.pillar)}
                    activeOpacity={0.8}
                  >
                    <TouchableOpacity
                      style={[s.checkbox, isChecked && s.checkboxChecked]}
                      onPress={(e) => { e.stopPropagation && e.stopPropagation(); toggleCheck(task.id); }}
                      activeOpacity={0.7}
                    >
                      {isChecked ? <Text style={s.checkboxCheck}>{"✓"}</Text> : null}
                    </TouchableOpacity>

                    <View style={[s.pillarDot, { backgroundColor: PILLAR_COLORS[task.pillar] }]} />
                    <Text style={[s.taskLabel, isChecked && s.taskLabelChecked]}>{task.label}</Text>
                    <CaretRight size={16} color="#8A7D6A" weight="regular" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={s.inviteCard}
          onPress={openTripModal}
          activeOpacity={0.85}
        >
          <View style={s.inviteTopRow}>
            <View style={s.inviteContent}>
              <Text style={s.inviteEyebrow}>GET STARTED</Text>
              <Text style={s.inviteHeadline}>{"Ready to plan your\nHajj or Umrah?"}</Text>
              <Text style={s.inviteSub}>Add your trip details for a personalized preparation timeline, tips, and reminders.</Text>
            </View>
            <View style={s.inviteKaabaWrap}>
              <Image source={require("../assets/kaaba_framed.png")} style={s.inviteKaabaImage} resizeMode="contain" />
            </View>
          </View>
          <View style={s.inviteArrowWrap}>
            <CaretRight size={20} color="#C8A96A" weight="regular" />
          </View>
        </TouchableOpacity>
      )}

      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={cancelTripModal}
      >
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Trip Details</Text>
            <Text style={s.modalSub}>Set your pilgrimage type and departure date.</Text>

            <View style={s.segmentedControl}>
              <TouchableOpacity
                style={[s.segment, draftType === "umrah" ? s.segmentActive : null]}
                onPress={() => setDraftType("umrah")}
                activeOpacity={0.85}
              >
                <Text style={[s.segmentText, draftType === "umrah" ? s.segmentTextActive : null]}>Umrah</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.segment, draftType === "hajj" ? s.segmentActive : null]}
                onPress={() => setDraftType("hajj")}
                activeOpacity={0.85}
              >
                <Text style={[s.segmentText, draftType === "hajj" ? s.segmentTextActive : null]}>Hajj</Text>
              </TouchableOpacity>
            </View>

            <DateTimePicker
              value={draftDate}
              mode="date"
              display="spinner"
              onChange={(e, selected) => { if (selected) setDraftDate(selected); }}
              minimumDate={new Date()}
              style={s.datePicker}
              textColor="#1C1A14"
            />

            <TouchableOpacity
              style={s.modalImportRow}
              onPress={() => {
                setModalOpen(false);
                navigation?.navigate?.("SafarAssist");
              }}
              activeOpacity={0.85}
            >
              <View style={s.modalImportIconWrap}>
                <Sparkle size={25} color="#C8A96A" weight="regular" />
              </View>
              <View style={s.modalImportTextWrap}>
                <Text style={s.modalImportLabel}>Import your booking details</Text>
                <Text style={s.modalImportSub}>Quickly bring in your travel details from email, notes, or docs.</Text>
              </View>
              <CaretRight size={16} color="#C8A96A" weight="regular" />
            </TouchableOpacity>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={cancelTripModal} activeOpacity={0.85}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSave} onPress={saveTripModal} activeOpacity={0.85}>
                <Text style={s.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 12,
  },
  inviteCard: {
    backgroundColor: "#4A5C48",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4A5C48",
    padding: 20,
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 12,
  },
  inviteTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inviteContent: {
    flex: 1,
    marginRight: 8,
  },
  inviteKaabaWrap: {
    marginLeft: 8,
    marginRight: 14,
    marginTop: -15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inviteKaabaImage: {
    width: 108,
    height: 108,
  },
  inviteArrowWrap: {
    position: "absolute",
    right: 16,
    bottom: 14,
  },
  inviteEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#C8A96A",
    marginBottom: 8,
  },
  inviteHeadline: {
    fontFamily: SERIF,
    fontSize: 22,
    color: "#FDFAF4",
    lineHeight: 28,
    marginBottom: 8,
  },
  inviteSub: {
    fontSize: 13,
    color: "rgba(253,250,244,0.75)",
    lineHeight: 19,
  },
  headerCard: {
    backgroundColor: "#4A5C48",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4A5C48",
    padding: 20,
    marginBottom: 10,
    position: "relative",
    overflow: "hidden",
  },
  eyebrowPill: {
    alignSelf: "center",
  },
  eyebrowText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#C8A96A",
  },
  phaseName: {
    fontFamily: SERIF,
    fontSize: 28,
    color: "#FDFAF4",
    marginBottom: 4,
    lineHeight: 34,
  },
  phaseDescription: {
    fontSize: 14,
    color: "rgba(253,250,244,0.85)",
    lineHeight: 19,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  kaabaWrap: {
    marginLeft: -2,
    marginRight: 18,
    marginBottom: -2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  kaabaImage: {
    width: 114,
    height: 114,
  },
  daysBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C8A96A",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.10)",
    flex: 0,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  daysIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  daysNum: {
    fontFamily: SERIF,
    fontSize: 48,
    color: "#FDFAF4",
    fontWeight: "600",
    marginRight: 9,
  },
  daysLabel: {
    fontSize: 14,
    color: "rgba(253,250,244,0.75)",
    marginTop: 0,
  },
  daysLabelStack: {
    justifyContent: "center",
  },
  phaseTagBox: {
    backgroundColor: "rgba(253,250,244,0.15)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  phaseTagText: {
    fontSize: 12,
    color: "#C8A96A",
    fontWeight: "600",
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(200,169,106,0.3)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(200,169,106,0.3)",
  },
  timelineCell: {
    alignItems: "center",
    flex: 1,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(200,169,106,0.4)",
    marginBottom: 6,
  },
  timelineDotActive: {
    backgroundColor: "#C8A96A",
    borderColor: "#C8A96A",
  },
  timelineDotPast: {
    backgroundColor: "transparent",
    borderColor: "#C8A96A",
    opacity: 0.7,
  },
  timelineLabel: {
    fontSize: 10,
    color: "rgba(253,250,244,0.6)",
    textAlign: "center",
  },
  timelineLabelActive: {
    color: "#C8A96A",
    fontWeight: "600",
  },
  checklistCard: {
    backgroundColor: "#FDFAF4",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0D8CC",
    paddingBottom: 5,
    overflow: "hidden",
  },
  checklistHeaderStrip: {
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  checklistTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  checklistLabelGroup: {
    flex: 1,
  },
  checklistBody: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  thisWeekLabel: {
    fontSize: 12,
    color: "#C8A96A",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  thisWeekFraming: {
    fontFamily: SERIF,
    fontSize: 20,
    color: "#1C1A14",
    lineHeight: 26,
    marginBottom: 2,
  },
  thisWeekSub: {
    fontSize: 13,
    color: "#5C534A",
    marginTop: 0,
    marginBottom: 4,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDFAF4",
    borderWidth: 1,
    borderColor: "#E0D8CC",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 12,
    color: "#5C534A",
    fontWeight: "500",
    marginRight: 4,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0EBE1",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#C8BFB2",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDFAF4",
  },
  checkboxChecked: {
    backgroundColor: "#2D4F32",
    borderColor: "#2D4F32",
  },
  checkboxCheck: {
    color: "#FDFAF4",
    fontSize: 14,
    fontWeight: "700",
  },
  pillarDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  taskLabel: {
    flex: 1,
    fontSize: 15,
    color: "#1C1A14",
    marginRight: 8,
  },
  taskLabelChecked: {
    color: "#8A7D6A",
    textDecorationLine: "line-through",
  },
  daysBoxColumn: {
    flexDirection: "column",
  },
  departureLine: {
    fontSize: 11,
    color: "rgba(253,250,244,0.6)",
    marginBottom: 9,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#FDFAF4",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 380,
  },
  modalTitle: {
    fontFamily: SERIF,
    fontSize: 24,
    color: "#1C1A14",
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 14,
    color: "#5C534A",
    marginBottom: 20,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#F0EBE1",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: "#4A5C48",
  },
  segmentText: {
    fontSize: 15,
    color: "#5C534A",
    fontWeight: "500",
  },
  segmentTextActive: {
    color: "#FDFAF4",
    fontWeight: "600",
  },
  datePicker: {
    height: 200,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalCancel: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F0EBE1",
  },
  modalCancelText: {
    fontSize: 15,
    color: "#5C534A",
    fontWeight: "500",
  },
  modalSave: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#4A5C48",
  },
  modalSaveText: {
    fontSize: 15,
    color: "#FDFAF4",
    fontWeight: "600",
  },
  modalImportRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A5C48",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C8A96A",
    padding: 19,
    marginBottom: 28,
  },
  modalImportIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(253,250,244,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalImportTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  modalImportLabel: {
    fontSize: 15,
    color: "#FDFAF4",
    fontWeight: "500",
    marginBottom: 2,
  },
  modalImportSub: {
    fontSize: 12,
    color: "rgba(253,250,244,0.75)",
    lineHeight: 16,
  },
});
