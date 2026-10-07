// Memòria de l'estat de l'avaluació
const state = {
  departament: '',
  emailContacte: '',
  proces: '',
  esPrimerAgent: false,
  answers: {
    p1: [],
    p2: [],
    p3: [],
    p4: [],
    p5: []
  },
  computedFinalLevel: 1,
  computedQuestionLevels: {}
};

// Adreça de correu de destinació de Governança
const EMAIL_GOVERNANCA = "governanca.ia@gencat.cat";

// Mapa d'opcions a nivells
const optionLevels = {
  p1: { A: 1, B: 1, C: 1, D: 2, E: 2, F: 3, G: 3 },
  p2: { A: 1, B: 2, C: 3 },
  p3: { A: 1, B: 1, C: 2, D: 2, E: 3, F: 3, G: 3 },
  p4: { A: 1, B: 2, C: 2, D: 3 },
  p5: { A: 1, B: 2, C: 3, D: 3 }
};

// Textos literals de les preguntes
const questionTitles = {
  p1: "Pregunta 1: Utilitat principal de l'agent",
  p2: "Pregunta 2: Nivell d'autonomia de l'agent",
  p3: "Pregunta 3: Tipus de dades utilitzades",
  p4: "Pregunta 4: Fonts d'informació",
  p5: "Pregunta 5: Nombre d'usuaris"
};

const optionLabels = {
  p1: {
    A: "Cercar o proporcionar informació dins la Generalitat",
    B: "Extreure informació de documents o fonts de dades, i anàlisi o classificació",
    C: "Creació, correcció, traducció o modificació de continguts",
    D: "Validació de criteris a partir d'informació extreta de documents/fonts",
    E: "Elaboració de conclusions a partir d'informació extreta de documents/fonts",
    F: "Facilitar informació i respondre dubtes de la ciutadania",
    G: "Desenvolupar aplicacions informàtiques i altres solucions tecnològiques"
  },
  p2: {
    A: "L'agent només 'parlarà amb l'usuari' (assistent conversacional)",
    B: "L'agent automatitzarà algunes tasques que a dia d'avui fa l'usuari",
    C: "L'agent actuarà de forma totalment autònoma sense instruccions puntuals"
  },
  p3: {
    A: "Només informació pública (disponible a Internet)",
    B: "Documents/fonts amb dades sobre persones jurídiques",
    C: "Documents/fonts sobre seguretat, infraestructures o patrimoni",
    D: "Documents/fonts sobre persones físiques majors d'edat",
    E: "Documents/fonts sobre persones físiques menors d'edat o depenents",
    F: "Documents/fonts sobre salut de les persones físiques",
    G: "Decisions sobre drets fonamentals de les persones"
  },
  p4: {
    A: "Documents facilitats directament o disponibles a Internet",
    B: "Unitats de xarxa, carpetes de SharePoint o TEAMS",
    C: "Bústies de correu electrònic o missatgeria de TEAMS",
    D: "Bases de dades o aplicacions informàtiques de negoci"
  },
  p5: {
    A: "Només un usuari individual",
    B: "Entre dos i deu usuaris",
    C: "Més de deu usuaris",
    D: "Sense un límit definit d'usuaris (obert a qualsevol persona del departament o ens)"
  }
};

const normativeTexts = {
  1: "L'agent que vols construir és de nivell 1, ús individual. Pots utilitzar lliurement qualsevol de les eines de les quals ja disposes (Copilot Xat o NotebookLM), i no necessites disposar de cap llicència específica. Tingues cura igualment de les recomanacions relatives a la privacitat i a l'ètica en l'ús de la IA que et vam donar durant el curs introductori a la IA.",
  2: "L'agent que vols construir és de nivell 2, ús d'equip de treball o unitat. Posa't en contacte amb l'àmbit competent en temes d'organització del teu departament o ens per tal que t'ajudin a desenvolupar un agent que faci les tasques específiques que necessites fer.",
  3: "L'agent que vols construir és de nivell 3, ús corporatiu. No el pots desenvolupar tu. Posa't en contacte amb l'àmbit competent en temes d'organització i amb l'Àrea TIC del teu departament o ens per tal d'explicar-los les teves necessitats i que ells valorin quina és la solució òptima a desenvolupar."
};

