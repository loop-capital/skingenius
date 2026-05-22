# SKINgenius Dashboard Implementation Guide

## Overview

This guide provides a comprehensive implementation plan for the SKINgenius skin analysis results dashboard, built with React Native + Expo for iPad-first deployment.

## Table of Contents

1. [Component Architecture](#1-component-architecture)
2. [Screen Layouts & Dimensions](#2-screen-layouts--dimensions)
3. [Navigation Structure](#3-navigation-structure)
4. [State Management](#4-state-management)
5. [Data Fetching Patterns](#5-data-fetching-patterns)
6. [Reusable Component Library](#6-reusable-component-library)
7. [Code Examples](#7-code-examples)
8. [Architecture Diagrams](#8-architecture-diagrams)

---

## 1. Component Architecture

### 1.1 Directory Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── SkinScoreCard.tsx
│   │   ├── RootCauseAnalysis.tsx
│   │   ├── IngredientRecommendations.tsx
│   │   ├── RoutineTracker.tsx
│   │   ├── ProgressTimeline.tsx
│   │   ├── DashboardHeader.tsx
│   │   └── DashboardGrid.tsx
│   ├── common/
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ScoreRing.tsx
│   │   ├── IconBadge.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingSkeleton.tsx
│   ├── charts/
│   │   ├── LineChart.tsx
│   │   ├── RadarChart.tsx
│   │   └── BarChart.tsx
│   └── layout/
│       ├── SafeAreaWrapper.tsx
│       ├── ResponsiveGrid.tsx
│       └── SplitView.tsx
├── screens/
│   ├── DashboardScreen.tsx
│   ├── SkinAnalysisScreen.tsx
│   ├── RootCauseDetailScreen.tsx
│   ├── IngredientsScreen.tsx
│   ├── RoutineScreen.tsx
│   └── ProgressScreen.tsx
├── hooks/
│   ├── useSkinAnalysis.ts
│   ├── useProgressData.ts
│   ├── useRoutineTracking.ts
│   └── useResponsiveLayout.ts
├── navigation/
│   ├── DashboardNavigator.tsx
│   └── RootNavigator.tsx
├── store/
│   ├── skinStore.ts
│   ├── dashboardStore.ts
│   └── uiStore.ts
├── api/
│   ├── skinAnalysisApi.ts
│   ├── ingredientsApi.ts
│   └── routinesApi.ts
├── types/
│   └── dashboard.types.ts
└── utils/
    ├── scoreCalculations.ts
    ├── chartHelpers.ts
    └── responsiveHelpers.ts
```

### 1.2 Component Hierarchy

```
DashboardScreen
├── DashboardHeader
├── DashboardGrid (2-column layout for iPad)
│   ├── SkinScoreCard (spans 2 columns)
│   │   ├── ScoreRing
│   │   └── ProgressBar
│   ├── RootCauseAnalysis
│   │   ├── RadarChart
│   │   └── IconBadge[]
│   ├── IngredientRecommendations
│   │   ├── Card[]
│   │   └── SectionHeader
│   ├── RoutineTracker
│   │   ├── ProgressBar[]
│   │   └── Card[]
│   └── ProgressTimeline
│       ├── LineChart
│       └── BarChart
└── BottomNavigation
```

### 1.3 Component Responsibilities

| Component | Responsibility | Reusability |
|-----------|--------------|-------------|
| SkinScoreCard | Display overall skin health score | High |
| RootCauseAnalysis | Show gut/hormones/nutrition/lifestyle breakdown | Medium |
| IngredientRecommendations | List recommended/avoid ingredients | Medium |
| RoutineTracker | AM/PM routine checklist & progress | High |
| ProgressTimeline | Historical skin health trends | Medium |
| ScoreRing | Circular progress indicator | High |
| RadarChart | Multi-axis comparison chart | High |
| Card | Consistent card container | Very High |
| ProgressBar | Linear progress indicator | Very High |

---

## 2. Screen Layouts & Dimensions

### 2.1 iPad Dimensions

```typescript
// utils/responsiveHelpers.ts
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const IS_IPAD = Platform.OS === 'ios' && SCREEN_WIDTH >= 768;

// Grid system for iPad
export const GRID_COLUMNS = IS_IPAD ? 2 : 1;
export const GRID_GAP = IS_IPAD ? 24 : 16;
export const SCREEN_PADDING = IS_IPAD ? 32 : 16;

// Card dimensions
export const CARD_WIDTH = (SCREEN_WIDTH - (SCREEN_PADDING * 2) - (GRID_GAP * (GRID_COLUMNS - 1))) / GRID_COLUMNS;
export const CARD_HEIGHTS = {
  small: 120,
  medium: 200,
  large: 320,
  extraLarge: 440,
};
```

### 2.2 Dashboard Screen Layout

```typescript
// screens/DashboardScreen.tsx
const DashboardScreen = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <DashboardHeader />
      
      <DashboardGrid columns={GRID_COLUMNS} gap={GRID_GAP}>
        {/* Row 1: Skin Score - Full Width */}
        <View style={styles.fullWidth}>
          <SkinScoreCard />
        </View>
        
        {/* Row 2: Root Cause + Ingredients */}
        <RootCauseAnalysis />
        <IngredientRecommendations />
        
        {/* Row 3: Routine Tracker + Progress */}
        <RoutineTracker />
        <ProgressTimeline />
      </DashboardGrid>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SCREEN_PADDING,
    paddingBottom: SCREEN_PADDING + 80, // Space for bottom nav
  },
  fullWidth: {
    width: '100%',
    gridColumn: '1 / -1', // Span all columns
  },
});
```

### 2.3 Layout Specifications

| Element | iPad Portrait | iPad Landscape | iPhone |
|---------|--------------|----------------|--------|
| Screen Padding | 32px | 40px | 16px |
| Grid Columns | 2 | 3 | 1 |
| Card Gap | 24px | 32px | 16px |
| Score Card Height | 280px | 320px | 220px |
| Card Border Radius | 20px | 24px | 16px |
| Font Scale | 1.2x | 1.3x | 1.0x |

### 2.4 Breakpoints

```typescript
export const BREAKPOINTS = {
  phone: 0,
  tablet: 768,
  largeTablet: 1024,
  desktop: 1200,
};

export const useBreakpoint = () => {
  const { width } = useWindowDimensions();
  
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.largeTablet) return 'largeTablet';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'phone';
};
```

---

## 3. Navigation Structure

### 3.1 Navigation Tree

```
RootNavigator (Stack)
├── DashboardTabNavigator (Bottom Tabs)
│   ├── DashboardScreen (Home)
│   ├── AnalysisScreen
│   ├── RoutineScreen
│   └── ProfileScreen
├── SkinAnalysisScreen (Modal)
├── RootCauseDetailScreen (Push)
├── IngredientDetailScreen (Push)
├── ProgressDetailScreen (Push)
└── SettingsScreen (Push)
```

### 3.2 Dashboard Navigator

```typescript
// navigation/DashboardNavigator.tsx
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DashboardTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        height: 80,
        paddingBottom: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        position: 'absolute',
        bottom: 0,
      },
      tabBarActiveTintColor: '#2D8B4E',
      tabBarInactiveTintColor: '#8E8E93',
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} />,
      }}
    />
    <Tab.Screen
      name="Analysis"
      component={AnalysisScreen}
      options={{
        tabBarIcon: ({ color }) => <ScanIcon color={color} size={24} />,
      }}
    />
    <Tab.Screen
      name="Routine"
      component={RoutineScreen}
      options={{
        tabBarIcon: ({ color }) => <ChecklistIcon color={color} size={24} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color }) => <UserIcon color={color} size={24} />,
      }}
    />
  </Tab.Navigator>
);

