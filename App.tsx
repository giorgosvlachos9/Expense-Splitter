import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CURRENCIES, getCurrency, toEUR, fromEUR } from './currencies';

export default function App() {
  const [total, setTotal] = useState('');
  const [people, setPeople] = useState('');
  const [currencyCode, setCurrencyCode] = useState('EUR');
  const [result, setResult] = useState<string | null>(null);

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

    
    Keyboard.dismiss();
  };

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

        {result && <Text style={styles.result}>{result}</Text>}
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
});