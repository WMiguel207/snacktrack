import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, app } from "../../../components/firebaseConfig.js";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore(app);

export default function LoginAluno() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha email e senha.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      const userDocRef = doc(db, "user", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await signOut(auth);
        Alert.alert(
          "Acesso Negado",
          "Usuário não cadastrado no sistema. Entre em contato com o administrador."
        );
        return;
      }

      const userData = userDoc.data();

      if (userData.tipo !== "aluno") {
        await signOut(auth);
        Alert.alert(
          "Acesso Negado",
          "Este login é apenas para alunos. Use o login de funcionário se for o seu caso."
        );
        return;
      }

      navigation.navigate("InicioAluno");
    } catch (error) {
      console.error("Erro no login:", error);
      const code = error.code || "";

      if (code.includes("auth/user-not-found") || code.includes("auth/wrong-password")) {
        Alert.alert("Erro", "Email ou senha incorretos.");
      } else if (code.includes("auth/invalid-email")) {
        Alert.alert("Erro", "Email inválido.");
      } else if (code.includes("auth/network-request-failed")) {
        Alert.alert("Erro", "Erro de conexão. Verifique sua internet.");
      } else {
        Alert.alert("Erro", "Erro ao conectar. Tente novamente.");
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.topContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("Escolha")}
              activeOpacity={0.6}
            >
              <Ionicons name="arrow-back" size={28} color="#7f8c8d" />
            </TouchableOpacity>

            <Image
              source={require("../../../assets/iconeLoginAluno.png")}
              style={styles.icon}
            />
          </View>

          {/* Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>entre para continuar</Text>

            <View style={{ width: "100%" }}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>SENHA</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Digite sua senha"
                  secureTextEntry={!mostrarSenha}
                  value={senha}
                  onChangeText={setSenha}
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setMostrarSenha(!mostrarSenha)}
                >
                  <Ionicons
                    name={mostrarSenha ? "eye" : "eye-off"}
                    size={22}
                    color="#7f8c8d"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log in</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("CadastroAluno")}
              style={styles.cadastroContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.cadastroTexto}>
                Não tem acesso?{" "}
                <Text style={styles.cadastroLink}>Faça seu cadastro</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    overflow: "hidden",
    paddingBottom: 20,
    flexGrow: 1,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },
  icon: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  loginContainer: {
    backgroundColor: "#C0392B",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    padding: 30,
    flexGrow: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    color: "#fff",
    marginBottom: 20,
  },
  label: {
    color: "#fff",
    marginBottom: 5,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "100%",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    color: "#333",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 10,
  },
  buttonText: {
    color: "#C0392B",
    fontWeight: "bold",
  },
  cadastroContainer: {
    marginTop: 15,
  },
  cadastroTexto: {
    color: "#fff",
    fontSize: 14,
  },
  cadastroLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
