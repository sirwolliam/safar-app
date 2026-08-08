/**
 * App.js — Safar
 * Tabs: Home · Plan · Learn · Practice · Connect
 */
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import { createBottomTabNavigator }          from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator }        from "@react-navigation/native-stack";
import { useFonts }                   from "expo-font";
import { House, ListChecks, BookOpen, Moon, UsersThree } from "phosphor-react-native";

// ── Tab landing screens ───────────────────────────────────────────────────────
import HomeScreen        from "./screens/HomeScreen";
import PlanMainScreen    from "./screens/PlanMainScreen";
import LearnMainScreen   from "./screens/LearnMainScreen";
import PracticeMainScreen from "./screens/PracticeMainScreen";
import ConnectMainScreen from "./screens/ConnectMainScreen";

// ── Stack screens ─────────────────────────────────────────────────────────────
import MapScreen           from "./screens/MapScreen";
import MyDuasScreen        from "./screens/MyDuasScreen";
import SupportScreen       from "./screens/SupportScreen";
import SettingsScreen      from "./screens/SettingsScreen";
import { runBookmarkMigration } from "./bookmarkStore";
import NotesScreen         from "./screens/NotesScreen";
import PracticeLearnScreen from "./screens/PracticeLearnScreen";
import DuaDetailScreen     from "./screens/DuaDetailScreen";
import CurrencyScreen      from "./screens/CurrencyScreen";
import PrintOfflineScreen  from "./screens/PrintOfflineScreen";
import GroupsScreen        from "./screens/GroupsScreen";
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
import MoodsScreen         from "./screens/MoodsScreen";
import MyContactsScreen    from "./screens/MyContactsScreen";
import MomentsScreen       from "./screens/MomentsScreen";
import MomentCreatorScreen from "./screens/MomentCreatorScreen";
import ProgressScreen      from "./screens/ProgressScreen";
import OnboardingFlow      from "./screens/OnboardingFlow";
import GuidesHubScreen     from "./screens/GuidesHubScreen";
import ShopScreen          from "./screens/ShopScreen";
import MediaScreen         from "./screens/MediaScreen";
import PrayerTimesScreen   from "./screens/PrayerTimesScreen";
import QiblaScreen         from "./screens/QiblaScreen";
import PilgrimageDuasScreen from "./screens/PilgrimageDuasScreen";
import SafarAssistScreen   from "./screens/SafarAssistScreen";
import SacredPlacesScreen  from "./screens/SacredPlacesScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import CalendarScreen      from "./screens/CalendarScreen";
import PillarIntroScreen   from "./screens/PillarIntroScreen";
import ChecklistsScreen    from "./screens/ChecklistsScreen";
import ChecklistDetailScreen    from "./screens/ChecklistDetailScreen";
import OfficialResourcesScreen  from "./screens/OfficialResourcesScreen";
import QuizHubScreen            from "./screens/QuizHubScreen";
import QuizScreen               from "./screens/QuizScreen";
import QuizResultsScreen        from "./screens/QuizResultsScreen";

// ── Context ───────────────────────────────────────────────────────────────────
import { AccessibilityProvider } from "./AccessibilityContext";
import { ToastHost } from "./Toast";
import { colors, spacing, shadows, typography } from "./theme";

const SERIF = "SourceSerif4-Regular";
const ICON_INACTIVE = "#8A7E6A";
const Tab           = createBottomTabNavigator();
const Stack         = createNativeStackNavigator();
const HomeStack     = createNativeStackNavigator();
const PlanStack     = createNativeStackNavigator();
const LearnStack    = createNativeStackNavigator();
const PracticeStack = createNativeStackNavigator();
const ConnectStack  = createNativeStackNavigator();

