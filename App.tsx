import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Keyboard, TouchableWithoutFeedback } from 'react-native';

export default function App() {
  const [total, setTotal] = useState('');
  const [people, setPeople] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const totalNum = parseFloat(total);
    const peopleNum = parseInt(people);
    if (!isNaN(totalNum) && !isNaN(peopleNum) && peopleNum > 0) {
      const perPerson = (totalNum / peopleNum).toFixed(2);
      setResult(`Each person pays: $${perPerson}`);
    } else {
      setResult('Please enter valid numbers');
    }
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Expense Splitter</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Total Amount ($)"
          keyboardType="numeric"
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