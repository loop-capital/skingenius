import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

type Period = 'AM' | 'PM';

interface RoutineItem {
  id: string;
  name: string;
  category: 'cleanse' | 'treat' | 'moisturize' | 'protect';
  completed: boolean;
}

interface RoutineTrackerProps {
  amRoutine: RoutineItem[];
  pmRoutine: RoutineItem[];
  onToggle: (period: Period, id: string, completed: boolean) => void;
}

/**
 * RoutineTracker — AM/PM checklist with progress
 *
 * Features:
 *   • Toggle between AM and PM tabs
 *   • Checkable list of routine steps
 *   • Progress ring + percentage at top
 *   • Categories color-coded for quick scanning
 *
 * State is optimistic: toggles immediately, calls onToggle for sync.
 */
export const RoutineTracker: React.FC<RoutineTrackerProps> = ({
  amRoutine,
  pmRoutine,
  onToggle,
}) => {
  const [period, setPeriod] = useState<Period>('AM');
  const items = period === 'AM' ? amRoutine : pmRoutine;

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? completedCount / items.length : 0;
  const percent = Math.round(progress * 100);

  const handleToggle = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    onToggle(period, id, !target.completed);
  };

  const categoryDot: Record<RoutineItem['category'], string> = {
    cleanse: 'bg-emerald-400',
    treat: 'bg-rose-400',
    moisturize: 'bg-sky-400',
    protect: 'bg-amber-400',
  };

  const renderItem = ({ item }: { item: RoutineItem }) => (
    <TouchableOpacity
      onPress={() => handleToggle(item.id)}
      activeOpacity={0.7}
      className="flex-row items-center bg-white rounded-xl p-4 mb-2 border border-slate-100"
    >
      {/* Checkbox */}
      <View
        className={`w-6 h-6 rounded-md border-2 mr-4 items-center justify-center ${
          item.completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-slate-300 bg-white'
        }`}
      >
        {item.completed && <Text className="text-white text-xs font-bold">✓</Text>}
      </View>

      {/* Category dot + name */}
      <View className="flex-row items-center flex-1">
        <View className={`w-2 h-2 rounded-full mr-2 ${categoryDot[item.category]}`} />
        <Text
          className={`text-base ${
            item.completed ? 'text-slate-400 line-through' : 'text-slate-900'
          }`}
        >
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-50 px-4 pt-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-xl font-bold text-slate-900">My Routine</Text>
        <View className="flex-row bg-white rounded-lg p-1 shadow-sm">
          {(['AM', 'PM'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md ${
                period === p ? 'bg-slate-900' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  period === p ? 'text-white' : 'text-slate-500'
                }`}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Progress summary */}
      <View className="flex-row items-center mb-6 bg-white rounded-xl p-4 shadow-sm">
        <View className="w-12 h-12 rounded-full border-4 border-emerald-500 items-center justify-center mr-4">
          <Text className="text-sm font-bold text-slate-900">{percent}%</Text>
        </View>
        <View>
          <Text className="text-base font-semibold text-slate-900">
            {completedCount} of {items.length} steps done
          </Text>
          <Text className="text-sm text-slate-500">
            {percent === 100
              ? 'Great job! Routine complete 🎉'
              : 'Keep going — consistency is key'}
          </Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

/* ------------------------------------------------------------------ */
// Mock data
export const mockAMRoutine: RoutineItem[] = [
  { id: 'am-1', name: 'Gentle Cleanser', category: 'cleanse', completed: true },
  { id: 'am-2', name: 'Vitamin C Serum', category: 'treat', completed: true },
  { id: 'am-3', name: 'Moisturizer', category: 'moisturize', completed: false },
  { id: 'am-4', name: 'SPF 50 Sunscreen', category: 'protect', completed: false },
];

export const mockPMRoutine: RoutineItem[] = [
  { id: 'pm-1', name: 'Oil Cleanser', category: 'cleanse', completed: true },
  { id: 'pm-2', name: 'Water-Based Cleanser', category: 'cleanse', completed: true },
  { id: 'pm-3', name: 'Retinol 0.3%', category: 'treat', completed: false },
  { id: 'pm-4', name: 'Peptide Moisturizer', category: 'moisturize', completed: false },
];

export const RoutineTrackerMock: React.FC = () => (
  <RoutineTracker
    amRoutine={mockAMRoutine}
    pmRoutine={mockPMRoutine}
    onToggle={(period, id, completed) =>
      console.log(`${period} routine: ${id} ${completed ? 'done' : 'undone'}`)
    }
  />
);
