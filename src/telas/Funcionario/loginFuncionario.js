import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginFuncionario() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    // Autenticação via Firebase
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('../../../components/firebaseConfig');
      await signInWithEmailAndPassword(auth, email, senha);
      navigation.navigate('CardapioFuncionario');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Email ou senha incorretos.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#C0392B" }}>
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate("Escolha")}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>

          <Image 
            source={require("../../../assets/iconeLoginFuncionario.png")}
            style={styles.icon}
          />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>entre para continuar</Text>

          <Text style={styles.label}>NOME</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            placeholderTextColor="#C0392B"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>SENHA</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#C0392B"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />

          <TouchableOpacity style={styles.button} onPress={()=> navigation.navigate("CardapioFuncionario")}>
            <Text style={styles.buttonText}>Log in</Text> 
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C0392B",
  },
  topContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#C0392B",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    overflow: "hidden",
    paddingBottom: 20,
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
    flex: 2,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    padding: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#C0392B",
    marginBottom: 5,
  },
  subtitle: {
    color: "#C0392B",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    color: "#C0392B",
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    backgroundColor: "#C0392B",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#C0392B",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footerText: {
    marginTop: 20,
    color: "#C0392B",
  },
  link: {
    color: "#C0392B",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
