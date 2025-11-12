import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image
} from 'react-native';
import FooterNav from "../../../components/FooterNav";
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../components/firebaseConfig";

export default function BuscaAluno() {
  const navigation = useNavigation();
  const route = useRoute();

  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Buscas');
  const [footerHeight, setFooterHeight] = useState(0);
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Todos', 'Salgados', 'Doces', 'Bebidas', 'Mais'];

  useEffect(() => {
    if (route.params?.appliedFilters) {
      setAdvancedFilters(route.params.appliedFilters);
    }
  }, [route.params?.appliedFilters]);

  useEffect(() => {
    const fetchItens = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cardapios"));
        if (querySnapshot.empty) {
          setItens([]);
          setLoading(false);
          return;
        }

        // Agora cada item é um documento individual
        const fetched = querySnapshot.docs
          .map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }))
          .filter((item) => item.disponivel === true && item.tipo === "avulso");

        setItens(fetched);
      } catch (error) {
        console.error("Erro ao buscar itens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItens();
  }, []);

  const normalizar = (valor = "") =>
    valor
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredProducts = itens.filter((item) => {
    const categoriasItem = Array.isArray(item.categoria)
      ? item.categoria
      : item.categoria
      ? [item.categoria]
      : [];

    const categoriasNormalizadas = categoriasItem.map(normalizar);
    const activeCategoryNormalized = normalizar(activeCategory);

    const matchesCategory =
      activeCategory === "Todos" ||
      categoriasNormalizadas.includes(activeCategoryNormalized);

    const searchNormalized = normalizar(searchText);
    const matchesSearch =
      searchText.trim().length === 0 ||
      normalizar(item.nome || "").includes(searchNormalized) ||
      categoriasNormalizadas.some((categoria) =>
        categoria.includes(searchNormalized)
      );

    const matchesAdvanced =
      !advancedFilters ||
      ((!advancedFilters.minPrice || item.preco >= advancedFilters.minPrice) &&
        (!advancedFilters.maxPrice || item.preco <= advancedFilters.maxPrice));

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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#c1372d" />
        <Text style={{ marginTop: 10, color: "#555" }}>Carregando itens...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 50,
          paddingHorizontal: 10,
          paddingBottom: footerHeight + 20
        }}
      >
        {/* 🔍 Barra de pesquisa */}
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

        {/* 🏷️ Categorias */}
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

        {/* 🛒 Itens */}
        <View style={styles.productsGrid}>
          {filteredProducts.map((item) => (
            <View key={item.id} style={styles.productCard}>
              {item.imagem ? (
                <Image source={{ uri: item.imagem }} style={styles.productImage} />
              ) : (
                <View
                  style={[
                    styles.productImage,
                    { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
                  ]}
                >
                  <Text style={styles.productImageText}>📷</Text>
                </View>
              )}
              <Text style={styles.productName}>{item.nome}</Text>
              <Text style={styles.productPrice}>
                R${Number(item.preco).toFixed(2)}
              </Text>
            </View>
          ))}

          {filteredProducts.length === 0 && (
            <Text style={styles.noResults}>Nenhum item encontrado</Text>
          )}
        </View>
      </ScrollView>

      {/* Footer fixo */}
      <View onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}>
        <FooterNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  searchInputRow: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  cartButtonRow: {
    backgroundColor: '#c1372d',
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    marginBottom: 20,
    maxHeight: 35,
  },
  categoriesContent: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  activeCategoryButton: {
    backgroundColor: '#c1372d',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    rowGap: 15,
  },
  productCard: {
    flexBasis: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  productImageText: {
    fontSize: 24,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#c1372d',
  },
  noResults: {
    width: '100%',
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 16,
  },
});
