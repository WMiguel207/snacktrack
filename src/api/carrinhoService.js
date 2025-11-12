import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../components/firebaseConfig';

/**
 * Obtém ou cria um carrinho para o usuário logado
 * @param {string} usuarioUid - UID do usuário autenticado
 * @returns {Object} { id, items, usuarioUid, status, criadoEm }
 */
export const getOrCreateCarrinho = async (usuarioUid) => {
  try {
    // Buscar carrinho existente com status "pendente"
    const q = query(
      collection(db, 'carrinhos'),
      where('usuarioUid', '==', usuarioUid),
      where('status', '==', 'pendente')
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Retorna o primeiro carrinho encontrado
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    }

    // Se não existe, cria um novo
    const novoCarrinho = {
      usuarioUid,
      status: 'pendente',
      items: [],
      criadoEm: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'carrinhos'), novoCarrinho);
    return {
      id: docRef.id,
      usuarioUid,
      status: 'pendente',
      items: [],
    };
  } catch (error) {
    console.error('Erro ao obter/criar carrinho:', error);
    throw error;
  }
};

/**
 * Adiciona um item ao carrinho (ou incrementa a quantidade se já existe)
 * @param {string} usuarioUid - UID do usuário autenticado
 * @param {Object} item - { id, nome, preco, imagem, etc }
 * @param {number} quantidade - quantidade a adicionar (padrão 1)
 */
export const adicionarItemAoCarrinho = async (usuarioUid, item, quantidade = 1) => {
  try {
    const carrinho = await getOrCreateCarrinho(usuarioUid);
    const carrinhoRef = doc(db, 'carrinhos', carrinho.id);

    // Limpa campos undefined do item
    const itemLimpo = {};
    Object.keys(item).forEach(key => {
      if (item[key] !== undefined) {
        itemLimpo[key] = item[key];
      }
    });

    // Verifica se o item já está no carrinho
    const itemExistente = carrinho.items?.find((i) => i.id === itemLimpo.id);

    let novoItems;
    if (itemExistente) {
      // Incrementa quantidade
      novoItems = carrinho.items.map((i) =>
        i.id === itemLimpo.id
          ? { ...i, quantidade: (i.quantidade || 1) + quantidade }
          : i
      );
    } else {
      // Adiciona novo item
      novoItems = [...(carrinho.items || []), { ...itemLimpo, quantidade }];
    }

    await updateDoc(carrinhoRef, {
      items: novoItems,
    });

    return {
      id: carrinho.id,
      ...carrinho,
      items: novoItems,
    };
  } catch (error) {
    console.error('Erro ao adicionar item ao carrinho:', error);
    throw error;
  }
};

/**
 * Remove um item do carrinho
 * @param {string} carrinhoId - ID do carrinho no Firestore
 * @param {string} itemId - ID do item a remover
 */
export const removerItemDoCarrinho = async (carrinhoId, itemId) => {
  try {
    const carrinhoRef = doc(db, 'carrinhos', carrinhoId);
    const carrinhoSnap = await getDocs(
      query(collection(db, 'carrinhos'), where('__name__', '==', carrinhoId))
    );

    if (carrinhoSnap.empty) {
      throw new Error('Carrinho não encontrado');
    }

    const carrinhoData = carrinhoSnap.docs[0].data();
    const novoItems = carrinhoData.items.filter((i) => i.id !== itemId);

    await updateDoc(carrinhoRef, {
      items: novoItems,
    });

    return {
      id: carrinhoId,
      ...carrinhoData,
      items: novoItems,
    };
  } catch (error) {
    console.error('Erro ao remover item do carrinho:', error);
    throw error;
  }
};

/**
 * Carrega o carrinho atual do usuário
 * @param {string} usuarioUid - UID do usuário autenticado
 * @returns {Object | null} carrinho com id ou null se não existir
 */
export const carregarCarrinho = async (usuarioUid) => {
  try {
    const q = query(
      collection(db, 'carrinhos'),
      where('usuarioUid', '==', usuarioUid),
      where('status', '==', 'pendente')
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error('Erro ao carregar carrinho:', error);
    throw error;
  }
};

/**
 * Finaliza o carrinho e cria uma reserva no Firestore
 * @param {string} carrinhoId - ID do carrinho
 * @param {string} usuarioUid - UID do usuário
 * @returns {Object} { reservaId, codigo }
 */
export const finalizarCarrinhoComReserva = async (carrinhoId, usuarioUid) => {
  try {
    const carrinhoRef = doc(db, 'carrinhos', carrinhoId);

    // Carrega o carrinho para obter os items
    const carrinhoSnap = await getDocs(
      query(collection(db, 'carrinhos'), where('__name__', '==', carrinhoId))
    );

    if (carrinhoSnap.empty) {
      throw new Error('Carrinho não encontrado');
    }

    const carrinhoData = carrinhoSnap.docs[0].data();

    // Limpa items de campos undefined
    const itemsLimpos = (carrinhoData.items || []).map(item => {
      const cleaned = {};
      Object.keys(item).forEach(key => {
        if (item[key] !== undefined) {
          cleaned[key] = item[key];
        }
      });
      return cleaned;
    });

    // Gera um código único para a reserva
    const codigoReserva = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Cria a reserva no Firestore
    const reserva = {
      usuarioUid,
      carrinhoId,
      items: itemsLimpos,
      status: 'confirmada',
      codigo: codigoReserva,
      criadoEm: serverTimestamp(),
      total: calcularTotal(itemsLimpos),
    };

    const reservaRef = await addDoc(collection(db, 'reservas'), reserva);

    // Marca o carrinho como "finalizado"
    await updateDoc(carrinhoRef, {
      status: 'finalizado',
      reservaId: reservaRef.id,
    });

    return {
      reservaId: reservaRef.id,
      codigo: codigoReserva,
    };
  } catch (error) {
    console.error('Erro ao finalizar carrinho e criar reserva:', error);
    throw error;
  }
};

/**
 * Calcula o total do carrinho
 * @param {Array} items - array de items
 * @returns {number} total em reais
 */
const calcularTotal = (items) => {
  if (!Array.isArray(items)) return 0;

  return items.reduce((total, item) => {
    const preco = parseFloat(
      item.preco
        ?.toString()
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.') || 0
    );
    const quantidade = item.quantidade || 1;
    return total + preco * quantidade;
  }, 0);
};

/**
 * Formata o preço para exibição
 * @param {number} preco - preço em reais
 * @returns {string} preço formatado (ex: "R$ 12,00")
 */
export const formatarPreco = (preco) => {
  if (typeof preco === 'string') {
    // Se já é string, retorna como está
    return preco.includes('R$') ? preco : `R$ ${preco}`;
  }
  return `R$ ${Number(preco).toFixed(2).replace('.', ',')}`;
};
