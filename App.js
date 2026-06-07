import {
  StyleSheet, Text, View, Image, ImageBackground,
  SectionList, TouchableOpacity
} from 'react-native';
import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { formatarData } from './utils/DateFormat';
import DiaCard from './componentes/DiaCard';
import { supabase } from './utils/supabase';
import Login from './telas/Login';
import Registro from './telas/Registro';
import Palpites from './telas/Palpites';
import MeusPalpites from './telas/MeusPalpites';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TelaCalendario() {
  const [jogos, setJogos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState('TODOS');

  useEffect(() => {
    //RF-012 carrega os favoritos do usuario salvos no Supabase
    async function carregarFavoritos() {
      const { data, error } = await supabase.from('favoritos').select('jogo_id');
      if (error) { console.log(error); return; }
      setFavoritos(data.map(item => item.jogo_id));
    }

    //RF-006 carrega jogos ordenados por data de forma crescente
    async function carregarJogos() {
      const { data, error } = await supabase
        .from('jogos_copa').select('*').order('data_brasilia', { ascending: true });
      if (error) { console.log('Erro ao carregar jogos:', error); }
      else { setJogos(data); }
    }

    carregarJogos();
    carregarFavoritos();
  }, []);

  //RF-009 extrai grupos únicos dos jogos para montar os botões de filtro
  const grupos = ['TODOS', ...new Set(jogos.map(jogo => jogo.grupo))];

  //RF-008 / RF-012 alterna favorito: remove do Supabase se já favoritado, insere se não
  const toggleFavorito = async (id) => {
    if (favoritos.includes(id)) {
      const { error } = await supabase.from('favoritos').delete().eq('jogo_id', id);
      if (!error) setFavoritos(favoritos.filter(item => item !== id));
    } else {
      const { error } = await supabase.from('favoritos').insert([{ jogo_id: id }]);
      if (!error) setFavoritos([...favoritos, id]);
    }
  };

  //RF-009 filtra jogos pelo grupo selecionado
  const jogosFiltrados = grupoSelecionado === 'TODOS'
    ? jogos : jogos.filter(jogo => jogo.grupo === grupoSelecionado);

  //RF-004 função de agrupamento separada em utilitário, ordena por horário (RF-006)
  const agruparPorData = (jogos) => jogos.reduce((acc, jogo) => {
    const data = formatarData(jogo.data_brasilia);
    if (!acc[data]) acc[data] = [];
    acc[data].push(jogo);
    acc[data].sort((a, b) => a.hora_brasilia.localeCompare(b.hora_brasilia));
    return acc;
  }, {});

  const jogosAgrupados = agruparPorData(jogosFiltrados);
  const jogosTratados = Object.keys(jogosAgrupados).map(data => ({
    title: data, data: jogosAgrupados[data]
  }));

  const handleLogout = async () => { await supabase.auth.signOut(); };

  return (
    <ImageBackground
      source={require('./assets/bg-overlay.png')}
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%' }}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Image style={styles.logo} source={require('./assets/unicopa.png')} />
          <TouchableOpacity onPress={handleLogout} style={styles.botaoSair}>
            <Text style={styles.textoBotaoSair}>SAIR</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>CALENDÁRIO</Text>

        {/*RF-009 botões de filtro por grupo gerados dinamicamente */}
        <View style={styles.filtrosContainer}>
          {grupos.map((grupo) => (
            <TouchableOpacity
              key={grupo}
              style={[styles.botaoGrupo, grupoSelecionado === grupo && styles.botaoGrupoAtivo]}
              onPress={() => setGrupoSelecionado(grupo)}
            >
              <Text style={[styles.textoGrupo, grupoSelecionado === grupo && styles.textoGrupoAtivo]}>
                {grupo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/*RF-011 exibe card quando não há jogos; caso contrário exibe lista agrupada por data */}
        {jogos.length === 0 ? (
          <View style={styles.cardSemJogos}>
            <Text style={styles.textoSemJogos}>Nenhum jogo carregado</Text>
          </View>
        ) : (
          <SectionList
            style={{ width: '100%' }}
            contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}
            sections={jogosTratados}
            keyExtractor={(item) => item.id.toString()}
            renderItem={() => null}
            //RF-003 DiaCard encapsula todos os jogos de um dia
            renderSectionHeader={({ section }) => (
              <DiaCard
                data={section.title} jogos={section.data}
                favoritos={favoritos} toggleFavorito={toggleFavorito}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ImageBackground>
  );
}

function TabIcon({ label, focused }) {
  const icons = { 'Calendário': '📅', 'Palpites': '⚽', 'Meus Palpites': '📋' };
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>{icons[label]}</Text>
    </View>
  );
}

//RF-015 / RF-016 / RF-017 navegação por abas para usuários autenticados
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0c1b2a',
          borderTopColor: '#1e2d3d',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#f2cc2f',
        tabBarInactiveTintColor: '#4a6070',
        tabBarLabelStyle: { fontSize: 11, fontWeight: 'bold' },
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Calendário" component={TelaCalendario} />
      <Tab.Screen name="Palpites" component={Palpites} />
      <Tab.Screen name="Meus Palpites" component={MeusPalpites} />
    </Tab.Navigator>
  );
}

//RF-013 / RF-014 navegação para usuários não autenticados
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Registro" component={Registro} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [sessao, setSessao] = useState(undefined);

  useEffect(() => {
    //RF-013 recupera sessão persistida e escuta mudanças de autenticação em tempo real
    supabase.auth.getSession().then(({ data: { session } }) => setSessao(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessao(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (sessao === undefined) return <View style={{ flex: 1, backgroundColor: '#040b13' }} />;

  //RF-013 redireciona para login se não autenticado, ou para o app principal se autenticado
  return (
    <NavigationContainer>
      {sessao ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', backgroundColor: '#040b13' },
  content: { flex: 1, alignItems: 'center', paddingTop: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', width: '100%', paddingHorizontal: 20
  },
  logo: { width: 200, height: 50, resizeMode: 'contain' },
  botaoSair: {
    backgroundColor: '#102030', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#1e2d3d'
  },
  textoBotaoSair: { color: '#f2cc2f', fontWeight: 'bold', fontSize: 12 },
  title: { marginTop: 10, fontSize: 28, fontWeight: '700', color: 'white' },
  filtrosContainer: {
    marginTop: 20, marginBottom: 10, width: '100%',
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', paddingHorizontal: 10
  },
  botaoGrupo: {
    backgroundColor: '#102030', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#1e2d3d', margin: 4
  },
  botaoGrupoAtivo: { backgroundColor: '#f2cc2f' },
  textoGrupo: { color: 'white', fontWeight: 'bold' },
  textoGrupoAtivo: { color: '#040b13' },
  cardSemJogos: { marginTop: 40, backgroundColor: '#0c1b2a', borderRadius: 12, padding: 20 },
  textoSemJogos: { color: 'white', fontSize: 16 },
});
