import { BattleVerdict } from "../battle/types";
import { PlatformEvidence } from "../platforms/contracts";
import { CommentaryResult, RoastPersona } from "./schemas";
import { PROMPT_VERSION } from "./personas";
import { GlobalRegionInfo } from "./global-regions";

interface RegionalRoastParams {
  p1Evidence?: PlatformEvidence;
  p2Evidence?: PlatformEvidence;
  verdict: BattleVerdict;
  persona: RoastPersona;
  platform?: string;
  regionInfo: GlobalRegionInfo;
}

function hashMatch(s1: string, s2: string): number {
  let hash = 0;
  const str = `${s1}:${s2}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickFresh<T>(items: T[], s1: string, s2: string): T {
  const base = hashMatch(s1, s2);
  const entropy = Math.floor(Math.random() * items.length);
  return items[(base + entropy) % items.length];
}

export function generateRegionalLocalRoast({
  verdict,
  persona,
  platform,
  regionInfo,
}: RegionalRoastParams): CommentaryResult {
  const p1 = verdict.player1Score;
  const p2 = verdict.player2Score;
  const isDraw = verdict.outcome === "draw";
  const winner = verdict.winnerHandle || p1.handle;
  const loser = isDraw ? null : winner === p1.handle ? p2.handle : p1.handle;
  const winnerScore = winner === p1.handle ? p1 : p2;
  const loserScore = winner === p1.handle ? p2 : p1;
  const margin = verdict.margin;
  const lang = regionInfo.languageCode;

  let headToHeadRoast = "";
  let player1Roast = "";
  let player2Roast = "";
  let punchline = "";

  // 1. Spanish (Mexico & Latin America)
  if (lang === "es") {
    if (isDraw) {
      headToHeadRoast = `Empate técnico entre @${p1.handle} y @${p2.handle} con ${p1.total} pts. Los dos sobrevivieron a los casos de prueba, pero ninguno pasa la entrevista técnica.`;
      player1Roast = `@${p1.handle}: Mucho commit directo a main en viernes, pero cero arquitectura limpia.`;
      player2Roast = `@${p2.handle}: Dice que es taquero programador senior, pero tiembla cuando le preguntan por qué falla la memoria.`;
      punchline = "EMPATE: Ambos sobrevivieron al código espagueti. Ninguno se lleva la oferta.";
    } else {
      const esPunchlines =
        platform === "github"
          ? [
              `Winner: @${winner}. Abre un issue en el repo de @${loser} para darle el pésame.`,
              `Winner: @${winner}. Los repositorios de @${loser} parecen un cementerio sin estrellas.`,
              `Winner: @${winner}. @${loser} clona tutoriales mientras @${winner} despliega en producción.`,
              `Winner: @${winner}. +${margin} puntos de ventaja; el git log de @${loser} es puro humo.`,
            ]
          : [
              `Winner: @${winner}. @${loser} sigue releyendo Two Sum por 47ª vez.`,
              `Winner: @${winner}. @${loser} se comió un TLE brutal en el segundo caso de prueba.`,
              `Winner: @${winner}. +${margin} pts arriba; el fuerza bruta de @${loser} explotó.`,
              `Winner: @${winner}. @${loser} buscaba pistas mientras @${winner} mandaba AC limpio.`,
            ];
      const esH2H =
        platform === "github"
          ? [
              `@${winner} le metió un baile (${winnerScore.total}–${loserScore.total}) a @${loser}. Tener proyectos reales con estrellas hace que los repositorios de @${loser} parezcan un cementerio de código abandonado.`,
              `Inspección de código abierta: @${winner} domina por +${margin} puntos con software real mientras @${loser} acumula repos vacíos sin un solo usuario.`,
              `Realidad en GitHub: @${winner} manda código limpio a producción mientras @${loser} solo edita el README para inflar la racha.`,
            ]
          : [
              `@${winner} barrió con @${loser} (${winnerScore.total}–${loserScore.total}) en el tablero. Memorizar Easy problems no te salva cuando te piden diseñar algo más complejo que un for-loop.`,
              `Clínica de algoritmos: @${winner} sacó +${margin} puntos de ventaja con complejidad óptima mientras @${loser} reenviaba el mismo código rezando por no tener TLE.`,
              `Diferencia de nivel: el pico de ${winnerScore.metrics.maxRating} de @${winner} dejó a @${loser} (${loserScore.metrics.maxRating}) congelado en mitad del concurso.`,
            ];
      headToHeadRoast = pickFresh(esH2H, winner, loser || "");
      player1Roast = `@${p1.handle}: Resuelve los fáciles en 5 minutos, pero la programación dinámica le da frío.`;
      player2Roast = `@${p2.handle}: Reenviar el mismo código 5 veces no cambia la complejidad O(N^2).`;
      punchline = pickFresh(esPunchlines, winner, loser || "");
    }
  }

  // 2. French (France & Europe)
  else if (lang === "fr") {
    if (isDraw) {
      headToHeadRoast = `Égalité parfaite entre @${p1.handle} et @${p2.handle} à ${p1.total} points. Deux usines à gaz identiques qui plantent sur le même cas de test.`;
      player1Roast = `@${p1.handle}: Beaucoup de commits sauvages le vendredi à 18h, mais zéro rigueur algorithmique.`;
      player2Roast = `@${p2.handle}: Prétend être architecte 10x, mais incapable d'inverser un arbre binaire sans aide.`;
      punchline = "ÉGALITÉ: Les deux ont évité le crash. Aucun ne décroche le CDI.";
    } else {
      const frPunchlines = [
        `Winner: @${winner}. @${loser} cherche encore la solution sur StackOverflow.`,
        `Winner: @${winner}. Le brute-force de @${loser} a rendu l'âme sur le prétest 2.`,
        `Winner: @${winner}. +${margin} points d'avance; @${loser} code une vraie usine à gaz.`,
        `Winner: @${winner}. ${winnerScore.total}–${loserScore.total}; @${loser} retourne réviser ses arbres binaires.`,
      ];
      const frH2H = [
        `@${winner} a donné une vraie leçon d'ingénierie à @${loser} (${winnerScore.total}–${loserScore.total}). Aligner des problèmes faciles ne sert à rien quand on panique dès que la complexité dépasse O(N).`,
        `Victoire nette de @${winner} par +${margin} points: pendant que @${winner} enchaînait les AC propres, @${loser} empilait les TLE sur des cas limites basiques.`,
        `Écart de niveau flagrant: le plafond de ${winnerScore.metrics.maxRating} de @${winner} a laissé @${loser} sur le carreau dès la deuxième moitié du round.`,
      ];
      headToHeadRoast = pickFresh(frH2H, winner, loser || "");
      player1Roast = `@${p1.handle}: Du code spaghetti digne d'un stagiaire payé en tickets resto.`;
      player2Roast = `@${p2.handle}: TLE sur le prétest 2, le compilateur a littéralement rendu l'âme.`;
      punchline = pickFresh(frPunchlines, winner, loser || "");
    }
  }

  // 3. German (Germany & DACH)
  else if (lang === "de") {
    if (isDraw) {
      headToHeadRoast = `Unentschieden zwischen @${p1.handle} und @${p2.handle} bei ${p1.total} Punkten. Zwei identische Implementierungen von Spaghetti-Code, die am gleichen Grenzwert scheitern.`;
      player1Roast = `@${p1.handle}: Maximales Over-Engineering, aber die Laufzeit explodiert ins Unendliche.`;
      player2Roast = `@${p2.handle}: 25 Klassen für ein einfaches Problem. Verschlimmbessert bis zum TLE.`;
      punchline = "UNENTSCHIEDEN: Beide bestanden den Testlauf, keiner bekommt das Jobangebot.";
    } else {
      const dePunchlines = [
        `Winner: @${winner}. @${loser} liest zum 47. Mal die Musterlösung durch.`,
        `Winner: @${winner}. @${loser} hat den Code komplett verschlimmbessert bis zum TLE.`,
        `Winner: @${winner}. +${margin} Punkte Vorsprung; Brute-Force rettet @${loser} nicht.`,
        `Winner: @${winner}. ${winnerScore.total}–${loserScore.total}; @${loser} scheitert schon an Testfall 2.`,
      ];
      const deH2H = [
        `@${winner} deklassiert @${loser} mit ${winnerScore.total} zu ${loserScore.total} Punkten. Einfache Aufgaben retten niemanden vor Laufzeitfehlern, wenn echte Algorithmik gefragt ist.`,
        `Klares Urteil (+${margin} Pkt.): @${winner} liefert saubere O(N log N)-Architektur, während @${loser} im Spaghetti-Code versinkt.`,
        `Klassenunterschied im Wettbewerb: Mit einem Peak von ${winnerScore.metrics.maxRating} lässt @${winner} @${loser} (${loserScore.metrics.maxRating}) chancenlos zurück.`,
      ];
      headToHeadRoast = pickFresh(deH2H, winner, loser || "");
      player1Roast = `@${p1.handle}: Viel Code geschrieben, wenig verstanden. Brute-Force ist keine Architektur.`;
      player2Roast = `@${p2.handle}: TLE auf Testcase 2. Mehrfaches Absenden ändert die Komplexität leider nicht.`;
      punchline = pickFresh(dePunchlines, winner, loser || "");
    }
  }

  // 4. Portuguese (Brazil)
  else if (lang === "pt") {
    if (isDraw) {
      headToHeadRoast = `Empate técnico entre @${p1.handle} e @${p2.handle} com ${p1.total} pontos. Duas gambiarras idênticas tomando TLE no mesmo teste de sistema.`;
      player1Roast = `@${p1.handle}: Commit direto na master sem teste unitário. Coragem tem, falta é código limpo.`;
      player2Roast = `@${p2.handle}: Júnior jurando que é sênior com 6 meses de curso, mas travou na recursão.`;
      punchline = "EMPATE: Ambos sobreviveram ao código espaguete. Ninguém ganha a vaga.";
    } else {
      const ptPunchlines = [
        `Winner: @${winner}. @${loser} ainda tá no fórum copiando a resposta dos outros.`,
        `Winner: @${winner}. A gambiarra de @${loser} tomou TLE logo no pré-teste 2.`,
        `Winner: @${winner}. Surra de +${margin} pontos; @${loser} travou na primeira recursão.`,
        `Winner: @${winner}. ${winnerScore.total}–${loserScore.total}; pastel de código não passa no juiz, @${loser}.`,
      ];
      const ptH2H = [
        `@${winner} amassou @${loser} no placar (${winnerScore.total}–${loserScore.total}). Fazer problema fácil não salva ninguém quando o entrevistador pede para otimizar memória.`,
        `Aula de algoritmo (+${margin} pts): enquanto @${winner} mandou solução otimizada de primeira, @${loser} empilhou gambiarra até estourar o tempo limite.`,
        `Diferença brutal de nível: o pico de ${winnerScore.metrics.maxRating} de @${winner} deixou @${loser} (${loserScore.metrics.maxRating}) perdido nos casos de borda.`,
      ];
      headToHeadRoast = pickFresh(ptH2H, winner, loser || "");
      player1Roast = `@${p1.handle}: Pastel de código completo. Subiu pra prod e derrubou o servidor.`;
      player2Roast = `@${p2.handle}: TLE no pré-teste 2. Reenviar o mesmo código rezando pro juiz aceitar não é algoritmo.`;
      punchline = pickFresh(ptPunchlines, winner, loser || "");
    }
  }

  // 5. Russian (Eastern Europe)
  else if (lang === "ru") {
    if (isDraw) {
      headToHeadRoast = `Ничья между @${p1.handle} и @${p2.handle} на ${p1.total} баллах. Два одинаковых брутфорса, дружно упавших с TL на одном и том же тесте.`;
      player1Roast = `@${p1.handle}: 150 строк кода ради задачи на четность. Дерево отрезков тут не поможет.`;
      player2Roast = `@${p2.handle}: Слил рейтинг в ноль и винит плохие тесты авторов раунда.`;
      punchline = "НИЧЬЯ: Оба чудом дожили до конца раунда. Рейтинг никому не светит.";
    } else {
      const ruPunchlines = [
        `Winner: @${winner}. @${loser} уходит читать разбор и плакать в подушку.`,
        `Winner: @${winner}. Квадратный брутфорс @${loser} развалился на втором претесте.`,
        `Winner: @${winner}. +${margin} очков разницы; @${loser} схлопотал взлом в конце тура.`,
        `Winner: @${winner}. ${winnerScore.total}–${loserScore.total}; дерево отрезков @${loser} снова забаговало.`,
      ];
      const ruH2H = [
        `@${winner} всухую разгромил @${loser} на табло (${winnerScore.total}–${loserScore.total}). Сотни простых задач не спасут от позора, когда в контесте нужна реальная динамика.`,
        `Разница в классе (+${margin} очков): @${winner} уверенно закрыл сложные задачи с пиком ${winnerScore.metrics.maxRating}, пока @${loser} ловил WA на крайних случаях.`,
        `Системные тесты вынесли приговор: @${winner} забрал раунд чистым кодом, а жадный алгоритм @${loser} рухнул на тесте 34.`,
      ];
      headToHeadRoast = pickFresh(ruH2H, winner, loser || "");
      player1Roast = `@${p1.handle}: Написал квадратный алгоритм и надеется, что сервер сжалится над ним.`;
      player2Roast = `@${p2.handle}: Схлопотал взлом на последних секундах раунда. Стыд перед кафедрой.`;
      punchline = pickFresh(ruPunchlines, winner, loser || "");
    }
  }

  // 6. Teluglish (Telugu Tech / Hyderabad)
  else if (lang === "te") {
    if (isDraw) {
      headToHeadRoast = `Deadlock ayindi @${p1.handle} and @${p2.handle} madhya ${p1.total} pts tho. Iddaru TLE kottaru same testcase meeda.`;
      player1Roast = `@${p1.handle}: Ameerpet coaching lo proxy petti interview pass avvaledu kabolu.`;
      player2Roast = `@${p2.handle}: Resume lo 5 years experience pettadu, recursion ante dimaag kharab ayindi.`;
      punchline = "DRAW: Iddaru fail ayyaru. Interviewer call disconnect chesesadu.";
    } else {
      const tePunchlines = [
        `Winner: @${winner}. @${loser} overaction aapi mundu basic syntax nerchukovali.`,
        `Winner: @${winner}. Ameerpet notes @${loser} ni +${margin} pts తేడా nundi kapadaledu.`,
        `Winner: @${winner}. @${loser} inka discussion tab lo hints vethukuntunnadu.`,
        `Winner: @${winner}. ${winnerScore.total}–${loserScore.total}; @${loser} code pretest 2 daggare poyindi.`,
      ];
      const teH2H = [
        `Ameerpet lo 45 days course chesi Two Sum kooda discussion tab chusi copy kotte batch idi. @${winner} (${winnerScore.total} pts) optimal runtime tho AC kodithe, @${loser} (${loserScore.total} pts) inka hints kosam vetukuntunnadu.`,
        `Scoreboard meeda oora mass domination: @${winner} +${margin} points tho @${loser} ni clean sweep chesadu. Recursion adagagane @${loser} ki mind block ayindi.`,
        `Peak rating ${winnerScore.metrics.maxRating} tho @${winner} ramp adinchadu, @${loser} matram basic greedy testcase deggare TLE kottadu.`,
      ];
      headToHeadRoast = pickFresh(teH2H, winner, loser || "");
      player1Roast = `@${p1.handle}: 50 repos unnai profile lo, okka project lo kooda pani chese code ledu.`;
      player2Roast = `@${p2.handle}: Problem B chudagane brain freeze ayindi. Cyber Towers mundu chai taagadam better.`;
      punchline = pickFresh(tePunchlines, winner, loser || "");
    }
  }

  // 7. Tanglish (Tamil Tech / Chennai)
  else if (lang === "ta") {
    if (isDraw) {
      headToHeadRoast = platform === "codechef"
        ? `CodeChef kitchen-la @${p1.handle} and @${p2.handle} rendu perum ${p1.total} points-la katti pudichu dead heat! Rendu perum Starters problem B-la TLE vaangitaanga.`
        : `Dead heat match @${p1.handle} and @${p2.handle} rendu perum ${p1.total} points-la deadlock. Rendu perum ore test case-la TLE vaangitaanga.`;
      player1Roast = `@${p1.handle}: College-la 6 arrear vechitu, grandmaster aaga poraaram namma thalaivar.`;
      player2Roast = `@${p2.handle}: OMR Tidel Park-la 9 hours AC room-la ukkandhu Todo app clone panradhu thappa vera onnum theriyaadhu.`;
      punchline = "DRAW: Vadivelu maadhiri rendu perum maatikitaanga. Yaarukkum offer illa.";
    } else {
      if (platform === "codechef") {
        const taCcPunchlines = [
          `Winner: @${winner}. @${loser}-ukku cutting chai kuduthu kitchen-ah vittu veliya anupunga.`,
          `Winner: @${winner}. @${loser} 2-star scene ellam +${margin} pts gap-la gaali aayiduchu.`,
          `Winner: @${winner}. Starters contest-la @${loser} sambar-ahtheega vechutaaru.`,
          `Winner: @${winner}. ${winnerScore.total}–${loserScore.total}; @${loser} Div 4-la paathiram kazhuvattum.`,
        ];
        const taCcH2H = [
          `@${winner} CodeChef kitchen-la @${loser}-ah nalla deep fry pannitaaru! 2-star badge vechitu 7-star scene podraaru @${loser}, aana @${winner} mass AC panni +${margin} pts-la trophy eduthutaaru!`,
          `Kitchen-la sema adi: @${winner} (${winnerScore.total} pts) optimal complexity-la samaikka, @${loser} (${loserScore.total} pts) Problem B-laye 5 WA penalty vaangitaaru!`,
        ];
        headToHeadRoast = pickFresh(taCcH2H, winner, loser || "");
        player1Roast = `@${p1.handle}: Chef hat potrukaaru, aana binary search kooda execute aagala.`;
        player2Roast = `@${p2.handle}: Long challenge-la 10 naal ukkandhum penalty points-la rating drop aayiduchu!`;
        punchline = pickFresh(taCcPunchlines, winner, loser || "");
      } else {
        const taPunchlines = [
          `Winner: @${winner}. @${loser}-ukku cutting chai vaangi kuduthu anupunga.`,
          `Winner: @${winner}. +${margin} pts வித்தியாசம்; @${loser} pretest 2-ve thaanda mudila.`,
          `Winner: @${winner}. @${loser} code-ah paathu compiler-eh kannur vitturuchu.`,
          `Winner: @${winner}. ${winnerScore.total}–${loserScore.total}; @${loser} Vadivelu maadhiri muzhikkiraaru.`,
        ];
        const taH2H = [
          `OMR Tidel Park-la 9 hours AC room-la ukkandhu Todo app clone pannitu, LinkedIn-la '10x Architect' nu status podradhu. @${winner} optimal runtime-la AC panna, @${loser} Vadivelu maadhiri muzhikkaradhu!`,
          `Scoreboard-la @${winner} (+${margin} pts) verithanamana sambavam! @${loser} வெறும் Easy problems solve pannitu Hard DP vandhadhum escape aayitaaru.`,
          `Peak rating ${winnerScore.metrics.maxRating} vechu @${winner} mass kaatitaaru; @${loser} (${loserScore.metrics.maxRating}) system test-la vaangina adi innum aarala.`,
        ];
        headToHeadRoast = pickFresh(taH2H, winner, loser || "");
        player1Roast = `@${p1.handle}: GitHub profile full-ah star graveyard. 40 repo-la oru star kooda illa.`;
        player2Roast = `@${p2.handle}: Machi, un code-ah paathu compiler-eh kannur vitturuchu da! Div 2 pretest 2-ve thaanda mudila.`;
        punchline = pickFresh(taPunchlines, winner, loser || "");
      }
    }
  }

  // 8. Hinglish (North/West India)
  else if (lang === "hi") {
    if (isDraw) {
      headToHeadRoast = platform === "codechef"
        ? `CodeChef kitchen me @${p1.handle} aur @${p2.handle} dono ${p1.total} pts pe barabar cook ho gaye. Starters contest me dono ne same brute force lagaya aur dono ka soufflé Div 3 me phat gaya.`
        : `Dono candidates @${p1.handle} aur @${p2.handle} ${p1.total} pts pe deadlock ho gaye. Dono ne same O(N^2) brute force likha aur pretest 2 pe TLE kha liya.`;
      player1Roast = `@${p1.handle}: Resume me 'passionate problem solver' likha hai, par recursion dekh ke paseene chhoot gaye.`;
      player2Roast = `@${p2.handle}: 3 LPA ka package, 50 LPA ka attitude. Test cases fail hone pe system ko dosh de raha hai.`;
      punchline = "DRAW: Dono survive to kar gaye, par offer letter kisi ko nahi mila.";
    } else {
      if (platform === "codechef") {
        const ccPunchlines = [
          `Winner: @${winner}. @${loser} ko bolo CodeChef chhod ke Maggi banane pe dhyan de.`,
          `Winner: @${winner}. 2-star badge leke 7-star ka roab, @${loser} Div 4 me bartan dho raha hai.`,
          `Winner: @${winner}. @${loser} ne Long Challenge me 10 din lagaye, fir bhi fry ho gaya.`,
          `Winner: @${winner}. @${loser} ki binary search lagate hi roti jal gayi.`,
          `Winner: @${winner}. +${margin} pts se @${loser} ka kitchen career khatam.`,
          `Winner: @${winner}. Starters contest me @${loser} ka tadka pretest pe hi jal gaya.`,
        ];
        const ccH2H = [
          `@${winner} ne @${loser} ko CodeChef ki kitchen me seedha fry kar diya (${winnerScore.total}–${loserScore.total})! 2-star badge leke 7-star ka roab jhad rahe the, par @${winner} ne optimal AC se dish serve kar di.`,
          `CodeChef kitchen me kohraam: @${winner} (+${margin} pts) ne Michelin star AC nikala aur @${loser} ke saare test cases jal ke raakh ho gaye.`,
          `Starters round ka hisaab: @${winner} ne ${winnerScore.metrics.maxRating} peak rating dikha ke baazi maar li, jabki @${loser} Problem B me 5 WA kha ke baitha hai.`,
          `Long challenge ke jugaad se Starters nahi jeete jaate: @${winner} (${winnerScore.metrics.solvedCount} solves) ne @${loser} ko +${margin} points se dhool chata di.`,
        ];
        headToHeadRoast = pickFresh(ccH2H, winner, loser || "");
        player1Roast = `@${p1.handle}: Chef hat pehen ke baithe hain par Problem B ka binary search lagate hi roti jal gayi.`;
        player2Roast = `@${p2.handle}: Long challenge me 10 din laga ke bhi penalty points se rating minus me chali gayi.`;
        punchline = pickFresh(ccPunchlines, winner, loser || "");
      } else if (platform === "github") {
        const ghPunchlines = [
          `Winner: @${winner}. @${loser} ke empty repos ke kabristan pe +${margin} pts ki jeet.`,
          `Winner: @${winner}. @${loser} YouTube dekh ke clone karta raha, @${winner} ne prod ship kiya.`,
          `Winner: @${winner}. Git log kholte hi @${loser} ki pol khul gayi.`,
          `Winner: @${winner}. @${loser} README sajata reh gaya aur @${winner} stars le gaya.`,
          `Winner: @${winner}. ${winnerScore.total}–${loserScore.total}; @${loser} ke repos pe mummy ke alawa kisi ka star nahi.`,
          `Winner: @${winner}. Todo-list clone se @${winner} ke open-source empire ko nahi hara sakte, @${loser}.`,
        ];
        const ghH2H = [
          `@${winner} ne GitHub pe @${loser} ki pol khol di (${winnerScore.total}–${loserScore.total}). Empty repos create karke developer nahi bante jab tak project me real users na hon.`,
          `Open-source reality check (+${margin} pts): @${winner} ke paas asli stars aur commits hain, jabki @${loser} ka profile forked tutorials ka kabristan bana hua hai.`,
          `Git blame ne sach ugal diya: @${winner} production code ship kar raha hai aur @${loser} sirf README me emojis daal ke green dots bhar raha hai.`,
          `Scoreboard ne sach dikha diya: @${winner} (${winnerScore.total} pts) ke flagship projects ke aage @${loser} (${loserScore.total} pts) ke 0-star repos tik nahi paaye.`,
        ];
        headToHeadRoast = pickFresh(ghH2H, winner, loser || "");
        player1Roast = `@${p1.handle}: Repositories itni saari hain par star ek bhi nahi mila, wo bhi mummy ke phone se star kiya tha.`;
        player2Roast = `@${p2.handle}: 40 repo fork kiye hain aur ek line ka commit nahi kiya. Sirf README change karke developer ban rahe hain.`;
        punchline = pickFresh(ghPunchlines, winner, loser || "");
      } else {
        const cpHinglishPunchlines = [
          `Winner: @${winner}. @${loser} ko bolo resume me 'Hardworking' likhna band kare.`,
          `Winner: @${winner}. Easy solves karke bhi recursion dekh ke @${loser} ki hawa nikal gayi.`,
          `Winner: @${winner}. @${loser} abhi bhi discussion tab me hints dhoondh raha hai.`,
          `Winner: @${winner}. 3 LPA ka package aur 50 LPA ka attitude, @${loser} pretest 2 pe phat gaya.`,
          `Winner: @${winner}. +${margin} pts ka gap; @${loser} ka Striver sheet ratta kaam nahi aaya.`,
          `Winner: @${winner}. ${winnerScore.total}–${loserScore.total}; @${loser} abhi bhi Two Sum ke teen tarike rat raha hai.`,
          `Winner: @${winner}. System test aate hi @${loser} ka O(N^2) jugaad dhwast ho gaya.`,
          `Winner: @${winner}. @${loser} contest chhod ke LinkedIn pe '10x Dev' post likhne chala gaya.`,
        ];
        const cpH2H = [
          `Bhai Easy solves karke bhi interviewer ke saamne 'recursion' sunte hi hawa nikal gayi. @${winner} (${winnerScore.total} pts) ne optimal complexity se AC nikala jabki @${loser} (${loserScore.total} pts) abhi bhi discussion tab me hints dhoondh raha hai.`,
          `Placement season reality check: @${winner} ne +${margin} points ke margin se system tests clear kar liye jabki @${loser} TCS Ninja ka form bharne ki taiyari kar raha hai.`,
          `Contest rating ka asli farak: @${winner} (${winnerScore.metrics.maxRating} peak, ${winnerScore.metrics.solvedCount} solves) ne @${loser} (${loserScore.metrics.maxRating} peak) ka saara hawa-baazi utaar diya.`,
          `Ratta maar ke contest nahi nikalta: @${winner} ne DP aur graphs me +${margin} pts ki lead li, aur @${loser} pretest 2 pe TLE kha ke baith gaya.`,
          `Scoreboard pe ek tarfa maamla (${winnerScore.total}–${loserScore.total}): @${winner} ne asli algorithmic grit dikhaya jabki @${loser} editorial kholne ka wait kar raha tha.`,
        ];
        headToHeadRoast = pickFresh(cpH2H, winner, loser || "");
        player1Roast = `@${p1.handle}: GitHub pe 52 repos hain aur ek bhi star nahi hai, wo bhi mummy ke account se karwaya tha.`;
        player2Roast = `@${p2.handle}: Div 2 Problem A speedrun karke khush ho raha tha, Problem B dekhte hi TCS Ninja ka form yaad aa gaya.`;
        punchline = pickFresh(cpHinglishPunchlines, winner, loser || "");
      }
    }
  }

  // Default fallback English
  else {
    const enPunchlines = [
      `Winner: @${winner}. File an issue in @${loser}'s repo to offer your condolences.`,
      `Winner: @${winner}. +${margin} points separated @${winner}'s receipts from @${loser}'s excuses.`,
      `Winner: @${winner}. ${winnerScore.total}–${loserScore.total}; @${loser} was still reading the hints tab.`,
      `Winner: @${winner}. @${loser}'s brute-force optimism died on pretest 2.`,
    ];
    const enH2H = [
      `@${winner} ratioed @${loser} (${winnerScore.total}–${loserScore.total}). Grinding Easy warmups won't save you when the timer demands better than O(N^2).`,
      `Scoreboard audit complete: @${winner} took it by +${margin} points with ${winnerScore.metrics.solvedCount} solves while @${loser} panicked in the discussion tab.`,
    ];
    headToHeadRoast = isDraw
      ? `Algorithmic deadlock. Both @${p1.handle} and @${p2.handle} finished at ${p1.total} pts. Two identical submissions, both hitting TLE on pretest 2.`
      : pickFresh(enH2H, winner, loser || "");
    player1Roast = `@${p1.handle}: 50 public repos but an absolute star graveyard. Not even your alt accounts starred the README.`;
    player2Roast = `@${p2.handle}: Memorized 300 solutions with the editorial open, but froze completely against a 90-minute contest timer.`;
    punchline = isDraw
      ? "DRAW: Both candidates survived the phone screen. Neither earned the offer."
      : pickFresh(enPunchlines, winner, loser || "");
  }

  return {
    source: "local",
    persona,
    headToHeadRoast,
    player1Roast,
    player2Roast,
    punchline,
    winnerHandle: isDraw ? null : winner,
    promptVersion: PROMPT_VERSION,
  };
}
