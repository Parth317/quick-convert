import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AMOUNTS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 5000, 10000, 50000];

// Absolute fallback just in case it's their very first time opening the app offline
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

  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'base' | 'target'>('target');

  // THE LIVE DATA & CACHE ENGINE
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      setIsOffline(false);

      const cacheKey = `@rates_cache_${baseCurrency}`;

      try {
        // 1. Attempt to fetch live market data
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
        if (!response.ok) throw new Error('Network offline or API down');

        const data = await response.json();
        setRates(data.rates);

        // 2. Save fresh data to local storage for future offline use
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data.rates));

      } catch (error) {
        console.log('Live fetch failed. Attempting to load from offline cache...');
        setIsOffline(true);

        // 3. If offline, pull from the cache
        try {
          const cachedData = await AsyncStorage.getItem(cacheKey);
          if (cachedData) {
            setRates(JSON.parse(cachedData));
          } else {
            // 4. If no cache exists (first ever load is offline), use absolute fallbacks
            setRates(ABSOLUTE_FALLBACK_RATES);
          }
        } catch (cacheError) {
          setRates(ABSOLUTE_FALLBACK_RATES);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, [baseCurrency]);

  const openPicker = (side: 'base' | 'target') => {
    setSelectingFor(side);
    setModalVisible(true);
  };

  const selectCurrency = (currency: string) => {
    if (selectingFor === 'base') setBaseCurrency(currency);
    else setTargetCurrency(currency);
    setModalVisible(false);
  };

  const formatAmount = (val: number, currency: string) => {
    if (currency === 'VND' || currency === 'JPY') {
      return Math.round(val).toLocaleString('en-US');
    }
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const currentRate = rates[targetCurrency] || 1;
  const availableCurrencies = Object.keys(rates).length > 0 ? Object.keys(rates) : Object.keys(ABSOLUTE_FALLBACK_RATES);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Centered Brutalist Header with Branding */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>QUICKCONVERT</Text>

        <View style={styles.currencyToggle}>
          <TouchableOpacity onPress={() => openPicker('base')}>
            <Text style={styles.baseCurrency}>{baseCurrency}</Text>
          </TouchableOpacity>
          <Text style={styles.slash}> / </Text>
          <TouchableOpacity onPress={() => openPicker('target')}>
            <Text style={styles.targetCurrency}>{targetCurrency}</Text>
          </TouchableOpacity>
        </View>

        {/* Offline Indicator */}
        {isOffline && (
          <Text style={styles.offlineText}>• OFFLINE MODE</Text>
        )}
      </View>

      {/* Loading State vs Main List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>SYNCING MARKET DATA...</Text>
        </View>
      ) : (
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {AMOUNTS.map((amount) => {
            const converted = amount * currentRate;

            return (
              <View key={amount} style={styles.row}>
                <Text style={styles.baseAmount} adjustsFontSizeToFit numberOfLines={1}>
                  {formatAmount(amount, baseCurrency)}
                </Text>
                <Text style={styles.targetAmount} adjustsFontSizeToFit numberOfLines={1}>
                  {formatAmount(converted, targetCurrency)}
                </Text>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* AdMob Banner Placeholder */}
      <View style={[styles.adContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View style={styles.adBanner}>
          <Text style={styles.adText}>ADVERTISEMENT SPACE (320x50)</Text>
        </View>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
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
                <Text style={styles.modalCurrencyText}>{item}</Text>
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
  header: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 10
  },
  appTitle: {
    color: '#E9C176',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 15,
  },
  currencyToggle: { flexDirection: 'row', alignItems: 'center' },
  baseCurrency: { color: '#E9C176', fontSize: 20, fontWeight: '900' },
  slash: { color: '#4A90E2', fontSize: 20 },
  targetCurrency: { color: '#4A90E2', fontSize: 20, fontWeight: '900' },
  offlineText: {
    color: '#FF4444',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 15,
  },
  listContainer: { flex: 1 },
  row: {
    flexDirection: 'row',
    paddingVertical: 24,
    alignItems: 'center'
  },
  baseAmount: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 20,
    color: '#E9C176',
    fontSize: 34,
    fontWeight: '900'
  },
  targetAmount: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 20,
    color: '#A4C9FF',
    fontSize: 34,
    fontWeight: 'bold'
  },
  adContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#110F0E',
    borderTopWidth: 1,
    borderTopColor: '#1C1A18',
    paddingTop: 10,
  },
  adBanner: {
    width: 320,
    height: 50,
    backgroundColor: '#1C1B1B',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  adText: {
    color: '#666',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#110F0E',
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { color: '#E9C176', fontSize: 20, fontWeight: 'bold' },
  modalRow: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalCurrencyText: { color: '#FFF', fontSize: 22, fontWeight: '500' },
});