// Mapa de percentatges per a la barra de progrés
const progressPercentages = {
  0: '15%',
  1: '30%',
  2: '45%',
  3: '60%',
  4: '75%',
  5: '90%',
  'result': '100%'
};

// Fase 1: Validar i desar context
function submitContext() {
  const deptInput = document.getElementById('departament').value.trim();
  const emailInput = document.getElementById('email-contacte').value.trim();
  const procInput = document.getElementById('proces').value.trim();
  const isFirstAgent = document.getElementById('primer-agent').checked;
  const err = document.getElementById('error-0');

  // Validació bàsica de correu
  const isEmailValid = emailInput.includes('@') && emailInput.includes('.');

  if (!deptInput || !procInput || !emailInput || !isEmailValid) {
    err.classList.remove('hidden');
    return;
  }

  err.classList.add('hidden');
  state.departament = deptInput;
  state.emailContacte = emailInput;
  state.proces = procInput;
  state.esPrimerAgent = isFirstAgent;

  goToStep(1);
}

// Fase 2: Navegació
function nextQuestion(qNum) {
  const selected = Array.from(document.querySelectorAll(`input[name="p${qNum}"]:checked`)).map(c => c.value);
  const err = document.getElementById(`error-${qNum}`);

  if (selected.length === 0) {
    err.classList.remove('hidden');
    return;
  }

  err.classList.add('hidden');
  state.answers[`p${qNum}`] = selected;

  goToStep(qNum + 1);
}

