import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native';

interface Ingredient {
  id: string;
  name: string;
  category: 'active' | 'moisturizer' | 'cleanser' | 'sunscreen' | 'treatment';
  benefit: string;
  concern: string;       // e.g., "acne", "aging", "dryness"
  imageUrl?: string;
  added: boolean;
}

interface IngredientRecommendationsProps {
  ingredients: Ingredient[];
  onToggle: (id: string, added: boolean) => void;
}

/**
 * IngredientRecommendations — Card list with add/remove functionality
 *
 * Displays a vertically-scrollable list of skincare ingredient cards.
 * Each card shows:
 *   • Thumbnail (optional)
 *   • Name + category badge
 *   • Benefit one-liner
 *   • Target concern
 *   • Add / Remove button with optimistic UI update
 *
 * Tailwind classes used for layout; assumes a global CSS reset
 * (e.g., via NativeWind or twrnc).
 */
export const IngredientRecommendations: React.FC<
  IngredientRecommendationsProps
> = ({ ingredients, onToggle }) => {
  const [localList, setLocalList] = useState<Ingredient[]>(ingredients);

  const handleToggle = (id: string) => {
    setLocalList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, added: !item.added } : item
      )
    );
    const target = localList.find((i) => i.id === id);
    if (target) onToggle(id, !target.added);
  };

  const categoryColor: Record<Ingredient['category'], string> = {
    active: 'bg-rose-100 text-rose-700',
    moisturizer: 'bg-sky-100 text-sky-700',
    cleanser: 'bg-emerald-100 text-emerald-700',
    sunscreen: 'bg-amber-100 text-amber-700',
    treatment: 'bg-violet-100 text-violet-700',
  };

  const renderItem = ({ item }: { item: Ingredient }) => (
    <View className="flex-row items-start bg-white rounded-xl p-4 mb-3 shadow-sm border border-slate-100">
      {/* Thumbnail placeholder */}
      <View className="w-14 h-14 rounded-lg bg-slate-200 mr-4 overflow-hidden">
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} className="w-full h-full" />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-slate-400 text-xs">IMG</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-base font-semibold text-slate-900 mr-2">
            {item.name}
          </Text>
          <View className={`px-2 py-0.5 rounded-full ${categoryColor[item.category].split(' ')[0]}`}>
            <Text className={`text-xs font-medium ${categoryColor[item.category].split(' ')[1]}`}>
              {item.category}
            </Text>
          </View>
        </View>
        <Text className="text-sm text-slate-600 mb-1">{item.benefit}</Text>
        <Text className="text-xs text-slate-400">Targets: {item.concern}</Text>
      </View>

      {/* Toggle button */}
      <TouchableOpacity
        onPress={() => handleToggle(item.id)}
        activeOpacity={0.7}
        className={`px-3 py-2 rounded-lg ${
          item.added ? 'bg-emerald-500' : 'bg-slate-900'
        }`}
      >
        <Text className="text-white text-sm font-medium">
          {item.added ? 'Added' : 'Add'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 px-4 pt-4">
      <Text className="text-lg font-bold text-slate-900 mb-4">
        Recommended Ingredients
      </Text>
      <FlatList
        data={localList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

/* ------------------------------------------------------------------ */
// Mock data for development / Storybook
export const mockIngredients: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Niacinamide 10%',
    category: 'active',
    benefit: 'Reduces pores, balances oil, brightens tone',
    concern: 'uneven texture / oiliness',
    added: false,
  },
  {
    id: 'ing-2',
    name: 'Hyaluronic Acid',
    category: 'moisturizer',
    benefit: 'Deep hydration, plumps fine lines',
    concern: 'dryness / dehydration',
    added: true,
  },
  {
    id: 'ing-3',
    name: 'Salicylic Acid 2%',
    category: 'treatment',
    benefit: 'Unclogs pores, exfoliates inside follicle',
    concern: 'acne / blackheads',
    added: false,
  },
  {
    id: 'ing-4',
    name: 'Zinc Oxide SPF 50',
    category: 'sunscreen',
    benefit: 'Broad-spectrum UV protection, non-irritating',
    concern: 'UV damage / photo-aging',
    added: true,
  },
  {
    id: 'ing-5',
    name: 'Gentle Foam Cleanser',
    category: 'cleanser',
    benefit: 'Removes impurities without stripping barrier',
    concern: 'sensitivity / barrier repair',
    added: false,
  },
];

export const IngredientRecommendationsMock: React.FC = () => (
  <IngredientRecommendations
    ingredients={mockIngredients}
    onToggle={(id, added) =>
      console.log(`Ingredient ${id} ${added ? 'added' : 'removed'}`)
    }
  />
);
