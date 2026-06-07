import {
  StyleSheet, Text, View, Image, TouchableOpacity
} from 'react-native';

//RF-001 importa o mapeamento de logos das seleções
import { TEAM_FLAGS } from '../utils/flagMapping';

//RF-003 componente de card individual de jogo, renderizado dentro do DiaCard
export default function GameCard({ game, favorito, toggleFavorito }) {

  //RF-001 busca a logo de cada seleção pelo código da sigla
  const timeCasa = TEAM_FLAGS[game.sigla_casa];
  const timeFora = TEAM_FLAGS[game.sigla_fora];

  //RF-005 identifica jogos envolvendo o Brasil para aplicar estilo diferenciado
  const jogoBrasil = game.sigla_casa === 'BRA' || game.sigla_fora === 'BRA';

  return (
    //RF-008 toque no card alterna o estado de favorito do jogo
    <TouchableOpacity onPress={() => toggleFavorito(game.id)} activeOpacity={0.8}>

      <View style={[
        styles.jogo,
        jogoBrasil && styles.jogoBrasil,  // RF-005 destaque visual para jogos do Brasil
        favorito && styles.favorito        // RF-008 destaque visual para jogos favoritos
      ]}>

        {/*RF-008 ícone de estrela indica se o jogo está favoritado */}
        <Text style={styles.estrela}>{favorito ? '⭐' : '☆'}</Text>

        <Text style={styles.grupo}>GRUPO {game.grupo} {game.confronto}</Text>

        <View style={styles.linhaPrincipal}>
          <View style={styles.time}>
            {/*RF-001 exibe a bandeira da seleção caso exista no mapeamento */}
            {timeCasa && <Image source={timeCasa} style={styles.bandeira} />}
            <Text style={styles.sigla}>{game.sigla_casa}</Text>
          </View>

          <View style={styles.horario}>
            {/*RF-006 exibe o horário do jogo no horário de Brasília */}
            <Text style={styles.hora}>{game.hora_brasilia}</Text>
            <Text style={styles.subTitulo}>VS</Text>
          </View>

          <View style={styles.time}>
            {timeFora && <Image source={timeFora} style={styles.bandeira} />}
            <Text style={styles.sigla}>{game.sigla_fora}</Text>
          </View>
        </View>

        <View style={styles.local}>
          <Text style={styles.subTitulo}>{game.estadio}</Text>
          <Text style={styles.subTitulo}>{game.cidade} • {game.pais}</Text>
        </View>

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  jogo: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2d3d',
    paddingBottom: 15,
    position: 'relative'
  },
  // RF-005 estilo diferenciado para jogos do Brasil
  jogoBrasil: {
    backgroundColor: '#113b1f',
    borderRadius: 12,
    padding: 10,
    borderWidth: 2,
    borderColor: '#f7d000',
  },
  // RF-008 estilo diferenciado para jogos favoritados
  favorito: {
    backgroundColor: '#1c2f4a',
    borderColor: '#ffd700',
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
  },
  estrela: { position: 'absolute', top: 10, right: 10, fontSize: 20 },
  grupo: { color: '#8fa3b8', fontSize: 12, marginBottom: 10 },
  linhaPrincipal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bandeira: { width: 28, height: 28, borderRadius: 14 },
  sigla: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  horario: { alignItems: 'center' },
  hora: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  local: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  subTitulo: { color: '#8fa3b8', fontSize: 12 }
});
