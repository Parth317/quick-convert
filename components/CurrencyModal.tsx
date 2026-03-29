import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet, Platform, StatusBar } from 'react-native';
import { X, Search } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useStore } from '../store/useStore';
import { CURRENCIES, POPULAR_CURRENCIES, ALL_CURRENCY_CODES } from '../utils/currencies';

interface Props {
  visible: boolean;
  onClose: () => void;
  mode: 'base' | 'target' | null;
}

export function CurrencyModal({ visible, onClose, mode }: Props) {
  const { setBaseCurrency, setTargetCurrency, baseCurrency, targetCurrency } = useStore();
  const [search, setSearch] = useState('');

  const handleSelect = (code: string) => {
    if (mode === 'base') setBaseCurrency(code);
    if (mode === 'target') setTargetCurrency(code);
    onClose();
  };

  const filteredCodes = ALL_CURRENCY_CODES.filter(code => 
    code.toLowerCase().includes(search.toLowerCase()) || 
    CURRENCIES[code].name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item: code }: { item: string }) => {
    const isSelected = (mode === 'base' && baseCurrency === code) || (mode === 'target' && targetCurrency === code);
    return (
      <TouchableOpacity 
        style={styles.itemContainer} 
        onPress={() => handleSelect(code)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{CURRENCIES[code].flag}</Text>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemCode}>{code}</Text>
          <Text style={styles.itemName}>{CURRENCIES[code].name}</Text>
        </View>
        {isSelected && <View style={styles.selectedDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{top:10,bottom:10,left:10,right:10}}>
            <X color={Colors.white} size={28} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Search color={Colors.muted} size={24} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Search currencies..."
              placeholderTextColor="rgba(209,197,180,0.5)"
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>
        </View>

        <FlatList
          data={search ? filteredCodes : POPULAR_CURRENCIES.concat(ALL_CURRENCY_CODES)}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background,
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 60,
    paddingBottom: 20, gap: 16
  },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', position: 'relative' },
  searchIcon: { position: 'absolute', left: 0, zIndex: 1 },
  input: { flex: 1, color: Colors.white, fontSize: 18, fontFamily: 'Inter_700Bold', paddingLeft: 36, paddingVertical: 8 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(28,27,27,0.5)' },
  flag: { fontSize: 32, marginRight: 16 },
  itemTextContainer: { flex: 1 },
  itemCode: { color: Colors.gold, fontSize: 20, fontFamily: 'Inter_900Black', letterSpacing: 2 },
  itemName: { color: Colors.muted, fontSize: 14, fontFamily: 'Inter_400Regular' },
  selectedDot: { width: 8, height: 8, backgroundColor: Colors.gold }
});