export const RootNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={DashboardTabs} />
    <Stack.Screen
      name="SkinAnalysis"
      component={SkinAnalysisScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen name="RootCauseDetail" component={RootCauseDetailScreen} />
    <Stack.Screen name="IngredientDetail" component={IngredientDetailScreen} />
    <Stack.Screen name="ProgressDetail" component={ProgressDetailScreen} />
  </Stack.Navigator>
);
```

### 3.3 Deep Linking Configuration

```typescript
// navigation/linking.ts
export const linking = {
  prefixes: ['skingenius://', 'https://skingenius.app'],
  config: {
    screens: {
      Main: {
        screens: {
          Dashboard: '',
          Analysis: 'analysis',
          Routine: 'routine',
          Profile: 'profile',
        },
      },
      SkinAnalysis: 'analysis/:analysisId',
      RootCauseDetail: 'root-cause/:category',
      IngredientDetail: 'ingredient/:ingredientId',
      ProgressDetail: 'progress/:timeRange',
    },
  },
};
```

---

## 4. State Management

### 4.1 Zustand Store Architecture

```typescript
// store/dashboardStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
  // Data
  skinScore: SkinScore | null;
  rootCauses: RootCause[];
  ingredients: Ingredient[];
  routines: Routine[];
  progressData: ProgressEntry[];
  
  // UI State
  selectedTimeRange: 'week' | 'month' | 'quarter' | 'year';
  selectedRootCause: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSkinScore: (score: SkinScore) => void;
  setRootCauses: (causes: RootCause[]) => void;
  setIngredients: (ingredients: Ingredient[]) => void;
  setRoutines: (routines: Routine[]) => void;
  setProgressData: (data: ProgressEntry[]) => void;
  setTimeRange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
  selectRootCause: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      skinScore: null,
      rootCauses: [],
      ingredients: [],
      routines: [],
      progressData: [],
      selectedTimeRange: 'month',
      selectedRootCause: null,
      isLoading: false,
      error: null,
      
      // Actions
      setSkinScore: (score) => set({ skinScore: score }),
      setRootCauses: (causes) => set({ rootCauses: causes }),
      setIngredients: (ingredients) => set({ ingredients }),
      setRoutines: (routines) => set({ routines }),
      setProgressData: (data) => set({ progressData: data }),
      setTimeRange: (range) => set({ selectedTimeRange: range }),
      selectRootCause: (id) => set({ selectedRootCause: id }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      refreshDashboard: async () => {
        set({ isLoading: true, error: null });
        try {
          const [score, causes, ingredients, routines, progress] = await Promise.all([
            skinAnalysisApi.getLatestScore(),
            skinAnalysisApi.getRootCauses(),
            ingredientsApi.getRecommendations(),
            routinesApi.getTodayRoutines(),
            skinAnalysisApi.getProgressData(get().selectedTimeRange),
          ]);
          
          set({
            skinScore: score,
            rootCauses: causes,
            ingredients,
            routines,
            progressData: progress,
            isLoading: false,
          });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        selectedTimeRange: state.selectedTimeRange,
        skinScore: state.skinScore,
      }),
    }
  )
);
```

### 4.2 Skin Analysis Store

```typescript
// store/skinStore.ts
interface SkinState {
  // User's skin profile
  skinProfile: SkinProfile | null;
  analysisHistory: SkinAnalysis[];
  currentAnalysis: SkinAnalysis | null;
  