// Canvi de pantalla i actualització de progrés
function goToStep(stepNum) {
  document.querySelectorAll('.step-card').forEach(card => card.classList.add('hidden'));

  const topBar = document.getElementById('top-progress-bar');
  const progressBar = document.getElementById('progress-bar-container');
  const stepLabel = document.getElementById('step-label');
  const stepCount = document.getElementById('step-count');

  if (topBar && progressPercentages[stepNum] !== undefined) {
    topBar.style.width = progressPercentages[stepNum];
  }

  if (stepNum === 0) {
    if (progressBar) progressBar.classList.remove('hidden');
    if (stepLabel) stepLabel.innerText = "Fase 1: Context Inicial";
    if (stepCount) stepCount.innerText = "Pas 1 de 6";
    document.getElementById('step-0').classList.remove('hidden');
  } else if (typeof stepNum === 'number' && stepNum >= 1 && stepNum <= 5) {
    if (progressBar) progressBar.classList.remove('hidden');
    if (stepLabel) stepLabel.innerText = "Fase 2: Qüestionari d'Avaluació";
    if (stepCount) stepCount.innerText = `Pas ${stepNum + 1} de 6`;
    document.getElementById(`step-${stepNum}`).classList.remove('hidden');
  } else if (stepNum === 'result') {
    if (progressBar) progressBar.classList.add('hidden');
    document.getElementById('step-result').classList.remove('hidden');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fase 3 & 4: Càlcul del Nivell Final i generació de l'Informe
function calculateResult() {
  const selectedP5 = Array.from(document.querySelectorAll('input[name="p5"]:checked')).map(c => c.value);
  const err5 = document.getElementById('error-5');

  if (selectedP5.length === 0) {
    err5.classList.remove('hidden');
    return;
  }
  err5.classList.add('hidden');
  state.answers.p5 = selectedP5;

  const questionLevels = {};
  let finalLevel = 1;

  for (let i = 1; i <= 5; i++) {
    const qKey = `p${i}`;
    const selectedOptions = state.answers[qKey];
    let qMax = 1;

    selectedOptions.forEach(opt => {
      const lvl = optionLevels[qKey][opt] || 1;
      if (lvl > qMax) qMax = lvl;
    });

    questionLevels[qKey] = qMax;
    if (qMax > finalLevel) {
      finalLevel = qMax;
    }
  }

  state.computedFinalLevel = finalLevel;
  state.computedQuestionLevels = questionLevels;

  renderReport();
  goToStep('result');
}

function renderReport() {
  const container = document.getElementById('report-container');
  const finalLevel = state.computedFinalLevel;
  const questionLevels = state.computedQuestionLevels;

  let analysisHTML = '';
  for (let i = 1; i <= 5; i++) {
    const qKey = `p${i}`;
    const selected = state.answers[qKey];
    const qLevel = questionLevels[qKey];
    const optsText = selected.map(o => `${o}) ${optionLabels[qKey][o]}`).join('; ');

    analysisHTML += `
      <div class="mb-3 pl-3 border-l-2 border-slate-300 dark:border-slate-600">
        <p class="font-semibold text-slate-900 dark:text-white">${questionTitles[qKey]}</p>
        <p class="text-slate-700 dark:text-slate-300">Opcions seleccionades: ${optsText}</p>
        <p class="text-slate-500 dark:text-slate-400">Nivell obtingut en aquesta pregunta: <strong>Nivell ${qLevel}</strong></p>
      </div>
    `;
  }

  // Notificació especial si és el primer agent
  let firstAgentNoticeHTML = '';
  if (state.esPrimerAgent) {
    firstAgentNoticeHTML = `
      <div class="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-sm">
          <strong>Acompanyament de l'Escola d'Agents activat:</strong> En haver indicat que és el teu primer agent, la còpia enviada per correu servirà perquè l'Escola d'Agents es posi en contacte amb tu per assistir-te en el seu desenvolupament.
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    ${firstAgentNoticeHTML}

    <!-- Títol principal -->
    <h2 class="report-title mb-4">Informe de valoració del nivell d'un cas d'ús de IA</h2>

    <!-- Resum del cas -->
    <div class="report-body-text mb-6 space-y-1 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
      <p><strong>Departament / Ens:</strong> ${escapeHtml(state.departament)}</p>
      <p><strong>Correu de contacte:</strong> ${escapeHtml(state.emailContacte)}</p>
      <p><strong>Procés i Finalitat:</strong> ${escapeHtml(state.proces)}</p>
      <p><strong>Primer agent desenvolupat:</strong> ${state.esPrimerAgent ? "Sí (Sol·licita suport a l'Escola d'Agents)" : 'No'}</p>
    </div>

    <!-- Anàlisi de respostes -->
    <div class="report-body-text mb-6">
      <h3 class="font-bold text-slate-900 dark:text-white mb-2">Anàlisi de respostes:</h3>
      ${analysisHTML}
    </div>

    <!-- Resultat de la valoració -->
    <div class="report-result-level my-6 p-4 rounded-xl border ${getLevelColorStyle(finalLevel)}">
      Resultat de la valoració: NIVELL FINAL ${finalLevel}
    </div>

    <!-- Text normatiu del nivell -->
    <div class="report-body-text mb-6 p-4 bg-slate-100 dark:bg-slate-700/40 rounded-lg">
      <p class="italic text-slate-800 dark:text-slate-200">"${normativeTexts[finalLevel]}"</p>
    </div>

    <!-- Dades de contacte -->
    <div class="report-body-text mb-6">
      <p><strong>Dades de contacte:</strong> Busqueu el <strong>referent d'automatització i IA</strong> de <strong>${escapeHtml(state.departament)}</strong> directament a la llista corporativa de SharePoint per validar el vostre cas d'ús.</p>
    </div>

    <!-- Frase literal de tancament -->
    <div class="report-body-text pt-4 border-t border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300">
      Espero haver-te ajudat, però recorda contactar amb el teu interlocutor per confirmar la informació.
    </div>

    <!-- Aclariment del procediment d'enviament -->
    <div class="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-600 dark:text-slate-300 space-y-2">
      <p class="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gencat shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Què passa quan envies aquest informe a Governança d'IA?
      </p>
      <p>1. En clicar el botó <strong>"Enviar per correu"</strong>, s'obrirà automàticament el teu programa de correu (Outlook o web) amb la bústia oficial <code>${EMAIL_GOVERNANCA}</code> i el text de l'informe preemplenat.</p>
      <p>2. L'equip de Governança d'IA registrarà la sol·licitud i la informació del cas d'ús al directori corporatiu.</p>
      <p>3. En cas que hagueis marcat la casella de primer agent, l'Escola d'Agents rebrà la notificació per contactar amb tu a través de <code>${escapeHtml(state.emailContacte)}</code> i guiar-te pas a pas en el desenvolupament.</p>
    </div>
  `;
}

// Generació del text en format Markdown (.md)
function generateMarkdownReport() {
  const finalLevel = state.computedFinalLevel;
  const questionLevels = state.computedQuestionLevels;

  let md = `# Informe de valoració del nivell d'un cas d'ús de IA\n\n`;
  md += `**Departament / Ens:** ${state.departament}\n`;
  md += `**Correu de contacte:** ${state.emailContacte}\n`;
  md += `**Procés i Finalitat:** ${state.proces}\n`;
  md += `**Primer agent desenvolupat:** ${state.esPrimerAgent ? "Sí (Acompanyament per l'Escola d'Agents)" : 'No'}\n\n`;

  md += `--- \n\n`;
  md += `### Anàlisi de respostes:\n\n`;

  for (let i = 1; i <= 5; i++) {
    const qKey = `p${i}`;
    const selected = state.answers[qKey];
    const qLevel = questionLevels[qKey];
    const optsText = selected.map(o => `${o}) ${optionLabels[qKey][o]}`).join('; ');

    md += `- **${questionTitles[qKey]}**\n`;
    md += `  - *Opcions seleccionades:* ${optsText}\n`;
    md += `  - *Nivell obtingut:* **Nivell ${qLevel}**\n\n`;
  }

  md += `--- \n\n`;
  md += `### Resultat de la valoració: NIVELL FINAL ${finalLevel}\n\n`;
  md += `> "${normativeTexts[finalLevel]}"\n\n`;
  md += `**Dades de contacte:** Busqueu el **referent d'automatització i IA** de **${state.departament}** directament a la llista corporativa de SharePoint per validar el vostre cas d'ús.\n\n`;
  md += `*Espero haver-te ajudat, però recorda contactar amb el teu interlocutor per confirmar la informació.*\n`;

  return md;
}

// Descarregar fitxer .md
function downloadMarkdown() {
  const mdText = generateMarkdownReport();
  const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const safeDept = state.departament.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  
  link.href = url;
  link.setAttribute('download', `informe_avaluacio_ia_${safeDept}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Enviar per correu mitjançant protocol mailto
function sendEmailReport() {
  const subject = encodeURIComponent(`[Avaluació IA] Informe de cas d'ús - ${state.departament}`);
  const bodyText = generateMarkdownReport();
  const body = encodeURIComponent(bodyText);

  window.location.href = `mailto:${EMAIL_GOVERNANCA}?subject=${subject}&body=${body}`;
}

function getLevelColorStyle(level) {
  if (level === 1) {
    return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200';
  } else if (level === 2) {
    return 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200';
  } else {
    return 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200';
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function resetEvaluation() {
  state.departament = '';
  state.emailContacte = '';
  state.proces = '';
  state.esPrimerAgent = false;
  state.answers = { p1: [], p2: [], p3: [], p4: [], p5: [] };

  document.getElementById('departament').value = '';
  document.getElementById('email-contacte').value = '';
  document.getElementById('proces').value = '';
  document.getElementById('primer-agent').checked = false;
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

  goToStep(0);
}