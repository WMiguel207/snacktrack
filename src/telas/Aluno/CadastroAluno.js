import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, app } from "../../../components/firebaseConfig.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const db = getFirestore(app);

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirma, setMostrarConfirma] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    try {
      setCarregando(true);

      // 🔹 Cria o usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // 🔹 Atualiza o perfil com nome/apelido
      await updateProfile(user, {
        displayName: apelido || nome,
      });

      // 🔹 Cria o documento dentro de user/usuario/{uid}
      const userDocRef = doc(db, "user", user.uid);
      await setDoc(userDocRef, {
        nome: nome,
        apelido: apelido || nome,
        email: email,
        tipo: "aluno",
        uid: user.uid,
        dataCadastro: serverTimestamp(),
      });

      Alert.alert("✅ Sucesso", "Conta criada com sucesso!");
      navigation.navigate("LoginAluno");
    } catch (error) {
      console.error(error);
      let mensagem = "Erro ao criar conta.";

      switch (error.code) {
        case "auth/email-already-in-use":
          mensagem = "Este email já está sendo usado.";
          break;
        case "auth/invalid-email":
          mensagem = "Email inválido.";
          break;
        case "auth/weak-password":
          mensagem = "A senha deve ter pelo menos 6 caracteres.";
          break;
        default:
          mensagem = "Erro ao criar conta. Tente novamente.";
      }

      Alert.alert("Erro", mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Cadastro</Text>
            <Text style={styles.subtitle}>crie sua conta para continuar</Text>

            <Text style={styles.label}>NOME COMPLETO</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome completo"
              placeholderTextColor="#eee"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>APELIDO (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu apelido"
              placeholderTextColor="#eee"
              value={apelido}
              onChangeText={setApelido}
            />

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              placeholderTextColor="#eee"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>SENHA</Text>
            <View style={styles.senhaContainer}>
              <TextInput
                style={styles.senhaInput}
                placeholder="Digite sua senha"
                placeholderTextColor="#eee"
                secureTextEntry={!mostrarSenha}
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                <Ionicons
                  name={mostrarSenha ? "eye" : "eye-off"}
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>CONFIRMAR SENHA</Text>
            <View style={styles.senhaContainer}>
              <TextInput
                style={styles.senhaInput}
                placeholder="Confirme sua senha"
                placeholderTextColor="#eee"
                secureTextEntry={!mostrarConfirma}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
              />
              <TouchableOpacity
                onPress={() => setMostrarConfirma(!mostrarConfirma)}
              >
                <Ionicons
                  name={mostrarConfirma ? "eye" : "eye-off"}
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.botao, carregando && { opacity: 0.6 }]}
              onPress={handleCadastro}
              disabled={carregando}
            >
              <Text style={styles.botaoTexto}>
                {carregando ? "Criando..." : "Cadastrar"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.link}>
              Já tem conta?{" "}
              <Text
                style={styles.linkBold}
                onPress={() => navigation.navigate("LoginAluno")}
              >
                Faça login
              </Text>
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    backgroundColor: "#BF3E32",
    width: "90%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  subtitle: {
    color: "#f2f2f2",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    color: "#fff",
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    width: "100%",
    backgroundColor: "#D75C4A",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginTop: 5,
  },
  senhaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D75C4A",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  senhaInput: {
    flex: 1,
    color: "#fff",
    padding: 12,
  },
  botao: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 25,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  botaoTexto: {
    color: "#BF3E32",
    fontWeight: "bold",
  },
  link: {
    color: "#fff",
    marginTop: 15,
  },
  linkBold: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
