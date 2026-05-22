import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import supplementsData from '../knowledge-graph/entities/supplements.json';
import rootCausesData from '../knowledge-graph/entities/root-causes.json';

// Recommendation Display Component
// Shows supplement recommendations based on detected root causes
// Tier 2: Supplement recommendations (evidence-based dosing)

export default function RecommendationDisplay({ rootCauseIds, conditionIds, onBasysReferral }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, [rootCauseIds, conditionIds]);

  const generateRecommendations = () => {
    setLoading(true);
    
    const recs = [];
    
    // Match supplements to root causes
    rootCauseIds.forEach(rootCauseId => {
      const rootCause = rootCausesData.find(rc => rc.id === rootCauseId);
      const matchingSupplements = supplementsData.filter(s => 
        s.root_causes_targeted?.includes(rootCauseId) ||
        s.concerns_treated?.some(c => conditionIds.includes(c))
      );
      
      matchingSupplements.forEach(supplement => {
        recs.push({
          type: 'supplement',
          rootCauseId,
          rootCauseName: rootCause?.name,
          ...supplement,
        });
      });
      
      // Check if root cause requires Basys referral
      if (rootCause?.intervention_tier === 'basys' || rootCause?.requires_lab_diagnosis) {
        recs.push({
          type: 'basys_referral',
          rootCauseId,
          rootCauseName: rootCause?.name,
          specialty: rootCause?.basys_specialty_param,
          tests: rootCause?.common_tests,
        });
      }
    });
    
    setRecommendations(recs);
    setLoading(false);
  };

  const getEvidenceColor = (level) => {
    const colors = {
      A: '#2CD674', // Green
      B: '#4A90D9', // Blue
      C: '#F5A623', // Orange
      D: '#E74C5E', // Red
    };
    return colors[level] || '#8A96A6';
  };

  const getEvidenceLabel = (level) => {
    const labels = {
      A: 'Strong evidence',
      B: 'Moderate evidence',
      C: 'Limited evidence',
      D: 'Expert opinion',
    };
    return labels[level] || 'Unknown';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2CD674" />
        <Text style={styles.loadingText}>Analyzing your skin profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Your Personalized Protocol</Text>
      <Text style={styles.subtitle}>Based on {rootCauseIds.length} detected root causes</Text>

      {recommendations.map((rec, index) => (
        <View key={`${rec.id}-${index}`}>
          {rec.type === 'supplement' && (
            <SupplementCard supplement={rec} evidenceColor={getEvidenceColor(rec.evidence_level)} />
          )}
          {rec.type === 'basys_referral' && (
            <BasysReferralCard 
              referral={rec} 
              onPress={() => onBasysReferral?.(rec)} 
            />
          )}
        </View>
      ))}

      <View style={styles.disclaimerCard}>
        <Ionicons name="information-circle-outline" size={20} color="#8A96A6" />
        <Text style={styles.disclaimerText}>
          These recommendations are based on evidence-based research. 
          Consult a healthcare provider before starting any supplement, 
          especially if pregnant, nursing, or taking medications.
        </Text>
      </View>
    </ScrollView>
  );
}

function SupplementCard({ supplement, evidenceColor }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.evidenceBadge, { backgroundColor: evidenceColor + '20' }]} >
          <Text style={[styles.evidenceText, { color: evidenceColor }]} >
            {supplement.evidence_level}
          </Text>
        </View>
        <Text style={styles.cardTitle}>{supplement.name}</Text>
      </View>

      <Text style={styles.rootCauseTag}>For: {supplement.rootCauseName}</Text>

      <View style={styles.dosageRow}>
        <Ionicons name="medical-outline" size={16} color="#4A90D9" />
        <Text style={styles.dosageText}>{supplement.dosage}</Text>
      </View>

      <TouchableOpacity 
        style={styles.expandButton}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.expandText}>
          {expanded ? 'Show less' : 'Show benefits & precautions'}
        </Text>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color="#4A90D9" 
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.sectionTitle}>Key Benefits</Text>
          {supplement.benefits?.slice(0, 3).map((benefit, i) => (
            <View key={i} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={16} color="#2CD674" />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}

          {supplement.interactions?.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Precautions</Text>
              {supplement.interactions.slice(0, 2).map((interaction, i) => (
                <View key={i} style={styles.warningRow}>
                  <Ionicons name="warning-outline" size={16} color="#F5A623" />
                  <Text style={styles.warningText}>{interaction}</Text>
                </View>
              ))}
            </>
          )}

          {supplement.pregnancy_safe && (
            <View style={styles.pregnancyBadge}>
              <Ionicons name="heart-outline" size={14} color="#E74C5E" />
              <Text style={styles.pregnancyText}>Pregnancy: {supplement.pregnancy_safe}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function BasysReferralCard({ referral, onPress }) {
  return (
    <TouchableOpacity style={styles.basysCard} onPress={onPress}>
      <View style={styles.basysHeader}>
        <Ionicons name="medical" size={24} color="#4A90D9" />
        <View style={styles.basysBadge}>
          <Text style={styles.basysBadgeText}>Basys Health</Text>
        </View>
      </View>

      <Text style={styles.basysTitle}>
        Consult a specialist for {referral.rootCauseName}
      </Text>
      <Text style={styles.basysDescription}>
        This root cause requires lab testing and professional diagnosis. 
        Connect with a {referral.specialty} through Basys Health.
      </Text>

      {referral.tests && referral.tests.length > 0 && (
        <View style={styles.testsContainer}>
          <Text style={styles.testsTitle}>Recommended tests:</Text>
          {referral.tests.map((test, i) => (
            <Text key={i} style={styles.testItem}>• {test}</Text>
          ))}
        </View>
      )}

      <View style={styles.ctaButton}>
        <Text style={styles.ctaText}>Find a Specialist →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F3',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F6F3',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#5A6B7F',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A2647',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A96A6',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  evidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  evidenceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2647',
    flex: 1,
  },
  rootCauseTag: {
    fontSize: 13,
    color: '#4A90D9',
    marginBottom: 12,
    fontWeight: '500',
  },
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    padding: 12,
    borderRadius: 12,
  },
  dosageText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#0A2647',
    fontWeight: '500',
    flex: 1,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  expandText: {
    fontSize: 14,
    color: '#4A90D9',
    marginRight: 4,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A6B7F',
    marginBottom: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  benefitText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#0A2647',
    flex: 1,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#8A6B3F',
    flex: 1,
  },
  pregnancyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  pregnancyText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#E74C5E',
    fontWeight: '500',
  },
  basysCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4A90D9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  basysHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  basysBadge: {
    backgroundColor: '#4A90D920',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  basysBadgeText: {
    color: '#4A90D9',
    fontSize: 12,
    fontWeight: '600',
  },
  basysTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2647',
    marginBottom: 8,
  },
  basysDescription: {
    fontSize: 14,
    color: '#5A6B7F',
    lineHeight: 20,
    marginBottom: 12,
  },
  testsContainer: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  testsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A90D9',
    marginBottom: 6,
  },
  testItem: {
    fontSize: 13,
    color: '#5A6B7F',
    marginBottom: 2,
  },
  ctaButton: {
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  disclaimerText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#8A96A6',
    flex: 1,
    lineHeight: 18,
  },
});
