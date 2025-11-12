import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from "../../../components/firebaseConfig.js";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore(app);

export default function CardapioAluno2() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrato, setSelectedPrato] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Busca no Firestore
  useEffect(() => {
    const buscarCardapio = async () => {
      try {
        const itensRef = collection(db, "cardapios"); 

        const snapshot = await getDocs(itensRef);
        let lista = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (Array.isArray(data.itens)) {
            const itensDisponiveis = data.itens
              .filter((item) => item.disponivel === true && item.tipo === "dia")
              .map((item, index) => ({
                ...item,
                id: `${doc.id}_${index}`, // 🔑 Garante que cada item tenha um id único
              }));
            lista = [...lista, ...itensDisponiveis];
          }
        });

        setItens(lista);
      } catch (e) {
        console.error("Erro ao buscar cardápio:", e);
        Alert.alert("Erro", "Não foi possível carregar o cardápio do dia.");
      } finally {
        setLoading(false);
      }
    };

    buscarCardapio();
  }, []);

  // 🛒 Adiciona ao carrinho local
  const adicionarAoCarrinho = async (item) => {
    try {
      const jsonValue = await AsyncStorage.getItem("carrinho");
      const carrinho = jsonValue ? JSON.parse(jsonValue) : [];

      const existente = carrinho.find((i) => i.id === item.id);
      if (existente) {
        Alert.alert("Aviso", `${item.nome} já está no carrinho.`);
        return;
      }

      const novoCarrinho = [
        ...carrinho,
        {
          id: item.id,
          nome: item.nome,
          preco: item.preco,
          imagem: item.imagem,
        },
      ];

      await AsyncStorage.setItem("carrinho", JSON.stringify(novoCarrinho));
      Alert.alert("✅ Adicionado", `${item.nome} foi adicionado ao carrinho!`);
    } catch (e) {
      console.log("Erro ao adicionar item:", e);
    }
  };

  // 🎨 Renderização de cada card
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.btnAdd}
        onPress={() => adicionarAoCarrinho(item)}
      >
        <Text style={styles.txtAdd}>+</Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <View style={styles.topo}>
          <Text style={styles.nome}>{item.nome}</Text>

          <TouchableOpacity
            style={styles.btnReservar}
            onPress={() => {
              setSelectedPrato(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.txtReservar}>reservar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.descricao}>{item.descricao}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.nota}>⭐ {item.nota}</Text>
          <Text style={styles.preco}>R$ {Number(item.preco).toFixed(2)}</Text>
        </View>
      </View>

      {item.imagem ? (
        <Image source={{ uri: item.imagem }} style={styles.imagem} />
      ) : (
        <View style={[styles.imagem, { backgroundColor: "#ccc" }]} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5", paddingTop: 75 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-ios" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.titulo}>CARDÁPIO DO DIA</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#c1372d" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#888", marginTop: 50 }}>
              Nenhum item disponível no momento.
            </Text>
          }
        />
      )}

      {/* 📅 Modal de Reserva */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Escolha a data para {selectedPrato?.nome}
            </Text>

            <Calendar
              minDate={new Date().toISOString().split("T")[0]}
              onDayPress={(day) => {
                const hoje = new Date();
                const selecionado = new Date(day.dateString);
                const diffDays = Math.ceil(
                  (selecionado - hoje) / (1000 * 60 * 60 * 24)
                );

                let mensagem = "";
                if (diffDays === 0) mensagem = "Reservado para hoje";
                else if (diffDays === 1) mensagem = "Reservado para amanhã";
                else mensagem = `Reservado para daqui a ${diffDays} dias`;

                Alert.alert("", mensagem, [
                  { text: "OK", onPress: () => setModalVisible(false) },
                ]);
              }}
              style={{ marginBottom: 20 }}
            />

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imagem: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginLeft: 10,
  },
  info: {
    flex: 1,
    marginHorizontal: 8,
  },
  topo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nome: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  descricao: {
    fontSize: 13,
    color: "#666",
    marginVertical: 4,
  },
  nota: {
    fontSize: 13,
    color: "#f1c40f",
  },
  preco: {
    fontSize: 14,
    color: "#c1372d",
    fontWeight: "bold",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  btnAdd: {
    backgroundColor: "#c1372d",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  txtAdd: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: -2,
  },
  btnReservar: {
    backgroundColor: "#eee",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  txtReservar: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#555",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalClose: {
    backgroundColor: "#c1372d",
    padding: 10,
    borderRadius: 10,
  },
});