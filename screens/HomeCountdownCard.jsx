import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { CalendarBlank, CaretRight } from "phosphor-react-native";

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
  { key: "focused",  label: "Focused",     fullLabel: "Focused Preparation",   description: "A good stretch for learning the rites, memorizing key duas, and shaping your packing list." },
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

// ── Hardcoded test data (Phase 3b will replace with real reads from AsyncStorage + checklistStore) ──
const TEST_HAS_DATE = true;
const TEST_DAYS_OUT = 87;
const TEST_PILGRIMAGE_TYPE = "Umrah";
const TEST_WEEKLY_FRAMING = "Start your visa application";
const TEST_TASKS = [
  { id: "visa",      label: "Book your visa appointment",       pillar: "plan"     },
  { id: "ihram",     label: "Read the guide to Ihram",          pillar: "learn"    },
  { id: "insurance", label: "Confirm your travel insurance",    pillar: "plan"     },
  { id: "niyyah",    label: "Memorize the intention (niyyah)",  pillar: "practice" },
];

export default function HomeCountdownCard({ navigation }) {
  const hasDate = TEST_HAS_DATE;

  if (!hasDate) {
    return null;
  }

  const daysOut = TEST_DAYS_OUT;
  const phaseIdx = phaseIndexForDays(daysOut);
  const phase = PHASES[phaseIdx];
  const [checked, setChecked] = React.useState({});

  const toggleCheck = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const openPillarTab = (pillar) => {
    const tabMap = { plan: "Plan", learn: "Learn", practice: "Practice", connect: "Connect" };
    const targetTab = tabMap[pillar];
    if (targetTab) {
      navigation?.getParent?.()?.navigate?.(targetTab);
    }
  };

  return (
    <View style={s.wrap}>
      {/* ─── CARD 1: PHASE HEADER ─── */}
      <View style={s.headerCard}>
        <View style={s.eyebrowPill}>
          <Text style={s.eyebrowText}>YOUR JOURNEY</Text>
        </View>

        <Text style={s.phaseName}>{phase.fullLabel}</Text>
        <Text style={s.phaseDescription}>{phase.description}</Text>

        <View style={s.middleRow}>
          <View style={s.daysBox}>
            <View style={s.daysIconWrap}>
              <CalendarBlank size={36} color="#C8A96A" weight="regular" />
            </View>
            <Text style={s.daysNum}>{daysOut}</Text>
            <View style={s.daysLabelStack}>
              <Text style={s.daysLabel}>days until</Text>
              <Text style={s.daysLabel}>your {TEST_PILGRIMAGE_TYPE}</Text>
            </View>
          </View>

          <View style={s.phaseTagBox}>
            <Text style={s.phaseTagText}>Phase {phaseIdx + 1} of 5</Text>
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
          <Text style={s.thisWeekLabel}>This week</Text>
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
  );
}

const s = StyleSheet.create({
  wrap: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 12,
  },
  headerCard: {
    backgroundColor: "#4A5C48",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4A5C48",
    padding: 18,
    marginBottom: 10,
  },
  eyebrowPill: {
    alignSelf: "flex-start",
    marginBottom: 12,
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
    marginBottom: 8,
    lineHeight: 34,
  },
  phaseDescription: {
    fontSize: 14,
    color: "rgba(253,250,244,0.85)",
    lineHeight: 20,
    marginBottom: 16,
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  daysBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C8A96A",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(253,250,244,0.10)",
    flex: 0,
    marginRight: 12,
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
    backgroundColor: "#F5F0E8",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  timelineCell: {
    alignItems: "center",
    flex: 1,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#F5F0E8",
    borderWidth: 1.5,
    borderColor: "#8A7D6A",
    marginBottom: 6,
  },
  timelineDotActive: {
    backgroundColor: "#2D4F32",
    borderColor: "#2D4F32",
  },
  timelineDotPast: {
    backgroundColor: "#2D4F32",
    borderColor: "#2D4F32",
    opacity: 0.4,
  },
  timelineLabel: {
    fontSize: 10,
    color: "#8A7D6A",
    textAlign: "center",
  },
  timelineLabelActive: {
    color: "#2D4F32",
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
    backgroundColor: "#4A5C48",
    paddingHorizontal: 18,
    paddingVertical: 18,
    justifyContent: "center",
  },
  checklistBody: {
    paddingHorizontal: 18,
    paddingTop: 4,
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
    color: "#FDFAF4",
    lineHeight: 26,
    marginBottom: 16,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
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
});
