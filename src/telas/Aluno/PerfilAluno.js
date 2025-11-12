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
  ActivityIndicator,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import FooterNav from "../../../components/FooterNav";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../components/firebaseConfig";
import { UserContext } from "../../../components/userContext";

export default function PerfilAluno() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("PerfilAluno");
  const [reservas, setReservas] = useState([]);
  const [usuario, setUsuario] = useState({ nome: "", apelido: "", email: "" });
  const [carregando, setCarregando] = useState(true);
  const { user: userContext, loading: userLoading } = useContext(UserContext);

  // 🔹 Carrega dados do usuário logado
  useEffect(() => {
    if (userContext?.uid && !userLoading) {
      setUsuario({
        nome: userContext.nome || "",
        apelido: userContext.apelido || "",
        email: userContext.email || "",
      });
    }
  }, [userContext, userLoading]);

  // 🔹 Carrega reservas do Firestore quando a tela é focada
  useFocusEffect(
    useCallback(() => {
      const carregarReservas = async () => {
        if (!userContext?.uid) return;

        try {
          setCarregando(true);
          const reservasRef = collection(db, "reservas");
          const q = query(reservasRef, where("usuarioUid", "==", userContext.uid));
          const snapshot = await getDocs(q);

          const lista = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // 🔸 Ordena: pendentes primeiro, confirmadas depois
          const ordenadas = lista.sort((a, b) => {
            if (a.status === b.status) return 0;
            if (a.status === "pendente") return -1;
            if (b.status === "pendente") return 1;
            return 0;
          });

          setReservas(ordenadas);
        } catch (error) {
          console.error("Erro ao carregar reservas:", error);
          Alert.alert("Erro", "Não foi possível carregar o histórico de reservas.");
        } finally {
          setCarregando(false);
        }
      };

      carregarReservas();
    }, [userContext])
  );

  // 🔹 Exclui reserva (apenas local, sem remover do Firestore)
  const excluirReserva = async (id) => {
    Alert.alert("Excluir código", "Deseja realmente excluir este código da lista?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          const novas = reservas.filter((item) => item.id !== id);
          setReservas(novas);
        },
      },
    ]);
  };

  const nomeExibido = usuario.apelido || usuario.nome || "Usuário";

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

        {carregando ? (
          <ActivityIndicator size="large" color="#c1372d" />
        ) : reservas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma reserva encontrada</Text>
        ) : (
          <FlatList
            data={reservas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.codigo}>Código: {item.codigo}</Text>
                  <TouchableOpacity onPress={() => excluirReserva(item.id)}>
                    <Icon name="delete" size={22} color="#c00" />
                  </TouchableOpacity>
                </View>

                <Text>Status: {item.status || "pendente"}</Text>
                <Text>Data: {item.data || "—"}</Text>
                <Text>
  Total:{" "}
  {item.total
    ? item.total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : "—"}
</Text>
                <Text style={styles.subtitulo}>Itens:</Text>
                {Array.isArray(item.itens) &&
                  item.itens.map((i, index) => (
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
