import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import {
  carregarCarrinho,
  finalizarCarrinhoComReserva,
} from "../../../src/api/carrinhoService";

const auth = getAuth();
const db = getFirestore();

export default function Carrinho() {
  const navigation = useNavigation();
  const [carrinhoData, setCarrinhoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mode, setMode] = useState("date");

  // 🔹 Carrega o carrinho do Firestore
  useFocusEffect(
    useCallback(() => {
      const carregarCarrinhoAtual = async () => {
        try {
          setLoading(true);
          const user = auth.currentUser;
          if (!user) {
            Alert.alert("Erro", "Você precisa estar logado.");
            navigation.navigate("LoginAluno");
            return;
          }

          const carrinho = await carregarCarrinho(user.uid);
          setCarrinhoData(carrinho);
        } catch (error) {
          console.error("Erro ao carregar carrinho:", error);
          Alert.alert("Erro", "Não foi possível carregar o carrinho.");
        } finally {
          setLoading(false);
        }
      };

      carregarCarrinhoAtual();
    }, [navigation])
  );

  // 🔹 Limpa o carrinho
  const limparCarrinho = async () => {
    Alert.alert("Esvaziar carrinho", "Deseja remover todos os itens?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        style: "destructive",
        onPress: async () => {
          try {
            const user = auth.currentUser;
            if (!user) return;
            if (!carrinhoData?.id) return;

            const carrinhoRef = doc(db, "carrinhos", carrinhoData.id);
            await updateDoc(carrinhoRef, { items: [] });
            setCarrinhoData({ ...carrinhoData, items: [] });

            Alert.alert("Carrinho limpo", "Todos os itens foram removidos!");
          } catch (error) {
            console.error("Erro ao limpar carrinho:", error);
            Alert.alert("Erro", "Não foi possível limpar o carrinho.");
          }
        },
      },
    ]);
  };

  // 🔹 Formata preço
  const formatarPreco = (preco) => {
    if (!preco) return "R$ 0,00";
    if (typeof preco === "number") return `R$ ${preco.toFixed(2)}`;
    const valor = parseFloat(preco.replace("R$", "").replace(",", ".")) || 0;
    return `R$ ${valor.toFixed(2)}`;
  };

  // 🔹 Calcula total
  const calcularTotal = () => {
    if (!carrinhoData?.items?.length) return 0;
    return carrinhoData.items.reduce((total, item) => {
      const preco = parseFloat(
        item.preco?.toString().replace("R$", "").replace(",", ".") || 0
      );
      return total + preco * (item.quantidade || 1);
    }, 0);
  };

  // 🔹 Mostra modal do calendário
  const handleReservar = () => {
    if (!carrinhoData?.items?.length) {
      navigation.navigate("InicioAluno");
      return;
    }
    setShowCalendarModal(true);
  };

  // 🔹 Cria reserva após escolher data/hora
  const confirmarReserva = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erro", "Você precisa estar logado.");
        return;
      }

      const dataFormatada = selectedDate.toLocaleDateString("pt-BR");
      const horaFormatada = selectedDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const { reservaId, codigo } = await finalizarCarrinhoComReserva(
        carrinhoData.id,
        user.uid,
        { data: dataFormatada, horario: horaFormatada }
      );

      Alert.alert("✅ Reserva confirmada", `Código da reserva: ${codigo}`, [
        {
          text: "OK",
          onPress: () => {
            setCarrinhoData(null);
            setShowCalendarModal(false);
            navigation.navigate("InicioAluno");
          },
        },
      ]);
    } catch (error) {
      console.error("Erro ao finalizar reserva:", error);
      Alert.alert("Erro", "Não foi possível concluir a reserva.");
    }
  };

  const onChange = (event, selected) => {
    if (selected) {
      setSelectedDate(selected);
      if (mode === "date") setMode("time");
      else setShowCalendarModal(false);
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
        ) : !carrinhoData?.items?.length ? (
          <Text style={styles.emptyText}>Nenhum item adicionado</Text>
        ) : (
          <>
            <FlatList
              data={carrinhoData.items}
              keyExtractor={(item, i) => i.toString()}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemText}>{item.nome}</Text>
                    <Text style={styles.itemQuantidade}>
                      Quantidade: {item.quantidade || 1}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>{formatarPreco(item.preco)}</Text>
                </View>
              )}
            />

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                R$ {total.toFixed(2).replace(".", ",")}
              </Text>
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.reserveButton, { opacity: loading ? 0.5 : 1 }]}
          disabled={loading}
          onPress={handleReservar}
        >
          <Text style={styles.reserveButtonText}>
            {carrinhoData?.items?.length > 0 ? "Reservar agora" : "Voltar ao Cardápio"}
          </Text>
        </TouchableOpacity>

        {carrinhoData?.items?.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={limparCarrinho}>
            <Text style={styles.clearButtonText}>Esvaziar carrinho</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🔹 Modal do calendário */}
      <Modal visible={showCalendarModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha data e horário</Text>

            <DateTimePicker
              value={selectedDate}
              mode={mode}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChange}
              minimumDate={new Date()}
            />

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmarReserva}
            >
              <Text style={styles.confirmButtonText}>Confirmar reserva</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCalendarModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: { fontSize: 16, color: "#333", fontWeight: "500" },
  itemQuantidade: { fontSize: 13, color: "#999", marginTop: 4 },
  itemPrice: { fontSize: 16, fontWeight: "bold", color: "#c1372d" },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: "#c1372d",
    paddingTop: 15,
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
  clearButton: { marginTop: 15, paddingVertical: 10, alignItems: "center" },
  clearButtonText: { color: "#c1372d", fontWeight: "bold", fontSize: 15 },

  // 🔹 Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  confirmButton: {
    backgroundColor: "#c1372d",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  confirmButtonText: { color: "#fff", fontWeight: "bold" },
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
  },
  cancelButtonText: { color: "#c1372d", fontWeight: "bold" },
});
