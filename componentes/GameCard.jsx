import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';

import { TEAM_FLAGS } from '../utils/flagMapping';

export default function GameCard({
  game,
  favorito,
  toggleFavorito
}) {

  const timeCasa = TEAM_FLAGS[game.sigla_casa];
  const timeFora = TEAM_FLAGS[game.sigla_fora];

  const jogoBrasil =
    game.sigla_casa === 'BRA' ||
    game.sigla_fora === 'BRA';

  return (

    <TouchableOpacity
      onPress={() => toggleFavorito(game.id)}
      activeOpacity={0.8}
    >

      <View style={[
        styles.jogo,
        jogoBrasil && styles.jogoBrasil,
        favorito && styles.favorito
      ]}>

        <Text style={styles.estrela}>
          {favorito ? '⭐' : '☆'}
        </Text>

        <Text style={styles.grupo}>
          GRUPO {game.grupo} {game.confronto}
        </Text>

        <View style={styles.linhaPrincipal}>

          <View style={styles.time}>
            {timeCasa && (
              <Image
                source={timeCasa}
                style={styles.bandeira}
              />
            )}

            <Text style={styles.sigla}>
              {game.sigla_casa}
            </Text>
          </View>

          <View style={styles.horario}>
            <Text style={styles.hora}>
              {game.hora_brasilia}
            </Text>

            <Text style={styles.subTitulo}>
              VS
            </Text>
          </View>

          <View style={styles.time}>
            {timeFora && (
              <Image
                source={timeFora}
                style={styles.bandeira}
              />
            )}

            <Text style={styles.sigla}>
              {game.sigla_fora}
            </Text>
          </View>

        </View>

        <View style={styles.local}>
          <Text style={styles.subTitulo}>
            {game.estadio}
          </Text>

          <Text style={styles.subTitulo}>
            {game.cidade} • {game.pais}
          </Text>
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

  jogoBrasil: {
    backgroundColor: '#113b1f',
    borderRadius: 12,
    padding: 10,
    borderWidth: 2,
    borderColor: '#f7d000',
  },

  // Favorito
  favorito: {
    backgroundColor: '#1c2f4a',
    borderColor: '#ffd700',
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
  },

  estrela: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 20
  },

  grupo: {
    color: '#8fa3b8',
    fontSize: 12,
    marginBottom: 10
  },

  linhaPrincipal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },

  bandeira: {
    width: 28,
    height: 28,
    borderRadius: 14
  },

  sigla: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },

  horario: {
    alignItems: 'center'
  },

  hora: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },

  local: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  subTitulo: {
    color: '#8fa3b8',
    fontSize: 12
  }
});