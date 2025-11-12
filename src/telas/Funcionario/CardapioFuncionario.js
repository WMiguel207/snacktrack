import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ImageBackground,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import FooterNavFuncionario from "../../../components/FooterNavFuncionario";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const localImages = {
  item1: require("../../../assets/item1.png"),
  item2: require("../../../assets/item2.png"),
  item3: require("../../../assets/item3.png"),
};

const initialPratos = [
  {
    id: "1",
    nome: "Strogonoff de Frango",
    descricao:
      "Prato clássico russo feito com frango cozido em molho cremoso de cogumelos, cebola e mostarda.",
    preco: "12.00",
    nota: "4.8",
    imagem: "item1",
    isLocal: true,
  },
  {
    id: "2",
    nome: "Macarrão ao Molho",
    descricao:
      "Prato clássico italiano feito com macarrão e molho de tomate com alho e ervas.",
    preco: "24.00",
    nota: "4.3",
    imagem: "item2",
    isLocal: true,
  },
  {
    id: "3",
    nome: "Filé de Frango",
    descricao: "Peito de frango grelhado com temperos especiais.",
    preco: "21.00",
    nota: "4.4",
    imagem: "item3",
    isLocal: true,
  },
];

export default function CardapioFuncionario() {
  const navigation = useNavigation();
  const [pratos, setPratos] = useState(initialPratos);
  const [activeTab, setActiveTab] = useState("CardapioFuncionario");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrato, setSelectedPrato] = useState(null);

  // Carregar cardápio salvo
  useEffect(() => {
    const carregarCardapio = async () => {
      try {
        const data = await AsyncStorage.getItem("@cardapio");
        if (data) setPratos(JSON.parse(data));
      } catch (error) {
        console.error("Erro ao carregar cardápio:", error);
      }
    };
    carregarCardapio();
  }, []);

  // Abrir modal
  const abrirModalEdicao = (item) => {
    setSelectedPrato({ ...item });
    setModalVisible(true);
  };

  // Escolher nova imagem (Expo ImagePicker)
  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Conceda acesso à galeria para escolher imagens.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });

    if (result.canceled) return;
    const asset = result.assets && result.assets[0];
    if (asset?.uri) {
      setSelectedPrato({ ...selectedPrato, imagem: asset.uri, isLocal: false });
    }
  };

  // Salvar edição
  const salvarEdicao = async () => {
    if (!selectedPrato.nome || !selectedPrato.descricao) {
      Alert.alert("Erro", "Nome e descrição são obrigatórios!");
      return;
    }

    const novosPratos = pratos.map((item) =>
      item.id === selectedPrato.id ? selectedPrato : item
    );
    setPratos(novosPratos);

    try {
      await AsyncStorage.setItem("@cardapio", JSON.stringify(novosPratos));
    } catch (error) {
      console.error("Erro ao salvar cardápio:", error);
    }

    setModalVisible(false);
    Alert.alert("Sucesso", "Item atualizado com sucesso!");
  };

  // Renderizar prato
  const renderItem = ({ item }) => {
    const source = item.isLocal
      ? localImages[item.imagem]
      : { uri: item.imagem };

    return (
      <View style={styles.card}>
        <Image source={source} style={styles.imagem} />
        <View style={styles.info}>
          <View style={styles.topo}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.nota}>⭐ {item.nota}</Text>
          </View>
          <Text style={styles.descricao}>{item.descricao}</Text>
          <View style={styles.footerCard}>
            <Text style={styles.preco}>R$ {parseFloat(item.preco).toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.btnEditar}
              onPress={() => abrirModalEdicao(item)}
            >
              <Text style={styles.txtEditar}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Modal de edição */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar prato</Text>

            <TouchableOpacity
              style={{ marginVertical: 10, alignItems: "center" }}
              onPress={escolherImagem}
            >
              <Image
                source={
                  selectedPrato?.isLocal
                    ? localImages[selectedPrato?.imagem]
                    : { uri: selectedPrato?.imagem }
                }
                style={{ width: 120, height: 120, borderRadius: 10 }}
              />
              <Text style={{ color: "#c1372d", marginTop: 5 }}>Alterar imagem</Text>
            </TouchableOpacity>

            <Text>Nome:</Text>
            <TextInput
              style={styles.input}
              value={selectedPrato?.nome}
              onChangeText={(text) =>
                setSelectedPrato({ ...selectedPrato, nome: text })
              }
            />

            <Text>Descrição:</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              value={selectedPrato?.descricao}
              onChangeText={(text) =>
                setSelectedPrato({ ...selectedPrato, descricao: text })
              }
            />

            <Text>Preço:</Text>
            <TextInput
              style={styles.input}
              value={selectedPrato?.preco?.toString()}
              keyboardType="numeric"
              onChangeText={(text) =>
                setSelectedPrato({ ...selectedPrato, preco: text })
              }
            />

            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <TouchableOpacity style={styles.btnSalvar} onPress={salvarEdicao}>
                <Text style={styles.txtSalvar}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSalvar, { backgroundColor: "#aaa", marginLeft: 10 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.txtSalvar}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate("CardapioFuncionario2")}>
          <ImageBackground
            source={require("../../../assets/CardapioDia.png")}
            style={styles.bgImage}
            imageStyle={{ borderRadius: 12 }}
          >
            <View style={styles.overlay}>
              <Text style={styles.titulo}>CARDÁPIO DO DIA</Text>
              <Text style={styles.txtBotao}>ABAIXO</Text>
              <Icon name="keyboard-arrow-down" size={28} color="#fff" style={styles.seta} />
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>

      <FlatList
        data={pratos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
      />

      <FooterNavFuncionario activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
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
  btnEditar: {
    backgroundColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  txtEditar: { fontSize: 13, fontWeight: "bold", color: "#555" },
  container: { margin: 16, borderRadius: 12, overflow: "hidden", paddingTop: 50 },
  bgImage: { height: 160, justifyContent: "center", alignItems: "center" },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    padding: 10,
  },
  titulo: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  txtBotao: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  seta: { marginTop: 4 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  btnSalvar: {
    flex: 1,
    backgroundColor: "#c1372d",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  txtSalvar: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
