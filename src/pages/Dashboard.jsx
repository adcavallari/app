import React, { useState, useEffect } from 'react';
import { 
  Bell, Play, ChevronRight, Calendar, BookOpen, 
  MapPin, Pin, Clock, Radio, Info, X, Loader2, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, Badge, Button } from '../components/ui';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// LISTA DE 100 VERSÍCULOS INSPIRADORES (Roda automaticamente ao longo do ano)
// ============================================================================
const VERSICULOS_DIARIOS = [
  { texto: "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.", referencia: "João 14:27", livro: "João", capitulo: 14, versiculo: 27 },
  { texto: "O Senhor é o meu pastor, nada me faltará.", referencia: "Salmos 23:1", livro: "Salmos", capitulo: 23, versiculo: 1 },
  { texto: "Posso todas as coisas em Cristo que me fortalece.", referencia: "Filipenses 4:13", livro: "Filipenses", capitulo: 4, versiculo: 13 },
  { texto: "Não to mandei eu? Esforça-te, e tem bom ânimo; não temas, nem te espantes; porque o Senhor teu Deus é contigo, por onde quer que andares.", referencia: "Josué 1:9", livro: "Josué", capitulo: 1, versiculo: 9 },
  { texto: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.", referencia: "Jeremias 29:11", livro: "Jeremias", capitulo: 29, versiculo: 11 },
  { texto: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.", referencia: "Romanos 8:28", livro: "Romanos", capitulo: 8, versiculo: 28 },
  { texto: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.", referencia: "Provérbios 3:5", livro: "Provérbios", capitulo: 3, versiculo: 5 },
  { texto: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará.", referencia: "Salmos 37:5", livro: "Salmos", capitulo: 37, versiculo: 5 },
  { texto: "Mil cairão ao teu lado, e dez mil à tua direita, mas não chegará a ti.", referencia: "Salmos 91:7", livro: "Salmos", capitulo: 91, versiculo: 7 },
  { texto: "Mas os que esperam no Senhor renovarão as forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.", referencia: "Isaías 40:31", livro: "Isaías", capitulo: 40, versiculo: 31 },
  { texto: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.", referencia: "Mateus 11:28", livro: "Mateus", capitulo: 11, versiculo: 28 },
  { texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", referencia: "João 3:16", livro: "João", capitulo: 3, versiculo: 16 },
  { texto: "Elevo os meus olhos para os montes; de onde me vem o socorro? O meu socorro vem do Senhor, que fez os céus e a terra.", referencia: "Salmos 121:1", livro: "Salmos", capitulo: 121, versiculo: 1 },
  { texto: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?", referencia: "Salmos 27:1", livro: "Salmos", capitulo: 27, versiculo: 1 },
  { texto: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.", referencia: "Salmos 46:1", livro: "Salmos", capitulo: 46, versiculo: 1 },
  { texto: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", referencia: "Salmos 119:105", livro: "Salmos", capitulo: 119, versiculo: 105 },
  { texto: "Peçam, e lhes será dado; busquem, e encontrarão; batam, e a porta lhes será aberta.", referencia: "Mateus 7:7", livro: "Mateus", capitulo: 7, versiculo: 7 },
  { texto: "Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não veem.", referencia: "Hebreus 11:1", livro: "Hebreus", capitulo: 11, versiculo: 1 },
  { texto: "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus.", referencia: "Filipenses 4:7", livro: "Filipenses", capitulo: 4, versiculo: 7 },
  { texto: "Clama a mim, e responder-te-ei, e anunciar-te-ei coisas grandes e firmes que não sabes.", referencia: "Jeremias 33:3", livro: "Jeremias", capitulo: 33, versiculo: 3 },
  { texto: "Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos.", referencia: "Filipenses 4:4", livro: "Filipenses", capitulo: 4, versiculo: 4 },
  { texto: "Mas buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.", referencia: "Mateus 6:33", livro: "Mateus", capitulo: 6, versiculo: 33 },
  { texto: "Porque o salário do pecado é a morte, mas o dom gratuito de Deus é a vida eterna, por Cristo Jesus nosso Senhor.", referencia: "Romanos 6:23", livro: "Romanos", capitulo: 6, versiculo: 23 },
  { texto: "Não andeis ansiosos por coisa alguma; antes em tudo sejam os vossos pedidos conhecidos diante de Deus pela oração e súplica com ação de graças.", referencia: "Filipenses 4:6", livro: "Filipenses", capitulo: 4, versiculo: 6 },
  { texto: "Porque andamos por fé, e não por vista.", referencia: "2 Coríntios 5:7", livro: "2 Coríntios", capitulo: 5, versiculo: 7 },
  { texto: "Sujeitai-vos, pois, a Deus, resisti ao diabo, e ele fugirá de vós.", referencia: "Tiago 4:7", livro: "Tiago", capitulo: 4, versiculo: 7 },
  { texto: "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.", referencia: "1 Pedro 5:7", livro: "1 Pedro", capitulo: 5, versiculo: 7 },
  { texto: "E tudo o que pedirdes na oração, crendo, o recebereis.", referencia: "Mateus 21:22", livro: "Mateus", capitulo: 21, versiculo: 22 },
  { texto: "Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar os pecados, e nos purificar de toda a injustiça.", referencia: "1 João 1:9", livro: "1 João", capitulo: 1, versiculo: 9 },
  { texto: "O choro pode durar uma noite, mas a alegria vem pela manhã.", referencia: "Salmos 30:5", livro: "Salmos", capitulo: 30, versiculo: 5 },
  { texto: "Instrui o menino no caminho em que deve andar, e até quando envelhecer não se desviará dele.", referencia: "Provérbios 22:6", livro: "Provérbios", capitulo: 22, versiculo: 6 },
  { texto: "Buscai ao Senhor enquanto se pode achar, invocai-o enquanto está perto.", referencia: "Isaías 55:6", livro: "Isaías", capitulo: 55, versiculo: 6 },
  { texto: "Sonda-me, ó Deus, e conhece o meu coração; prova-me, e conhece os meus pensamentos.", referencia: "Salmos 139:23", livro: "Salmos", capitulo: 139, versiculo: 23 },
  { texto: "Porque a palavra de Deus é viva e eficaz, e mais penetrante do que espada alguma de dois gumes...", referencia: "Hebreus 4:12", livro: "Hebreus", capitulo: 4, versiculo: 12 },
  { texto: "Portanto, quer comais quer bebais, ou façais outra qualquer coisa, fazei tudo para glória de Deus.", referencia: "1 Coríntios 10:31", livro: "1 Coríntios", capitulo: 10, versiculo: 31 },
  { texto: "Porque o Senhor repreende aquele a quem ama, assim como o pai ao filho a quem quer bem.", referencia: "Provérbios 3:12", livro: "Provérbios", capitulo: 3, versiculo: 12 },
  { texto: "Em todo o tempo ama o amigo e para a hora da angústia nasce o irmão.", referencia: "Provérbios 17:17", livro: "Provérbios", capitulo: 17, versiculo: 17 },
  { texto: "O coração alegre aformoseia o rosto, mas pela dor do coração o espírito se abate.", referencia: "Provérbios 15:13", livro: "Provérbios", capitulo: 15, versiculo: 13 },
  { texto: "Não se aparte da tua boca o livro desta lei; antes medita nele dia e noite...", referencia: "Josué 1:8", livro: "Josué", capitulo: 1, versiculo: 8 },
  { texto: "Bendize, ó minha alma, ao Senhor, e tudo o que há em mim bendiga o seu santo nome.", referencia: "Salmos 103:1", livro: "Salmos", capitulo: 103, versiculo: 1 },
  { texto: "Mas o fruto do Espírito é: amor, gozo, paz, longanimidade, benignidade, bondade, fé, mansidão, temperança.", referencia: "Gálatas 5:22", livro: "Gálatas", capitulo: 5, versiculo: 22 },
  { texto: "Chegai-vos a Deus, e ele se chegará a vós.", referencia: "Tiago 4:8", livro: "Tiago", capitulo: 4, versiculo: 8 },
  { texto: "O meu Deus, segundo as suas riquezas, suprirá todas as vossas necessidades em glória, por Cristo Jesus.", referencia: "Filipenses 4:19", livro: "Filipenses", capitulo: 4, versiculo: 19 },
  { texto: "Mas vós sois a geração eleita, o sacerdócio real, a nação santa, o povo adquirido...", referencia: "1 Pedro 2:9", livro: "1 Pedro", capitulo: 2, versiculo: 9 },
  { texto: "Se Deus é por nós, quem será contra nós?", referencia: "Romanos 8:31", livro: "Romanos", capitulo: 8, versiculo: 31 },
  { texto: "Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.", referencia: "Salmos 91:1", livro: "Salmos", capitulo: 91, versiculo: 1 },
  { texto: "O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti...", referencia: "Números 6:24", livro: "Números", capitulo: 6, versiculo: 24 },
  { texto: "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus.", referencia: "Efésios 2:8", livro: "Efésios", capitulo: 2, versiculo: 8 },
  { texto: "Vigiai, estai firmes na fé; portai-vos varonilmente, e fortalecei-vos.", referencia: "1 Coríntios 16:13", livro: "1 Coríntios", capitulo: 16, versiculo: 13 },
  { texto: "Deleita-te também no Senhor, e te concederá os desejos do teu coração.", referencia: "Salmos 37:4", livro: "Salmos", capitulo: 37, versiculo: 4 },
  { texto: "Respondeu-lhe Jesus: Eu sou o caminho, e a verdade e a vida; ninguém vem ao Pai, senão por mim.", referencia: "João 14:6", livro: "João", capitulo: 14, versiculo: 6 },
  { texto: "O Senhor é bom, uma fortaleza no dia da angústia, e conhece os que confiam nele.", referencia: "Naum 1:7", livro: "Naum", capitulo: 1, versiculo: 7 },
  { texto: "Sede fortes e corajosos; não temais, nem vos assusteis para com eles; porque o Senhor teu Deus é quem vai contigo...", referencia: "Deuteronômio 31:6", livro: "Deuteronômio", capitulo: 31, versiculo: 6 },
  { texto: "Bem-aventurado o homem que não anda segundo o conselho dos ímpios...", referencia: "Salmos 1:1", livro: "Salmos", capitulo: 1, versiculo: 1 },
  { texto: "O temor do Senhor é o princípio da sabedoria, e o conhecimento do Santo a prudência.", referencia: "Provérbios 9:10", livro: "Provérbios", capitulo: 9, versiculo: 10 },
  { texto: "Porque onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles.", referencia: "Mateus 18:20", livro: "Mateus", capitulo: 18, versiculo: 20 },
  { texto: "Pedi, e dar-se-vos-á; buscai, e encontrareis; batei, e abrir-se-vos-á.", referencia: "Lucas 11:9", livro: "Lucas", capitulo: 11, versiculo: 9 },
  { texto: "Em paz também me deitarei e dormirei, porque só tu, Senhor, me fazes habitar em segurança.", referencia: "Salmos 4:8", livro: "Salmos", capitulo: 4, versiculo: 8 },
  { texto: "Porque para Deus nada é impossível.", referencia: "Lucas 1:37", livro: "Lucas", capitulo: 1, versiculo: 37 },
  { texto: "Alegrai-vos na esperança, sede pacientes na tribulação, perseverai na oração.", referencia: "Romanos 12:12", livro: "Romanos", capitulo: 12, versiculo: 12 },
  { texto: "Nisto todos conhecerão que sois meus discípulos, se vos amardes uns aos outros.", referencia: "João 13:35", livro: "João", capitulo: 13, versiculo: 35 },
  { texto: "E a esperança não traz confusão, porquanto o amor de Deus está derramado em nossos corações pelo Espírito Santo.", referencia: "Romanos 5:5", livro: "Romanos", capitulo: 5, versiculo: 5 },
  { texto: "Ensina-nos a contar os nossos dias, de tal maneira que alcancemos corações sábios.", referencia: "Salmos 90:12", livro: "Salmos", capitulo: 90, versiculo: 12 },
  { texto: "Como o cervo brama pelas correntes das águas, assim suspira a minha alma por ti, ó Deus!", referencia: "Salmos 42:1", livro: "Salmos", capitulo: 42, versiculo: 1 },
  { texto: "Os céus declaram a glória de Deus e o firmamento anuncia a obra das suas mãos.", referencia: "Salmos 19:1", livro: "Salmos", capitulo: 19, versiculo: 1 },
  { texto: "Mas Deus prova o seu amor para conosco, em que Cristo morreu por nós, sendo nós ainda pecadores.", referencia: "Romanos 5:8", livro: "Romanos", capitulo: 5, versiculo: 8 },
  { texto: "As misericórdias do Senhor são a causa de não sermos consumidos, porque as suas misericórdias não têm fim.", referencia: "Lamentações 3:22", livro: "Lamentações", capitulo: 3, versiculo: 22 },
  { texto: "Todavia, eu me alegrarei no Senhor; exultarei no Deus da minha salvação.", referencia: "Habacuque 3:18", livro: "Habacuque", capitulo: 3, versiculo: 18 },
  { texto: "Porque o meu jugo é suave e o meu fardo é leve.", referencia: "Mateus 11:30", livro: "Mateus", capitulo: 11, versiculo: 30 },
  { texto: "Não se turbe o vosso coração; credes em Deus, crede também em mim.", referencia: "João 14:1", livro: "João", capitulo: 14, versiculo: 1 },
  { texto: "Aquele que não ama não conhece a Deus; porque Deus é amor.", referencia: "1 João 4:8", livro: "1 João", capitulo: 4, versiculo: 8 },
  { texto: "E conhecereis a verdade, e a verdade vos libertará.", referencia: "João 8:32", livro: "João", capitulo: 8, versiculo: 32 },
  { texto: "Nós o amamos a ele porque ele nos amou primeiro.", referencia: "1 João 4:19", livro: "1 João", capitulo: 4, versiculo: 19 },
  { texto: "Eis que estou à porta, e bato; se alguém ouvir a minha voz, e abrir a porta, entrarei em sua casa, e com ele cearei, e ele comigo.", referencia: "Apocalipse 3:20", livro: "Apocalipse", capitulo: 3, versiculo: 20 },
  { texto: "Sede, pois, imitadores de Deus, como filhos amados.", referencia: "Efésios 5:1", livro: "Efésios", capitulo: 5, versiculo: 1 },
  { texto: "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.", referencia: "1 Tessalonicenses 5:18", livro: "1 Tessalonicenses", capitulo: 5, versiculo: 18 },
  { texto: "Antes sede uns para com os outros benignos, misericordiosos, perdoando-vos uns aos outros, como também Deus vos perdoou em Cristo.", referencia: "Efésios 4:32", livro: "Efésios", capitulo: 4, versiculo: 32 },
  { texto: "Ora, o Deus de esperança vos encha de todo o gozo e paz em crença, para que abundeis em esperança pela virtude do Espírito Santo.", referencia: "Romanos 15:13", livro: "Romanos", capitulo: 15, versiculo: 13 },
  { texto: "Sejam os vossos costumes sem avareza, contentando-vos com o que tendes; porque ele disse: Não te deixarei, nem te desampararei.", referencia: "Hebreus 13:5", livro: "Hebreus", capitulo: 13, versiculo: 5 },
  { texto: "A resposta branda desvia o furor, mas a palavra dura suscita a ira.", referencia: "Provérbios 15:1", livro: "Provérbios", capitulo: 15, versiculo: 1 },
  { texto: "Não te deixes vencer do mal, mas vence o mal com o bem.", referencia: "Romanos 12:21", livro: "Romanos", capitulo: 12, versiculo: 21 },
  { texto: "As palavras suaves são favos de mel, doces para a alma, e saúde para os ossos.", referencia: "Provérbios 16:24", livro: "Provérbios", capitulo: 16, versiculo: 24 },
  { texto: "Porque o Filho do homem veio buscar e salvar o que se havia perdido.", referencia: "Lucas 19:10", livro: "Lucas", capitulo: 19, versiculo: 10 },
  { texto: "Vós sois a luz do mundo; não se pode esconder uma cidade edificada sobre um monte.", referencia: "Mateus 5:14", livro: "Mateus", capitulo: 5, versiculo: 14 },
  { texto: "Eu sou o pão da vida; aquele que vem a mim não terá fome, e quem crê em mim nunca terá sede.", referencia: "João 6:35", livro: "João", capitulo: 6, versiculo: 35 },
  { texto: "Eu sou a videira, vós as varas; quem está em mim, e eu nele, esse dá muito fruto; porque sem mim nada podeis fazer.", referencia: "João 15:5", livro: "João", capitulo: 15, versiculo: 5 },
  { texto: "Ninguém tem maior amor do que este, de dar alguém a sua vida pelos seus amigos.", referencia: "João 15:13", livro: "João", capitulo: 15, versiculo: 13 },
  { texto: "Portanto, ide, ensinai todas as nações, batizando-as em nome do Pai, e do Filho, e do Espírito Santo.", referencia: "Mateus 28:19", livro: "Mateus", capitulo: 28, versiculo: 19 },
  { texto: "Eis que eu estou convosco todos os dias, até a consumação dos séculos. Amém.", referencia: "Mateus 28:20", livro: "Mateus", capitulo: 28, versiculo: 20 },
  { texto: "Toda a Escritura é divinamente inspirada, e proveitosa para ensinar, para redarguir, para corrigir, para instruir em justiça.", referencia: "2 Timóteo 3:16", livro: "2 Timóteo", capitulo: 3, versiculo: 16 },
  { texto: "Porque pela vossa perseverança ganhareis as vossas almas.", referencia: "Lucas 21:19", livro: "Lucas", capitulo: 21, versiculo: 19 },
  { texto: "Bem-aventurados os puros de coração, porque eles verão a Deus.", referencia: "Mateus 5:8", livro: "Mateus", capitulo: 5, versiculo: 8 },
  { texto: "E não nos cansemos de fazer bem, porque a seu tempo ceifaremos, se não houvermos desfalecido.", referencia: "Gálatas 6:9", livro: "Gálatas", capitulo: 6, versiculo: 9 },
  { texto: "Mas graças a Deus que nos dá a vitória por nosso Senhor Jesus Cristo.", referencia: "1 Coríntios 15:57", livro: "1 Coríntios", capitulo: 15, versiculo: 57 },
  { texto: "Confessai as vossas culpas uns aos outros, e orai uns pelos outros, para que sareis.", referencia: "Tiago 5:16", livro: "Tiago", capitulo: 5, versiculo: 16 },
  { texto: "Cheguemos, pois, com confiança ao trono da graça, para que possamos alcançar misericórdia e achar graça.", referencia: "Hebreus 4:16", livro: "Hebreus", capitulo: 4, versiculo: 16 },
  { texto: "Fiel é Deus, pelo qual fostes chamados para a comunhão de seu Filho Jesus Cristo nosso Senhor.", referencia: "1 Coríntios 1:9", livro: "1 Coríntios", capitulo: 1, versiculo: 9 },
  { texto: "Buscai o Senhor e a sua força; buscai a sua face continuamente.", referencia: "1 Crônicas 16:11", livro: "1 Crônicas", capitulo: 16, versiculo: 11 },
  { texto: "Os que confiam no Senhor serão como o monte de Sião, que não se abala, mas permanece para sempre.", referencia: "Salmos 125:1", livro: "Salmos", capitulo: 125, versiculo: 1 },
  { texto: "O cavalo prepara-se para o dia da batalha, porém do Senhor vem a vitória.", referencia: "Provérbios 21:31", livro: "Provérbios", capitulo: 21, versiculo: 31 }
];

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate(); 
  
  const [greeting, setGreeting] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Estados Dinâmicos para Eventos e Avisos
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [dbError, setDbError] = useState(null);
  
  // Lógica Automática para o Versículo do Dia
  const [versiculoDoDia, setVersiculoDoDia] = useState(VERSICULOS_DIARIOS[0]);

  useEffect(() => {
    // 1. Mensagem de Saudação
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    // 2. Calcula o Dia do Ano e seleciona o versículo na Lista
    const hoje = new Date();
    const inicioAno = new Date(hoje.getFullYear(), 0, 0);
    const diferencaDias = Math.floor((hoje - inicioAno) / (1000 * 60 * 60 * 24));
    
    // O resto da divisão (%) garante que se chegar ao dia 101 do ano, ele volta ao índice 1 da lista
    const versiculoSelecionado = VERSICULOS_DIARIOS[diferencaDias % VERSICULOS_DIARIOS.length];
    setVersiculoDoDia(versiculoSelecionado);

    // 3. Buscar Dados do Supabase
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    setDbError(null);

    // Buscar Próximos Eventos
    try {
      setIsLoadingEvents(true);
      const { data: evData, error: evError } = await supabase
        .from('events')
        .select('*')
        .gte('date', todayISO)
        .order('date', { ascending: true })
        .limit(3);

      if (evError) {
        setDbError(prev => `${prev ? prev + ' | ' : ''}Erro (Eventos): ${evError.message}`);
      } else if (evData) {
        const formattedEvents = evData.map(ev => {
          const d = new Date(ev.date);
          const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
          const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          return {
            id: ev.id,
            title: ev.title,
            type: ev.type,
            day: String(d.getDate()).padStart(2, '0'),
            month: monthNames[d.getMonth()],
            dateStr: `${weekDays[d.getDay()]}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          };
        });
        setUpcomingEvents(formattedEvents);
      }
    } catch (err) { 
      setDbError(prev => `${prev ? prev + ' | ' : ''}Falha crítica nos eventos.`);
    } finally { 
      setIsLoadingEvents(false); 
    }

    // Buscar Avisos Recentes
    try {
      setIsLoadingAnnouncements(true);
      const { data: annData, error: annError } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(4);

      if (annError) {
        setDbError(prev => `${prev ? prev + ' | ' : ''}Erro (Avisos): ${annError.message}`);
      } else if (annData) {
        const formattedAnnouncements = annData.map(a => {
          const d = new Date(a.created_at);
          const isRecent = (new Date() - d) < 86400000; 
          let dateText = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
          if (isRecent) dateText = "Novo";

          return {
            id: a.id, title: a.title, desc: a.content || a.description, pinned: a.is_pinned, 
            date: dateText, isRecent: isRecent
          };
        });
        setAnnouncements(formattedAnnouncements);
        setHasNewNotifications(formattedAnnouncements.some(a => a.isRecent));
      }
    } catch (err) { 
      setDbError(prev => `${prev ? prev + ' | ' : ''}Falha crítica nos avisos.`);
    } finally { 
      setIsLoadingAnnouncements(false); 
    }
  };

  const quickAccess = [
    { icon: BookOpen, label: "Bíblia", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10", path: "/bible" },
    { icon: Radio, label: "Ao Vivo", color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", path: "/live" },
    { icon: Calendar, label: "Agenda", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", path: "/events" },
    { icon: MapPin, label: "Localização", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", path: "/location" },
  ];

  const firstName = profile?.full_name?.split(' ')[0] || 'Irmão(ã)';

  const handleOpenBible = () => {
    navigate('/bible', { 
      state: { 
        book: versiculoDoDia.livro, 
        chapter: versiculoDoDia.capitulo,
        verse: versiculoDoDia.versiculo 
      } 
    });
  };

  return (
    <>
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-28 md:pb-10 relative">
        
        {/* MENSAGEM DE ERRO NA TELA SE ALGO FALHAR NO SUPABASE */}
        {dbError && (
          <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-2xl flex items-start gap-3 shadow-sm dark:bg-red-900/30 dark:border-red-500/30 dark:text-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold">Aviso do Sistema (Debug)</h3>
              <p className="text-sm mt-1">{dbError}</p>
            </div>
          </div>
        )}

        {/* Header / Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {greeting}, {firstName}!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-1">
              Que a paz do Senhor esteja consigo hoje.
            </p>
          </div>
          
          <button 
            onClick={() => { setIsNotificationsOpen(true); setHasNewNotifications(false); }}
            className="relative p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 shadow-sm transition-colors active:scale-95"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            {hasNewNotifications && (
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-slate-800"></span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Versículo do Dia Dinâmico */}
          <Card className="md:col-span-2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white border-none shadow-xl shadow-indigo-500/20 relative overflow-hidden group p-6 md:p-8">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
              <BookOpen className="w-32 h-32 md:w-48 md:h-48" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-4"><Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-none uppercase tracking-wider text-[10px] md:text-xs">Palavra do Dia</Badge></div>
              <blockquote className="text-xl md:text-3xl font-semibold leading-snug md:leading-tight mb-6 text-indigo-50">
                "{versiculoDoDia.texto}"
              </blockquote>
              <div className="flex items-center justify-between mt-auto">
                <p className="text-indigo-200 font-bold tracking-wide uppercase text-xs md:text-sm">— {versiculoDoDia.referencia}</p>
                <button onClick={handleOpenBible} className="h-9 px-4 text-xs md:text-sm bg-white/10 text-white hover:bg-white/20 rounded-xl font-semibold backdrop-blur-md transition-colors flex items-center">
                  Ler na Bíblia <ChevronRight className="w-4 h-4 ml-1 hidden sm:block" />
                </button>
              </div>
            </div>
          </Card>

          {/* Banner Ao Vivo */}
          <Card className="flex flex-col justify-center items-center text-center bg-slate-900 text-white border-slate-800 relative overflow-hidden p-6 md:p-8">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
            <div className="relative z-10 w-full">
              <div className="flex justify-center mb-4 md:mb-6">
                <div className="h-14 w-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                  <Radio className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-1 text-white">Culto ao Vivo</h3>
              <p className="text-xs md:text-sm text-slate-400 mb-6">Acompanhe a transmissão</p>
              <button onClick={() => navigate('/live')} className="w-full bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold shadow-lg text-sm md:text-base h-10 md:h-12 transition-colors active:scale-95">
                Acessar Canal
              </button>
            </div>
          </Card>
        </div>

        {/* Acesso Rápido */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">Acesso Rápido</h3>
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            {quickAccess.map((item, i) => (
              <button key={i} onClick={() => navigate(item.path)} className="flex flex-col items-center justify-center text-center gap-2 p-3 md:p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5 hover:border-indigo-500/30 hover:shadow-lg dark:hover:bg-slate-800 transition-all active:scale-95 group">
                <div className={cn("p-2.5 md:p-3 rounded-xl transition-transform group-hover:scale-110 duration-300", item.bg)}>
                  <item.icon className={cn("w-5 h-5 md:w-6 md:h-6", item.color)} />
                </div>
                <span className="font-semibold text-[10px] md:text-xs text-slate-700 dark:text-slate-300">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quadro de Avisos Real */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Quadro de Avisos</h3>
              <button onClick={() => navigate('/announcements')} className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Ver todos</button>
            </div>
            <div className="space-y-3">
              {isLoadingAnnouncements ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
              ) : announcements.length === 0 ? (
                <Card className="p-8 text-center text-slate-500 border-dashed border-slate-300 dark:border-slate-700">
                  Nenhum aviso encontrado no banco de dados.
                </Card>
              ) : (
                announcements.map((aviso) => (
                  <Card onClick={() => navigate('/announcements')} key={aviso.id} hover className={cn("p-4 flex gap-4 items-start border-l-4 transition-colors border-slate-200/60 dark:border-white/5", aviso.pinned ? "border-l-amber-500 bg-amber-50/50 dark:bg-slate-800/80" : "border-l-transparent")}>
                    <div className={cn("p-2 rounded-lg mt-1 shrink-0", aviso.pinned ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>
                      {aviso.pinned ? <Pin className="w-5 h-5 fill-current" /> : <Info className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{aviso.title}</h4>
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap", aviso.isRecent ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" : "text-slate-400")}>{aviso.date}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{aviso.desc}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Próximos Eventos Reais */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Próximos Eventos</h3>
            </div>
            <div className="space-y-3">
              {isLoadingEvents ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
              ) : upcomingEvents.length === 0 ? (
                <Card className="p-8 text-center text-slate-500 border-dashed border-slate-300 dark:border-slate-700">
                  Nenhum evento futuro agendado.
                </Card>
              ) : (
                upcomingEvents.map((ev) => (
                  <Card onClick={() => navigate('/events', { state: { openEventId: ev.id } })} key={ev.id} hover className="p-3 md:p-4 flex gap-4 items-center cursor-pointer border-slate-200/60 dark:border-white/5">
                    <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl p-2 min-w-[60px] md:min-w-[65px] border border-slate-200/50 dark:border-white/5 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{ev.month}</span>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-none mt-0.5">{ev.day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm md:text-base text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{ev.title}</h4>
                      <div className="flex items-center text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <Clock className="w-3.5 h-3.5 mr-1" /> {ev.dateStr}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0 group-hover:translate-x-1 transition-transform" />
                  </Card>
                ))
              )}
            </div>
            <button onClick={() => navigate('/events')} className="w-full h-12 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl transition-colors active:scale-95">
              Ver Agenda Completa
            </button>
          </div>
        </div>

      </div>

      {/* POP-UP DE NOTIFICAÇÕES FORA DA DIV ANIMADA */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end md:p-4 md:pt-20">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsNotificationsOpen(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-950 w-full md:w-96 h-full md:h-auto md:max-h-[80vh] md:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full md:slide-in-from-top-8 duration-300 border border-slate-200 dark:border-white/10">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 md:rounded-t-3xl">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" /> Notificações
              </h3>
              <button onClick={() => setIsNotificationsOpen(false)} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:hidden">
              {isLoadingAnnouncements ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
              ) : announcements.length === 0 ? (
                <p className="text-center text-slate-500 text-sm mt-10">Nenhuma notificação nova.</p>
              ) : (
                announcements.map((aviso) => (
                  <div key={aviso.id} onClick={() => { setIsNotificationsOpen(false); navigate('/announcements'); }} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 cursor-pointer hover:border-indigo-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        {aviso.pinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
                        {aviso.title}
                      </h4>
                      {aviso.isRecent && <span className="w-2 h-2 bg-red-500 rounded-full mt-1 shrink-0"></span>}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">{aviso.desc}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950 md:rounded-b-3xl shrink-0">
              <button onClick={() => { setIsNotificationsOpen(false); navigate('/announcements'); }} className="w-full py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                Ver Quadro Completo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}