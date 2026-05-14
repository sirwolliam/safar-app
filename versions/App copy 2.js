/**
 * App.js — Safar
 * Tabs: Home · Journey · Focus · Duas · Prepare
 */
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { NavigationContainer }        from "@react-navigation/native";
import { createBottomTabNavigator }   from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts }                   from "expo-font";
import { House, Compass, Moon, BookOpen, ListChecks } from "phosphor-react-native";

import HomeScreen    from "./screens/HomeScreen";
import JourneyScreen from "./screens/JourneyScreen";
import MapScreen     from "./screens/MapScreen";
import MyDuasScreen  from "./screens/MyDuasScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SupportScreen from "./screens/SupportScreen";
import FocusScreen   from "./screens/FocusScreen";

import { AccessibilityProvider } from "./AccessibilityContext";
import { colors, spacing, shadows, radius, typography } from "./theme";

const SERIF = "SourceSerif4-Regular";
const ICON_INACTIVE = "#8A7E6A";
const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Placeholder screens with back navigation ──────────────────────────────────
function BackScreen({ title, sub, navigation }) {
  return (
    <View style={ph.safe}>
      <TouchableOpacity style={ph.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Text style={ph.backArrow}>{"\u2039"}</Text>
        <Text style={ph.backLabel}>Back</Text>
      </TouchableOpacity>
      <Text style={ph.title}>{title}</Text>
      {sub && <Text style={ph.sub}>{sub}</Text>}
    </View>
  );
}

function GroupsScreen({ navigation }) {
  return (
    <View style={ph.safe}>
      <TouchableOpacity style={ph.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Text style={ph.backArrow}>{"\u2039"}</Text>
        <Text style={ph.backLabel}>My Journey</Text>
      </TouchableOpacity>
      <Text style={ph.title}>Groups</Text>
      <Text style={ph.sub}>Your pilgrimage group — coming soon</Text>
    </View>
  );
}
function SettingsScreen({ navigation }) {
  return (
    <View style={ph.safe}>
      <TouchableOpacity style={ph.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Text style={ph.backArrow}>{"\u2039"}</Text>
        <Text style={ph.backLabel}>Back</Text>
      </TouchableOpacity>
      <Text style={ph.title}>Settings</Text>
      <TouchableOpacity style={ph.row} onPress={() => navigation.navigate("Support")}>
        <Text style={ph.rowText}>Help & Support</Text>
        <Text style={ph.rowArrow}>{"\u203a"}</Text>
      </TouchableOpacity>
    </View>
  );
}
function SiteDuasScreen({ route, navigation }) {
  const site = route?.params?.site;
  return (
    <View style={ph.safe}>
      <TouchableOpacity style={ph.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Text style={ph.backArrow}>{"\u2039"}</Text>
        <Text style={ph.backLabel}>Sacred Places</Text>
      </TouchableOpacity>
      <Text style={ph.title}>{site?.name ?? "Duas"}</Text>
      <Text style={ph.sub}>{site?.subtitle}</Text>
    </View>
  );
}
function StepGuideScreen({ route, navigation }) {
  const { mode, steps, completed } = route?.params ?? {};
  return (
    <View style={ph.safe}>
      <TouchableOpacity style={ph.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Text style={ph.backArrow}>{"\u2039"}</Text>
        <Text style={ph.backLabel}>My Journey</Text>
      </TouchableOpacity>
      <Text style={ph.title}>Step-by-step Guide</Text>
      <Text style={ph.sub}>{steps} steps · {completed} completed</Text>
    </View>
  );
}
function PracticeLearnScreen({ navigation }) {
  return (
    <View style={ph.safe}>
      <TouchableOpacity style={ph.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Text style={ph.backArrow}>{"\u2039"}</Text>
        <Text style={ph.backLabel}>Back</Text>
      </TouchableOpacity>
      <Text style={ph.title}>Practice & Learn</Text>
      <Text style={ph.sub}>Audio, repeat, and recite — coming soon</Text>
    </View>
  );
}
function CurrencyConverterScreen({ navigation }) {
  return <BackScreen title="Currency Converter" sub="SAR to your home currency" navigation={navigation} />;
}
function PrintOfflineScreen({ navigation }) {
  return <BackScreen title="Save for Offline" sub="All duas work without internet" navigation={navigation} />;
}
function BookmarksScreen({ navigation }) {
  return <BackScreen title="Bookmarks" sub="Your saved duas" navigation={navigation} />;
}
function NotesScreen({ navigation }) {
  return <BackScreen title="Notes" sub="Personal reflections" navigation={navigation} />;
}

const ph = StyleSheet.create({
  safe:     { flex:1, backgroundColor:colors.background, paddingTop:spacing(6) },
  backBtn:  { flexDirection:"row", alignItems:"center", gap:spacing(0.5), paddingHorizontal:spacing(2.5), paddingBottom:spacing(2) },
  backArrow:{ fontSize:26, color:colors.primary, lineHeight:30 },
  backLabel:{ fontSize:typography.body, color:colors.primary, fontWeight:"500" },
  title:    { fontFamily:SERIF, fontSize:26, fontWeight:"400", color:colors.text, paddingHorizontal:spacing(2.5), marginBottom:spacing(1) },
  sub:      { fontSize:14, color:colors.subtext, fontWeight:"300", paddingHorizontal:spacing(2.5) },
  row:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingVertical:spacing(2), paddingHorizontal:spacing(2.5), borderBottomWidth:1, borderBottomColor:colors.border, marginTop:spacing(2) },
  rowText:  { fontFamily:SERIF, fontSize:16, color:colors.text },
  rowArrow: { fontSize:20, color:colors.subtext },
});

// ── Tab config ────────────────────────────────────────────────────────────────
const TAB_CONFIG = {
  Home:    { Icon: House,      label: "Home"    },
  Journey: { Icon: Compass,    label: "Journey" },
  Focus:   { Icon: Moon,       label: "Focus",  center: true },
  Duas:    { Icon: BookOpen,   label: "Duas"    },
  Prepare: { Icon: ListChecks, label: "Prepare" },
};

function SafarTabBar({ state, descriptors, navigation }) {
  return (
    <View style={tb.bar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { Icon, label, center } = TAB_CONFIG[route.name] ?? { Icon: House, label: route.name };
        const onPress = () => {
          const event = navigation.emit({ type:"tabPress", target:route.key, canPreventDefault:true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        if (center) {
          return (
            <TouchableOpacity key={route.key} style={tb.centerTab} onPress={onPress} activeOpacity={0.85}>
              <View style={[tb.centerBtn, focused && tb.centerBtnActive]}>
                <Icon size={26} color={colors.card} weight="fill" />
              </View>
              <Text style={[tb.label, focused && tb.labelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity key={route.key} style={tb.tab} onPress={onPress} activeOpacity={0.7}>
            <Icon size={22} color={focused ? colors.primary : ICON_INACTIVE} weight={focused ? "fill" : "regular"} />
            <Text style={[tb.label, focused && tb.labelActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tb = StyleSheet.create({
  bar: { flexDirection:"row", backgroundColor:colors.card, borderTopWidth:1, borderTopColor:colors.border, paddingBottom:Platform.OS==="ios"?28:12, paddingTop:10, height:Platform.OS==="ios"?88:72, alignItems:"flex-end", ...shadows.card },
  tab:             { flex:1, alignItems:"center", justifyContent:"flex-end", paddingBottom:2, gap:4 },
  label:           { fontSize:10, color:ICON_INACTIVE, fontWeight:"400" },
  labelActive:     { color:colors.primary, fontWeight:"600" },
  centerTab:       { flex:1, alignItems:"center", justifyContent:"flex-end", paddingBottom:2, gap:4 },
  centerBtn:       { width:56, height:56, borderRadius:28, backgroundColor:ICON_INACTIVE, alignItems:"center", justifyContent:"center", marginBottom:4, shadowColor:"#000", shadowOffset:{width:0,height:4}, shadowOpacity:0.22, shadowRadius:8, elevation:8 },
  centerBtnActive: { backgroundColor:colors.primary },
});

function MainTabs() {
  return (
    <Tab.Navigator tabBar={props => <SafarTabBar {...props} />} screenOptions={{ headerShown:false }}>
      <Tab.Screen name="Home"    component={HomeScreen}    />
      <Tab.Screen name="Journey" component={JourneyScreen} />
      <Tab.Screen name="Focus"   component={FocusScreen}   />
      <Tab.Screen name="Duas"    component={MyDuasScreen}  />
      <Tab.Screen name="Prepare" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    "SourceSerif4-Regular": require("./assets/fonts/SourceSerif4-Regular.ttf"),
  });
  if (!fontsLoaded) return null;

  return (
    <AccessibilityProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown:false }}>
          <Stack.Screen name="MainTabs"          component={MainTabs}             />
          <Stack.Screen name="Support"           component={SupportScreen}        />
          <Stack.Screen name="Settings"          component={SettingsScreen}       />
          <Stack.Screen name="SiteDuas"          component={SiteDuasScreen}       />
          <Stack.Screen name="Map"               component={MapScreen}            />
          <Stack.Screen name="Groups"            component={GroupsScreen}         />
          <Stack.Screen name="StepGuide"         component={StepGuideScreen}      />
          <Stack.Screen name="PracticeLearn"     component={PracticeLearnScreen}  />
          <Stack.Screen name="CurrencyConverter" component={CurrencyConverterScreen} />
          <Stack.Screen name="PrintOffline"      component={PrintOfflineScreen}   />
          <Stack.Screen name="Bookmarks"         component={BookmarksScreen}      />
          <Stack.Screen name="Notes"             component={NotesScreen}          />
        </Stack.Navigator>
      </NavigationContainer>
    </AccessibilityProvider>
  );
}
