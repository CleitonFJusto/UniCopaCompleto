//RF-002 / RF-004 função utilitária separada para formatar datas no padrão brasileiro DD/MM
export const formatarData = (dataString) => {
  return new Date(dataString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
};
