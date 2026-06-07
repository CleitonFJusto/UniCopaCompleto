import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  SectionList,
  TouchableOpacity
} from 'react-native';

import { useState, useEffect } from 'react';
import { formatarData } from './utils/DateFormat';
import DiaCard from './componentes/DiaCard';
import { supabase } from './utils/supabase';

export default function App() {

  const [jogos, setJogos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState('TODOS');

useEffect(() => {

  //RF 12 CARREGAR FAVORITOS DO USUARIO 
  async function carregarFavoritos() {

    const { data, error } = await supabase
      .from('favoritos')
      .select('jogo_id');

    if (error) {
      console.log(error);
      return;
    }

    setFavoritos(data.map(item => item.jogo_id));

  }

  async function carregarJogos() {

    const { data, error } = await supabase
      .from('jogos_copa')
      .select('*')
      .order('data_brasilia', { ascending: true });

    if (error) {
      console.log('Erro ao carregar jogos:', error);
    } else {
      setJogos(data);
    }

  }

  carregarJogos();
  carregarFavoritos();

}, []);


  const grupos = [
    'TODOS',
    ...new Set(jogos.map(jogo => jogo.grupo))
  ];

const toggleFavorito = async (id) => {
  
  if (favoritos.includes(id)) {

    const { error } = await supabase
      .from('favoritos')
      .delete()
      .eq('jogo_id', id);

    if (!error) {
      setFavoritos(
        favoritos.filter(item => item !== id)
      );
    }

  } else {

    const { error } = await supabase
      .from('favoritos')
      .insert([
        { jogo_id: id }
      ]);

    if (!error) {
      setFavoritos([
        ...favoritos,
        id
      ]);
    }

  }

};
  const jogosFiltrados =
    grupoSelecionado === 'TODOS'
      ? jogos
      : jogos.filter(jogo => jogo.grupo === grupoSelecionado);

  const agruparPorData = (jogos) => {

    return jogos.reduce((acc, jogo) => {

      const data = formatarData(jogo.data_brasilia);

      if (!acc[data]) {
        acc[data] = [];
      }

      acc[data].push(jogo);

      acc[data].sort((a, b) =>
        a.hora_brasilia.localeCompare(b.hora_brasilia)
      );

      return acc;

    }, {});

  };

  const jogosAgrupados = agruparPorData(jogosFiltrados);

  const jogosTratados = Object.keys(jogosAgrupados).map(data => ({
    title: data,
    data: jogosAgrupados[data]
  }));

  return (
    <ImageBackground
      source={require('./assets/bg-overlay.png')}
      style={styles.container}
      resizeMode="cover"
    >

      <View style={styles.content}>

        <Image
          style={styles.logo}
          source={require('./assets/unicopa.png')}
        />

        <Text style={styles.title}>
          CALENDÁRIO
        </Text>

        <View style={styles.filtrosContainer}>

          {grupos.map((grupo) => (
            <TouchableOpacity
              key={grupo}
              style={[
                styles.botaoGrupo,
                grupoSelecionado === grupo && styles.botaoGrupoAtivo
              ]}
              onPress={() => setGrupoSelecionado(grupo)}
            >
              <Text
                style={[
                  styles.textoGrupo,
                  grupoSelecionado === grupo && styles.textoGrupoAtivo
                ]}
              >
                {grupo}
              </Text>
            </TouchableOpacity>
          ))}

        </View>
{/* RF 11 -Exibe mensagem se não houver jogos, caso contrário exibe a lista de jogos agrupados por data */}
{jogos.length === 0 ? (
        <View style={styles.cardSemJogos}>
          <Text style={styles.textoSemJogos}>
            Nenhum jogo carregado
          </Text>
        </View>
      ) : (
        <SectionList
          style={{ width: '100%' }}
          contentContainerStyle={{
            alignItems: 'center',
            paddingBottom: 40
          }}
          sections={jogosTratados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={() => null}
          renderSectionHeader={({ section }) => (
            <DiaCard
              data={section.title}
              jogos={section.data}
              favoritos={favoritos}
              toggleFavorito={toggleFavorito}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

    </View>
  </ImageBackground>
);
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#040b13',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },

  logo: {
    width: 200,
    height: 50,
    resizeMode: 'contain'
  },

  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },

  filtrosContainer: {
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10
  },

  botaoGrupo: {
    backgroundColor: '#102030',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e2d3d',
    margin: 4
  },

  botaoGrupoAtivo: {
    backgroundColor: '#f2cc2f',
  },

  textoGrupo: {
    color: 'white',
    fontWeight: 'bold'
  },

  textoGrupoAtivo: {
    color: '#040b13'
  }

});