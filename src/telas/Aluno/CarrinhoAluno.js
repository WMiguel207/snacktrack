import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Carrinho() {
  const navigation = useNavigation();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega o carrinho sempre que a tela ganha foco
  useEffect(() => {
    const carregarCarrinho = async () => {
      try {
        setLoading(true);
        const jsonValue = await AsyncStorage.getItem("carrinho");
        const carrinho = jsonValue ? JSON.parse(jsonValue) : [];
        setItens(carrinho);
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = navigation.addListener("focus", carregarCarrinho);
    return unsubscribe;
  }, [navigation]);

  const limparCarrinho = async () => {
    Alert.alert("Esvaziar carrinho", "Deseja remover todos os itens?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("carrinho");
          setItens([]);
          Alert.alert("Carrinho limpo", "Todos os itens foram removidos!");
        },
      },
    ]);
  };

  const formatarPreco = (preco) => {
    if (!preco) return "R$ 0,00";
    if (typeof preco === "number") return `R$ ${preco.toFixed(2)}`;
    const valor = parseFloat(preco.replace("R$", "").replace(",", ".")) || 0;
    return `R$ ${valor.toFixed(2)}`;
  };

  const calcularTotal = () => {
    return itens.reduce((total, item) => {
      const preco = parseFloat(
        item.preco?.toString().replace("R$", "").replace(",", ".")
      ) || 0;
      return total + preco;
    }, 0);
  };

  const gerarCodigoReserva = () => {
    const timestamp = Date.now().toString();
    return timestamp.slice(-6); // últimos 6 dígitos
  };

  const salvarReserva = async (reserva) => {
    try {
      const armazenadas = await AsyncStorage.getItem("reservas");
      const reservas = armazenadas ? JSON.parse(armazenadas) : [];
      reservas.push(reserva);
      await AsyncStorage.setItem("reservas", JSON.stringify(reservas));
    } catch (error) {
      console.error("Erro ao salvar reserva:", error);
    }
  };

  const handleReservar = async () => {
    if (itens.length === 0) {
      navigation.navigate("InicioAluno");
      return;
    }

    try {
      const codigo = gerarCodigoReserva();
      const reserva = {
        codigo,
        data: new Date().toLocaleString(),
        itens,
        total: formatarPreco(calcularTotal()),
      };

      await salvarReserva(reserva);
      await AsyncStorage.removeItem("carrinho");
      setItens([]);

      Alert.alert("Reserva confirmada ✅", `Código da reserva: ${codigo}`);
      navigation.navigate("InicioAluno");
    } catch (error) {
      console.error("Erro ao finalizar reserva:", error);
      Alert.alert("Erro", "Não foi possível concluir a reserva.");
    }
  };

  const total = calcularTotal();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Buscas")}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Carrinho</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#c1372d" style={{ marginTop: 40 }} />
        ) : itens.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum item adicionado por enquanto</Text>
        ) : (
          <>
            <FlatList
              data={itens}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text style={styles.itemText}>{item.titulo || item.nome}</Text>
                  {item.preco && <Text style={styles.itemPrice}>{formatarPreco(item.preco)}</Text>}
                </View>
              )}
            />

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{formatarPreco(total)}</Text>
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.reserveButton, { opacity: loading ? 0.5 : 1 }]}
          disabled={loading}
          onPress={handleReservar}
        >
          <Text style={styles.reserveButtonText}>Reservar agora</Text>
        </TouchableOpacity>

        {itens.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={limparCarrinho}>
            <Text style={styles.clearButtonText}>Esvaziar carrinho</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  emptyText: { fontSize: 18, color: "#666", textAlign: "center", paddingTop: 300 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: { fontSize: 16, color: "#333" },
  itemPrice: { fontSize: 16, fontWeight: "bold", color: "#c1372d" },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalValue: { fontSize: 16, fontWeight: "bold", color: "#c1372d" },
  reserveButton: {
    backgroundColor: "#c1372d",
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
    alignItems: "center",
  },
  reserveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  clearButton: { marginTop: 15, paddingVertical: 10, alignItems: "center", paddingBottom: 50 },
  clearButtonText: { color: "#c1372d", fontWeight: "bold", fontSize: 15 },
});
