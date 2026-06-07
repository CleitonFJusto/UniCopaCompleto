import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ImageBackground, Image,
  SectionList, TextInput, TouchableOpacity, ActivityIndicator,
  Modal, ScrollView, Alert
} from 'react-native';
import { supabase } from '../utils/supabase';
import { formatarData } from '../utils/DateFormat';

//RF-015 verifica se o jogo já iniciou com base em data e hora no horário de Brasília
function jogoJaIniciou(dataJogo, horaJogo) {
  const agora = new Date();
  const inicio = new Date(`${dataJogo}T${horaJogo}-03:00`);
  return agora >= inicio;
}

//RF-015 tela de palpites: exibe jogos disponíveis e permite informar placar
export default function Palpites() {
  const [jogos, setJogos] = useState([]);
  const [palpites, setPalpites] = useState({});
  const [palpitesSalvos, setPalpitesSalvos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
      await carregarJogos();
      await carregarPalpites(user?.id);
      setCarregando(false);
    }
    init();
  }, []);

  //RF-015 carrega lista de jogos disponíveis para palpite a partir do Supabase
  async function carregarJogos() {
    const { data, error } = await supabase
      .from('jogos_copa')
      .select('*')
      .order('data_brasilia', { ascending: true });
    if (!error) setJogos(data);
  }

  //RF-015 carrega palpites já salvos do usuário e preenche os inputs com os valores existentes
  async function carregarPalpites(uid) {
    if (!uid) return;
    const { data, error } = await supabase
      .from('palpites')
      .select('*')
      .eq('user_id', uid);
    if (!error && data) {
      const mapa = {};
      data.forEach(p => { mapa[p.jogo_id] = p; });
      setPalpitesSalvos(mapa);
      const inputs = {};
      data.forEach(p => {
        inputs[p.jogo_id] = { casa: String(p.gols_casa), fora: String(p.gols_fora) };
      });
      setPalpites(inputs);
    }
  }

  //RF-015 atualiza o palpite digitado, aceitando apenas números de até 2 dígitos
  const atualizarPalpite = (jogoId, campo, valor) => {
    const numerico = valor.replace(/[^0-9]/g, '').slice(0, 2);
    setPalpites(prev => ({
      ...prev,
      [jogoId]: { ...prev[jogoId], [campo]: numerico }
    }));
  };

  const agruparPorData = (jogos) => {
    return jogos.reduce((acc, jogo) => {
      const data = formatarData(jogo.data_brasilia);
      if (!acc[data]) acc[data] = [];
      acc[data].push(jogo);
      return acc;
    }, {});
  };

  const jogosAgrupados = agruparPorData(jogos);
  const jogosTratados = Object.keys(jogosAgrupados).map(data => ({
    title: data, data: jogosAgrupados[data]
  }));

  //RF-016 filtra apenas palpites preenchidos de jogos que ainda não iniciaram para revisão
  const palpitesParaRevisar = jogos.filter(j => {
    const p = palpites[j.id];
    return p && p.casa !== '' && p.fora !== '' &&
      !jogoJaIniciou(j.data_brasilia, j.hora_brasilia);
  });

  //RF-016 persiste os palpites no Supabase usando upsert para evitar duplicidade por usuário+jogo
  const handleConfirmar = async () => {
    setSalvando(true);
    const upserts = palpitesParaRevisar.map(j => ({
      user_id: userId,
      jogo_id: j.id,
      gols_casa: parseInt(palpites[j.id].casa) || 0,
      gols_fora: parseInt(palpites[j.id].fora) || 0,
      confirmado: true,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('palpites')
      .upsert(upserts, { onConflict: 'user_id,jogo_id' });

    setSalvando(false);
    setModalVisivel(false);

    //RF-016 exibe feedback de sucesso ou erro ao finalizar
    if (error) {
      Alert.alert('Erro', 'Não foi possível salvar os palpites. Tente novamente.');
    } else {
      Alert.alert('Sucesso!', 'Palpites confirmados com sucesso! ✅');
      await carregarPalpites(userId);
    }
  };

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
        <Text style={styles.titulo}>PALPITES</Text>

        <SectionList
          style={{ width: '100%' }}
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 100 }}
          sections={jogosTratados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: jogo }) => {
            //RF-015 bloqueia edição após o horário do jogo usando hora_brasilia como referência
            const iniciou = jogoJaIniciou(jogo.data_brasilia, jogo.hora_brasilia);
            const salvo = palpitesSalvos[jogo.id];
            const palpite = palpites[jogo.id] || { casa: '', fora: '' };

            return (
              <View style={[styles.jogoCard, iniciou && styles.jogoCardBloqueado]}>
                <View style={styles.jogoHeader}>
                  <Text style={styles.jogoHora}>{jogo.hora_brasilia?.slice(0, 5)}</Text>
                  {iniciou && <Text style={styles.tagBloqueado}>ENCERRADO</Text>}
                  {salvo?.confirmado && !iniciou && <Text style={styles.tagConfirmado}>✓ CONFIRMADO</Text>}
                </View>

                <View style={styles.jogoTimes}>
                  <Text style={styles.timeCasa} numberOfLines={1}>{jogo.sigla_casa}</Text>

                  <View style={styles.placarContainer}>
                    {/*RF-015 inputs de gols bloqueados para jogos já iniciados */}
                    <TextInput
                      style={[styles.inputGol, iniciou && styles.inputBloqueado]}
                      value={palpite.casa}
                      onChangeText={(v) => atualizarPalpite(jogo.id, 'casa', v)}
                      keyboardType="numeric"
                      maxLength={2}
                      editable={!iniciou}
                      placeholder="0"
                      placeholderTextColor="#4a6070"
                    />
                    <Text style={styles.separador}>×</Text>
                    <TextInput
                      style={[styles.inputGol, iniciou && styles.inputBloqueado]}
                      value={palpite.fora}
                      onChangeText={(v) => atualizarPalpite(jogo.id, 'fora', v)}
                      keyboardType="numeric"
                      maxLength={2}
                      editable={!iniciou}
                      placeholder="0"
                      placeholderTextColor="#4a6070"
                    />
                  </View>

                  <Text style={styles.timeFora} numberOfLines={1}>{jogo.sigla_fora}</Text>
                </View>
              </View>
            );
          }}
          renderSectionHeader={({ section }) => (
            <Text style={styles.dataHeader}>{section.title}</Text>
          )}
          showsVerticalScrollIndicator={false}
        />

        {/*RF-016 botão flutuante de revisão aparece apenas quando há palpites preenchidos */}
        {palpitesParaRevisar.length > 0 && (
          <TouchableOpacity style={styles.botaoConfirmar} onPress={() => setModalVisivel(true)}>
            <Text style={styles.textoBotaoConfirmar}>
              REVISAR E CONFIRMAR ({palpitesParaRevisar.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/*RF-016 modal de revisão exibe os palpites antes de confirmar o envio */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>REVISAR PALPITES</Text>
            <Text style={styles.modalSubtitulo}>Confirme seus palpites abaixo:</Text>

            <ScrollView style={styles.modalLista}>
              {palpitesParaRevisar.map(jogo => (
                <View key={jogo.id} style={styles.modalItem}>
                  <Text style={styles.modalJogo}>{jogo.sigla_casa} vs {jogo.sigla_fora}</Text>
                  <Text style={styles.modalPlacar}>
                    {palpites[jogo.id]?.casa} × {palpites[jogo.id]?.fora}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalVisivel(false)}>
                <Text style={styles.textoBotaoCancelar}>VOLTAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botaoSalvar, salvando && { opacity: 0.6 }]}
                onPress={handleConfirmar}
                disabled={salvando}
              >
                {salvando
                  ? <ActivityIndicator color="#040b13" />
                  : <Text style={styles.textoBotaoSalvar}>CONFIRMAR</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#040b13' },
  loadingContainer: { flex: 1, backgroundColor: '#040b13', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, alignItems: 'center', paddingTop: 20 },
  logo: { width: 200, height: 50, resizeMode: 'contain' },
  titulo: { marginTop: 10, fontSize: 28, fontWeight: '700', color: 'white', marginBottom: 10 },
  dataHeader: { color: '#f2cc2f', fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginLeft: 20, marginTop: 16, marginBottom: 4 },
  jogoCard: { width: 320, backgroundColor: '#0c1b2a', borderRadius: 12, padding: 12, marginVertical: 4, borderWidth: 1, borderColor: '#1e2d3d' },
  jogoCardBloqueado: { opacity: 0.6 },
  jogoHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  jogoHora: { color: '#7a9ab0', fontSize: 12 },
  tagBloqueado: { color: '#e74c3c', fontSize: 11, fontWeight: 'bold', backgroundColor: '#2a0c0c', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagConfirmado: { color: '#2ecc71', fontSize: 11, fontWeight: 'bold', backgroundColor: '#0c2a15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  jogoTimes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeCasa: { color: 'white', fontWeight: 'bold', fontSize: 16, flex: 1, textAlign: 'left' },
  timeFora: { color: 'white', fontWeight: 'bold', fontSize: 16, flex: 1, textAlign: 'right' },
  placarContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  inputGol: { backgroundColor: '#102030', borderWidth: 1, borderColor: '#1e2d3d', borderRadius: 8, color: 'white', fontWeight: 'bold', fontSize: 20, width: 44, height: 44, textAlign: 'center' },
  inputBloqueado: { borderColor: '#0a1520', color: '#4a6070' },
  separador: { color: '#f2cc2f', fontSize: 18, fontWeight: 'bold' },
  botaoConfirmar: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#f2cc2f', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  textoBotaoConfirmar: { color: '#040b13', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0c1b2a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitulo: { color: 'white', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  modalSubtitulo: { color: '#7a9ab0', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  modalLista: { maxHeight: 300, marginBottom: 16 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e2d3d' },
  modalJogo: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  modalPlacar: { color: '#f2cc2f', fontSize: 18, fontWeight: '800' },
  modalBotoes: { flexDirection: 'row', gap: 12 },
  botaoCancelar: { flex: 1, backgroundColor: '#102030', borderRadius: 10, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1e2d3d' },
  textoBotaoCancelar: { color: 'white', fontWeight: 'bold' },
  botaoSalvar: { flex: 2, backgroundColor: '#f2cc2f', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  textoBotaoSalvar: { color: '#040b13', fontWeight: '800', fontSize: 15 },
});
