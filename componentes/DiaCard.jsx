import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import GameCard from './GameCard';

//RF-003 componente que encapsula o agrupamento de jogos por dia
export default function DiaCard({ data, jogos, favoritos, toggleFavorito }) {

  const dataJogo = new Date(jogos[0].data_brasilia);
  const hoje = new Date();

  //RF-007 compara a data do card com a data atual para identificar o dia de hoje
  const diaAtual =
    dataJogo.getDate() === hoje.getDate() &&
    dataJogo.getMonth() === hoje.getMonth() &&
    dataJogo.getFullYear() === hoje.getFullYear();

  return (
    //RF-007 aplica estilo de destaque visual quando o card representa o dia atual
    <View style={[styles.card, diaAtual && styles.cardHoje]}>

      <Text style={[styles.data, diaAtual && styles.dataHoje]}>
        {/*RF-002 data já formatada em DD/MM recebida via prop */}
        {data}
      </Text>

      {/*RF-003 renderiza todos os jogos do dia usando o componente GameCard */}
      {jogos.map((jogo) => (
        <GameCard
          key={jogo.id}
          game={jogo}
          favorito={favoritos.includes(jogo.id)}
          toggleFavorito={toggleFavorito}
        />
      ))}

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
  // RF-007 estilo de destaque para o dia atual
  cardHoje: {
    borderWidth: 2,
    borderColor: '#f2cc2f',
    backgroundColor: '#13263a',
  },
  data: { color: '#f2cc2f', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  dataHoje: { fontSize: 24 },
});
