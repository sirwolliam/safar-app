/**
 * PillarList.jsx — Safar
 * Shared component rendering the four pillars (Learn, Practice, Plan, Connect)
 * with pillar-identity colors, gold Phosphor icons, and one-line descriptions.
 * Used by PillarIntroScreen (onboarding) and HomeScreen's AboutModal.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Books, Heartbeat, ClipboardText, UsersThree } from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";

const PILLARS = [
  { id: "learn",    name: "Learn",    desc: "Understand every step before you go — at your own pace.",                    bg: "#446655", Icon: Books        },
  { id: "practice", name: "Practice", desc: "Rehearse each step and keep your remembrance — calm and guided.",            bg: "#66572E", Icon: Heartbeat    },
  { id: "plan",     name: "Plan",     desc: "Get everything ready — documents, packing, contacts, money.",                bg: "#445870", Icon: ClipboardText },
  { id: "connect",  name: "Connect",  desc: "Stay close to your group and share the journey with those you love.",        bg: "#584260", Icon: UsersThree   },
];

export default function PillarList({ showFooterNote = true }) {
  return (
    <View>
      <View style={s.pillars}>
        {PILLARS.map((pillar) => (
          <View key={pillar.id} style={[s.pillarRow, { backgroundColor: pillar.bg }]}>
            <View style={s.iconBadge}>
              <pillar.Icon size={22} color="#C8A96A" weight="regular" />
            </View>
            <View style={s.pillarText}>
              <Text style={s.pillarName}>{pillar.name}</Text>
              <Text style={s.pillarDesc}>{pillar.desc}</Text>
            </View>
          </View>
        ))}
      </View>
      {showFooterNote ? (
        <Text style={s.note}>{"Duas live at the center of every tab — always one tap away."}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  pillars:    { gap: 10 },
  pillarRow:  { flexDirection: "row", alignItems: "center", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18 },
  iconBadge:  { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginRight: 16, flexShrink: 0, backgroundColor: "rgba(255,255,255,0.15)" },
  pillarText: { flex: 1 },
  pillarName: { fontFamily: SERIF, fontSize: 17, color: "#FFFFFF", marginBottom: 4 },
  pillarDesc: { fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 18 },
  note:       { fontSize: 13, color: "#5C534A", lineHeight: 20, textAlign: "center", paddingHorizontal: 8, marginTop: 20 },
});
