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
  // Auto-zoeira: o Sr. Cofre debochando da própria cara (visual feio do mascote).
  autozoeira: {
    leve: [
      "Eu sei que pareço um chiclete que derreteu no sol, {nome}. Mas com a sua grana eu capricho.",
      "Não repara no meu visual: fui feito com R$ 0,00 de orçamento, igual esse app.",
      "Sou meio tortinho, eu sei. Mas beleza não enche cofre, então bora ao que importa.",
    ],
    medio: [
      "Pode rir da minha cara, {nome}. Eu rio também. Agora vem ver essas finanças.",
      "Tenho cara de sabonete no fim da vida, mas entendo de grana mais que muita gente.",
      "Eu pareço um emoji que deu errado. Seu extrato também não tá um quadro de museu, tamo quites.",
    ],
    brutal: [
      "Olha, eu sei que sou feio. Me desenharam às pressas em SVG. Ainda assim, seu saldo assusta mais.",
      "Sou horrível? Sou. Sabe o que é mais horrível, {nome}? A fatura depois do fim de semana.",
      "Pode me chamar de feio à vontade. Doeu menos que os juros do seu cartão.",
      "Tenho cara de porquinho que caiu da prateleira. Mas pelo menos EU não estourei o orçamento esse mês.",
    ],
  },
};

