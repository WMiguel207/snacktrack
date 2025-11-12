import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import FooterNavFuncionario from "../../../components/FooterNavFuncionario";
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BuscaFuncionario() {
  const navigation = useNavigation();

  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Buscas');
  const [footerHeight, setFooterHeight] = useState(0);
  const [advancedFilters, setAdvancedFilters] = useState(null);

  const categories = ['Todos', 'Salgados', 'Doces', 'Bebidas', 'Mais'];

  const products = [
    { id: 1, name: 'Coxinha', price: 7, category: 'Salgados' },
    { id: 2, name: 'Esfiha', price: 6, category: 'Salgados' },
    { id: 3, name: 'Quibe', price: 8, category: 'Salgados' },
    { id: 4, name: 'Sanduíche', price: 10, category: 'Salgados' },
    { id: 5, name: 'Enroladinho', price: 7, category: 'Salgados' },
    { id: 6, name: 'Mini Pizza', price: 6, category: 'Salgados' },
    { id: 7, name: 'Bolo de Chocolate', price: 12, category: 'Doces' },
    { id: 8, name: 'Brigadeiro', price: 2.5, category: 'Doces' },
    { id: 9, name: 'Suco de Laranja', price: 5, category: 'Bebidas' },
    { id: 10, name: 'Refrigerante', price: 6, category: 'Bebidas' },
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      activeCategory === 'Todos' || product.category === activeCategory;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesAdvanced =
      !advancedFilters ||
      (
        (!advancedFilters.minPrice || product.price >= advancedFilters.minPrice) &&
        (!advancedFilters.maxPrice || product.price <= advancedFilters.maxPrice)
      );

    return matchesCategory && matchesSearch && matchesAdvanced;
  });

  const handleCategoryPress = (category) => {
    if (category === 'Mais') {
      navigation.navigate('FiltrosAvancados', {
        onApply: (filters) => setAdvancedFilters(filters),
      });
    } else {
      setActiveCategory(category);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 50,
          paddingHorizontal: 10,
          paddingBottom: footerHeight + 20
        }}
      >
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInputRow}
            placeholder="Pesquisar..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity
            style={styles.cartButtonRow}
            onPress={() => navigation.navigate('Carrinho')}
          >
            <Icon name="shopping-cart" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                activeCategory === category && category !== 'Mais' && styles.activeCategoryButton
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === category && category !== 'Mais' && styles.activeCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productImage}>
                <Text style={styles.productImageText}>📷</Text>
              </View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>R${product.price.toFixed(2)}</Text>
            </View>
          ))}
          {filteredProducts.length === 0 && (
            <Text style={styles.noResults}>Nenhum item encontrado</Text>
          )}
        </View>
      </ScrollView>

      <View onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}>
        <FooterNavFuncionario activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 20 },
  searchInputRow: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, fontSize: 16, color: '#333', marginRight: 10 },
  cartButtonRow: { backgroundColor: '#c1372d', padding: 12, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  categoriesContainer: { marginBottom: 20, maxHeight: 35 },
  categoriesContent: { paddingHorizontal: 15 },
  categoryButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 10, backgroundColor: '#f5f5f5' },
  activeCategoryButton: { backgroundColor: '#c1372d' },
  categoryText: { fontSize: 14, color: '#666', fontWeight: '500' },
  activeCategoryText: { color: '#fff', fontWeight: '600' },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 10, rowGap: 15 },
  productCard: { flexBasis: '48%', backgroundColor: '#f9f9f9', borderRadius: 12, padding: 15, marginBottom: 15, alignItems: 'center' },
  productImage: { width: 80, height: 80, backgroundColor: '#e0e0e0', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  productImageText: { fontSize: 24 },
  productName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 5, textAlign: 'center' },
  productPrice: { fontSize: 18, fontWeight: '700', color: '#c1372d' },
  noResults: { width: '100%', textAlign: 'center', color: '#999', marginTop: 20, fontSize: 16 },
});
