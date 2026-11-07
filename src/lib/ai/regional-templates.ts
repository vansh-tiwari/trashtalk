import { BattleVerdict } from "../battle/types";
import { PlatformEvidence } from "../platforms/contracts";
import { CommentaryResult, RoastPersona } from "./schemas";
import { PROMPT_VERSION } from "./personas";
import { GlobalRegionInfo } from "./global-regions";

interface RegionalRoastParams {
  p1Evidence: PlatformEvidence;
  p2Evidence: PlatformEvidence;
  verdict: BattleVerdict;
  persona: RoastPersona;
  platform?: string;
  regionInfo: GlobalRegionInfo;
}

export function generateRegionalLocalRoast({
  p1Evidence,
  p2Evidence,
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
      if (platform === "github") {
        headToHeadRoast = `@${winner} le metió un baile a @${loser}. Tener proyectos reales con estrellas hace que los repositorios de @${loser} parezcan un cementerio de código abandonado.`;
        player1Roast = `@${p1.handle}: Repositorios de tutoriales clonados y estrellas que ni su mamá le dio.`;
        player2Roast = `@${p2.handle}: 50 repositorios creados, cero proyectos corriendo en producción. Puro humo.`;
        punchline = `Winner: @${winner}. Abre un issue en el repo del perdedor para darle el pésame.`;
      } else {
        headToHeadRoast = `@${winner} barrió con @${loser} en el tablero. Memorizar 400 Two Sums no te salva cuando te piden diseñar algo más complejo que un for-loop. @${winner} entregó con complejidad óptima mientras @${loser} buscaba pistas.`;
        player1Roast = `@${p1.handle}: Resuelve los fáciles en 5 minutos, pero la recursión le da miedo.`;
        player2Roast = `@${p2.handle}: TLE en el segundo caso de prueba. Reenviar el mismo código 5 veces no es un algoritmo.`;
        punchline = `Winner: @${winner}. @${loser} sigue releyendo Two Sum por 47ª vez.`;
      }
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
      headToHeadRoast = `@${winner} a donné une vraie leçon d'ingénierie à @${loser}. Aligner 400 problèmes Easy ne sert à rien quand on panique dès que la complexité temporelle dépasse O(N).`;
      player1Roast = `@${p1.handle}: Du code spaghetti digne d'un stagiaire payé en tickets resto.`;
      player2Roast = `@${p2.handle}: TLE sur le prétest 2, le compilateur a littéralement rendu l'âme.`;
      punchline = `Winner: @${winner}. @${loser} est encore en train de chercher les solutions sur StackOverflow.`;
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
      headToHeadRoast = `@${winner} deklassiert @${loser} auf ganzer Linie. 400 Easy-Aufgaben retten einen nicht vor Laufzeitfehlern, wenn saubere Algorithmik gefragt ist.`;
      player1Roast = `@${p1.handle}: Viel Code geschrieben, wenig verstanden. Brute-Force ist keine Architektur.`;
      player2Roast = `@${p2.handle}: TLE auf Testcase 2. Mehrfaches Absenden ändert die Komplexität leider nicht.`;
      punchline = `Winner: @${winner}. @${loser} liest zum 47. Mal die Musterlösung durch.`;
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
      headToHeadRoast = `@${winner} amassou @${loser} no placar. 400 Easy no LeetCode não salvam ninguém de travar quando o entrevistador pede para otimizar espaço de memória.`;
      player1Roast = `@${p1.handle}: Pastel de código completo. Subiu pra prod e derrubou o servidor.`;
      player2Roast = `@${p2.handle}: TLE no pré-teste 2. Reenviar o mesmo código rezando pro juiz aceitar não é algoritmo.`;
      punchline = `Winner: @${winner}. @${loser} ainda tá no fórum copiando a resposta dos outros.`;
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
      headToHeadRoast = `@${winner} всухую разгромил @${loser} на табло. Сотни решенных задач уровня Easy не спасут от позора, когда в контесте требуется реальное понимание алгоритмов.`;
      player1Roast = `@${p1.handle}: Написал квадратный алгоритм и надеется, что сервер сжалится над ним.`;
      player2Roast = `@${p2.handle}: Схлопотал взлом на последних секундах раунда. Стыд перед кафедрой.`;
      punchline = `Winner: @${winner}. @${loser} уходит читать разбор и плакать в подушку.`;
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
      headToHeadRoast = `Ameerpet lo 45 days Java course chesi, resume lo 5 years experience petti, Two Sum kooda discussion tab chusi copy kotte batch idi. @${winner} optimal runtime tho AC kodithe, @${loser} inka hints kosam vetukuntunnadu.`;
      player1Roast = `@${p1.handle}: 50 repos unnai GitHub lo, okka project lo kooda pani chese code ledu. Antha downloaded zips.`;
      player2Roast = `@${p2.handle}: Div 2 Problem B chudagane brain freeze ayindi. Cyber Towers mundu chai taagutu timepass cheyadam better.`;
      punchline = `Winner: @${winner}. @${loser} ki cheppandi, overaction aapi mundu basic syntax nerchukomannu.`;
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
        headToHeadRoast = `@${winner} CodeChef kitchen-la @${loser}-ah nalla deep fry pannitaaru! 2-star badge vechitu 7-star scene podraaru @${loser}, aana @${winner} Division 3-la mass AC panni trophy eduthutaaru!`;
        player1Roast = `@${p1.handle}: Chef hat potrukaaru, aana binary search kooda execute aagala.`;
        player2Roast = `@${p2.handle}: Long challenge-la 10 naal ukkandhum penalty points-la rating drop aayiduchu!`;
        punchline = `Winner: @${winner}. @${loser}-ukku oru cutting chai vaangi kuduthu kitchen-ah vittu veliya anupunga.`;
      } else {
        headToHeadRoast = `OMR Tidel Park-la 9 hours AC room-la ukkandhu Todo app clone pannitu, LinkedIn-la '10x Architect' nu status podradhu. @${winner} optimal runtime-la AC panna, @${loser} Vadivelu maadhiri muzhikkaradhu!`;
        player1Roast = `@${p1.handle}: GitHub profile full-ah star graveyard. 40 repo-la oru star kooda illa.`;
        player2Roast = `@${p2.handle}: Machi, un code-ah paathu compiler-eh kannur vitturuchu da! Div 2 pretest 2-ve thaanda mudila.`;
        punchline = `Winner: @${winner}. @${loser}-ukku oru cutting chai vaangi kuduthu, coding-ah vittutu vere business paakka sollunga.`;
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
        headToHeadRoast = `@${winner} ne @${loser} ko CodeChef ki kitchen me seedha fry kar diya! 2-star badge leke 7-star ka roab jhad rahe the, par @${winner} ne optimal AC se dish serve kar di jabki @${loser} Div 4 me abhi bhi bartan dho raha hai.`;
        player1Roast = `@${p1.handle}: Chef hat pehen ke baithe hain par Problem B ka binary search lagate hi roti jal gayi.`;
        player2Roast = `@${p2.handle}: Long challenge me 10 din laga ke bhi penalty points se rating minus me chali gayi.`;
        punchline = `Winner: @${winner}. @${loser} ko bolo CodeChef chhod ke Maggie banane pe dhyan de.`;
      } else {
        headToHeadRoast = `Bhai 400 Easy solves karke bhi interviewer ke saamne 'recursion' sunte hi hawa nikal gayi. @${winner} ne optimal complexity se AC nikala jabki @${loser} abhi bhi discussion tab me hints dhoondh raha hai.`;
        player1Roast = `@${p1.handle}: GitHub pe 52 repos hain aur ek bhi star nahi hai, wo bhi mummy ke account se karwaya tha.`;
        player2Roast = `@${p2.handle}: Div 2 Problem A speedrun karke khush ho raha tha, Problem B dekhte hi TCS Ninja ka form yaad aa gaya.`;
        punchline = `Winner: @${winner}. Loser ko bolo resume me 'Hardworking' likhna band kare.`;
      }
    }
  }

  // Default fallback English
  else {
    headToHeadRoast = isDraw
      ? `Algorithmic deadlock. Both @${p1.handle} and @${p2.handle} finished at ${p1.total} pts. Two identical submissions, both hitting TLE on pretest 2.`
      : `@${winner} ratioed @${loser} into a secondary repository. 400 Easy solves won't save you when the interviewer asks for anything more complicated than a for-loop. While @${winner} deployed clean AC, @${loser} was still panicking in the discussion tab.`;
    player1Roast = `@${p1.handle}: 50 public repos but an absolute star graveyard. Not even your alt accounts starred the README.`;
    player2Roast = `@${p2.handle}: Memorized 300 solutions with the editorial open, but froze completely against a 90-minute contest timer.`;
    punchline = isDraw
      ? "DRAW: Both candidates survived the phone screen. Neither earned the offer."
      : `Winner: @${winner}. File an issue in the loser's repo to offer your condolences.`;
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
