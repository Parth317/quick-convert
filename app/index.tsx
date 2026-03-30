import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Swap this string out with your real Ad Unit ID (the one with the slash /)
const productionAdId = 'ca-app-pub-2476985545128960/3313217791';
const adUnitId = __DEV__ ? TestIds.BANNER : productionAdId; // <--- And paste this here

// 1. THE DYNAMIC AMOUNT GENERATOR
const getDynamicAmounts = (currency: string) => {
  const standardAmounts = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 5000];

  // For ultra-high denomination currencies like Vietnamese Dong
  if (currency === 'VND' || currency === 'IDR') {
    return standardAmounts.map(amount => amount * 10000);
    // Generates: 10k, 50k, 100k, 250k, 500k, 1M, 2.5M, 5M, 10M, 50M
  }

  // For medium denomination currencies like Japanese Yen
  if (currency === 'JPY' || currency === 'KRW') {
    return standardAmounts.map(amount => amount * 100);
    // Generates: 100, 500, 1k, 2.5k, 5k, 10k, 25k, 50k, 100k, 500k
  }

  // Default for USD, EUR, GBP, AUD, etc.
  return standardAmounts;
};

const ABSOLUTE_FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 151.25, VND: 25430, AUD: 1.53, CAD: 1.36, CHF: 0.90, NZD: 1.66
};

