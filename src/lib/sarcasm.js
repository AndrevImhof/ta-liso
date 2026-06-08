// Banco de frases do Sr. Cofre — deboche carinhoso, nunca cruel/ofensivo.
// getMessage(trigger, ctx) sorteia uma frase do nível apropriado e troca
// placeholders {nome}, {categoria}, {valor}.

// Estrutura: MESSAGES[trigger][level] = [frases...]
// Níveis: "leve" (suave), "medio" (padrão), "brutal" (ácido).

const MESSAGES = {
  boasVindas: {
    leve: [
      "Bem-vindo, {nome}! Renda de {valor}? A gente cuida disso com carinho.",
      "Prazer, {nome}. Com {valor} por mês dá pra fazer bonito. Bora começar!",
      "Tudo pronto! Renda de {valor} anotada. Agora é só não me dar trabalho. 🐷",
    ],
    medio: [
      "Renda de {valor}? Tá... a gente dá um jeito. Talvez.",
      "Bem-vindo ao clube de quem controla o que (ainda) não tem.",
      "{valor} por mês, {nome}? Anotado. Vamos ver no que dá.",
    ],
    brutal: [
      "Renda de {valor}? Corajoso instalar um app de finanças, {nome}.",
      "Bem-vindo. Com {valor} por mês, vamos precisar de milagre e disciplina.",
      "{valor}? Tá. Senta que a aula de sobrevivência financeira vai começar.",
    ],
  },
  saudacao: {
    leve: [
      "Oi, {nome}! Que bom te ver por aqui. 🐷",
      "Olá! Bora dar uma olhadinha no dinheiro?",
      "E aí, {nome}? Hoje a gente cuida bem da grana, combinado?",
    ],
    medio: [
      "Voltou, {nome}? Achei que tinha fugido da realidade financeira.",
      "Olha quem apareceu. As contas sentiram sua falta.",
      "Oi, {nome}. Pronto pra fingir que tá tudo sob controle?",
    ],
    brutal: [
      "Ah, {nome}. De volta à cena do crime financeiro.",
      "Você de novo? Seu saldo já estava se acostumando com a paz.",
      "Sentou pra ver o estrago, {nome}? Coragem é isso.",
    ],
  },
  saldoAlto: {
    leve: [
      "Uau, {nome}! Tá com uma grana boa guardada. Orgulho!",
      "Olha esse saldo bonito. Continua assim!",
      "Tá voando alto, hein? Adorei.",
    ],
    medio: [
      "Saldo gordo desse. Quem é você e o que fez com o {nome}?",
      "Tá rico agora? Calma que despesa nenhuma escapa de mim.",
      "Olha esse dinheiro todo. Tô quase com inveja.",
    ],
    brutal: [
      "Tá podre de rico, é? Aproveita antes que você sabote isso.",
      "Esse saldo tá tão alto que até suspeito. Roubou de quem?",
      "Eu não acredito. {nome} com dinheiro. Anota a data.",
    ],
  },
  saldoMedio: {
    leve: [
      "Tá indo bem, {nome}. Um pouquinho de cuidado e a gente chega lá.",
      "Saldo na medida. Nada de loucura por enquanto.",
      "Equilibrado. Eu gosto de equilíbrio.",
    ],
    medio: [
      "Saldo morno. Nem rico, nem na lona. A história da sua vida.",
      "Tá no meio termo, {nome}. Que emocionante.",
      "Dá pra respirar, mas não pra comemorar. Segura a onda.",
    ],
    brutal: [
      "Mediano como sempre, {nome}. Medíocre tem charme, vai.",
      "Esse saldo é a definição de 'tô levando'. Levando pra onde?",
      "Nem afunda, nem nada. Você é o pão sem recheio das finanças.",
    ],
  },
  saldoBaixo: {
    leve: [
      "Tá apertado, {nome}, mas a gente segura. Vamos com calma nos gastos.",
      "O cofre tá levinho. Bora poupar um pouquinho?",
      "Quase no vermelho. Atenção dobrada daqui pra frente, tá?",
    ],
    medio: [
      "Saldo magrelo, {nome}. Tá comendo miojo até dia 30?",
      "O cofre tá ecoando de vazio. Cuidado com os próximos cliques.",
      "Tá raspando o tacho, hein. Respira e segura a carteira.",
    ],
    brutal: [
      "Esse saldo tá tão baixo que precisa de ré pra ser visto.",
      "Tá liso, {nome}. Liso igual careca no sol.",
      "Mais um Pix e você vira lenda do vermelho. Cuidado.",
    ],
  },
  saldoNegativo: {
    leve: [
      "Ops, {nome}, ficamos no vermelho. Vamos respirar e ajustar.",
      "Passou do limite, mas dá pra recuperar. Bora cortar uns gastos?",
      "Saldo negativo agora. Sem pânico, a gente reverte isso juntos.",
    ],
    medio: [
      "No vermelho, {nome}. O Sr. Cofre tá oficialmente preocupado.",
      "Saldo negativo. Eu avisei. Mas ninguém escuta o porquinho.",
      "Tá devendo até pra mim agora. Isso é novo.",
    ],
    brutal: [
      "Negativo, {nome}. Você conseguiu gastar dinheiro que não tinha. Talento.",
      "O vermelho te abraçou. Espero que tenha sido por uma boa causa.",
      "Parabéns, você inventou o saldo subterrâneo.",
    ],
  },
  addDespesa: {
    leve: [
      "Anotado: {valor} em {categoria}. Tudo sob controle, {nome}.",
      "Gasto registrado. {categoria}? Tudo bem, a gente merece às vezes.",
      "Mais {valor} em {categoria}. Eu tô de olho, com carinho.",
    ],
    medio: [
      "{valor} em {categoria}? Anotei. Tô de olho em você.",
      "Lá se foi {valor} em {categoria}. Suspirei aqui no cofre.",
      "{categoria} de novo, {nome}? Tá virando rotina, hein.",
    ],
    brutal: [
      "{valor} em {categoria}. Seu dinheiro mal me conheceu e já foi embora.",
      "Mais {valor} pro buraco de {categoria}. Tradição que dói.",
      "Gastou em {categoria} de novo? O cofre chorou uma moedinha.",
    ],
  },
  addDespesaGrande: {
    leve: [
      "Eita, {valor} em {categoria}! Foi um gastão, mas você sabe o que faz.",
      "Gasto grande em {categoria}. Espero que valha cada centavo, {nome}.",
      "{valor}? Foi pesado, mas tudo bem. Bola pra frente com cuidado.",
    ],
    medio: [
      "{valor} em {categoria}?! Tá comemorando o quê, {nome}?",
      "Caramba, {valor} de uma vez. O cofre engasgou.",
      "Gastão de {valor}. Espero foto do que comprou pra valer a dor.",
    ],
    brutal: [
      "{valor} em {categoria}?! Você acordou rico e decidiu não ser mais?",
      "Esse {valor} doeu até em mim, e eu sou de plástico.",
      "Gastou {valor} numa tacada. Audácia premium, {nome}.",
    ],
  },
  addReceita: {
    leve: [
      "Entrou {valor}! Que delícia, {nome}. Bora guardar um tiquinho?",
      "Dinheiro novo: {valor}. O cofre agradece a visita.",
      "{valor} na conta. Respira fundo e aproveita o momento.",
    ],
    medio: [
      "Chegou {valor}! Aproveita antes que vire {categoria}.",
      "Entrou {valor}. Vamos ver quanto tempo isso dura, hein.",
      "Olha o dinheirinho: {valor}. Não some tudo de uma vez, {nome}.",
    ],
    brutal: [
      "Entrou {valor}? Aproveita o flerte, porque já já ele te abandona.",
      "{valor} na conta. A despedida começa agora.",
      "Dinheiro novo: {valor}. Tic-tac, {nome}, o relógio do gasto começou.",
    ],
  },
  estadoVazio: {
    leve: [
      "Tudo zerado por aqui, {nome}. Bora começar registrando algo?",
      "Nada lançado ainda. Página em branco é página de oportunidade!",
      "Cofre vazio e curioso. Me conta o que rolou hoje?",
    ],
    medio: [
      "Tá tudo vazio, {nome}. Ou você é santo ou tá enrolando.",
      "Nada aqui. Suspeito que você gasta e não conta pra mim.",
      "Cofre vazio. Solidão financeira é isso aqui.",
    ],
    brutal: [
      "Nada lançado. Ou você não tem dinheiro, ou não tem coragem de me mostrar.",
      "Vazio total. Até o vento passa assobiando aqui dentro.",
      "Zero transações. Tá escondendo o quê de mim, {nome}?",
    ],
  },
  orcamentoEstourado: {
    leve: [
      "Opa, {categoria} passou do orçamento. Calma, dá pra ajustar!",
      "Estourou o limite de {categoria}, {nome}. Vamos com mais calma?",
      "{categoria} furou o teto. Acontece. Bora segurar daqui pra frente.",
    ],
    medio: [
      "{categoria} estourou o orçamento, {nome}. Eu avisei, viu?",
      "Limite de {categoria} foi pro espaço. Cadê a disciplina?",
      "Passou do orçamento em {categoria}. O cofre tá de sobrancelha erguida.",
    ],
    brutal: [
      "{categoria} explodiu o orçamento. Você trata limite como sugestão, né?",
      "Estourou {categoria} com folga. Orçamento pra você é decoração.",
      "{categoria} no vermelho do orçamento. Impressionante e preocupante.",
    ],
  },
  metaPerto: {
    leve: [
      "Quase lá, {nome}! Falta pouquinho pra essa meta. Vai!",
      "Tá colado no objetivo! Mais um empurrãozinho.",
      "Olha a metinha chegando. Orgulho do porquinho aqui.",
    ],
    medio: [
      "Tá quase, {nome}. Não vacila agora que o final é o mais difícil.",
      "Falta pouco pra meta. Não vai gastar tudo numa pizza, né?",
      "Quase batendo a meta. Segura a ansiedade e o cartão.",
    ],
    brutal: [
      "Tá quase na meta. Tenta não estragar tudo nos últimos metros, {nome}.",
      "Perto do objetivo. Agora é hora de não fazer besteira, prodígio.",
      "Falta um tiquinho. Não me decepciona justo agora.",
    ],
  },
  metaBatida: {
    leve: [
      "Conseguiu, {nome}! Meta batida! Tô tão orgulhoso! 🎉",
      "Você foi incrível! Objetivo alcançado. Comemora aí!",
      "Bateu a meta! O cofre tá fazendo a dancinha da vitória.",
    ],
    medio: [
      "Meta batida, {nome}! Até eu duvidei, e olha que sou pessimista.",
      "Conseguiu! Anota no calendário, isso é raro.",
      "Objetivo alcançado! Quem diria. Tô impressionado de verdade.",
    ],
    brutal: [
      "Bateu a meta?! {nome}, você me surpreendeu. E é difícil me surpreender.",
      "Meta concluída. Tá, admito, foi foda. Não se acostuma.",
      "Conseguiu mesmo. O porquinho tira o chapéu, com desconfiança.",
    ],
  },
  metaLonge: {
    leve: [
      "A meta ainda tá longe, {nome}, mas todo começo conta. Bora!",
      "Falta um caminho, mas você dá conta. Um real de cada vez.",
      "Ainda no comecinho. Sem pressa, com constância.",
    ],
    medio: [
      "Essa meta tá longe, {nome}. Tipo, MUITO longe. Bora acelerar?",
      "Você e essa meta ainda nem se cumprimentaram direito.",
      "No ritmo atual, essa meta vira herança. Acelera!",
    ],
    brutal: [
      "Essa meta tá tão longe que precisa de passaporte, {nome}.",
      "No passo atual você bate essa meta na próxima encarnação.",
      "Olha a distância dessa meta. Tá vendo ela com binóculo?",
    ],
  },
  loading: {
    leve: [
      "Contando suas moedinhas...",
      "Só um segundo, organizando o cofre...",
      "Calculando com todo carinho...",
    ],
    medio: [
      "Contando o estrago, segura aí...",
      "Fazendo as contas. Respira fundo, {nome}.",
      "Carregando a verdade financeira...",
    ],
    brutal: [
      "Preparando o diagnóstico. Não vai ser bonito.",
      "Contando os cacos do seu orçamento...",
      "Calculando o tamanho do problema. Aguenta firme.",
    ],
  },
  confirmarExclusao: {
    leve: [
      "Tem certeza que quer apagar, {nome}? Sem pressa.",
      "Quer mesmo deletar isso? Posso desfazer no coração, mas não no app.",
      "Confirma a exclusão? Depois não tem volta, viu.",
    ],
    medio: [
      "Vai apagar mesmo, {nome}? Apagar não muda o passado, sabia?",
      "Certeza? Deletar o registro não deleta o gasto, infelizmente.",
      "Quer sumir com isso? Eu lembro de tudo, mas tudo bem.",
    ],
    brutal: [
      "Apagar não desfaz o gasto, {nome}. Mas vai lá, finge que não rolou.",
      "Deletando a prova do crime? Esperto. Confirma aí.",
      "Some com o registro se quiser. Sua conta bancária não vai esquecer.",
    ],
  },
  analiseRelatorio: {
    leve: [
      "No geral, {nome}, dá pra melhorar um pouquinho. Tá no caminho!",
      "Seu mês teve altos e baixos. Vamos focar no equilíbrio?",
      "Relatório fechado. Nada de assustador, bora ajustar fino.",
    ],
    medio: [
      "Esse mês foi... interessante, {nome}. Eufemismo, claro.",
      "Olhando o relatório, dá pra cortar umas gordurinhas, hein.",
      "Seu mês conta uma história. E não é um conto de fadas.",
    ],
    brutal: [
      "Esse relatório é um filme de terror, {nome}. E você é o vilão.",
      "Analisei tudo. Recomendo um abraço e talvez um segundo emprego.",
      "Os números falaram. E eles falaram 'socorro'.",
    ],
  },
};