  // Computed
  getSkinType: () => SkinType | null;
  getTopConcerns: () => SkinConcern[];
  getLatestAnalysis: () => SkinAnalysis | null;
  
  // Actions
  setSkinProfile: (profile: SkinProfile) => void;
  addAnalysis: (analysis: SkinAnalysis) => void;
  setCurrentAnalysis: (analysis: SkinAnalysis | null) => void;
}

export const useSkinStore = create<SkinState>()((set, get) => ({
  skinProfile: null,
  analysisHistory: [],
  currentAnalysis: null,
  
  getSkinType: () => get().skinProfile?.skinType ?? null,
  getTopConcerns: () => get().currentAnalysis?.concerns ?? [],
  getLatestAnalysis: () => 
    get().analysisHistory[0] ?? get().currentAnalysis,
  
  setSkinProfile: (profile) => set({ skinProfile: profile }),
  addAnalysis: (analysis) => 
    set((state) => ({ 
      analysisHistory: [analysis, ...state.analysisHistory] 
    })),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
}));
```

### 4.3 UI Store (Theme/Layout)

```typescript
// store/uiStore.ts
interface UIState {
  theme: 'light' | 'dark' | 'system';
  isSidebarOpen: boolean;
  activeModal: string | null;
  toast: Toast | null;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  showModal: (modal: string) => void;
  hideModal: () => void;
  showToast: (toast: Toast) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  theme: 'system',
  isSidebarOpen: false,
  activeModal: null,
  toast: null,
  
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  showModal: (modal) => set({ activeModal: modal }),
  hideModal: () => set({ activeModal: null }),
  showToast: (toast) => set({ toast }),
  hideToast: () => set({ toast: null }),
}));
```

---

## 5. Data Fetching Patterns

### 5.1 React Query Integration

```typescript
// hooks/useSkinAnalysis.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export const useSkinScore = () => {
  return useQuery({
    queryKey: ['skinScore'],
    queryFn: skinAnalysisApi.getLatestScore,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
};

export const useRootCauses = () => {
  return useQuery({
    queryKey: ['rootCauses'],
    queryFn: skinAnalysisApi.getRootCauses,
    staleTime: STALE_TIME,
  });
};

export const useIngredients = (type: 'recommended' | 'avoid') => {
  return useQuery({
    queryKey: ['ingredients', type],
    queryFn: () => ingredientsApi.getByType(type),
  });
};

export const useProgressData = (timeRange: TimeRange) => {
  return useQuery({
    queryKey: ['progress', timeRange],
    queryFn: () => skinAnalysisApi.getProgressData(timeRange),
    staleTime: STALE_TIME,
  });
};

export const useRoutineTracking = (routineId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (stepId: string) => routinesApi.completeStep(routineId, stepId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['skinScore'] });
    },
  });
};
```

### 5.2 Optimistic Updates

```typescript
// hooks/useRoutineTracking.ts
export const useCompleteRoutineStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ routineId, stepId }: { routineId: string; stepId: string }) => {
      return routinesApi.completeStep(routineId, stepId);
    },
    
    onMutate: async ({ routineId, stepId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['routines', routineId] });
      
      // Snapshot previous value
      const previousRoutine = queryClient.getQueryData(['routines', routineId]);
      
      // Optimistically update
      queryClient.setQueryData(['routines', routineId], (old: Routine) => ({
        ...old,
        steps: old.steps.map((step) =>
          step.id === stepId ? { ...step, completed: true, completedAt: new Date() } : step
        ),
        progress: calculateProgress(old.steps),
      }));
      
      return { previousRoutine };
    },
    
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['routines', variables.routineId],
        context?.previousRoutine
      );
    },
    
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['routines', variables.routineId] });
    },
  });
};
```

### 5.3 API Layer

```typescript
// api/skinAnalysisApi.ts
import { createApiClient } from './client';

const api = createApiClient();