// ------------------------------------------------------------------
// Pacote EXTRA de humor BR (turbinado) — frases novas mescladas no
// banco principal no carregamento do módulo. Mesmo tom: deboche
// carinhoso, nunca cruel/ofensivo. Mantém placeholders {nome}/{categoria}/{valor}.
// ------------------------------------------------------------------
const EXTRA_MESSAGES = {
  boasVindas: {
    leve: [
      "Oi, {nome}! Sou o Sr. Cofre. De grão em grão a gente enche esse cofre. Bora?",
      "Chegou! Seu dinheiro agora tem um adulto responsável tomando conta. E não é você.",
      "Prazer, {nome}. Aqui quem guarda tem. E quem não guarda vira meu cliente favorito.",
      "Bem-vindo! Café passado, app aberto, boletos fingindo que não existem. Bora começar.",
    ],
    medio: [
      "Renda anotada! Agora a gente descobre pra onde isso vai. Spoiler: iFood.",
      "Me conta a renda que eu te conto a real. De graça.",
      "Bem-vindo ao clube. Dinheiro não dá em árvore, mas aqui pelo menos ele não some misteriosamente.",
      "Pronto, sei quanto entra. Agora respira: foco, força e fé. O resto é comigo.",
    ],
    brutal: [
      "Renda cadastrada. Bem-vindo, {nome}: começa aqui o nosso jogo, e eu narro tudo.",
      "Anotei tudo. A partir de hoje seu dinheiro dorme com um olho aberto.",
    ],
  },
  saudacao: {
    leve: [
      "Bem-vindo de volta, {nome}. Bom te ver de pé. Saco vazio não para em pé, então bora encher o cofre.",
      "Olha quem voltou. Senta aqui que hoje a gente se entende, {nome}.",
      "E aí, {nome}? Abriu pra controlar as contas ou pra se torturar? Tô aqui pros dois.",
    ],
    medio: [
      "Voltou? Deixa eu adivinhar: veio conferir se o salário ainda tá vivo.",
      "Calma, calabreso. Eu já abri tudo, é só não surtar com o que vem.",
      "Senti sua falta, {nome}. Sua carteira, nem tanto.",
      "Voltou rápido. Saudade minha ou ansiedade de gastar?",
    ],
    brutal: [
      "Abriu o app de novo? Dinheiro não cresce só de você olhar. Mas pode olhar, vai que.",
      "Voltou rapidinho, hein. Saudade de mim ou medo do extrato?",
      "Casa de quem abre app de finança toda hora, carteira de papelão. Bora mudar isso?",
    ],
  },
  saldoAlto: {
    leve: [
      "Olha o que ele fez! Saldo bonito, {nome}. Tô emocionado aqui na cabine.",
      "Esse saldo tá um espetáculo. Tira foto, emoldura, mostra pra família.",
      "Olha o papo cheio! De grão em grão a galinha encheu o papo de verdade. Orgulho.",
    ],
    medio: [
      "Saldo gordo desse jeito? Calma, milionário. Ainda tem aquele boleto que você fingiu não ver.",
      "Saldo respirando tranquilo. Tá rico? Não. Mas tá de boa, e já é luxo.",
      "Olha esse saldo. Agora a parte difícil: não torrar tudo até sexta.",
    ],
    brutal: [
      "Tá rico, {nome}? Tira a foto agora, porque até dia 30 isso aqui vira miojo.",
      "Calma com tanto dinheiro na conta que eu nem te reconheço. Tá lindo isso.",
      "Saldo tão alto que dinheiro até parece dar em árvore. Mas não dá, então não sacode o galho todo de uma vez.",
    ],
  },
  saldoMedio: {
    leve: [
      "Tá equilibrado, {nome}. Nem rico, nem no miojo. O famoso 'tô me virando'.",
      "Saldo morno: nem rico, nem liso. Você no clássico 'dá pro mês, reza pro próximo'.",
      "Saldo na média da novela: nem rico, nem desmaiando. Tá bom assim.",
    ],
    medio: [
      "Saldo na média: não dá pra viajar, mas dá pra fingir que tá tudo sob controle. Combinado?",
      "Tá na linha de meio de campo, {nome}. Joga seguro que dá pra chegar no gol.",
      "Saldo na média: o famoso 'tá tranquilo, tá favorável'.",
    ],
    brutal: [
      "De grão em grão a galinha enche o papo. O seu papo tá na fase 'galinha que almoçou pouco'.",
      "Saldo mediano que nem segunda de manhã: não anima, mas tá ali firme.",
    ],
  },
  saldoBaixo: {
    leve: [
      "O cofre tá levinho, mas a gente segura a mão juntos, {nome}. Respira.",
      "Tá apertado, mas relaxa: eu também tô de dieta aqui dentro.",
      "Saldo magrelo, mas calma. Quem guarda tem; quem começa hoje guarda amanhã.",
    ],
    medio: [
      "Saldo baixo detectado. Hora de ativar o modo 'eu já jantei, obrigado'.",
      "Saco vazio não para em pé, {nome}. E o seu saldo já tá sentadinho encostado na parede.",
      "Tá raspando o tacho. Mas calma, tacho raspado também é refeição.",
    ],
    brutal: [
      "Tá liso, {nome}. Liso que nem eu, então a gente combina.",
      "Esse saldo tá tão magro que vou ter que apertar o cinto. E eu nem uso cinto.",
      "Mais um Pix e a gente entra junto pra história do vermelho. De mãos dadas.",
    ],
  },
  saldoNegativo: {
    leve: [
      "Caímos no vermelho juntos, {nome}. De mãos dadas a gente sobe de novo.",
      "Tá negativo, mas sem drama. Já passei por pior. Ah não, peraí, não passei.",
      "No vermelho, mas de pé. Você parou pra olhar, e isso já é começo de virada.",
    ],
    medio: [
      "O saldo tá no vermelho igual nota de boletim. Bora pra recuperação?",
      "No vermelho, {nome}. Tô abraçado nas minhas moedinhas imaginárias aqui.",
      "'Isso não vai ficar assim!', é o que a novela diria. A gente reverte, prometo.",
    ],
    brutal: [
      "Negativo?! {nome}, isso não é placar de jogo, é o banco te cobrando juros com carinho.",
      "Negativo, {nome}. Gastamos dinheiro que nem existia. Dupla de visionários.",
      "Inventamos o saldo subterrâneo. Lá embaixo é quentinho, {nome}, vem.",
    ],
  },
  addDespesa: {
    leve: [
      "Gasto registrado! Pequeno hoje, mas o Pix some que é uma beleza, viu.",
      "Anotado: {valor} em {categoria}. A gente merece um agrado de vez em quando.",
      "Anotado: {valor} em {categoria}. O barato sai caro, mas pelo menos sai anotado.",
    ],
    medio: [
      "Mais um gasto em {categoria}. Anotado aqui no caderninho da consciência.",
      "Lá se foi {valor} em {categoria}. Suspirei aqui, mas suspirei sorrindo.",
      "{categoria} de novo, {nome}? Tá, anota aí que eu também ia querer.",
    ],
    brutal: [
      "De novo essa {categoria}? Em 12x sem juros a gente até parcela essa teimosia.",
      "Mais {valor} pro buraco de {categoria}. Buraco fundo, mas ao menos é nosso.",
      "Gastou em {categoria} de novo? Beleza, choramos juntos e seguimos, {nome}.",
    ],
  },
  addDespesaGrande: {
    leve: [
      "Gasto gordo de {valor}. Tudo bem, até ferreiro merece espeto de ferro de vez em quando.",
      "Eita, {valor} em {categoria}! Foi pesado, mas espero que valha cada centavo.",
      "{valor} numa tacada! Respira: foi merecido. Foi, né, {nome}?",
    ],
    medio: [
      "Parcelou em 12x sem juros? Parabéns, agora você tem boleto até o ano que vem.",
      "Gasto grande em {categoria}. Tudo bem, foi 'merecido'. É sempre merecido, né, {nome}?",
      "{valor}?! Esse não foi grão, foi a galinha inteira saindo do papo.",
    ],
    brutal: [
      "{valor} numa tacada?! A maquininha passou e meu coração de porquinho passou junto.",
      "OLHA O QUE ELE FEZ! {valor} de uma vez. Golaço… pro lado errado, {nome}.",
      "{valor} de uma vez? Dinheiro não dá em árvore, mas você acabou de podar a floresta inteira.",
    ],
  },
  addReceita: {
    leve: [
      "Entrou grana, {nome}! Pix caiu, alegria subiu. Curte esse momentinho de riqueza.",
      "É tetra! Entrou {valor}, {nome}. Cabine de transmissão em festa.",
      "Dinheiro novo na área! Bem-vindo, fica à vontade, fica um tempão de preferência.",
    ],
    medio: [
      "Dinheiro na conta! Respira fundo e aproveita: ele costuma ser de passagem.",
      "Dinheiro novo, {nome}! Não dá em árvore, mas hoje caiu um galho bom no seu colo.",
      "Pingou grana! Lembrete amigo: isso não é sinal pra comemorar gastando, viu, {nome}.",
    ],
    brutal: [
      "Caiu o 13º? Que beleza. Os boletos já estão na porta fazendo fila pra te cumprimentar.",
      "Caiu {valor}! Antes que vire 'já era', deixa eu guardar um pouquinho longe de você.",
    ],
  },
  estadoVazio: {
    leve: [
      "Tudo zerado por aqui, {nome}. Folha em branco é folha sem dívida ainda!",
      "Tela limpa, igual seu nome (espero). Bora começar a anotar essa grana?",
      "Tá vazio, {nome}. Bora botar o primeiro lançamento? Toda fortuna começa num registro.",
    ],
    medio: [
      "Nada por aqui ainda. Ou você é muito organizado, ou tá fingindo que não gastou. Suspeito.",
      "Cofre vazio, {nome}. Eu e o eco somos os únicos moradores.",
      "Tá mais vazio que promessa de 'esse mês eu economizo'.",
    ],
    brutal: [
      "Vazio total. Coloquei até uma cama de sofá aqui dentro de tão espaçoso.",
      "Zero transação, {nome}. A gente tá pobre de dinheiro E de assunto.",
      "Nada lançado. Tá tão vazio que dá pra ouvir minha barriga roncar.",
    ],
  },
  orcamentoEstourado: {
    leve: [
      "Opa, {categoria} passou do limite. Calma, dá pra ajustar daqui pra frente.",
      "{categoria} furou o teto, {nome}. Acontece nas melhores famílias. Bora segurar.",
      "Estourou {categoria}, mas sem drama. Amanhã a gente reaperta o cinto juntos.",
    ],
    medio: [
      "{categoria} passou do limite. O orçamento pediu arrego, {nome}.",
      "Estourou {categoria}, {nome}. Calma, calabreso, dessa vez você passou um pouquinho do roteiro.",
      "Estourou {categoria}! De grão em grão a galinha encheu o papo... só que o papo era o do prejuízo.",
    ],
    brutal: [
      "Estourou {categoria}! Esse orçamento durou menos que promessa de dieta na segunda.",
      "{categoria} estourou tão feio que o narrador gritou 'haja coração'. Reservas técnicas, já!",
      "{categoria} passou do limite e ainda mandou abraço. O barato saiu caro, {nome}, mas dá pra segurar.",
    ],
  },
  metaPerto: {
    leve: [
      "Tá quase, {nome}! Já dá pra enxergar a linha de chegada.",
      "Olha a meta logo ali! Mais um empurrãozinho e você me deixa orgulhoso.",
      "Quase lá, {nome}! De grão em grão... seu papo já tá quase estufando. Falta pouco!",
    ],
    medio: [
      "Falta pouquinho pra meta! Segura a maquininha mais um tiquinho que a gente chega lá.",
      "Falta tão pouco que já dá pra sentir o cheiro da vitória. Não vacila agora.",
      "Falta um tiquinho. Foco, força e fé, e nada de gastar agora, calabreso.",
    ],
    brutal: [
      "Tá quase! Agora segura esse cartão como se a vida dependesse. Porque a meta depende.",
      "Quase lá! Conta até dez e não compra nada que comece com 'ah, mas é baratinho'.",
      "Tão perto que dá pra cheirar. Mais um esforço e quem guarda, tem, e quem teve foi você.",
    ],
  },
  metaBatida: {
    leve: [
      "Conseguiu, {nome}! Esse porquinho aqui tá quicando de orgulho. Oinc da vitória!",
      "É TETRA! Meta batida, {nome}! Olha o que ELE fez, gente!",
      "Você bateu a meta e eu aqui quase chorando. Cofre também tem coração, sabia?",
    ],
    medio: [
      "Conseguiu, {nome}! Anota a data: hoje você foi mais forte que a vontade de gastar.",
      "Meta concluída! Pode se gabar no grupo da família. Eu confirmo a história, se precisar.",
      "META BATIDA! A galinha encheu o papo, botou o ovo e ainda sobrou. Orgulho desse cofre!",
    ],
    brutal: [
      "Bateu a meta?! Tô chocado, emocionado e levemente desconfiado. Mas é isso aí, parabéns mesmo!",
      "Meta batida! Quem guarda tem, e hoje quem tem é você, {nome}. Tô soltando confete.",
      "META BATIDA! Confete, fanfarra, e um aplauso meu, que sou difícil de impressionar.",
    ],
  },
  metaLonge: {
    leve: [
      "A meta tá longe, mas longe é só o começo de perto. Bora dar o primeiro passo, {nome}?",
      "Meta lá no horizonte. Mas de grão em grão a galinha enche o papo, e a gente tem tempo.",
      "A meta tá longe, mas haja coração: toda novela boa tem uns 200 capítulos. A gente chega.",
    ],
    medio: [
      "Calma que Roma também não foi guardada em um mês. A meta tá longe, mas a gente caminha.",
      "Essa meta tá distante igual segunda de manhã. Mas chega, viu? Um pouquinho por vez.",
      "Essa meta precisa de CEP. Mas dinheiro não dá em árvore, se planta, então bora plantar.",
    ],
    brutal: [
      "Essa meta tá tão longe que dá pra ver daqui o miojo te esperando no caminho.",
      "Essa meta tá tão distante que nem o universo conspirando dá conta sozinho. Vai precisar de você, {nome}.",
      "No ritmo atual, essa meta vira herança. Bora acelerar antes do inventário.",
    ],
  },
  loading: {
    leve: [
      "Contando nossas moedinhas com todo carinho...",
      "Só um segundo, {nome}, tô somando tudo no dedo. Brincadeira, sou um cofre moderno.",
      "Contando grão por grão pra encher o papo... segura aí, {nome}.",
    ],
    medio: [
      "Calculando... contando moedinha por moedinha igual quem junta pra fechar o mês.",
      "Fazendo as contas. Respira fundo que eu respiro junto, {nome}.",
      "Aguenta o coração que o VAR aqui tá revisando seus números...",
    ],
    brutal: [
      "Calculando o tamanho do perrengue. Segura minha patinha aí.",
      "Contando os cacos do orçamento. Suspense de fim de capítulo...",
      "Preparando o diagnóstico. Dinheiro não dá em árvore, mas susto dá em segundo.",
    ],
  },
  confirmarExclusao: {
    leve: [
      "Vai apagar mesmo, {nome}? Sem pressa, eu espero o tempo que precisar.",
      "Vai mesmo apagar? Depois não adianta chorar pelo grão derramado.",
      "Apagar esse aqui? Tipo amnésia de novela: depois ninguém lembra que existiu.",
    ],
    medio: [
      "Vai apagar mesmo? Esconder o gasto não faz o dinheiro voltar, mas eu entendo o impulso.",
      "Quer sumir com isso? Beleza. O que a gente não vê, a gente não chora.",
      "Vai sumir com o registro? 'Isso não vai ficar assim'… brincadeira, confirma aí.",
    ],
    brutal: [
      "Apagar esse registro não limpa seu nome no Serasa, {nome}. Mas tá, decisão é sua.",
      "Some com o registro se quiser. Sua conta bancária não tem amnésia de novela.",
    ],
  },
  analiseRelatorio: {
    leve: [
      "Fechei o mês, {nome}. Teve tropeço, mas a gente tá de pé. Bora ajustar fino.",
      "Mês fechado! O barato saiu caro em alguns dias, mas no geral a galinha guardou uns grãos. Tamo indo.",
      "Relatório fechado. Nada de terror, só uns ajustes finos e a gente vira o jogo.",
    ],
    medio: [
      "Fechando o mês, {nome}: você gastou com carinho e o boleto retribuiu com juros.",
      "Esse mês foi... uma jornada, {nome}. Sobrevivemos os dois, isso já é vitória.",
      "Resumo do mês na cabine: teve golaço, teve gol contra. No geral, {nome}, haja coração.",
    ],
    brutal: [
      "Relatório do mês: a maior categoria foi 'achei que ia caber no orçamento'.",
      "Os números falaram e disseram 'socorro'. Mas falaram pra nós dois, então segura.",
      "Fechei o mês e vou te contar: virou novela das nove. Drama, reviravolta e um cartão que precisa de terapia.",
    ],
  },
};

// Mescla o pacote extra no banco principal (append, sem duplicar exatos).
for (const [trigger, levels] of Object.entries(EXTRA_MESSAGES)) {
  if (!MESSAGES[trigger]) MESSAGES[trigger] = {};
  for (const [level, frases] of Object.entries(levels)) {
    const base = MESSAGES[trigger][level] || (MESSAGES[trigger][level] = []);
    for (const f of frases) {
      if (!base.includes(f)) base.push(f);
    }
  }
}

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
      .replace(/,\s*([?!.:;])/g, "$1")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([?!.,:;])/g, "$1")
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
