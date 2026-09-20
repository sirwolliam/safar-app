import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CalendarBlank, CaretRight } from "phosphor-react-native";
import { CHECKLIST_ITEMS, getChecklistProgress, setItemChecked } from "../checklistStore";
import { useFocusEffect } from "@react-navigation/native";
import { sharedCardStyles } from "./sharedCardStyles";

export default function HomePrioritiesCard({ navigation }) {
  const [tripDate, setTripDate] = React.useState(null);
  const [pilgrimageType, setPilgrimageType] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);
  const [activeTasks, setActiveTasks] = React.useState([]);

  const loadTrip = React.useCallback(async () => {
    try {
      const [dateStr, typeStr] = await Promise.all([
        AsyncStorage.getItem("safar_departure_date_v1"),
        AsyncStorage.getItem("safar_journey_type_v1"),
      ]);
      if (dateStr) setTripDate(dateStr);
      if (typeStr) setPilgrimageType(typeStr);
    } catch (e) {
      // If storage read fails, treat as no trip set
    } finally {
      setLoaded(true);
    }
  }, []);

  React.useEffect(() => { loadTrip(); }, [loadTrip]);
  useFocusEffect(React.useCallback(() => { loadTrip(); }, [loadTrip]));

  const hasDate = tripDate !== null && (pilgrimageType === "umrah" || pilgrimageType === "hajj");

  let daysOut = 0;
  if (hasDate) {
    const now = new Date();
    const trip = new Date(tripDate);
    const ms = trip.getTime() - now.getTime();
    daysOut = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  function buildActiveTasks(daysOut, checkedIds) {
    const flat = [];
    for (const categoryId of Object.keys(CHECKLIST_ITEMS)) {
      for (const item of CHECKLIST_ITEMS[categoryId].items) {
        flat.push({ ...item, categoryId, checked: checkedIds.has(item.id) });
      }
    }
    const unlocked = flat.filter((t) => t.daysOutThreshold >= daysOut).sort((a, b) => a.daysOutThreshold - b.daysOutThreshold);
    const locked = flat.filter((t) => t.daysOutThreshold < daysOut).sort((a, b) => b.daysOutThreshold - a.daysOutThreshold);
    const ordered = [...unlocked, ...locked];
    const unchecked = ordered.filter((t) => !t.checked);
    const checkedList = ordered.filter((t) => t.checked);
    return [...unchecked, ...checkedList].slice(0, 4);
  }

  useFocusEffect(
    React.useCallback(() => {
      if (!hasDate) return;
      let cancelled = false;
      (async () => {
        const categoryIds = Object.keys(CHECKLIST_ITEMS);
        const lists = await Promise.all(categoryIds.map((id) => getChecklistProgress(id)));
        const checkedIds = new Set(lists.flat());
        if (!cancelled) setActiveTasks(buildActiveTasks(daysOut, checkedIds));
      })();
      return () => { cancelled = true; };
    }, [hasDate, daysOut])
  );

  const toggleTaskChecked = (task) => {
    const next = !task.checked;
    setActiveTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, checked: next } : t)));
    setItemChecked(task.categoryId, task.id, next);
  };

  if (!loaded || !hasDate) return null;

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <View style={s.headerLeft}>
          <Text style={sharedCardStyles.eyebrowText}>YOUR PRIORITIES</Text>
          <Text style={s.headline}>{activeTasks.length} things to take care of</Text>
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

      <View style={s.grid}>
        {activeTasks.map((task) => {
          const isChecked = task.checked;
          return (
            <TouchableOpacity
              key={task.id}
              style={s.tile}
              onPress={() => navigation?.getParent?.()?.navigate?.("Plan", { screen: "ChecklistDetail", params: { categoryId: task.categoryId, itemId: task.id } })}
              activeOpacity={0.8}
            >
              <TouchableOpacity
                style={[s.checkbox, isChecked ? s.checkboxChecked : null]}
                onPress={(e) => { e.stopPropagation && e.stopPropagation(); toggleTaskChecked(task); }}
                activeOpacity={0.7}
              >
                {isChecked ? <Text style={s.checkboxCheck}>{"✓"}</Text> : null}
              </TouchableOpacity>

              <Text style={[s.taskLabel, isChecked ? s.taskLabelChecked : null]} numberOfLines={2}>
                {task.label}
              </Text>

              <CaretRight size={16} color="#8A7D6A" weight="regular" />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 8,
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 4,
    borderWidth: 1,
    borderColor: "rgba(200, 191, 178, 0.5)",
    borderRadius: 16,
    backgroundColor: "#F9F4E8",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  headline: {
    fontSize: 12,
    color: "#1C1A14",
    marginTop: 4,
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
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 12,
    color: "#5C534A",
    fontWeight: "500",
    marginRight: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    width: "49%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(200, 191, 178, 0.35)",
    backgroundColor: "rgba(122, 145, 118, 0.13)",
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#C8BFB2",
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
    fontSize: 12,
    fontWeight: "700",
  },
  taskLabel: {
    flex: 1,
    fontSize: 13,
    color: "#1C1A14",
    marginLeft: 5,
  },
  taskLabelChecked: {
    color: "#8A7D6A",
    textDecorationLine: "line-through",
  },
});
