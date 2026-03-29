import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Menu, Star } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';

export function Header({ title, onRightPress, rightIconActive }: any) {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.openDrawer()} hitSlop={{top:10,bottom:10,left:10,right:10}}>
        <Menu color={Colors.white} size={28} strokeWidth={2} />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        {typeof title === 'string' ? (
          <Text style={styles.titleText}>{title}</Text>
        ) : (
          title
        )}
      </View>

      <TouchableOpacity onPress={onRightPress} hitSlop={{top:10,bottom:10,left:10,right:10}}>
        <Star 
          color={rightIconActive ? Colors.gold : Colors.white} 
          fill={rightIconActive ? Colors.gold : 'transparent'} 
          size={28} 
          strokeWidth={2} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 60,
    paddingBottom: 20,
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  titleText: {
    fontFamily: 'Inter_900Black',
    fontSize: 20,
    color: Colors.white,
    letterSpacing: 4,
  }
});
