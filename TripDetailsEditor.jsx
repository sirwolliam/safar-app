import React, { useState, useEffect } from "react";
import {
  Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const JOURNEY_KEY   = "safar_journey_type_v1";
const DEPARTURE_KEY = "safar_departure_date_v1";

const JOURNEY_TYPES = [
  { key: "umrah",  label: "Umrah"    },
  { key: "hajj",   label: "Hajj"     },
  { key: "learn",  label: "Learning" },
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export default function TripDetailsEditor({
  visible,
  onClose,
  initialJourneyType,
  initialDepartureDate,
  onSaved,
}) {
  const now         = new Date();
  const currentYear = now.getFullYear();
  const YEARS       = [currentYear, currentYear + 1, currentYear + 2];

  const [journeyType,   setJourneyType]   = useState("umrah");
  const [selectedYear,  setSelectedYear]  = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay,   setSelectedDay]   = useState(null);

  useEffect(() => {
    if (!visible) return;
    setJourneyType(initialJourneyType || "umrah");
    if (initialDepartureDate) {
      const [y, m, d] = initialDepartureDate.split("-").map(Number);
      setSelectedYear(Number.isFinite(y) ? y : currentYear);
      setSelectedMonth(Number.isFinite(m) && m >= 1 && m <= 12 ? m : null);
      setSelectedDay(Number.isFinite(d) && d >= 1 && d <= 31 ? d : null);
    } else {
      setSelectedYear(currentYear);
      setSelectedMonth(null);
      setSelectedDay(null);
    }
  }, [visible]);

  useEffect(() => {
    if (selectedMonth && selectedDay) {
      const max = daysInMonth(selectedYear, selectedMonth);
      if (selectedDay > max) setSelectedDay(max);
    }
  }, [selectedMonth, selectedYear]);

  const isLearn = journeyType === "learn";
  const canSave = isLearn || (selectedMonth !== null && selectedDay !== null);
  const dayCount = selectedMonth ? daysInMonth(selectedYear, selectedMonth) : 31;

  const selectedLabel = isLearn
    ? "No departure date needed"
    : selectedMonth !== null && Number.isFinite(selectedDay)
      ? `${MONTHS[selectedMonth - 1]} ${selectedDay}, ${selectedYear}`
      : "Select a departure date";

  async function handleSave() {
    await AsyncStorage.setItem(JOURNEY_KEY, journeyType);
    if (isLearn) {
      await AsyncStorage.removeItem(DEPARTURE_KEY);
      onSaved?.({ journeyType, departureISO: null });
    } else {
      const pm  = String(selectedMonth).padStart(2, "0");
      const pd  = String(selectedDay).padStart(2, "0");
      const iso = `${selectedYear}-${pm}-${pd}`;
      await AsyncStorage.setItem(DEPARTURE_KEY, iso);
      onSaved?.({ journeyType, departureISO: iso });
    }
    onClose?.();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={s.sheet} onStartShouldSetResponder={() => true}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.handle} />
            <Text style={s.title}>Trip Details</Text>

            <Text style={s.sectionLabel}>JOURNEY TYPE</Text>
            <View style={s.journeyRow}>
              {JOURNEY_TYPES.map((jt) => (
                <TouchableOpacity
                  key={jt.key}
                  style={journeyType === jt.key ? [s.journeyPill, s.journeyPillActive] : s.journeyPill}
                  onPress={() => setJourneyType(jt.key)}
                  activeOpacity={0.75}
                >
                  <Text style={journeyType === jt.key ? [s.journeyText, s.journeyTextActive] : s.journeyText}>
                    {jt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {isLearn ? null : (
              <>
                <Text style={s.sectionLabelSpaced}>DEPARTURE YEAR</Text>
                <View style={s.pillRow}>
                  {YEARS.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={selectedYear === y ? [s.pill, s.pillActive] : s.pill}
                      onPress={() => setSelectedYear(y)}
                      activeOpacity={0.75}
                    >
                      <Text style={selectedYear === y ? [s.pillText, s.pillTextActive] : s.pillText}>
                        {String(y)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={s.sectionLabel}>DEPARTURE MONTH</Text>
                <View style={s.monthGrid}>
                  {MONTHS.map((name, idx) => {
                    const m = idx + 1;
                    return (
                      <TouchableOpacity
                        key={m}
                        style={selectedMonth === m ? [s.monthCell, s.cellActive] : s.monthCell}
                        onPress={() => setSelectedMonth(m)}
                        activeOpacity={0.75}
                      >
                        <Text style={selectedMonth === m ? [s.monthText, s.cellTextActive] : s.monthText}>
                          {name.slice(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={s.sectionLabel}>DEPARTURE DAY</Text>
                <View style={s.dayGrid}>
                  {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={selectedDay === d ? [s.dayCell, s.cellActive] : s.dayCell}
                      onPress={() => setSelectedDay(d)}
                      activeOpacity={0.75}
                    >
                      <Text style={selectedDay === d ? [s.dayText, s.cellTextActive] : s.dayText}>
                        {String(d)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={s.selectedLabelWrap}>
              <Text style={s.selectedLabel}>{selectedLabel}</Text>
            </View>

            <TouchableOpacity
              style={canSave ? s.saveBtn : [s.saveBtn, s.saveBtnDisabled]}
              onPress={canSave ? handleSave : undefined}
              activeOpacity={canSave ? 0.85 : 1}
            >
              <Text style={s.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop:        { flex: 1, backgroundColor: "rgba(26,20,16,0.60)", justifyContent: "flex-end" },
  sheet:           { backgroundColor: "#FDFAF4", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingBottom: 40, maxHeight: "90%" },
  content:         { paddingHorizontal: 24, paddingBottom: 16 },
  handle:          { width: 36, height: 4, borderRadius: 2, backgroundColor: "#DDD5C0", alignSelf: "center", marginBottom: 20 },
  title:           { fontFamily: "SourceSerif4-Regular", fontSize: 22, color: "#1A1410", fontWeight: "600", marginBottom: 20 },
  sectionLabel:       { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: "#8A7D6A", textTransform: "uppercase", marginBottom: 10, marginTop: 4 },
  sectionLabelSpaced: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: "#8A7D6A", textTransform: "uppercase", marginBottom: 10, marginTop: 32 },

  journeyRow:        { flexDirection: "row", gap: 10, marginBottom: 6 },
  journeyPill:       { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: "#F0EBE1", borderWidth: 1, borderColor: "#DDD5C0" },
  journeyPillActive: { backgroundColor: "#4A5C48", borderWidth: 2, borderColor: "#C8A96A" },
  journeyText:       { fontSize: 13, fontWeight: "600", color: "#5C534A" },
  journeyTextActive: { fontSize: 16, fontWeight: "800", color: "#F5EFDD", letterSpacing: 0.3 },

  pillRow:         { flexDirection: "row", gap: 8, marginBottom: 20 },
  pill:            { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#F0EBE1", borderWidth: 1, borderColor: "#DDD5C0" },
  pillActive:      { backgroundColor: "#4A5C48", borderColor: "#4A5C48" },
  pillText:        { fontSize: 14, fontWeight: "600", color: "#5C534A" },
  pillTextActive:  { color: "#FFFFFF" },

  monthGrid:       { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  monthCell:       { width: "30%", flexGrow: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#F0EBE1", borderWidth: 1, borderColor: "#DDD5C0" },
  monthText:       { fontSize: 13, fontWeight: "600", color: "#5C534A" },

  dayGrid:         { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 20 },
  dayCell:         { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#F0EBE1", borderWidth: 1, borderColor: "#DDD5C0" },
  dayText:         { fontSize: 14, fontWeight: "600", color: "#5C534A" },

  cellActive:      { backgroundColor: "#4A5C48", borderColor: "#4A5C48" },
  cellTextActive:  { color: "#FFFFFF" },

  selectedLabelWrap: { backgroundColor: "#E2EDE6", borderRadius: 14, borderWidth: 1.5, borderColor: "#4A5C48", paddingVertical: 16, paddingHorizontal: 20, marginTop: 18, marginBottom: 20, alignItems: "center" },
  selectedLabel:   { fontFamily: "SourceSerif4-Regular", fontSize: 24, fontWeight: "700", color: "#1E3D30", textAlign: "center", letterSpacing: 0.3 },
  saveBtn:         { backgroundColor: "#1A1410", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  saveBtnDisabled: { opacity: 0.40 },
  saveBtnText:     { fontSize: 15, fontWeight: "600", color: "#C8A96A", letterSpacing: 0.3 },
});