export default function MainScreen() {
  const insets = useSafeAreaInsets();

  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('VND');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const [showConsent, setShowConsent] = useState(false);
  const [adsInitialized, setAdsInitialized] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'base' | 'target'>('target');

  // 2. GET THE RIGHT AMOUNTS FOR THE CURRENT BASE CURRENCY
  const currentAmounts = getDynamicAmounts(baseCurrency);

  useEffect(() => {
    checkConsent();
    fetchRates();
  }, [baseCurrency]);

  const checkConsent = async () => {
    const hasSeenConsent = await AsyncStorage.getItem('@has_seen_consent');
    if (!hasSeenConsent) {
      setShowConsent(true);
    } else {
      initializeAds();
    }
  };

  const initializeAds = () => {
    mobileAds().initialize().then(() => setAdsInitialized(true));
  };

  const handleConsentResponse = async (accepted: boolean) => {
    await AsyncStorage.setItem('@has_seen_consent', 'true');
    setShowConsent(false);
    initializeAds();
  };

  const fetchRates = async () => {
    setIsLoading(true);
    setIsOffline(false);
    const cacheKey = `@rates_cache_${baseCurrency}`;
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      if (!response.ok) throw new Error('Network offline');
      const data = await response.json();
      setRates(data.rates);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data.rates));
    } catch (error) {
      setIsOffline(true);
      const cachedData = await AsyncStorage.getItem(cacheKey);
      setRates(cachedData ? JSON.parse(cachedData) : ABSOLUTE_FALLBACK_RATES);
    } finally {
      setIsLoading(false);
    }
  };

  const swapCurrencies = () => {
    const oldBase = baseCurrency;
    const oldTarget = targetCurrency;
    setBaseCurrency(oldTarget);
    setTargetCurrency(oldBase);
  };

  const selectCurrency = (currency: string) => {
    if (selectingFor === 'base') setBaseCurrency(currency);
    else setTargetCurrency(currency);
    setModalVisible(false);
  };

  const formatAmount = (val: number, currency: string) => {
    if (currency === 'VND' || currency === 'JPY') return Math.round(val).toLocaleString('en-US');
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const currentRate = rates[targetCurrency] || 1;
  const availableCurrencies = Object.keys(rates).length > 0 ? Object.keys(rates) : Object.keys(ABSOLUTE_FALLBACK_RATES);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Header with SWAP Button */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>QUICKCONVERT</Text>
        <View style={styles.currencyToggle}>
          <TouchableOpacity onPress={() => { setSelectingFor('base'); setModalVisible(true); }}>
            <Text style={styles.baseText}>{baseCurrency}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={swapCurrencies} style={styles.swapIconWrapper}>
            <Ionicons name="swap-horizontal" size={24} color="#4A90E2" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setSelectingFor('target'); setModalVisible(true); }}>
            <Text style={styles.targetText}>{targetCurrency}</Text>
          </TouchableOpacity>
        </View>
        {isOffline && <Text style={styles.offlineText}>• OFFLINE MODE</Text>}
      </View>

      {/* Main List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : (
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {/* 3. MAP OVER THE DYNAMIC AMOUNTS */}
          {currentAmounts.map((amount) => (
            <View key={amount} style={styles.row}>
              <Text style={styles.baseAmount} adjustsFontSizeToFit numberOfLines={1}>
                {formatAmount(amount, baseCurrency)}
              </Text>
              <Text style={styles.targetAmount} adjustsFontSizeToFit numberOfLines={1}>
                {formatAmount(amount * currentRate, targetCurrency)}
              </Text>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Alchemist Consent Modal */}
      <Modal visible={showConsent} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.brutalistCard}>
            <Ionicons name="sparkles" size={32} color="#E9C176" style={{ marginBottom: 15 }} />
            <Text style={styles.consentTitle}>OPTIMIZE YOUR TRIP</Text>
            <Text style={styles.consentBody}>
              Help keep QuickConvert free. Allow personalization to see travel-relevant deals
              and local currency insights tailored to your current location.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => handleConsentResponse(true)}>
              <Text style={styles.primaryBtnText}>PERSONALIZE EXPERIENCE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleConsentResponse(false)}>
              <Text style={styles.secondaryBtnText}>Show random ads instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Live AdBanner */}
      <View style={[styles.adContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {adsInitialized ? (
          <BannerAd unitId={adUnitId} size={BannerAdSize.BANNER} />
        ) : (
          <View style={styles.adPlaceholder} />
        )}
      </View>

      {/* Currency Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.currencyModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#E9C176" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={availableCurrencies}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalRow} onPress={() => selectCurrency(item)}>
                <Text style={styles.modalText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#110F0E' },
  header: { alignItems: 'center', paddingBottom: 20, paddingTop: 10 },
  appTitle: { color: '#E9C176', fontSize: 14, fontWeight: '900', letterSpacing: 4, marginBottom: 15 },
  currencyToggle: { flexDirection: 'row', alignItems: 'center' },
  baseText: { color: '#E9C176', fontSize: 24, fontWeight: '900' },
  targetText: { color: '#4A90E2', fontSize: 24, fontWeight: '900' },
  swapIconWrapper: { paddingHorizontal: 20 },
  offlineText: { color: '#FF4444', fontSize: 10, fontWeight: 'bold', marginTop: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center' },
  listContainer: { flex: 1 },
  row: { flexDirection: 'row', paddingVertical: 24 },
  baseAmount: { flex: 1, textAlign: 'right', paddingRight: 20, color: '#E9C176', fontSize: 32, fontWeight: '900' },
  targetAmount: { flex: 1, textAlign: 'left', paddingLeft: 20, color: '#A4C9FF', fontSize: 32, fontWeight: 'bold' },
  adContainer: { width: '100%', alignItems: 'center', backgroundColor: '#110F0E', borderTopWidth: 1, borderTopColor: '#1C1A18', paddingTop: 10 },
  adPlaceholder: { height: 50 },

  // PRE-PROMPT
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  brutalistCard: { backgroundColor: '#1C1B1B', borderWidth: 2, borderColor: '#E9C176', padding: 30, width: '100%', alignItems: 'center' },
  consentTitle: { color: '#E9C176', fontSize: 20, fontWeight: '900', letterSpacing: 2, marginBottom: 15 },
  consentBody: { color: '#BBB', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  primaryBtn: { backgroundColor: '#E9C176', paddingVertical: 15, width: '100%', alignItems: 'center', marginBottom: 15 },
  primaryBtnText: { color: '#110F0E', fontWeight: '900', fontSize: 14 },
  secondaryBtn: { paddingVertical: 10 },
  secondaryBtnText: { color: '#666', fontSize: 12, textDecorationLine: 'underline' },

  // CURRENCY MODAL
  currencyModal: { flex: 1, backgroundColor: '#110F0E', marginTop: 60, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { color: '#E9C176', fontSize: 20, fontWeight: 'bold' },
  modalRow: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  modalText: { color: '#FFF', fontSize: 22 },
});