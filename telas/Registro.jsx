import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { supabase } from '../utils/supabase';

export default function Registro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState({});
  const [sucesso, setSucesso] = useState(false);

  const validar = () => {
    const novosErros = {};

    if (!email.trim()) {
      novosErros.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      novosErros.email = 'Formato de e-mail inválido';
    }

    if (!senha) {
      novosErros.senha = 'Senha é obrigatória';
    } else if (senha.length < 6) {
      novosErros.senha = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (!confirmarSenha) {
      novosErros.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (senha !== confirmarSenha) {
      novosErros.confirmarSenha = 'As senhas não coincidem';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleRegistro = async () => {
    if (!validar()) return;

    setCarregando(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: { nome: nome.trim() || null },
      },
    });

    setCarregando(false);

    if (error) {
      Alert.alert('Erro ao cadastrar', error.message);
    } else {
      setSucesso(true);
    }
  };

  if (sucesso) {
    return (
      <ImageBackground
        source={require('../assets/bg-overlay.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.inner}>
          <Image style={styles.logo} source={require('../assets/unicopa.png')} />

          <View style={styles.form}>
            <Text style={styles.iconeSuccesso}>✓</Text>
            <Text style={styles.tituloSucesso}>Cadastro realizado!</Text>
            <Text style={styles.textoSucesso}>
              Verifique seu e-mail para confirmar o cadastro antes de entrar.
            </Text>
            <TouchableOpacity
              style={styles.botao}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.textoBotao}>IR PARA LOGIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/bg-overlay.png')}
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%' }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
        >
          <Image style={styles.logo} source={require('../assets/unicopa.png')} />

          <Text style={styles.titulo}>REGISTRAR-SE</Text>

          <View style={styles.form}>

            <Text style={styles.label}>Nome (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor="#4a6070"
              autoCapitalize="words"
              value={nome}
              onChangeText={setNome}
            />

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
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#4a6070"
              secureTextEntry
              value={senha}
              onChangeText={(v) => { setSenha(v); setErros(e => ({ ...e, senha: null })); }}
            />
            {erros.senha && <Text style={styles.textoErro}>{erros.senha}</Text>}

            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput
              style={[styles.input, erros.confirmarSenha && styles.inputErro]}
              placeholder="Repita a senha"
              placeholderTextColor="#4a6070"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={(v) => { setConfirmarSenha(v); setErros(e => ({ ...e, confirmarSenha: null })); }}
            />
            {erros.confirmarSenha && <Text style={styles.textoErro}>{erros.confirmarSenha}</Text>}

            <TouchableOpacity
              style={[styles.botao, carregando && styles.botaoDesativado]}
              onPress={handleRegistro}
              disabled={carregando}
            >
              {carregando
                ? <ActivityIndicator color="#040b13" />
                : <Text style={styles.textoBotao}>CADASTRAR</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoSecundario}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.textoBotaoSecundario}>
                Já tem conta?{' '}
                <Text style={styles.textoLink}>Entrar</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  width: '100%',
  height: '100%',
  backgroundColor: '#040b13',
},
  inner: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logo: {
    width: 200,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 30,
    letterSpacing: 2,
  },
  form: {
    width: '100%',
    backgroundColor: '#0c1b2a',
    borderRadius: 16,
    padding: 24,
  },
  label: {
    color: '#f2cc2f',
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 13,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#102030',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e2d3d',
    color: 'white',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
    fontSize: 15,
  },
  inputErro: {
    borderColor: '#e74c3c',
  },
  textoErro: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 10,
  },
  botao: {
    backgroundColor: '#f2cc2f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  botaoDesativado: {
    opacity: 0.6,
  },
  textoBotao: {
    color: '#040b13',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },
  botaoSecundario: {
    marginTop: 16,
    alignItems: 'center',
  },
  textoBotaoSecundario: {
    color: '#7a9ab0',
    fontSize: 14,
  },
  textoLink: {
    color: '#f2cc2f',
    fontWeight: 'bold',
  },
  iconeSuccesso: {
    fontSize: 48,
    color: '#f2cc2f',
    textAlign: 'center',
    marginBottom: 12,
  },
  tituloSucesso: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  textoSucesso: {
    color: '#7a9ab0',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
});
