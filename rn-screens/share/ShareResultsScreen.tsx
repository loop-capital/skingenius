import React, { useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../types/navigation';

// Types
type ShareResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ShareResults'>;

// Mock data
const mockProfessionals = [
  { id: '1', name: 'Dr. Alex Chen', specialty: 'Dermatologist', location: 'New York, NY', rating: 4.9, photo: 'https://randomuser.me/api/portraits/men/32.jpg', isFavorite: true },
  { id: '2', name: 'Samanta Lee', specialty: 'Esthetician', location: 'Los Angeles, CA', rating: 4.8, photo: 'https://randomuser.me/api/portraits/women/44.jpg', isFavorite: false },
  { id: '3', name: 'Dr. Morgan Patel', specialty: 'Nutritionist', location: 'Chicago, IL', rating: 4.7, photo: 'https://randomuser.me/api/portraits/men/45.jpg', isFavorite: true },
  { id: '4', name: 'Taylor Gomez', specialty: 'Dermatologist', location: 'Miami, FL', rating: 4.9, photo: 'https://randomuser.me/api/portraits/women/22.jpg', isFavorite: false },
  { id: '5', name: 'Jordan Kim', specialty: 'Holistic Practitioner', location: 'Seattle, WA', rating: 4.6, photo: 'https://randomuser.me/api/portraits/men/18.jpg', isFavorite: false },
];

const mockShareHistory = [
  { id: 'h1', date: '2026-05-10', professional: 'Dr. Alex Chen', status: 'Pending' },
  { id: 'h2', date: '2026-05-05', professional: 'Samanta Lee', status: 'Accepted' },
];

// Mock analysis results (would come from previous screen)
const mockAnalysis = {
  overallScore: 85,
  topConditions: [
    { name: 'Acne', severity: 'Moderate' },
    { name: 'Redness', severity: 'Mild' },
    { name: 'Oiliness', severity: 'High' },
  ],
  rootCauses: {
    gut: 30,
    hormones: 25,
    nutrition: 20,
    lifestyle: 25,
  },
  ingredientRecommendations: [
    { name: 'Niacinamide', reason: 'Reduces inflammation and regulates oil' },
    { name: 'Zinc PCA', reason: 'Controls sebum production' },
    { name: 'Green Tea Extract', reason: 'Antioxidant, soothes redness' },
    { name: 'Salicylic Acid', reason: 'Exfoliates, unclogs pores' },
    { name: 'Hyaluronic Acid', reason: 'Hydrates without clogging pores' },
  ],
};

export default function ShareResultsScreen() {
  const navigation = useNavigation<ShareResultsScreenNavigationProp>();
  const route = useRoute<RootStackParamList['ShareResults']>();
  
  // State
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('All');
  const [shareFullAnalysis, setShareFullAnalysis] = useState<boolean>(true);
  const [shareSummaryOnly, setShareSummaryOnly] = useState<boolean>(false);
  const [shareSections, setShareSections] = useState<{ conditions: boolean; rootCauses: boolean; recommendations: boolean }>({
    conditions: true,
    rootCauses: true,
    recommendations: true,
  });
  const [personalNote, setPersonalNote] = useState('');
  const [privacyPhoto, setPrivacyPhoto] = useState<boolean>(true);
  const [privacyAge, setPrivacyAge] = useState<boolean>(true);
  const [privacyMedications, setPrivacyMedications] = useState<boolean>(false);
  const [expirationDays, setExpirationDays] = useState<'7' | '30' | '90'>('30');
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState<boolean>(false);
  const [isShareSuccessVisible, setIsShareSuccessVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Computed values
  const filteredProfessionals = mockProfessionals
    .filter(prof => 
      (filterSpecialty === 'All' || prof.specialty === filterSpecialty) &&
      prof.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1)); // Favorites first

  const selectedProfessional = selectedProfessionalId ? mockProfessionals.find(p => p.id === selectedProfessionalId) : null;

  // Handlers
  const handleSelectProfessional = (id: string) => {
    setSelectedProfessionalId(id);
  };

  const handleToggleShareOption = (type: 'full' | 'summary') => {
    if (type === 'full') {
      setShareFullAnalysis(!shareFullAnalysis);
      if (shareFullAnalysis) setShareSummaryOnly(false); // Mutual exclusion
    } else {
      setShareSummaryOnly(!shareSummaryOnly);
      if (shareSummaryOnly) setShareFullAnalysis(false); // Mutual exclusion
    }
  };

  const handleToggleSection = (section: keyof typeof shareSections) => {
    setShareSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSendShare = () => {
    if (!selectedProfessionalId) {
      Alert.alert('Please select a professional to share with');
      return;
    }
    setIsConfirmationModalVisible(true);
  };

  const handleConfirmShare = async () => {
    setIsConfirmationModalVisible(false);
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsShareSuccessVisible(true);
  };

  const handleCloseSuccess = () => {
    setIsShareSuccessVisible(false);
    navigation.goBack(); // Or navigate to home
  };

  // Render
  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      {/* Header */}
      <View style={{ padding: 16, backgroundColor: '#fff', elevation: 2, marginBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '600' }}>Share Your Results</Text>
        <Text style={{ color: '#666', marginTop: 4 }}>Get professional advice from GetUpLook experts</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Results Summary Card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, elevation: 2, marginBottom: 16, overflow: 'hidden' }}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Your Skin Analysis Results</Text>
            
            {/* Overall Score */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: mockAnalysis.overallScore >= 80 ? '#4ade80' : mockAnalysis.overallScore >= 60 ? '#fbbf24' : '#f87171' }}>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{mockAnalysis.overallScore}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '500' }}>Overall Skin Score</Text>
                <Text style={{ color: '#666', fontSize: 14 }}>{mockAnalysis.overallScore >= 80 ? 'Excellent' : mockAnalysis.overallScore >= 60 ? 'Good' : 'Needs Improvement'}</Text>
              </View>
            </View>
            
            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 8 }} />
            
            {/* Top Conditions */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 6 }}>Top Conditions Detected</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {mockAnalysis.topConditions.map((condition, index) => (
                  <View key={index} style={{ 
                    paddingHorizontal: 10, 
                    paddingVertical: 4, 
                    backgroundColor: '#f0f9ff', 
                    borderRadius: 12 
                  }}>
                    <Text style={{ fontSize: 12, color: '#0369a1' }}>{condition.name}</Text>
                    <Text style={{ fontSize: 10, color: '#64748b' }}>{condition.severity}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {/* Root Cause Breakdown */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 6 }}>Root Cause Breakdown</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: '#666' }}>Gut</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Hormones</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Nutrition</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Lifestyle</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '500' }}>{mockAnalysis.rootCauses.gut}%</Text>
                <Text style={{ fontSize: 12, fontWeight: '500' }}>{mockAnalysis.rootCauses.hormones}%</Text>
                <Text style={{ fontSize: 12, fontWeight: '500' }}>{mockAnalysis.rootCauses.nutrition}%</Text>
                <Text style={{ fontSize: 12, fontWeight: '500' }}>{mockAnalysis.rootCauses.lifestyle}%</Text>
              </View>
            </View>
            
            {/* Ingredient Recommendations */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 6 }}>Top Ingredient Recommendations</Text>
              <View style={{ 
                padding: 12, 
                backgroundColor: '#f0fdf4', 
                borderRadius: 8 
              }}>
                {mockAnalysis.ingredientRecommendations.map((ing, index) => (
                  <View key={index} style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: '500' }}>{ing.name}</Text>
                    <Text style={{ fontSize: 11, color: '#555' }}>{ing.reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Professional Selector */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, elevation: 2, marginBottom: 16, overflow: 'hidden' }}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Choose a Professional</Text>
            
            {/* Search and Filter */}
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <TextInput
                placeholder="Search by name or location"
                value={searchTerm}
                onChangeText={setSearchTerm}
                style={{ 
                  flex: 1, 
                  padding: 10, 
                  borderWidth: 1, 
                  borderColor: '#ddd', 
                  borderRadius: 8,
                  paddingHorizontal: 12
                }}
              />
              <TouchableOpacity 
                style={{ 
                  marginLeft: 8, 
                  padding: 10, 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: 8 
                }}
                onPress={() => { /* Open filter modal - simplified */ }}
              >
                <Text style={{ fontSize: 14 }}>Filter</Text>
              </TouchableOpacity>
            </View>
            
            {/* Specialty Filter Chips (simplified) */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              <TouchableOpacity 
                style={[
                  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: filterSpecialty === 'All' ? '#3b82f6' : '#e5e7eb' },
                  filterSpecialty === 'All' && { color: '#fff' }
                ]}
                onPress={() => setFilterSpecialty('All')}
              >
                <Text style={{ fontSize: 12, color: filterSpecialty === 'All' ? '#fff' : '#666' }}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: filterSpecialty === 'Dermatologist' ? '#3b82f6' : '#e5e7eb' },
                  filterSpecialty === 'Dermatologist' && { color: '#fff' }
                ]}
                onPress={() => setFilterSpecialty('Dermatologist')}
              >
                <Text style={{ fontSize: 12, color: filterSpecialty === 'Dermatologist' ? '#fff' : '#666' }}>Dermatologist</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: filterSpecialty === 'Esthetician' ? '#3b82f6' : '#e5e7eb' },
                  filterSpecialty === 'Esthetician' && { color: '#fff' }
                ]}
                onPress={() => setFilterSpecialty('Esthetician')}
              >
                <Text style={{ fontSize: 12, color: filterSpecialty === 'Esthetician' ? '#fff' : '#666' }}>Esthetician</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: filterSpecialty === 'Nutritionist' ? '#3b82f6' : '#e5e7eb' },
                  filterSpecialty === 'Nutritionist' && { color: '#fff' }
                ]}
                onPress={() => setFilterSpecialty('Nutritionist')}
              >
                <Text style={{ fontSize: 12, color: filterSpecialty === 'Nutritionist' ? '#fff' : '#666' }}>Nutritionist</Text>
              </TouchableOpacity>
            </View>
            
            {/* Professionals List */}
            <View style={{ 
              maxHeight: 200, 
              // Simple list without FlatList for brevity in this example
            }}>
              {filteredProfessionals.map(prof => (
                <TouchableOpacity 
                  key={prof.id}
                  style={[
                    { 
                      padding: 12, 
                      marginBottom: 8, 
                      borderWidth: 1, 
                      borderColor: selectedProfessionalId === prof.id ? '#3b82f6' : '#e5e7eb',
                      borderRadius: 8,
                      backgroundColor: selectedProfessionalId === prof.id ? '#eff6ff' : '#fff'
                    }
                  ]}
                  onPress={() => handleSelectProfessional(prof.id)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image 
                      source={{ uri: prof.photo }} 
                      style={{ width: 50, height: 50, borderRadius: 25 }} 
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600' }}>{prof.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Text style={{ fontSize: 12, color: '#666' }}>{prof.specialty}</Text>
                        <Text style={{ marginLeft: 8, color: '#999' }}>|</Text>
                        <Text style={{ fontSize: 12, color: '#666' }}>{prof.location}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        {[1,2,3,4,5].map(star => (
                          <Text 
                            key={star} 
                            style={{ 
                              marginRight: 1, 
                              color: star <= Math.floor(prof.rating) ? '#fbbf24' : star <= prof.rating ? '#fdba74' : '#e5e7eb'
                            }}
                          >
                            ⭐
                          </Text>
                        ))}
                        <Text style={{ marginLeft: 4, fontSize: 12, color: '#666' }}>{prof.rating}</Text>
                      </View>
                    </View>
                    {prof.isFavorite && (
                      <View style={{ position: 'absolute', right: 12, top: 12 }}>
                        <Text style={{ color: '#fbbf24', fontSize: 16 }}>&starf;</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Recently Consulted (simplified) */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 6 }}>Recently Consulted</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {mockShareHistory.slice(0, 2).map(hist => (
                  <View key={hist.id} style={{ 
                    padding: 8, 
                    backgroundColor: '#f9fafb', 
                    borderRadius: 6 
                  }}>
                    <Text style={{ fontSize: 12, color: '#555' }}>{hist.professional.split(' ')[0]}</Text>
                    <Text style={{ fontSize: 10, color: '#999' }}>{hist.status}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Share Options */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, elevation: 2, marginBottom: 16, overflow: 'hidden' }}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>What to Share</Text>
            
            <View style={{ marginBottom: 12 }}>
              <TouchableOpacity 
                style={[
                  { 
                    padding: 12, 
                    borderWidth: 1, 
                    borderColor: shareFullAnalysis ? '#3b82f6' : '#ddd', 
                    borderRadius: 8,
                    backgroundColor: shareFullAnalysis ? '#eff6ff' : '#fff'
                  ]
                ]}
                onPress={() => handleToggleShareOption('full')}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '500' }}>Full Analysis</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>Photo + all data</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={{ marginBottom: 12 }}>
              <TouchableOpacity 
                style={[
                  { 
                    padding: 12, 
                    borderWidth: 1, 
                    borderColor: shareSummaryOnly ? '#3b82f6' : '#ddd', 
                    borderRadius: 8,
                    backgroundColor: shareSummaryOnly ? '#eff6ff' : '#fff'
                  ]
                ]}
                onPress={() => handleToggleShareOption('summary')}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '500' }}>Summary Only</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>Score + top insights</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6 }}>Specific Sections</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <TouchableOpacity 
                  style={[
                    { 
                      paddingHorizontal: 12, 
                      paddingVertical: 6, 
                      borderRadius: 16,
                      backgroundColor: shareSections.conditions ? '#3b82f6' : '#e5e7eb'
                    }
                  ]}
                  onPress={() => handleToggleSection('conditions')}
                >
                  <Text style={{ 
                    fontSize: 12, 
                    color: shareSections.conditions ? '#fff' : '#666' 
                  }}>
                    Conditions
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    { 
                      paddingHorizontal: 12, 
                      paddingVertical: 6, 
                      borderRadius: 16,
                      backgroundColor: shareSections.rootCauses ? '#3b82f6' : '#e5e7eb'
                    }
                  ]}
                  onPress={() => handleToggleSection('rootCauses')}
                >
                  <Text style={{ 
                    fontSize: 12, 
                    color: shareSections.rootCauses ? '#fff' : '#666' 
                  }}>
                    Root Causes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    { 
                      paddingHorizontal: 12, 
                      paddingVertical: 6, 
                      borderRadius: 16,
                      backgroundColor: shareSections.recommendations ? '#3b82f6' : '#e5e7eb'
                    }
                  ]}
                  onPress={() => handleToggleSection('recommendations')}
                >
                  <Text style={{ 
                    fontSize: 12, 
                    color: shareSections.recommendations ? '#fff' : '#666' 
                  }}>
                    Recommendations
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy Controls */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, elevation: 2, marginBottom: 16, overflow: 'hidden' }}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Privacy Controls</Text>
            
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14 }}>Include Photo</Text>
                <Switch 
                  value={privacyPhoto} 
                  onValueChange={setPrivacyPhoto} 
                  trackColor={{ false: '#767676', true: '#81b622' }}
                  thumbColor={privacyPhoto ? '#f5dd4b' : '#f4f3f4'}
                />
              </View>
            </View>
            
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14 }}>Include Age</Text>
                <Switch 
                  value={privacyAge} 
                  onValueChange={setPrivacyAge} 
                  trackColor={{ false: '#767676', true: '#81b622' }}
                  thumbColor={privacyAge ? '#f5dd4b' : '#f4f3f4'}
                />
              </View>
            </View>
            
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14 }}>Include Medications</Text>
                <Switch 
                  value={privacyMedications} 
                  onValueChange={setPrivacyMedications} 
                  trackColor={{ false: '#767676', true: '#81b622' }}
                  thumbColor={privacyMedications ? '#f5dd4b' : '#f4f3f4'}
                />
              </View>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6 }}>Link Expires In</Text>
              <View style={{ flexDirection: 'row' }}>
                {['7', '30', '90'].map(days => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      { 
                        paddingHorizontal: 12, 
                        paddingVertical: 8, 
                        marginRight: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: expirationDays === days ? '#3b82f6' : '#ddd',
                        backgroundColor: expirationDays === days ? '#eff6ff' : '#fff'
                      }
                    ]}
                    onPress={() => setExpirationDays(days as '7' | '30' | '90')}
                  >
                    <Text style={{ fontSize: 12, color: expirationDays === days ? '#3b82f6' : '#666' }}>
                      {days} days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14 }}>Add Personal Note</Text>
                <TouchableOpacity 
                  style={{ 
                    paddingHorizontal: 12, 
                    paddingVertical: 6, 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: 6 
                  }}
                  onPress={() => { /* Open note input - simplified */ }}
                >
                  <Text style={{ fontSize: 12, color: '#666' }}>Add note</Text>
                </TouchableOpacity>
              </View>
              {personalNote && (
                <View style={{ 
                  marginTop: 6, 
                  padding: 8, 
                  backgroundColor: '#fff3cd', 
                  borderRadius: 4 
                }}>
                  <Text style={{ fontSize: 12, color: '#664d03' }}>{personalNote}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Send Button */}
        <TouchableOpacity 
          style={{ 
            marginHorizontal: 16, 
            marginVertical: 24, 
            paddingVertical: 14, 
            backgroundColor: selectedProfessionalId ? '#3b82f6' : '#9ca3af', 
            borderRadius: 8, 
            alignItems: 'center' 
          }}
          disabled={!selectedProfessionalId || isLoading}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {isLoading ? 'Sending...' : 'Send Share Request'}
          </Text>
        </TouchableOpacity>
        
        {/* Share History */}
        <View style={{ 
          marginHorizontal: 16, 
          marginBottom: 24, 
          alignItems: 'center' 
        }}>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Share History</Text>
          <View style={{ 
            width: '100%', 
            maxHeight: 80, 
            // Simple list
          }}>
            {mockShareHistory.map(hist => (
              <View key={hist.id} style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingVertical: 6, 
                borderBottomWidth: 1, 
                borderColor: '#eee' 
              }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '500' }}>{hist.professional}</Text>
                  <Text style={{ fontSize: 10, color: '#666' }}>{hist.date}</Text>
                </View>
                <Text style={{ 
                  fontSize: 10, 
                  color: hist.status === 'Accepted' ? '#10b981' : hist.status === 'Pending' ? '#f59e0b' : '#ef4444' 
                }}>
                  {hist.status}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Confirmation Modal */}
      <Modal 
        visible={isConfirmationModalVisible} 
        transparent={true}
        animationType="fade"
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ 
            width: '80%', 
            backgroundColor: '#fff', 
            borderRadius: 12, 
            padding: 24,
            elevation: 5
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 16 }}>
              Confirm Share Request
            </Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6 }}>To:</Text>
              <Text style={{ fontSize: 14, color: '#3b82f6' }}>{selectedProfessional?.name}</Text>
              <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{selectedProfessional?.specialty}, {selectedProfessional?.location}</Text>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6 }}>Sharing:</Text>
              <View style={{ 
                marginLeft: 8, 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                gap: 6 
              }}>
                {shareFullAnalysis && (
                  <View style={{ 
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    backgroundColor: '#dbeafe', 
                    borderRadius: 12 
                  }}>
                    <Text style={{ fontSize: 12, color: '#1e40af' }}>Full Analysis</Text>
                  </View>
                )}
                {shareSummaryOnly && (
                  <View style={{ 
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    backgroundColor: '#dbeafe', 
                    borderRadius: 12 
                  }}>
                    <Text style={{ fontSize: 12, color: '#1e40af' }}>Summary Only</Text>
                  </View>
                )}
                {shareSections.conditions && (
                  <View style={{ 
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    backgroundColor: '#dbeafe', 
                    borderRadius: 12 
                  }}>
                    <Text style={{ fontSize: 12, color: '#1e40af' }}>Conditions</Text>
                  </View>
                )}
                {shareSections.rootCauses && (
                  <View style={{ 
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    backgroundColor: '#dbeafe', 
                    borderRadius: 12 
                  }}>
                    <Text style={{ fontSize: 12, color: '#1e40af' }}>Root Causes</Text>
                  </View>
                )}
                {shareSections.recommendations && (
                  <View style={{ 
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    backgroundColor: '#dbeafe', 
                    borderRadius: 12 
                  }}>
                    <Text style={{ fontSize: 12, color: '#1e40af' }}>Recommendations</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6 }}>Privacy Settings:</Text>
              <View style={{ marginLeft: 8 }}>
                {privacyPhoto && <Text style={{ fontSize: 12, marginBottom: 2 }}>• Photo included</Text>}
                {privacyAge && <Text style={{ fontSize: 12, marginBottom: 2 }}>• Age included</Text>}
                {privacyMedications && <Text style={{ fontSize: 12, marginBottom: 2 }}>• Medications included</Text>}
                <Text style={{ fontSize: 12, marginBottom: 2 }}>• Link expires in {expirationDays} days</Text>
              </View>
            </View>
            
            {personalNote && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6 }}>Personal Note:</Text>
                <View style={{ 
                  marginLeft: 8, 
                  padding: 8, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 4 
                }}>
                  <Text style={{ fontSize: 12, color: '#334155' }}>{personalNote}</Text>
                </View>
              </View>
            )}
            
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity 
                style={{ 
                  paddingHorizontal: 16, 
                  paddingVertical: 8, 
                  borderWidth: 1, 
                  borderColor: '#9ca3af', 
                  borderRadius: 6 
                }}
                onPress={() => setIsConfirmationModalVisible(false)}
              >
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ 
                  paddingHorizontal: 16, 
                  paddingVertical: 8, 
                  backgroundColor: '#3b82f6', 
                  borderRadius: 6 
                }}
                onPress={handleConfirmShare}
                disabled={isLoading}
              >
                <Text style={{ fontSize: 14, color: '#fff' }}>
                  {isLoading ? 'Sending...' : 'Send'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Success Modal */}
      <Modal 
        visible={isShareSuccessVisible} 
        transparent={true}
        animationType="fade"
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ 
            width: '80%', 
            backgroundColor: '#fff', 
            borderRadius: 12, 
            padding: 24,
            alignItems: 'center',
            elevation: 5
          }}>
            <Text style={{ fontSize: 24, marginBottom: 12 }}>✓</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 8 }}>Share Sent!</Text>
            <Text style={{ fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 16 }}>
              Your request has been sent to {selectedProfessional?.name}. They'll review it and respond soon.
            </Text>
            <TouchableOpacity 
              style={{ 
                paddingHorizontal: 24, 
                paddingVertical: 10, 
                backgroundColor: '#3b82f6', 
                borderRadius: 6 
              }}
              onPress={handleCloseSuccess}
            >
              <Text style={{ fontSize: 14, color: '#fff', fontWeight: '500' }}>Track Response</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Mock TextInput component since we didn't import it
const TextInput = ({ placeholder, value, onChangeText, style }: { 
  placeholder: string; 
  value: string; 
  onChangeText: (text: string) => void; 
  style: any 
}) => {
  return (
    <View style={[style, { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8 }]}>
      {/* Simplified - in real app would be actual TextInput */}
    </View>
  );
};

// Mock Switch component
const Switch = ({ value, onValueChange, trackColor, thumbColor }: { 
  value: boolean; 
  onValueChange: (value: boolean) => void; 
  trackColor: any; 
  thumbColor: string 
}) => {
  return (
    <View style={{ width: 40, height: 20 }}>
      {/* Simplified switch */}
    </View>
  );
};