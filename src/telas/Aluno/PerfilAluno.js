import React, { useState, useCallback, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import FooterNav from "../../../components/FooterNav";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../components/firebaseConfig";
import { UserContext } from "../../../components/userContext";

export default function PerfilAluno() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("PerfilAluno");
  const [reservas, setReservas] = useState([]);
  const [usuario, setUsuario] = useState({
    nome: "",
    apelido: "",
    email: "",
  });
  const { user: userContext, loading: userLoading } = useContext(UserContext);

  // 🔹 Carrega dados do usuário logado
  useEffect(() => {
    const carregarUsuario = async () => {
      if (!userContext?.uid) {
        if (!userLoading) {
          setUsuario({ nome: "", apelido: "", email: "" });
        }
        return;
      }

      // usa dados já carregados no contexto
      setUsuario((prev) => ({
        nome: userContext.nome ?? prev.nome,
        apelido: userContext.apelido ?? prev.apelido,
        email: userContext.email ?? prev.email,
      }));

      try {
        const docRef = doc(db, "user", userContext.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dados = docSnap.data();
          setUsuario({
            nome: dados.nome || "",
            apelido: dados.apelido || "",
            email: userContext.email || "",
          });
        }
      } catch (error) {
        console.warn("Não foi possível carregar dados do usuário:", error);
      }
    };
    carregarUsuario();
  }, [userContext, userLoading]);

  // 🔹 Carrega reservas quando a tela é focada
  useFocusEffect(
    useCallback(() => {
      const carregarReservas = async () => {
        const armazenadas = await AsyncStorage.getItem("reservas");
        const lista = armazenadas ? JSON.parse(armazenadas) : [];
        setReservas(lista.reverse());
      };
      carregarReservas();
    }, [])
  );

  // 🔹 Exclui reserva
  const excluirReserva = async (codigo) => {
    Alert.alert("Excluir código", "Tem certeza que deseja excluir este código?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const novasReservas = reservas.filter((item) => item.codigo !== codigo);
          setReservas(novasReservas);
          await AsyncStorage.setItem("reservas", JSON.stringify(novasReservas));
        },
      },
    ]);
  };

  let nomeExibido = "";

  if (usuario.apelido) {
    nomeExibido = usuario.apelido;
  } else if (usuario.nome) {
    nomeExibido = usuario.nome;
  } else {
    nomeExibido = "Usuário";
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={require("../../../assets/item2.png")}
          style={styles.avatar}
        />
        <Text style={styles.name}>{nomeExibido}</Text>
        <Text style={styles.email}>{usuario.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de Códigos</Text>

        {reservas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma reserva encontrada</Text>
        ) : (
          <FlatList
            data={reservas}
            keyExtractor={(item) => item.codigo}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.codigo}>Código: {item.codigo}</Text>
                  <TouchableOpacity onPress={() => excluirReserva(item.codigo)}>
                    <Icon name="delete" size={24} color="#c00" />
                  </TouchableOpacity>
                </View>
                <Text>Data: {item.data}</Text>
                <Text>Total: {item.total}</Text>
                <Text style={styles.subtitulo}>Itens:</Text>
                {item.itens.map((i, index) => (
                  <Text key={index} style={styles.itemText}>
                    • {i.titulo || i.nome}
                  </Text>
                ))}
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.option, styles.logoutOption]}
          onPress={() => navigation.navigate("Escolha")}
        >
          <Text style={[styles.optionText, styles.logoutText]}>Sair</Text>
          <Icon name="logout" size={24} color="#c00" />
        </TouchableOpacity>
      </View>

      <FooterNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 50, flex: 1, backgroundColor: "#fff" },
  profileContainer: { alignItems: "center", marginVertical: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#ccc" },
  name: { marginTop: 10, fontWeight: "bold", fontSize: 18 },
  email: { color: "#555", marginTop: 2 },
  section: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  codigo: { fontWeight: "bold", color: "#c1372d" },
  subtitulo: { marginTop: 6, fontWeight: "bold" },
  itemText: { fontSize: 13, color: "#555" },
  emptyText: { color: "#777", textAlign: "center", marginTop: 20 },
  optionsContainer: { paddingBottom: 20 },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  optionText: { fontSize: 16 },
  logoutText: { color: "#c00", fontWeight: "bold" },
});
