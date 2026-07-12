/**
 * App.js — Safar
 * Tabs: Home · Journey · Duas · Tools · Prepare
 */
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer }        from "@react-navigation/native";
import { createBottomTabNavigator }   from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts }                   from "expo-font";
import { House, Compass, Moon, Wrench, ListChecks } from "phosphor-react-native";

// ── Tab screens ───────────────────────────────────────────────────────────────
import HomeScreen    from "./screens/HomeScreen";
import JourneyScreen from "./screens/JourneyScreen";
import MapScreen     from "./screens/MapScreen";
import MyDuasScreen  from "./screens/MyDuasScreen";
import ProfileScreen from "./screens/ProfileScreen";

// ── Stack screens (pushed on top) ─────────────────────────────────────────────
import SupportScreen       from "./screens/SupportScreen";
import SettingsScreen      from "./screens/SettingsScreen";
import BookmarksScreen     from "./screens/BookmarksScreen";
import NotesScreen         from "./screens/NotesScreen";
import PracticeLearnScreen from "./screens/PracticeLearnScreen";
import DuaDetailScreen     from "./screens/DuaDetailScreen";
import CurrencyScreen      from "./screens/CurrencyScreen";
import PrintOfflineScreen  from "./screens/PrintOfflineScreen";
import GroupsScreen        from "./screens/GroupsScreen";
import HubScreen           from "./screens/HubScreen";
import TawafScreen         from "./screens/TawafScreen";
import SaiyScreen          from "./screens/SaiyScreen";
import DhikrScreen         from "./screens/DhikrScreen";
import UmrahGuideScreen    from "./screens/UmrahGuideScreen";
import HajjGuideScreen     from "./screens/HajjGuideScreen";
import GroupDetailScreen   from "./screens/GroupDetailScreen";
import ConnectionsScreen   from "./screens/ConnectionsScreen";
import WhatToExpectScreen  from "./screens/WhatToExpectScreen";
import MyBoardScreen       from "./screens/MyBoardScreen";
import DuaListScreen       from "./screens/DuaListScreen";
import MyContactsScreen    from "./screens/MyContactsScreen";
import ProgressScreen      from "./screens/ProgressScreen";
import OnboardingFlow      from "./screens/OnboardingFlow";
import ToolsScreen         from "./screens/ToolsScreen";
import GuidesHubScreen     from "./screens/GuidesHubScreen";
import ShopScreen          from "./screens/ShopScreen";
import MediaScreen         from "./screens/MediaScreen";
import PrayerTimesScreen   from "./screens/PrayerTimesScreen";
import QiblaScreen         from "./screens/QiblaScreen";
import PilgrimageDuasScreen from "./screens/PilgrimageDuasScreen";
import SafarAssistScreen   from "./screens/SafarAssistScreen";
import SacredPlacesScreen  from "./screens/SacredPlacesScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import PlanHubScreen       from "./screens/PlanHubScreen";
import LearnHubScreen      from "./screens/LearnHubScreen";
import PracticeHubScreen   from "./screens/PracticeHubScreen";
import ConnectHubScreen    from "./screens/ConnectHubScreen";
import HubContainerScreen  from "./screens/HubContainerScreen";

// ── Context ───────────────────────────────────────────────────────────────────
import { AccessibilityProvider } from "./AccessibilityContext";
import { ToastHost } from "./Toast";
import { colors, spacing, shadows, typography } from "./theme";

const SERIF = "SourceSerif4-Regular";
const ICON_INACTIVE = "#8A7E6A";
const Tab      = createBottomTabNavigator();
const Stack    = createNativeStackNavigator();
const DuasStack    = createNativeStackNavigator();
const HomeStack    = createNativeStackNavigator();
const JourneyStack = createNativeStackNavigator();
const PrepareStack = createNativeStackNavigator();
const ToolsStack   = createNativeStackNavigator();

// ── Placeholder screens with back nav ────────────────────────────────────────
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


const ph = StyleSheet.create({
  safe:      { flex:1, backgroundColor:colors.background, paddingTop:spacing(6) },
  backBtn:   { flexDirection:"row", alignItems:"center", gap:spacing(0.5), paddingHorizontal:spacing(2.5), paddingBottom:spacing(2) },
  backArrow: { fontSize:26, color:colors.primary, lineHeight:30 },
  backLabel: { fontSize:typography.body, color:colors.primary, fontWeight:"500" },
  title:     { fontFamily:SERIF, fontSize:26, fontWeight:"400", color:colors.text, paddingHorizontal:spacing(2.5), marginBottom:spacing(1) },
  sub:       { fontSize:14, color:colors.subtext, fontWeight:"300", paddingHorizontal:spacing(2.5), lineHeight:22 },
  row:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingVertical:spacing(2), paddingHorizontal:spacing(2.5), borderBottomWidth:1, borderBottomColor:colors.border, marginTop:spacing(2) },
  rowText:   { fontFamily:SERIF, fontSize:16, color:colors.text },
  rowArrow:  { fontSize:20, color:colors.subtext },
});

