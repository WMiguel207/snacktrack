import AsyncStorage from "@react-native-async-storage/async-storage";

export const addItem = async (item) => {
  try {
    const data = await AsyncStorage.getItem("carrinho");
    const carrinho = data ? JSON.parse(data) : [];

    const index = carrinho.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      carrinho[index].quantidade = (carrinho[index].quantidade || 1) + 1;
    } else {
      carrinho.push({ ...item, quantidade: 1 });
    }

    await AsyncStorage.setItem("carrinho", JSON.stringify(carrinho));
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
  }
};

export const getItems = async () => {
  try {
    const data = await AsyncStorage.getItem("carrinho");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Erro ao buscar itens:", error);
    return [];
  }
};

export const clearCart = async () => {
  try {
    await AsyncStorage.removeItem("carrinho");
  } catch (error) {
    console.error("Erro ao limpar carrinho:", error);
  }
};

export const removeItem = async (id) => {
  try {
    const data = await AsyncStorage.getItem("carrinho");
    let carrinho = data ? JSON.parse(data) : [];
    carrinho = carrinho.filter((i) => i.id !== id);
    await AsyncStorage.setItem("carrinho", JSON.stringify(carrinho));
  } catch (error) {
    console.error("Erro ao remover item:", error);
  }
};
