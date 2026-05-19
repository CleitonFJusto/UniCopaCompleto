import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import GameCard from './GameCard';

export default function DiaCard({
  data,
  jogos,
  favoritos,
  toggleFavorito
}) {

  const dataJogo = new Date(jogos[0].data_brasilia);

  const hoje = new Date();

  const diaAtual =
    dataJogo.getDate() === hoje.getDate() &&
    dataJogo.getMonth() === hoje.getMonth() &&
    dataJogo.getFullYear() === hoje.getFullYear();

  return (
    <View style={[
      styles.card,
      diaAtual && styles.cardHoje
    ]}>

      <Text style={[
        styles.data,
        diaAtual && styles.dataHoje
      ]}>
        {data}
      </Text>

      {
        jogos.map((jogo) => (

          <GameCard
            key={jogo.id}
            game={jogo}
            favorito={favoritos.includes(jogo.id)}
            toggleFavorito={toggleFavorito}
          />

        ))
      }

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    backgroundColor: '#0c1b2a',
    width: 320,
    borderRadius: 12,
    padding: 15,
  },

  cardHoje: {
    borderWidth: 2,
    borderColor: '#f2cc2f',
    backgroundColor: '#13263a',
  },

  data: {
    color: '#f2cc2f',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },

  dataHoje: {
    fontSize: 24,
  },
});