// ── Tab config ────────────────────────────────────────────────────────────────
const TAB_CONFIG = {
  Home:    { Icon: House,      label: "Home"    },
  Journey: { Icon: Compass,    label: "Journey" },
  Duas:    { Icon: Moon,       label: "Duas",   center: true },
  Tools:   { Icon: Wrench,     label: "Tools"   },
  Prepare: { Icon: ListChecks, label: "Prepare" },
};

function SafarTabBar({ state, descriptors, navigation }) {
  return (
    <View style={tb.bar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { Icon, label, center } = TAB_CONFIG[route.name] ?? { Icon: House, label: route.name };
        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        if (center) {
          return (
            <TouchableOpacity key={route.key} style={tb.centerTab} onPress={onPress} activeOpacity={0.85}>
              <View style={focused ? [tb.centerBtn, tb.centerBtnActive] : tb.centerBtn}>
                <Icon size={26} color={colors.card} weight="fill" />
              </View>
              <Text style={focused ? [tb.label, tb.labelActive] : tb.label}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity key={route.key} style={tb.tab} onPress={onPress} activeOpacity={0.7}>
            <Icon size={22} color={focused ? colors.primary : ICON_INACTIVE} weight={focused ? "fill" : "regular"} />
            <Text style={focused ? [tb.label, tb.labelActive] : tb.label}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tb = StyleSheet.create({
  bar:             { flexDirection:"row", backgroundColor:colors.card, borderTopWidth:1, borderTopColor:colors.border, paddingBottom:Platform.OS==="ios"?28:12, paddingTop:10, height:Platform.OS==="ios"?88:72, alignItems:"flex-end", ...shadows.card },
  tab:             { flex:1, alignItems:"center", justifyContent:"flex-end", paddingBottom:2, gap:4 },
  label:           { fontSize:10, color:ICON_INACTIVE, fontWeight:"400" },
  labelActive:     { color:colors.primary, fontWeight:"600" },
  centerTab:       { flex:1, alignItems:"center", justifyContent:"flex-end", paddingBottom:2, gap:4 },
  centerBtn:       { width:56, height:56, borderRadius:28, backgroundColor:ICON_INACTIVE, alignItems:"center", justifyContent:"center", marginBottom:4, shadowColor:"#000", shadowOffset:{width:0,height:4}, shadowOpacity:0.22, shadowRadius:8, elevation:8 },
  centerBtnActive: { backgroundColor:colors.primary },
});

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
      <HomeStack.Screen name="HomeMain"      component={HomeScreen}         />
      <HomeStack.Screen name="Hub"           component={HubScreen}          />
      <HomeStack.Screen name="PlanHub"       component={PlanHubScreen}      />
      <HomeStack.Screen name="LearnHub"      component={LearnHubScreen}     />
      <HomeStack.Screen name="PracticeHub"   component={PracticeHubScreen}  />
      <HomeStack.Screen name="ConnectHub"    component={ConnectHubScreen}   />
      <HomeStack.Screen name="HubContainer" component={HubContainerScreen}  />
      <HomeStack.Screen name="UmrahGuide"    component={UmrahGuideScreen}   />
      <HomeStack.Screen name="HajjGuide"     component={HajjGuideScreen}    />
      <HomeStack.Screen name="WhatToExpect"  component={WhatToExpectScreen} />
      <HomeStack.Screen name="Groups"       component={GroupsScreen}       />
      <HomeStack.Screen name="Guides"        component={GuidesHubScreen}    />
      <HomeStack.Screen name="Shop"          component={ShopScreen}         />
      <HomeStack.Screen name="Media"         component={MediaScreen}        />
      <HomeStack.Screen name="Notes"         component={NotesScreen}        />
      <HomeStack.Screen name="Settings"      component={SettingsScreen}     />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    </HomeStack.Navigator>
  );
}

function JourneyNavigator() {
  return (
    <JourneyStack.Navigator screenOptions={{ headerShown:false }}>
      <JourneyStack.Screen name="JourneyMain" component={JourneyScreen}      />
      <JourneyStack.Screen name="Map"         component={MapScreen}          />
      <JourneyStack.Screen name="SiteDuas"    component={SiteDuasScreen}     />
      <JourneyStack.Screen name="WhatToExpect" component={WhatToExpectScreen}/>
      <JourneyStack.Screen name="Groups"      component={GroupsScreen}       />
      <JourneyStack.Screen name="GroupDetail" component={GroupDetailScreen}  />
      <JourneyStack.Screen name="Connections" component={ConnectionsScreen}  />
      <JourneyStack.Screen name="MyBoard"     component={MyBoardScreen}      />
      <JourneyStack.Screen name="MyContacts"  component={MyContactsScreen}   />
      <JourneyStack.Screen name="Tawaf"       component={TawafScreen}        />
      <JourneyStack.Screen name="Saiy"        component={SaiyScreen}         />
    </JourneyStack.Navigator>
  );
}

function PrepareNavigator() {
  return (
    <PrepareStack.Navigator screenOptions={{ headerShown:false }}>
      <PrepareStack.Screen name="PrepareMain"       component={ProfileScreen}       />
      <PrepareStack.Screen name="Bookmarks"         component={BookmarksScreen}     />
      <PrepareStack.Screen name="Notes"             component={NotesScreen}         />
      <PrepareStack.Screen name="CurrencyConverter" component={CurrencyScreen}      />
      <PrepareStack.Screen name="Support"           component={SupportScreen}       />
      <PrepareStack.Screen name="Settings"          component={SettingsScreen}      />
      <PrepareStack.Screen name="WhatToExpect"      component={WhatToExpectScreen}  />
      <PrepareStack.Screen name="PrintOffline"      component={PrintOfflineScreen}  />
      <PrepareStack.Screen name="Media"             component={MediaScreen}         />
    </PrepareStack.Navigator>
  );
}

function DuasNavigator() {
  return (
    <DuasStack.Navigator screenOptions={{ headerShown:false }}>
      <DuasStack.Screen name="MyDuas"  component={MyDuasScreen}  />
      <DuasStack.Screen name="DuaList" component={DuaListScreen} />
      <DuasStack.Screen name="Dhikr"   component={DhikrScreen}   />
    </DuasStack.Navigator>
  );
}

function ToolsNavigator() {
  return (
    <ToolsStack.Navigator screenOptions={{ headerShown:false }}>
      <ToolsStack.Screen name="ToolsMain"         component={ToolsScreen}        />
      <ToolsStack.Screen name="PrayerTimes"       component={PrayerTimesScreen}  />
      <ToolsStack.Screen name="Qibla"             component={QiblaScreen}        />
      <ToolsStack.Screen name="CurrencyConverter" component={CurrencyScreen}     />
      <ToolsStack.Screen name="Tawaf"             component={TawafScreen}        />
      <ToolsStack.Screen name="Saiy"              component={SaiyScreen}         />
      <ToolsStack.Screen name="Dhikr"             component={DhikrScreen}        />
      <ToolsStack.Screen name="PracticeLearn"     component={PracticeLearnScreen}/>
      <ToolsStack.Screen name="Notes"             component={NotesScreen}        />
      <ToolsStack.Screen name="Bookmarks"         component={BookmarksScreen}    />
    </ToolsStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator tabBar={(props) => (
      <SafarTabBar {...props} />
    )} screenOptions={{ headerShown:false }}>
      <Tab.Screen name="Home"    component={HomeNavigator}    />
      <Tab.Screen name="Journey" component={JourneyNavigator} />
      <Tab.Screen name="Duas"    component={DuasNavigator}    />
      <Tab.Screen name="Tools"   component={ToolsNavigator}   />
      <Tab.Screen name="Prepare" component={PrepareNavigator} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    "SourceSerif4-Regular": require("./assets/fonts/SourceSerif4-Regular.ttf"),
  });

  // ── Onboarding gate ──
  // Read the persisted flag once on launch to decide the first screen.
  // null = still checking, "yes" = onboarded, "no" = needs onboarding.
  const [onboarded, setOnboarded] = React.useState(null);
  React.useEffect(() => {
    AsyncStorage.getItem("safar_onboarded_v1")
      .then((val) => setOnboarded(val === "true" ? "yes" : "no"))
      .catch(() => setOnboarded("no"));
  }, []);

  // Wait for both fonts and the flag before rendering, so we never flash
  // the wrong screen.
  if (!fontsLoaded || onboarded === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F0E8" }}>
        <ActivityIndicator size="large" color="#2F5D50" />
      </View>
    );
  }

  return (
    <AccessibilityProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown:false }}
          initialRouteName={onboarded === "yes" ? "MainTabs" : "Onboarding"}
        >
          <Stack.Screen name="Onboarding"     component={OnboardingFlow}      />
          <Stack.Screen name="MainTabs"      component={MainTabs}            />
          {/* ── Full-screen focused task screens — no tab bar ── */}
          {/* Users are mid-task: reciting, counting, learning, printing */}
          <Stack.Screen name="DuaDetail"          component={DuaDetailScreen}      />
          <Stack.Screen name="StepGuide"          component={ProgressScreen}       />
          <Stack.Screen name="PracticeLearn"      component={PracticeLearnScreen}  />
          <Stack.Screen name="PrintOffline"       component={PrintOfflineScreen}   />
          {/* ── Shared destinations reachable from multiple stacks ── */}
          <Stack.Screen name="PilgrimageDuas"     component={PilgrimageDuasScreen} />
          <Stack.Screen name="SafarAssist"        component={SafarAssistScreen}    />
          <Stack.Screen name="SacredPlaces"       component={SacredPlacesScreen}   />
        </Stack.Navigator>
        <ToastHost />
      </NavigationContainer>
    </AccessibilityProvider>
  );
}
