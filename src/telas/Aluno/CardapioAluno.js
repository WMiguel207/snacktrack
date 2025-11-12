import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import FooterNav from "../../../components/FooterNav";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../../components/firebaseConfig.js";
import { adicionarItemAoCarrinho } from "../../../src/api/carrinhoService";

const db = getFirestore(app);
const auth = getAuth(app);

export default function CardapioAluno() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrato, setSelectedPrato] = useState(null);
  const [activeTab, setActiveTab] = useState("Cardapio");
  const [pratos, setPratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchCardapio = async () => {
    try {
      const snapshot = await getDocs(collection(db, "cardapios"));
      if (snapshot.empty) {
        Alert.alert("Aviso", "Nenhum cardápio disponível no momento.");
        setPratos([]);
        return;
      }

      const cardapios = snapshot.docs.map((doc) => doc.data());
      const cardapioMaisRecente = cardapios.sort((a, b) => b.data - a.data)[0];

      const itensFiltrados = (cardapioMaisRecente.itens || []).filter(
        (item) => item.disponivel === true && item.tipo === "semana"
      );

      // Verifica se após o filtro não há itens disponíveis
      if (itensFiltrados.length === 0) {
        Alert.alert("Aviso", "Nenhum cardápio disponível no momento.");
        setPratos([]);
        return;
      }

      setPratos(itensFiltrados);
    } catch (error) {
      console.error("Erro ao buscar cardápio:", error);
      Alert.alert("Erro", "Não foi possível carregar o cardápio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardapio();
  }, []);

  // 🔹 Gera código da reserva
  const gerarCodigo = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  // 🔹 Salva reserva no Firestore
  const salvarReserva = async (prato, dataEntrega) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erro", "Você precisa estar logado para reservar.");
        return;
      }

      const codigo = gerarCodigo();

      await addDoc(collection(db, "reservas"), {
        idAluno: user.uid,
        nomeAluno: user.displayName || "Aluno",
        idItem: prato.idItem || prato.id,
        nomeItem: prato.nome,
        preco: prato.preco,
        dataReserva: new Date(),
        dataEntrega,
        status: "pendente",
        codigoGerado: codigo,
      });

      Alert.alert(
        "✅ Reserva confirmada",
        `${prato.nome} reservado com código #${codigo}\nEntrega: ${dataEntrega}`,
        [{ text: "OK", onPress: () => setModalVisible(false) }]
      );
    } catch (error) {
      console.error("Erro ao salvar reserva:", error);
      Alert.alert("Erro", "Não foi possível salvar a reserva.");
    }
  };

  const handleAddCarrinho = async (item) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erro", "Você precisa estar logado.");
        return;
      }

      // Adiciona item ao carrinho usando o novo serviço
      await adicionarItemAoCarrinho(user.uid, {
        id: item.idItem || item.id,
        nome: item.nome,
        preco: item.preco,
        imagem: item.imagem,
      }, 1);

      Alert.alert("✅ Adicionado ao carrinho", `${item.nome} foi adicionado!`);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível adicionar ao carrinho.");
    }
  };

  const Header = () => (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("CardapioAluno2")}>
        <ImageBackground
          source={require("../../../assets/CardapioDia.png")}
          style={styles.bgImage}
          imageStyle={{ borderRadius: 12 }}
        >
          <View style={styles.overlay}>
            <Text style={styles.titulo}>CARDÁPIO DO DIA</Text>
            <Text style={styles.txtBotao}>TOQUE PARA VER</Text>
            <Icon name="keyboard-arrow-down" size={28} color="#fff" style={styles.seta} />
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={item.imagem ? { uri: item.imagem } : require("../../../assets/item1.png")}
        style={styles.imagem}
      />
      <View style={styles.info}>
        <View style={styles.topo}>
          <Text style={styles.nome}>{String(item.nome || "Item sem nome")}</Text>
          {item.nota && <Text style={styles.nota}>⭐ {String(item.nota)}</Text>}
        </View>

        {item.descricao && <Text style={styles.descricao}>{String(item.descricao)}</Text>}

        <View style={styles.footerCard}>
          <Text style={styles.preco}>
            {item.preco
              ? (() => {
                  const precoNum = parseFloat(item.preco);
                  return !isNaN(precoNum)
                    ? precoNum.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : String(item.preco || "R$ 0,00");
                })()
              : "R$ 0,00"}
          </Text>
          <TouchableOpacity
            style={styles.btnReservar}
            onPress={() => {
              setSelectedPrato(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.txtReservar}>Reservar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnAdd} onPress={() => handleAddCarrinho(item)}>
            <Text style={styles.txtAdd}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#c1372d" />
        <Text>Carregando cardápio...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={pratos}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.idItem || index.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListHeaderComponent={<Header />}
      />

      {/* Modal de Reserva */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {`Escolha a data para ${selectedPrato?.nome ? String(selectedPrato.nome) : "o item"}`}
            </Text>

            <Calendar
              minDate={new Date().toISOString().split("T")[0]}
              onDayPress={(day) => {
                const dataEntrega = day.dateString;
                salvarReserva(selectedPrato, dataEntrega);
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

      <FooterNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagem: { width: 100, height: 100, borderRadius: 10 },
  info: { flex: 1, marginLeft: 10, justifyContent: "space-between" },
  topo: { flexDirection: "row", justifyContent: "space-between" },
  nome: { fontSize: 16, fontWeight: "bold", color: "#333" },
  nota: { fontSize: 14, color: "#ff9900" },
  descricao: { fontSize: 13, color: "#555", marginVertical: 5 },
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  preco: { fontSize: 16, fontWeight: "bold", color: "#c1372d" },
  btnReservar: {
    backgroundColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginLeft: 8,
  },
  txtReservar: { fontSize: 13, fontWeight: "bold", color: "#555" },
  btnAdd: {
    backgroundColor: "#c1372d",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  txtAdd: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  container: { margin: 16, borderRadius: 12, overflow: "hidden", paddingTop: 50 },
  bgImage: { height: 160, justifyContent: "center", alignItems: "center" },
  overlay: { justifyContent: "center", alignItems: "center", borderRadius: 12 },
  titulo: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  txtBotao: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  seta: { marginTop: 4 },
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
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalClose: { backgroundColor: "#c1372d", padding: 10, borderRadius: 10 },
});