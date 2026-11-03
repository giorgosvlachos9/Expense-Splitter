import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Keyboard, TouchableWithoutFeedback, Platform, Animated, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURRENCIES, getCurrency, toEUR, fromEUR } from './currencies';

// ---------- Types ----------
type HistoryItem = {
    id: string;
    total: string;        // as typed by the user
    people: string;       // as typed
    perPerson: number;    // computed
    currencyCode: string;
    symbol: string;
    decimals: number;
    at: string;           // ISO timestamp
  };

const HISTORY_KEY = 'splitter:history';
const MAX_HISTORY = 20;

export default function App() {
  const [total, setTotal] = useState('');
  const [people, setPeople] = useState('');
  const [currencyCode, setCurrencyCode] = useState('EUR');
  const [result, setResult] = useState<string | null>(null);
  // When the result changes, animate it in
  // Animation value: 0 = hidden, 1 = fully visible
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (result) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [result, fadeAnim]);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  // ---------- Load history on mount ----------
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(HISTORY_KEY);
        if (saved) setHistory(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to load history', e);
      }
    })();
  }, []);
  // ---------- Save history whenever it changes ----------
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      } catch (e) {
        console.warn('Failed to save history', e);
      }
    })();
  }, [history]);

  const currency = getCurrency(currencyCode);

  const calculate = () => {
    const totalNum = parseFloat(total.replace(',', '.'));
    const peopleNum = parseInt(people, 10);

    if (isNaN(totalNum) || isNaN(peopleNum) || peopleNum <= 0) {
        setResult('Please enter valid numbers');
        Keyboard.dismiss();
        return;
    }
    
    // convert to EUR -> split -> convert back to chosen currency
    const totalEUR = toEUR(totalNum, currency);
    const perPersonEUR = totalEUR / peopleNum;
    const perPerson = fromEUR(perPersonEUR, currency);

    const formatted = perPerson.toFixed(currency.decimals);
    setResult(`Each person pays: ${currency.symbol}${formatted} ${currency.code}`);

    // New history item (newest first), cap at MAX_HISTORY
    const item: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        total,
        people,
        perPerson,
        currencyCode: currency.code,
        symbol: currency.symbol,
        decimals: currency.decimals,
        at: new Date().toISOString(),
      };
      setHistory(prev => [item, ...prev].slice(0, MAX_HISTORY));

    Keyboard.dismiss();
  };

  // ---------- Clear history ----------
  const clearHistory = () => setHistory([]);

  // ---------- Format timestamp ----------
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // ---------- Render a single history row ----------
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.historyRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.historyMain}>
          {item.symbol}
          {item.perPerson.toFixed(item.decimals)} {item.currencyCode} each
        </Text>
        <Text style={styles.historySub}>
          {item.total} {item.currencyCode} ÷ {item.people} {Number(item.people) === 1 ? 'person' : 'people'}
        </Text>
      </View>
      <Text style={styles.historyTime}>{formatTime(item.at)}</Text>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Expense Splitter</Text>
        
        <Text style={styles.label}>Currency</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={currencyCode}
            onValueChange={(value) => setCurrencyCode(value)}
            mode="dropdown"
            style={styles.picker}
            itemStyle={Platform.OS === 'ios' ? { height: 150 } : undefined}
          >
            {CURRENCIES.map(c => (
              <Picker.Item
                key={c.code}
                label={`${c.symbol} ${c.name} (${c.code})`}
                value={c.code}
              />
            ))}
          </Picker>
        </View>
        
        <TextInput
          style={styles.input}
          placeholder={`Total Amount (${currency.code})`}
          keyboardType="decimal-pad"
          value={total}
          onChangeText={setTotal}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Number of People"
          keyboardType="numeric"
          value={people}
          onChangeText={setPeople}
        />
        
        <View style={styles.buttonContainer}>
          <Button title="Calculate" onPress={calculate} />
        </View>

        {result && (
          <Animated.Text
            style={[
              styles.result,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0], // slides up 12px as it fades in
                    }),
                  },
                ],
              },
            ]}
          >
            {result}
          </Animated.Text>
        )}

        {/* ---------- History ---------- */}
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>History</Text>
          {history.length > 0 && (
            <Pressable onPress={clearHistory} hitSlop={8}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          )}
        </View>

        {history.length === 0 ? (
          <Text style={styles.emptyText}>No calculations yet.</Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            style={styles.historyList}
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          />
        )}
        
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  result: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2e7d32',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearText: {
    fontSize: 14,
    color: '#c62828',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  historyList: {
    flex: 1,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  historyMain: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  historySub: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  historyTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
});