import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons as Icon } from '@expo/vector-icons';

export default function FiltrosAvancados() {
  const navigation = useNavigation();
  const route = useRoute();

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Função para aplicar filtros
  const handleApply = () => {
    const filters = {
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    };

    // Se a tela que chamou passou uma função onApply, usamos ela
    if (route.params?.onApply) {
      route.params.onApply(filters);
    }

    navigation.goBack(); // volta para a tela que abriu o filtro
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtros Avançados</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Preço mínimo:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 5"
          keyboardType="numeric"
          value={minPrice}
          onChangeText={setMinPrice}
        />

        <Text style={styles.label}>Preço máximo:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 15"
          keyboardType="numeric"
          value={maxPrice}
          onChangeText={setMaxPrice}
        />

        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Adicionar filtro</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: '500', marginTop: 20, marginBottom: 5 },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#c1372d',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 40,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