// ── Placeholder screen with back nav ─────────────────────────────────────────
function BackScreen({ title, sub, navigation }) {
  return (
    <View style={ph.safe}>
      <TouchableOpacity style={ph.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Text style={ph.backArrow}>{"‹"}</Text>
        <Text style={ph.backLabel}>Back</Text>
      </TouchableOpacity>
      <Text style={ph.title}>{title}</Text>
      {sub && <Text style={ph.sub}>{sub}</Text>}
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
  Home:     { Icon: House,       label: "Home"     },
  Plan:     { Icon: ListChecks,  label: "Plan"     },
  Learn:    { Icon: BookOpen,    label: "Learn"    },
  Practice: { Icon: Moon,        label: "Practice", center: true },
  Connect:  { Icon: UsersThree,  label: "Connect"  },
};

function routeToLanding(tabName) {
  switch (tabName) {
    case "Home":     return "HomeMain";
    case "Plan":     return "PlanMain";
    case "Learn":    return "LearnMain";
    case "Practice": return "PracticeMain";
    case "Connect":  return "ConnectMain";
    default:         return undefined;
  }
}

function SafarTabBar({ state, descriptors, navigation }) {
  return (
    <View style={tb.bar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { Icon, label, center } = TAB_CONFIG[route.name] ?? { Icon: House, label: route.name };
        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (event.defaultPrevented) return;
          if (focused) {
            const landing = routeToLanding(route.name);
            if (landing) {
              navigation.dispatch({
                ...CommonActions.reset({
                  index: 0,
                  routes: [{ name: landing }],
                }),
                target: state.routes[index].state?.key,
              });
            }
          } else {
            navigation.navigate(route.name);
          }
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
            <Icon size={24} color={focused ? colors.primary : ICON_INACTIVE} weight={focused ? "fill" : "bold"} />
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
      <HomeStack.Screen name="HomeMain"      component={HomeScreen}          />
      <HomeStack.Screen name="Settings"      component={SettingsScreen}      />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    </HomeStack.Navigator>
  );
}

function PlanNavigator() {
  return (
    <PlanStack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
      <PlanStack.Screen name="PlanMain"          component={PlanMainScreen}       />
      <PlanStack.Screen name="Notes"             component={NotesScreen}          />
      <PlanStack.Screen name="Calendar"          component={CalendarScreen}       />
      <PlanStack.Screen name="Checklists"        component={ChecklistsScreen}     />
      <PlanStack.Screen name="ChecklistDetail"   component={ChecklistDetailScreen}/>
      <PlanStack.Screen name="CurrencyConverter" component={CurrencyScreen}       />
      <PlanStack.Screen name="MyBoard"           component={MyBoardScreen}        />
      <PlanStack.Screen name="MyContacts"        component={MyContactsScreen}     />
      <PlanStack.Screen name="Support"           component={SupportScreen}        />
      <PlanStack.Screen name="Shop"              component={ShopScreen}           />
      <PlanStack.Screen name="WhatToExpect"      component={WhatToExpectScreen}   />
      <PlanStack.Screen name="Media"             component={MediaScreen}          />
    </PlanStack.Navigator>
  );
}

function LearnNavigator() {
  return (
    <LearnStack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
      <LearnStack.Screen name="LearnMain"              component={LearnMainScreen}       />
      <LearnStack.Screen name="UmrahGuide"             component={UmrahGuideScreen}      />
      <LearnStack.Screen name="HajjGuide"              component={HajjGuideScreen}       />
      <LearnStack.Screen name="Guides"                 component={GuidesHubScreen}       />
      <LearnStack.Screen name="WhatToExpect"           component={WhatToExpectScreen}    />
      <LearnStack.Screen name="Media"                  component={MediaScreen}           />
      <LearnStack.Screen name="SacredPlaces"           component={SacredPlacesScreen}    />
      <LearnStack.Screen name="Map"                    component={MapScreen}             />
      <LearnStack.Screen name="QuizHub"                component={QuizHubScreen}         />
      <LearnStack.Screen name="Quiz"                   component={QuizScreen}            />
      <LearnStack.Screen name="QuizResults"            component={QuizResultsScreen}     />
      <LearnStack.Screen name="OfficialResourcesScreen" component={OfficialResourcesScreen} />
      <LearnStack.Screen name="Shop"                   component={ShopScreen}            />
    </LearnStack.Navigator>
  );
}

function PracticeNavigator() {
  return (
    <PracticeStack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
      <PracticeStack.Screen name="PracticeMain"  component={PracticeMainScreen}  />
      <PracticeStack.Screen name="MyDuas"        component={MyDuasScreen}        />
      <PracticeStack.Screen name="DuaList"       component={DuaListScreen}       />
      <PracticeStack.Screen name="Moods"         component={MoodsScreen}         />
      <PracticeStack.Screen name="Dhikr"         component={DhikrScreen}         />
      <PracticeStack.Screen name="Tawaf"         component={TawafScreen}         />
      <PracticeStack.Screen name="Saiy"          component={SaiyScreen}          />
      <PracticeStack.Screen name="PrayerTimes"   component={PrayerTimesScreen}   />
      <PracticeStack.Screen name="Qibla"         component={QiblaScreen}         />
      <PracticeStack.Screen name="PracticeLearn" component={PracticeLearnScreen} />
    </PracticeStack.Navigator>
  );
}

function ConnectNavigator() {
  return (
    <ConnectStack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
      <ConnectStack.Screen name="ConnectMain"   component={ConnectMainScreen}  />
      <ConnectStack.Screen name="Groups"        component={GroupsScreen}       />
      <ConnectStack.Screen name="GroupDetail"   component={GroupDetailScreen}  />
      <ConnectStack.Screen name="Connections"   component={ConnectionsScreen}  />
      <ConnectStack.Screen name="MyContacts"    component={MyContactsScreen}   />
      <ConnectStack.Screen name="Moments"       component={MomentsScreen}      />
      <ConnectStack.Screen name="MomentCreator" component={MomentCreatorScreen}/>
    </ConnectStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator tabBar={(props) => (
      <SafarTabBar {...props} />
    )} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home"     component={HomeNavigator}     />
      <Tab.Screen name="Plan"     component={PlanNavigator}     />
      <Tab.Screen name="Learn"    component={LearnNavigator}    />
      <Tab.Screen name="Practice" component={PracticeNavigator} />
      <Tab.Screen name="Connect"  component={ConnectNavigator}  />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    "SourceSerif4-Regular":  require("./assets/fonts/SourceSerif4-Regular.ttf"),
    "SourceSerif4-SemiBold": require("./assets/fonts/SourceSerif4-SemiBold.ttf"),
    "SourceSerif4-Bold":     require("./assets/fonts/SourceSerif4-Bold.ttf"),
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
  React.useEffect(() => { runBookmarkMigration(); }, []);

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
          screenOptions={{ headerShown: false }}
          initialRouteName={onboarded === "yes" ? "MainTabs" : "Onboarding"}
        >
          <Stack.Screen name="Onboarding"    component={OnboardingFlow}      />
          <Stack.Screen name="PillarIntro"   component={PillarIntroScreen}   options={{ gestureEnabled: false }} />
          <Stack.Screen name="MainTabs"      component={MainTabs}            />
          {/* ── Full-screen focused task screens — no tab bar ── */}
          {/* Users are mid-task: reciting, counting, learning, printing */}
          <Stack.Screen name="DuaDetail"     component={DuaDetailScreen}     />
          <Stack.Screen name="StepGuide"     component={ProgressScreen}      />
          <Stack.Screen name="PracticeLearn" component={PracticeLearnScreen} />
          <Stack.Screen name="PrintOffline"  component={PrintOfflineScreen}  />
          {/* ── Shared destinations reachable from multiple stacks ── */}
          <Stack.Screen name="PilgrimageDuas" component={PilgrimageDuasScreen} />
          <Stack.Screen name="SafarAssist"    component={SafarAssistScreen}    />
          <Stack.Screen name="SacredPlaces"   component={SacredPlacesScreen}   />
        </Stack.Navigator>
        <ToastHost />
      </NavigationContainer>
    </AccessibilityProvider>
  );
}
