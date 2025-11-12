import React, { useEffect, useState, createContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/firebaseConfig";
import { UserProvider } from "./components/userContext";

import SplashScreen from "./src/telas/SplashScreen";
import EscolhaScreen from "./src/telas/EscolhaScreen";
import LoginAluno from "./src/telas/Aluno/LoginAluno";
import LoginFuncionario from "./src/telas/Funcionario/loginFuncionario";
import Cardapio from "./src/telas/Aluno/CardapioAluno"
import Busca from "./src/telas/Aluno/BuscaAluno"
import CardapioFuncionario from "./src/telas/Funcionario/CardapioFuncionario"
import BuscasFuncionario from "./src/telas/Funcionario/BuscaFuncionario"
import CardapioAluno2 from "./src/telas/Aluno/CardapioAluno2"
import PerfilAluno from "./src/telas/Aluno/PerfilAluno"
import CardapioFuncionario2 from "./src/telas/Funcionario/CardapioFuncionario2"
import PerfilFuncionario from "./src/telas/Funcionario/PerfilFuncionario"
import Carrinho from "./src/telas/Aluno/CarrinhoAluno"
import FiltrosAvancados from "./src/telas/Aluno/FiltroAvancados"
import CadastroAluno from "./src/telas/Aluno/CadastroAluno"

const Stack = createStackNavigator();

export const AuthContext = createContext(null);

const App = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authInitializing, setAuthInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setAuthInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (loading || authInitializing) {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={{ user }}>
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Escolha" component={EscolhaScreen} />
            <Stack.Screen name="LoginAluno" component={LoginAluno} />
            <Stack.Screen name="LoginFuncionario" component={LoginFuncionario} />
            <Stack.Screen name="InicioAluno" component={Cardapio} />
            <Stack.Screen name="Buscas" component={Busca} />
            <Stack.Screen name="CardapioFuncionario" component={CardapioFuncionario} />
            <Stack.Screen name="BuscasFuncionario" component={BuscasFuncionario} />
            <Stack.Screen name="CardapioAluno2" component={CardapioAluno2} />
            <Stack.Screen name="PerfilAluno" component={PerfilAluno} />
            <Stack.Screen name="CardapioFuncionario2" component={CardapioFuncionario2} />
            <Stack.Screen name="PerfilFuncionario" component={PerfilFuncionario} />
            <Stack.Screen name="Carrinho" component={Carrinho} />
            <Stack.Screen name="FiltrosAvancados" component={FiltrosAvancados} />
            <Stack.Screen name="CadastroAluno" component={CadastroAluno} />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </AuthContext.Provider>
  );
};

export default App;
