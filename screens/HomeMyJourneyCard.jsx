import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, NotePencil } from "phosphor-react-native";

// Parked 2026-09-27 — removed from HomeScreen, kept for reuse on another screen.
// Not imported anywhere yet. Moved verbatim from HomeScreen.jsx's inline "MY JOURNEY" card;
// the only change is that daysAway / onEditTrip come in as props instead of HomeScreen state.
export default function HomeMyJourneyCard({ navigation, daysAway = null, onEditTrip }) {
  return (
    <View style={s.journeyCard}>
      <View style={s.journeyCardImg}>
        <Image
          source={require("../assets/myboard.jpg")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
          }}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(42,31,14,0.95)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFillObject, {
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
          }]}
        />
        <View style={s.journeyCardOverlay}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Text style={[s.journeyCardEyebrow, { marginBottom: 0, flex: 1 }]}>MY JOURNEY</Text>
              <TouchableOpacity
                onPress={onEditTrip}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.75}
              >
                <NotePencil size={15} color="rgba(200,169,106,0.90)" weight="regular" />
              </TouchableOpacity>
            </View>
            <Text style={s.journeyCardTitle}>
              {daysAway !== null
                ? `${daysAway} days until departure`
                : "Plan your pilgrimage"}
            </Text>
            <Text style={s.journeyCardSub}>
              Track your preparation, notes, checklists, and contacts in one place.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={s.cardCornerBtn}
          onPress={() => navigation?.getParent?.()?.navigate?.("Plan", { screen: "MyBoard", initial: false, params: { returnToTab: "Home" } })}
          activeOpacity={0.85}
        >
          <ArrowRight size={16} color="#FFFFFF" weight="regular" />
        </TouchableOpacity>
      </View>

      {/* Quick links row */}
      <View style={s.journeyLinks}>
        {[
          { label:"Board",     onPress: () => navigation?.getParent?.()?.navigate?.("Plan",    { screen: "MyBoard",    initial: false, params: { returnToTab: "Home" } }) },
          { label:"Checklist", onPress: () => navigation?.getParent?.()?.navigate?.("Plan",    { screen: "Checklists", initial: false, params: { returnToTab: "Home" } }) },
          { label:"Contacts",  onPress: () => navigation?.getParent?.()?.navigate?.("Connect", { screen: "MyContacts", initial: false, params: { returnToTab: "Home" } }) },
          { label:"Groups",    onPress: () => navigation?.getParent?.()?.navigate?.("Connect", { screen: "Groups",     initial: false, params: { returnToTab: "Home" } }) },
        ].map((item, i, arr) => (
          <React.Fragment key={item.label}>
            <TouchableOpacity
              style={s.journeyLink}
              onPress={item.onPress}
              activeOpacity={0.75}
            >
              <Text style={s.journeyLinkTxt}>{item.label}</Text>
            </TouchableOpacity>
            {i < arr.length - 1 ? <View style={s.journeyLinkDiv} /> : null}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  // Vertical margins dropped — the host screen's card stack owns spacing.
  journeyCard: {
    marginHorizontal: 14,
    backgroundColor: "rgba(42,31,14,0.35)",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#2A1F0E",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  journeyCardImg: {
    height: 150,
    overflow: "hidden",
  },
  journeyCardOverlay: {
    position: "absolute",
    bottom: 14,
    left: 22,
    right: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  journeyCardEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(200,169,106,0.90)",
    letterSpacing: 1.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  journeyCardTitle: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "400",
    lineHeight: 28,
    marginBottom: 4,
  },
  journeyCardSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.88)",
    lineHeight: 20,
    fontWeight: "400",
    marginTop: 0,
    marginBottom: 0,
  },
  cardCornerBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4A5C48",
    alignItems: "center",
    justifyContent: "center",
  },
  journeyLinks: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(253,250,244,0.30)",
    paddingVertical: 14,
  },
  journeyLink: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  journeyLinkTxt: {
    fontSize: 13,
    color: "#FDFAF4",
    fontWeight: "600",
  },
  journeyLinkDiv: {
    width: 1,
    backgroundColor: "rgba(253,250,244,0.30)",
    marginVertical: 8,
  },
});
