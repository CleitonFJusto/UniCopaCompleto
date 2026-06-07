import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Image, ImageBackground, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { supabase } from '../utils/supabase';

//RF-013 tela de login com campos de e-mail e senha
export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState({});

  //RF-013 valida campos obrigatórios e formato de e-mail antes de enviar
  const validar = () => {
    const novosErros = {};
    if (!email.trim()) {
      novosErros.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      novosErros.email = 'Formato de e-mail inválido';
    }
    if (!senha.trim()) {
      novosErros.senha = 'Senha é obrigatória';
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  //RF-013 integra autenticação com Supabase; em erro exibe mensagem amigável
  const handleLogin = async () => {
    if (!validar()) return;
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    setCarregando(false);
    if (error) {
      Alert.alert('Erro ao entrar', 'E-mail ou senha incorretos. Tente novamente.');
    }
    // Em caso de sucesso, o listener de auth no App.js redireciona automaticamente
  };

  return (
    <ImageBackground
      source={require('../assets/bg-overlay.png')}
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%' }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <Image style={styles.logo} source={require('../assets/unicopa.png')} />
        <Text style={styles.titulo}>ENTRAR</Text>

        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, erros.email && styles.inputErro]}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#4a6070"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => { setEmail(v); setErros(e => ({ ...e, email: null })); }}
          />
          {erros.email && <Text style={styles.textoErro}>{erros.email}</Text>}

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={[styles.input, erros.senha && styles.inputErro]}
            placeholder="••••••••"
            placeholderTextColor="#4a6070"
            secureTextEntry
            value={senha}
            onChangeText={(v) => { setSenha(v); setErros(e => ({ ...e, senha: null })); }}
          />
          {erros.senha && <Text style={styles.textoErro}>{erros.senha}</Text>}

          <TouchableOpacity
            style={[styles.botao, carregando && styles.botaoDesativado]}
            onPress={handleLogin}
            disabled={carregando}
          >
            {carregando
              ? <ActivityIndicator color="#040b13" />
              : <Text style={styles.textoBotao}>ENTRAR</Text>
            }
          </TouchableOpacity>

          {/*RF-014 link para navegar até a tela de registro */}
          <TouchableOpacity
            style={styles.botaoSecundario}
            onPress={() => navigation.navigate('Registro')}
          >
            <Text style={styles.textoBotaoSecundario}>
              Não tem conta?{' '}
              <Text style={styles.textoLink}>Registre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%', backgroundColor: '#040b13' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  logo: { width: 200, height: 50, resizeMode: 'contain', marginBottom: 10 },
  titulo: { fontSize: 28, fontWeight: '700', color: 'white', marginBottom: 30, letterSpacing: 2 },
  form: { width: '100%', backgroundColor: '#0c1b2a', borderRadius: 16, padding: 24 },
  label: { color: '#f2cc2f', fontWeight: 'bold', marginBottom: 6, fontSize: 13, letterSpacing: 1 },
  input: {
    backgroundColor: '#102030', borderRadius: 10, borderWidth: 1,
    borderColor: '#1e2d3d', color: 'white', paddingHorizontal: 14,
    paddingVertical: 12, marginBottom: 6, fontSize: 15,
  },
  inputErro: { borderColor: '#e74c3c' },
  textoErro: { color: '#e74c3c', fontSize: 12, marginBottom: 10 },
  botao: { backgroundColor: '#f2cc2f', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  botaoDesativado: { opacity: 0.6 },
  textoBotao: { color: '#040b13', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  botaoSecundario: { marginTop: 16, alignItems: 'center' },
  textoBotaoSecundario: { color: '#7a9ab0', fontSize: 14 },
  textoLink: { color: '#f2cc2f', fontWeight: 'bold' },
});