export const skinAnalysisApi = {
  getLatestScore: async (): Promise<SkinScore> => {
    const response = await api.get('/skin-analysis/score');
    return response.data;
  },
  
  getRootCauses: async (): Promise<RootCause[]> => {
    const response = await api.get('/skin-analysis/root-causes');
    return response.data;
  },
  
  getProgressData: async (timeRange: TimeRange): Promise<ProgressEntry[]> => {
    const response = await api.get('/skin-analysis/progress', {
      params: { timeRange },
    });
    return response.data;
  },
  
  submitAnalysis: async (data: AnalysisInput): Promise<SkinAnalysis> => {
    const response = await api.post('/skin-analysis', data);
    return response.data;
  },
};
```

### 5.4 Error Handling Pattern

```typescript
// hooks/useDashboardData.ts
export const useDashboardData = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showToast } = useUIStore();
  
  const queries = useQueries({
    queries: [
      { queryKey: ['skinScore'], queryFn: skinAnalysisApi.getLatestScore },
      { queryKey: ['rootCauses'], queryFn: skinAnalysisApi.getRootCauses },
      { queryKey: ['ingredients'], queryFn: ingredientsApi.getRecommendations },
      { queryKey: ['routines'], queryFn: routinesApi.getTodayRoutines },
    ],
  });
  
  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.isError)?.error;
  
  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all(queries.map((q) => q.refetch()));
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Failed to refresh dashboard data',
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    if (isError && error) {
      showToast({
        type: 'error',
        message: error.message || 'Something went wrong',
      });
    }
  }, [isError, error]);
  
  return {
    skinScore: queries[0].data,
    rootCauses: queries[1].data,
    ingredients: queries[2].data,
    routines: queries[3].data,
    isLoading,
    isRefreshing,
    refresh,
  };
};
```

---

## 6. Reusable Component Library

### 6.1 Card Component

```typescript
// components/common/Card.tsx
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  onPress,
  style,
}) => {
  const cardStyles = [
    styles.card,
    styles[variant],
    styles[`padding_${padding}`],
    style,
  ];
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={cardStyles}>{children}</View>
      </TouchableOpacity>
    );
  }
  
  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  padding_none: { padding: 0 },
  padding_small: { padding: 12 },
  padding_medium: { padding: 20 },
  padding_large: { padding: 28 },
});
```

### 6.2 Score Ring Component

```typescript
// components/common/ScoreRing.tsx
interface ScoreRingProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  showValue?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 120,
  strokeWidth = 10,
  color = '#2D8B4E',
  backgroundColor = '#E5E5EA',
  label,
  showValue = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / 100) * circumference;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#2D8B4E';
    if (score >= 60) return '#F5A623';
    return '#E74C3C';
  };
  
  const animatedProgress = useSharedValue(0);
  
  useEffect(() => {
    animatedProgress.value = withSpring(score / 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [score]);
  
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - animatedProgress.value * circumference,
  }));
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getScoreColor(score)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      {showValue && (
        <View style={styles.labelContainer}>
          <Text style={[styles.score, { fontSize: size * 0.3 }]}>
            {Math.round(score)}
          </Text>
          {label && <Text style={styles.label}>{label}</Text>}
        </View>
      )}
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
```

### 6.3 Progress Bar Component

```typescript
// components/common/ProgressBar.tsx
interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  showLabel?: boolean;
  labelPosition?: 'left' | 'right' | 'center';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = '#2D8B4E',
  backgroundColor = '#E5E5EA',
  animated = true,
  showLabel = false,
  labelPosition = 'right',
}) => {
  const animatedWidth = useSharedValue(0);
  
  useEffect(() => {
    if (animated) {
      animatedWidth.value = withTiming(progress / 100, { duration: 1000 });
    } else {
      animatedWidth.value = progress / 100;
    }
  }, [progress, animated]);
  
  const widthStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));
  
  return (
    <View style={styles.wrapper}>
      {showLabel && labelPosition === 'left' && (
        <Text style={styles.label}>{Math.round(progress)}%</Text>
      )}
      
      <View style={[styles.container, { height, backgroundColor }]}>
        <Animated.View
          style={[
            styles.progress,
            { backgroundColor: color, height },
            widthStyle,
          ]}
        />
      </View>
      
      {showLabel && labelPosition === 'right' && (
        <Text style={styles.label}>{Math.round(progress)}%</Text>
      )}
    </View>
  );
};
```

### 6.4 Section Header Component

```typescript
// components/common/SectionHeader.tsx
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  icon?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      {action && (
        <TouchableOpacity onPress={action.onPress} style={styles.action}>
          <Text style={styles.actionLabel}>{action.label}</Text>
          <ChevronRight size={16} color="#2D8B4E" />
        </TouchableOpacity>
      )}
    </View>
  );
};
```

---

## 7. Code Examples

### 7.1 Skin Score Card Implementation

```typescript
// components/dashboard/SkinScoreCard.tsx
export const SkinScoreCard: React.FC = () => {
  const { skinScore } = useDashboardStore();
  const { data, isLoading } = useSkinScore();
  
  if (isLoading) return <LoadingSkeleton type="scoreCard" />;
  
  const score = data?.overall ?? 0;
  const categories = data?.categories ?? [];
  
  return (
    <Card variant="elevated" padding="large" style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Skin Health Score</Text>
          <Text style={styles.subtitle}>Based on your latest analysis</Text>
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <InfoIcon size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.scoreContainer}>
        <ScoreRing
          score={score}
          size={180}
          strokeWidth={14}
          label="Overall"
        />
        
        <View style={styles.categoryScores}>
          {categories.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryScore}>{category.score}</Text>
              </View>
              <ProgressBar
                progress={category.score}
                height={6}
                color={getCategoryColor(category.status)}
                showLabel={false}
              />
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.insightBanner}>
        <LightbulbIcon size={20} color="#F5A623" />
        <Text style={styles.insightText}>
          Your hydration score improved by 12% this week!
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: CARD_HEIGHTS.extraLarge,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  scoreContainer: {
    flexDirection: IS_IPAD ? 'row' : 'column',
    alignItems: 'center',
    gap: 24,
  },
  categoryScores: {
    flex: 1,
    width: '100%',
    gap: 16,
  },
  categoryItem: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3A3C',
  },
  categoryScore: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#8B6914',
    fontWeight: '500',
  },
});
```

### 7.2 Root Cause Analysis Component

```typescript
// components/dashboard/RootCauseAnalysis.tsx
export const RootCauseAnalysis: React.FC = () => {
  const { data: rootCauses, isLoading } = useRootCauses();
  const navigation = useNavigation();
  
  if (isLoading) return <LoadingSkeleton type="card" />;
  
  const categories: RootCauseCategory[] = [
    { id: 'gut', name: 'Gut Health', icon: 'gut', color: '#4A90D9' },
    { id: 'hormones', name: 'Hormones', icon: 'hormone', color: '#E74C3C' },
    { id: 'nutrition', name: 'Nutrition', icon: 'nutrition', color: '#F5A623' },
    { id: 'lifestyle', name: 'Lifestyle', icon: 'lifestyle', color: '#2D8B4E' },
  ];
  
  const radarData = categories.map((cat) => ({
    category: cat.name,
    score: rootCauses?.find((r) => r.id === cat.id)?.score ?? 0,
    color: cat.color,
  }));
  
  return (
    <Card padding="large">
      <SectionHeader
        title="Root Causes"
        subtitle="What's driving your skin concerns"
        action={{ label: 'See details', onPress: () => navigation.navigate('RootCauseDetail') }}
      />
      
      <View style={styles.chartContainer}>
        <RadarChart
          data={radarData}
          size={IS_IPAD ? 200 : 160}
        />
      </View>
      
      <View style={styles.categoryList}>
        {categories.map((category) => {
          const cause = rootCauses?.find((r) => r.id === category.id);
          return (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => navigation.navigate('RootCauseDetail', { category: category.id })}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${category.color}15` }]}>
                <CategoryIcon name={category.icon} color={category.color} />
              </View>
              
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryStatus}>
                  {cause?.status ?? 'Analyzing...'}
                </Text>
              </View>
              
              <View style={styles.scoreContainer}>
                <Text style={[styles.score, { color: category.color }]}>
                  {cause?.score ?? '--'}
                </Text>
                <ChevronRight size={16} color="#C7C7CC" />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
};
```

### 7.3 Ingredient Recommendations Component

```typescript
// components/dashboard/IngredientRecommendations.tsx
export const IngredientRecommendations: React.FC = () => {
  const { data: ingredients, isLoading } = useIngredients('recommended');
  const [activeTab, setActiveTab] = useState<'recommended' | 'avoid'>('recommended');
  
  if (isLoading) return <LoadingSkeleton type="card" />;
  
  const filteredIngredients = ingredients?.filter((i) => i.type === activeTab) ?? [];
  
  return (
    <Card padding="large">
      <SectionHeader
        title="Ingredients"
        subtitle="Based on your skin profile"
      />
      
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recommended' && styles.activeTab]}
          onPress={() => setActiveTab('recommended')}
        >
          <Text style={[styles.tabText, activeTab === 'recommended' && styles.activeTabText]}>
            Recommended
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'avoid' && styles.activeTab]}
          onPress={() => setActiveTab('avoid')}
        >
          <Text style={[styles.tabText, activeTab === 'avoid' && styles.activeTabText]}>
            Avoid
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.ingredientsList}
        contentContainerStyle={styles.ingredientsContent}
      >
        {filteredIngredients.map((ingredient) => (
          <TouchableOpacity
            key={ingredient.id}
            style={styles.ingredientCard}
            onPress={() => navigateToIngredient(ingredient.id)}
          >
            <View style={styles.ingredientHeader}>
              <Image
                source={{ uri: ingredient.imageUrl }}
                style={styles.ingredientImage}
              />
              <View style={styles.badgeContainer}>
                {ingredient.isActive && (
                  <Badge variant="success" label="Active" />
                )}
                {ingredient.isGentle && (
                  <Badge variant="info" label="Gentle" />
                )}
              </View>
            </View>
            
            <Text style={styles.ingredientName}>{ingredient.name}</Text>
            <Text style={styles.ingredientFunction} numberOfLines={2}>
              {ingredient.function}
            </Text>
            
            <View style={styles.benefitsList}>
              {ingredient.benefits.slice(0, 2).map((benefit) => (
                <View key={benefit} style={styles.benefitTag}>
                  <CheckIcon size={12} color="#2D8B4E" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Card>
  );
};
```

### 7.4 Routine Tracker Component

```typescript
// components/dashboard/RoutineTracker.tsx
export const RoutineTracker: React.FC = () => {
  const { data: routines, isLoading } = useRoutines();
  const completeStep = useCompleteRoutineStep();
  const [activeRoutine, setActiveRoutine] = useState<'am' | 'pm'>('am');
  
  if (isLoading) return <LoadingSkeleton type="card" />;
  
  const currentRoutine = routines?.find((r) => r.type === activeRoutine);
  const progress = currentRoutine ? calculateProgress(currentRoutine.steps) : 0;
  
  return (
    <Card padding="large">
      <SectionHeader
        title="Today's Routine"
        subtitle={`${currentRoutine?.steps.filter((s) => s.completed).length ?? 0} of ${currentRoutine?.steps.length ?? 0} completed`}
      />
      
      <View style={styles.routineToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, activeRoutine === 'am' && styles.activeToggle]}
          onPress={() => setActiveRoutine('am')}
        >
          <SunIcon size={16} color={activeRoutine === 'am' ? '#FFFFFF' : '#8E8E93'} />
          <Text style={[styles.toggleText, activeRoutine === 'am' && styles.activeToggleText]}>
            AM
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, activeRoutine === 'pm' && styles.activeToggle]}
          onPress={() => setActiveRoutine('pm')}
        >
          <MoonIcon size={16} color={activeRoutine === 'pm' ? '#FFFFFF' : '#8E8E93'} />
          <Text style={[styles.toggleText, activeRoutine === 'pm' && styles.activeToggleText]}>
            PM
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Routine Progress</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <ProgressBar progress={progress} height={8} color="#2D8B4E" />
      </View>
      
      <View style={styles.stepsList}>
        {currentRoutine?.steps.map((step) => (
          <TouchableOpacity
            key={step.id}
            style={[
              styles.stepItem,
              step.completed && styles.stepCompleted,
            ]}
            onPress={() => completeStep.mutate({ routineId: currentRoutine.id, stepId: step.id })}
          >
            <View style={styles.stepCheckbox}>
              {step.completed ? (
                <CheckCircleIcon size={24} color="#2D8B4E" />
              ) : (
                <CircleIcon size={24} color="#C7C7CC" />
              )}
            </View>
            
            <View style={styles.stepInfo}>
              <Text style={[
                styles.stepName,
                step.completed && styles.stepTextCompleted,
              ]}>
                {step.name}
              </Text>
              <Text style={styles.stepProduct}>
                {step.productName}
              </Text>
            </View>
            
            <View style={styles.stepTiming}>
              <ClockIcon size={14} color="#8E8E93" />
              <Text style={styles.timingText}>{step.duration}m</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
};
```

### 7.5 Progress Timeline Component

```typescript
// components/dashboard/ProgressTimeline.tsx
export const ProgressTimeline: React.FC = () => {
  const { selectedTimeRange } = useDashboardStore();
  const { data: progressData, isLoading } = useProgressData(selectedTimeRange);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  if (isLoading) return <LoadingSkeleton type="chart" />;
  
  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'week', label: '1W' },
    { value: 'month', label: '1M' },
    { value: 'quarter', label: '3M' },
    { value: 'year', label: '1Y' },
  ];
  
  const chartData = progressData?.map((entry) => ({
    date: entry.date,
    score: entry.overallScore,
    hydration: entry.hydrationScore,
    clarity: entry.clarityScore,
    texture: entry.textureScore,
  })) ?? [];
  
  return (
    <Card padding="large" style={styles.container}>
      <SectionHeader
        title="Progress"
        subtitle="Track your skin health journey"
        action={{ label: 'Full report', onPress: () => navigateToProgressDetail() }}
      />
      
      <View style={styles.timeRangeSelector}>
        {timeRangeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.timeRangeButton,
              selectedTimeRange === option.value && styles.activeTimeRange,
            ]}
            onPress={() => useDashboardStore.getState().setTimeRange(option.value)}
          >
            <Text style={[
              styles.timeRangeText,
              selectedTimeRange === option.value && styles.activeTimeRangeText,
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.chartTypeToggle}>
        <TouchableOpacity
          style={[styles.typeButton, chartType === 'line' && styles.activeType]}
          onPress={() => setChartType('line')}
        >
          <LineChartIcon size={16} color={chartType === 'line' ? '#2D8B4E' : '#8E8E93'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, chartType === 'bar' && styles.activeType]}
          onPress={() => setChartType('bar')}
        >
          <BarChartIcon size={16} color={chartType === 'bar' ? '#2D8B4E' : '#8E8E93'} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.chartContainer}>
        {chartType === 'line' ? (
          <LineChart
            data={chartData}
            xKey="date"
            yKey="score"
            width={CARD_WIDTH - 60}
            height={200}
            color="#2D8B4E"
            showGrid
            showArea
          />
        ) : (
          <BarChart
            data={chartData}
            xKey="date"
            yKey="score"
            width={CARD_WIDTH - 60}
            height={200}
            color="#2D8B4E"
            showGrid
          />
        )}
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {getAverageScore(chartData)}
          </Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.positive]}>
            +{getScoreChange(chartData)}
          </Text>
          <Text style={styles.statLabel}>Change</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {getBestDay(chartData)}
          </Text>
          <Text style={styles.statLabel}>Best Day</Text>
        </View>
      </View>
    </Card>
  );
};
```

---

## 8. Architecture Diagrams

### 8.1 Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   DashboardScreen                        │
│                    (Screen Container)                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │              DashboardHeader                      │   │
│  │         (Greeting + Date + Notifications)       │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │               SkinScoreCard                     │   │
│  │   ┌─────────┐  ┌─────────────────────────┐     │   │
│  │   │ScoreRing│  │  Category Progress Bars │     │   │
│  │   │  (SVG)  │  │  [Hydration] [Clarity]  │     │   │
│  │   └─────────┘  │  [Texture]   [Barrier]  │     │   │
│  │                 └─────────────────────────┘     │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │ RootCauseAnalysis    │  │ IngredientRecs       │   │
│  │ ┌────────────────┐   │  │ ┌────────────────┐   │   │
│  │ │  RadarChart    │   │  │ │ Horizontal     │   │   │
│  │ │  (SVG/Canvas)  │   │  │ │ Scroll Cards   │   │   │
│  │ └────────────────┘   │  │ └────────────────┘   │   │
│  │ [Gut][Horm][Nut][Lif]│  │ [Retinol][Niacinamide]│  │
│  └──────────────────────┘  └──────────────────────┘   │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │   RoutineTracker     │  │   ProgressTimeline   │   │
│  │ [AM/PM Toggle]       │  │ [1W 1M 3M 1Y]        │   │
│  │ Progress: 60%        │  │ [Line/Bar Toggle]      │   │
│  │ ☑ Cleanse  ☐ Tone    │  │ ┌──────────────────┐   │   │
│  │ ☑ Serum    ☐ Moisturize│  │ │   Chart Area     │   │   │
│  │ ☐ Sunscreen           │  │ │  (Victory/SVG)   │   │   │
│  └──────────────────────┘  │ └──────────────────┘   │   │
│                              └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│  Dashboard  │────▶│   Zustand   │
│  Action     │     │  Component  │     │    Store    │
└─────────────┘     └─────────────┘     └──────┬──────┘
       │                                       │
       │                              ┌────────┴────────┐
       │                              │                 │
       │                       ┌──────▼──────┐   ┌──────▼──────┐
       │                       │   Persist   │   │  UI State   │
       │                       │   Storage   │   │  (toasts)   │
       │                       └─────────────┘   └─────────────┘
       │
       │         ┌─────────────┐     ┌─────────────┐
       └────────▶│  React Query │────▶│  Supabase   │
                 │   Cache      │     │   API       │
                 └─────────────┘     └─────────────┘
```

### 8.3 State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Dashboard Screen                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │ useSkinScore │    │useRootCauses │    │useRoutines│  │
│  │   (React     │    │   (React     │    │  (React   │  │
│  │    Query)    │    │    Query)    │    │  Query)   │  │
│  └──────┬───────┘    └──────┬───────┘    └─────┬─────┘  │
│         │                   │                   │         │
│         └───────────────────┼───────────────────┘       │
│                             ▼                           │
│              ┌────────────────────────────┐              │
│              │    Dashboard Store         │              │
│              │   (Zustand - Client State) │              │
│              │                            │              │
│              │  • selectedTimeRange      │              │
│              │  • selectedRootCause        │              │
│              │  • isLoading / error       │              │
│              │  • refreshDashboard()      │              │
│              └────────────────────────────┘              │
│                             │                           │
│         ┌───────────────────┼───────────────────┐     │
│         │                   │                   │     │
│         ▼                   ▼                   ▼     │
│  ┌──────────────┐    ┌──────────────┐    ┌────────┐  │
│  │ SkinScoreCard│    │RootCauseAnalysis│   │Routine │  │
│  │              │    │              │    │Tracker │  │
│  └──────────────┘    └──────────────┘    └────────┘  │
│                                                         │
│  All components subscribe to relevant store slices       │
│  Only re-render when their specific data changes         │
└─────────────────────────────────────────────────────────┘
```

### 8.4 API Integration

```
┌─────────────────────────────────────────────────────────┐
│                      API Layer                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │skinAnalysis  │  │ ingredients  │  │  routines    │  │
│  │    API       │  │    API       │  │    API       │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  │
│  │ getLatestScore│ │getRecommendations│ │getTodayRoutines││
│  │ getRootCauses │  │getByType     │  │completeStep  │  │
│  │ getProgressData│ │search        │  │updateRoutine │  │
│  │ submitAnalysis│  │getDetails    │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                   │                   │         │
│         └───────────────────┼───────────────────┘         │
│                             ▼                           │
│              ┌────────────────────────────┐              │
│              │     Axios Client           │              │
│              │  • Base URL config         │              │
│              │  • Auth headers (JWT)      │              │
│              │  • Request/Response        │              │
│              │    interceptors            │              │
│              │  • Error handling          │              │
│              │  • Retry logic             │              │
│              └────────────────────────────┘              │
│                             │                           │
│                             ▼                           │
│                    ┌─────────────────┐                  │
│                    │   Supabase API   │                  │
│                    │  (REST + Edge)   │                  │
│                    └─────────────────┘                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Performance Considerations

### 9.1 Optimization Strategies

```typescript
// 1. Memoize expensive components
export const SkinScoreCard = React.memo(() => {
  // Component logic
});

// 2. Virtualize long lists
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={ingredients}
  renderItem={renderIngredientItem}
  estimatedItemSize={120}
  showsHorizontalScrollIndicator={false}
/>;

// 3. Use useMemo for derived data
const categoryScores = useMemo(() => {
  return calculateCategoryScores(rawData);
}, [rawData]);

// 4. Debounce frequent operations
const debouncedSearch = useMemo(
  () => debounce((query) => searchIngredients(query), 300),
  []
);

// 5. Lazy load heavy components
const RadarChart = lazy(() => import('./RadarChart'));
```

### 9.2 Animation Guidelines

```typescript
// Use Reanimated for smooth animations
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';

// Entrance animations
<Animated.View entering={FadeInUp.duration(400).delay(index * 100)}>
  <Card>{content}</Card>
</Animated.View>

// Scroll-driven animations
const scrollY = useSharedValue(0);
const headerStyle = useAnimatedStyle(() => ({
  opacity: interpolate(scrollY.value, [0, 100], [1, 0.9], Extrapolation.CLAMP),
  transform: [
    { translateY: interpolate(scrollY.value, [0, 100], [0, -10], Extrapolation.CLAMP) },
  ],
}));
```

---

## 10. Accessibility

```typescript
// Accessibility props for all components
interface AccessibleProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
}

// Example implementation
<Card
  accessible
  accessibilityLabel={`Skin score: ${score} out of 100`}
  accessibilityHint="Double tap to view detailed analysis"
  accessibilityRole="button"
>
  <ScoreRing score={score} />
</Card>

// Screen reader announcements
import * as Speech from 'expo-speech';

const announceProgress = (stepName: string) => {
  Speech.speak(`${stepName} completed`);
};
```

---

## 11. Testing Strategy

```typescript
// Component tests with React Native Testing Library
import { render, screen, fireEvent } from '@testing-library/react-native';

describe('SkinScoreCard', () => {
  it('renders score correctly', () => {
    render(<SkinScoreCard score={85} />);
    expect(screen.getByText('85')).toBeTruthy();
  });

  it('shows loading skeleton when loading', () => {
    render(<SkinScoreCard isLoading />);
    expect(screen.getByTestId('loading-skeleton')).toBeTruthy();
  });

  it('navigates to detail on press', () => {
    const navigate = jest.fn();
    render(<SkinScoreCard score={85} onPress={navigate} />);
    fireEvent.press(screen.getByRole('button'));
    expect(navigate).toHaveBeenCalled();
  });
});

// Store tests
describe('DashboardStore', () => {
  it('updates skin score', () => {
    const store = useDashboardStore.getState();
    store.setSkinScore({ overall: 85, categories: [] });
    expect(useDashboardStore.getState().skinScore?.overall).toBe(85);
  });
});
```

---

## 12. Implementation Checklist

### Phase 1: Foundation
- [ ] Set up project structure
- [ ] Configure navigation
- [ ] Set up state management (Zustand)
- [ ] Configure React Query
- [ ] Create API client
- [ ] Set up theming system

### Phase 2: Core Components
- [ ] Card component
- [ ] ScoreRing component
- [ ] ProgressBar component
- [ ] SectionHeader component
- [ ] LoadingSkeleton component
- [ ] ErrorBoundary component

### Phase 3: Dashboard Widgets
- [ ] SkinScoreCard
- [ ] RootCauseAnalysis (with RadarChart)
- [ ] IngredientRecommendations
- [ ] RoutineTracker
- [ ] ProgressTimeline (with charts)

### Phase 4: Integration
- [ ] DashboardScreen composition
- [ ] Data fetching integration
- [ ] Error handling
- [ ] Loading states
- [ ] Pull-to-refresh
- [ ] Empty states

### Phase 5: Polish
- [ ] Animations
- [ ] Accessibility
- [ ] Performance optimization
- [ ] iPad-specific optimizations
- [ ] Testing
- [ ] Documentation

---

## 13. Dependencies

```json
{
  "dependencies": {
    "react-native": "0.73.x",
    "expo": "~50.0.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/stack": "^6.3.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "react-native-reanimated": "~3.6.0",
    "react-native-svg": "^14.0.0",
    "react-native-gesture-handler": "~2.14.0",
    "@shopify/flash-list": "^1.6.0",
    "date-fns": "^3.0.0",
    "lodash.debounce": "^4.0.8",
    "victory-native": "^40.0.0"
  },
  "devDependencies": {
    "@testing-library/react-native": "^12.0.0",
    "@testing-library/jest-native": "^5.4.0",
    "jest": "^29.0.0",
    "typescript": "^5.3.0"
  }
}
```

---

## Conclusion

This implementation guide provides a comprehensive foundation for building the SKINgenius dashboard. Key principles:

1. **iPad-First**: All layouts optimized for tablet, with responsive fallbacks
2. **Modular Components**: Reusable, composable UI pieces
3. **Performance**: Memoization, virtualization, and lazy loading
4. **Type Safety**: Full TypeScript coverage
5. **Testability**: Component and store tests included
6. **Accessibility**: Screen reader support throughout

Next steps:
1. Review and approve architecture
2. Set up project scaffolding
3. Implement core components
4. Build dashboard screen
5. Integrate with backend API
6. Add animations and polish
