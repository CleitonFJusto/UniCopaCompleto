import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, ImageBackground, Image,
  SectionList, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../utils/supabase';
import { formatarData } from '../utils/DateFormat';

//RF-017 verifica se o jogo já iniciou com base em data e hora no horário de Brasília
function jogoJaIniciou(dataJogo, horaJogo) {
  const agora = new Date();
  const inicio = new Date(`${dataJogo}T${horaJogo}-03:00`);
  return agora >= inicio;
}

//RF-017 opções de filtro: todos, pendentes (não confirmados) e confirmados
const FILTROS = ['TODOS', 'PENDENTES', 'CONFIRMADOS'];

//RF-017 tela dedicada para visualizar todos os palpites do usuário autenticado
export default function MeusPalpites() {
  const [palpites, setPalpites] = useState([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [carregando, setCarregando] = useState(true);

  //RF-017 recarrega os palpites sempre que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      carregarPalpites();
    }, [])
  );

  //RF-017 busca todos os palpites do usuário autenticado com join na tabela de jogos
  async function carregarPalpites() {
    setCarregando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('palpites')
      .select(`
        *,
        jogos_copa (
          id, time_casa, time_fora, sigla_casa, sigla_fora,
          data_brasilia, hora_brasilia, grupo, fase
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    setCarregando(false);
    if (!error && data) setPalpites(data);
  }

  //RF-017 filtra palpites por status: todos / pendentes / confirmados
  const palpitesFiltrados = palpites.filter(p => {
    if (filtro === 'TODOS') return true;
    if (filtro === 'CONFIRMADOS') return p.confirmado;
    if (filtro === 'PENDENTES') return !p.confirmado;
    return true;
  });

  //RF-017 agrupa palpites por data do jogo para exibir em seções
  const agruparPorData = (lista) => {
    return lista.reduce((acc, p) => {
      const jogo = p.jogos_copa;
      if (!jogo) return acc;
      const data = formatarData(jogo.data_brasilia);
      if (!acc[data]) acc[data] = [];
      acc[data].push(p);
      return acc;
    }, {});
  };

  const agrupados = agruparPorData(palpitesFiltrados);
  const secoes = Object.keys(agrupados).map(data => ({
    title: data, data: agrupados[data]
  }));

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#f2cc2f" size="large" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/bg-overlay.png')}
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%' }}
    >
      <View style={styles.content}>
        <Image style={styles.logo} source={require('../assets/unicopa.png')} />
        <Text style={styles.titulo}>MEUS PALPITES</Text>

        {/*RF-017 botões de filtro por status do palpite */}
        <View style={styles.filtrosContainer}>
          {FILTROS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.botaoFiltro, filtro === f && styles.botaoFiltroAtivo]}
              onPress={() => setFiltro(f)}
            >
              <Text style={[styles.textoFiltro, filtro === f && styles.textoFiltroAtivo]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/*RF-017 trata estado vazio com mensagem informativa */}
        {palpitesFiltrados.length === 0 ? (
          <View style={styles.vazioContainer}>
            <Text style={styles.vazioIcone}>🏆</Text>
            <Text style={styles.vazioTexto}>
              {filtro === 'TODOS'
                ? 'Você ainda não cadastrou palpites'
                : `Nenhum palpite ${filtro.toLowerCase()}`}
            </Text>
          </View>
        ) : (
          <SectionList
            style={{ width: '100%' }}
            contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}
            sections={secoes}
            keyExtractor={(item) => item.id.toString()}
            renderSectionHeader={({ section }) => (
              <Text style={styles.dataHeader}>{section.title}</Text>
            )}
            renderItem={({ item: palpite }) => {
              const jogo = palpite.jogos_copa;
              if (!jogo) return null;
              //RF-017 indica visualmente jogos já iniciados/finalizados
              const iniciou = jogoJaIniciou(jogo.data_brasilia, jogo.hora_brasilia);

              return (
                <View style={[styles.card, iniciou && styles.cardIniciado]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardHora}>{jogo.hora_brasilia?.slice(0, 5)}</Text>
                    <View style={styles.tagsContainer}>
                      {iniciou && (
                        <View style={styles.tagEncerrado}>
                          <Text style={styles.tagEncerradoTexto}>ENCERRADO</Text>
                        </View>
                      )}
                      {palpite.confirmado && (
                        <View style={styles.tagConfirmado}>
                          <Text style={styles.tagConfirmadoTexto}>✓ CONFIRMADO</Text>
                        </View>
                      )}
                      {!palpite.confirmado && (
                        <View style={styles.tagPendente}>
                          <Text style={styles.tagPendenteTexto}>PENDENTE</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/*RF-017 exibe times, placar palpitado e horário do jogo */}
                  <View style={styles.cardTimes}>
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeSigla}>{jogo.sigla_casa}</Text>
                      <Text style={styles.timeNome} numberOfLines={1}>{jogo.time_casa}</Text>
                    </View>
                    <View style={styles.placarContainer}>
                      <Text style={styles.placarGol}>{palpite.gols_casa}</Text>
                      <Text style={styles.placarSep}>×</Text>
                      <Text style={styles.placarGol}>{palpite.gols_fora}</Text>
                    </View>
                    <View style={[styles.timeContainer, { alignItems: 'flex-end' }]}>
                      <Text style={styles.timeSigla}>{jogo.sigla_fora}</Text>
                      <Text style={styles.timeNome} numberOfLines={1}>{jogo.time_fora}</Text>
                    </View>
                  </View>
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#040b13' },
  loadingContainer: { flex: 1, backgroundColor: '#040b13', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, alignItems: 'center', paddingTop: 20 },
  logo: { width: 200, height: 50, resizeMode: 'contain' },
  titulo: { marginTop: 10, fontSize: 28, fontWeight: '700', color: 'white', marginBottom: 16 },
  filtrosContainer: { flexDirection: 'row', marginBottom: 10, paddingHorizontal: 10, gap: 8 },
  botaoFiltro: { backgroundColor: '#102030', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#1e2d3d' },
  botaoFiltroAtivo: { backgroundColor: '#f2cc2f' },
  textoFiltro: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  textoFiltroAtivo: { color: '#040b13' },
  dataHeader: { color: '#f2cc2f', fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginLeft: 20, marginTop: 16, marginBottom: 4 },
  vazioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  vazioIcone: { fontSize: 48 },
  vazioTexto: { color: '#7a9ab0', fontSize: 16, textAlign: 'center' },
  card: { width: 320, backgroundColor: '#0c1b2a', borderRadius: 12, padding: 14, marginVertical: 4, borderWidth: 1, borderColor: '#1e2d3d' },
  cardIniciado: { borderColor: '#1e2d3d', opacity: 0.85 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardHora: { color: '#7a9ab0', fontSize: 12 },
  tagsContainer: { flexDirection: 'row', gap: 6 },
  tagEncerrado: { backgroundColor: '#2a0c0c', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagEncerradoTexto: { color: '#e74c3c', fontSize: 10, fontWeight: 'bold' },
  tagConfirmado: { backgroundColor: '#0c2a15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagConfirmadoTexto: { color: '#2ecc71', fontSize: 10, fontWeight: 'bold' },
  tagPendente: { backgroundColor: '#2a1f0c', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagPendenteTexto: { color: '#f2cc2f', fontSize: 10, fontWeight: 'bold' },
  cardTimes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeContainer: { flex: 1, alignItems: 'flex-start' },
  timeSigla: { color: 'white', fontWeight: 'bold', fontSize: 20 },
  timeNome: { color: '#7a9ab0', fontSize: 11, marginTop: 2 },
  placarContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  placarGol: { color: '#f2cc2f', fontWeight: '800', fontSize: 28, minWidth: 32, textAlign: 'center' },
  placarSep: { color: '#7a9ab0', fontSize: 20, fontWeight: 'bold' },
});