const LEVELS = ["leve", "medio", "brutal"];

function pickLevel(ctx) {
  const fromCtx = ctx && ctx.level;
  const fromState =
    ctx && ctx.state && ctx.state.settings && ctx.state.settings.sarcasmLevel;
  const level = fromCtx || fromState || "medio";
  return LEVELS.includes(level) ? level : "medio";
}

function randomFrom(arr) {
  if (!arr || arr.length === 0) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillPlaceholders(text, ctx) {
  const nome = (ctx && ctx.nome) || (ctx && ctx.state?.settings?.userName) || "";
  const categoria = (ctx && ctx.categoria) || "";
  const valor = (ctx && ctx.valor) || "";

  let out = text
    .replace(/\{nome\}/g, nome)
    .replace(/\{categoria\}/g, categoria)
    .replace(/\{valor\}/g, valor);

  // Se o nome veio vazio, limpa vírgulas/espaços órfãos deixados pelo {nome}.
  if (!nome) {
    out = out
      .replace(/,\s*\?/g, "?")
      .replace(/,\s*!/g, "!")
      .replace(/,\s*\./g, ".")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([?!.,])/g, "$1")
      .trim();
    // Capitaliza se sobrou começo minúsculo após remoção
    out = out.charAt(0).toUpperCase() + out.slice(1);
  }

  return out.trim();
}

// API principal.
export function getMessage(trigger, ctx = {}) {
  const group = MESSAGES[trigger];
  if (!group) return "";
  const level = pickLevel(ctx);
  const pool = group[level] || group.medio || [];
  return fillPlaceholders(randomFrom(pool), ctx);
}

// Triggers disponíveis (útil para testes/consumidores).
export const TRIGGERS = Object.keys(MESSAGES);
