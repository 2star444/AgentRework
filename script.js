// Clau per al desat a la memòria local
const LOCAL_STORAGE_KEY = 'gencat_ia_evaluation_state_v1';

// Memòria de l'estat de l'avaluació
const state = {
  departament: '',
  emailContacte: '',
  proces: '',
  esPrimerAgent: false,
  currentStep: 0,
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
const EMAIL_GOVERNANCA = "judithmimoso@gencat.cat";

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

// Carregador inicial i restauració des de localStorage
document.addEventListener('DOMContentLoaded', () => {
  restoreStateFromLocalStorage();
});

// Desat de l'estat actual a localStorage
function saveStateToLocalStorage() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("No s'ha pogut desar l'estat a localStorage:", e);
  }
}

// Restauració de l'estat des de localStorage i inicialització de la vista
function restoreStateFromLocalStorage() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(state, parsed);

      // Assegurar que currentStep és de tipus correcte
      if (typeof state.currentStep === 'string' && !isNaN(state.currentStep)) {
        state.currentStep = parseInt(state.currentStep, 10);
      }

      // Restaurar valors als camps de context
      const deptEl = document.getElementById('departament');
      const emailEl = document.getElementById('email-contacte');
      const procEl = document.getElementById('proces');
      const primerAgentEl = document.getElementById('primer-agent');

      if (deptEl) deptEl.value = state.departament || '';
      if (emailEl) emailEl.value = state.emailContacte || '';
      if (procEl) procEl.value = state.proces || '';
      if (primerAgentEl) primerAgentEl.checked = state.esPrimerAgent || false;

      // Restaurar caselles de selecció de les preguntes
      for (let i = 1; i <= 5; i++) {
        const qKey = `p${i}`;
        const savedAnswers = state.answers[qKey] || [];
        document.querySelectorAll(`input[name="${qKey}"]`).forEach(cb => {
          cb.checked = savedAnswers.includes(cb.value);
        });
      }
    }
  } catch (e) {
    console.error("Error restaurant les dades des de localStorage:", e);
  }

  // NAVEGACIÓ FORÇADA: Si no hi ha pas vàlid, carregar el Pas 0 inicial
  if (state.currentStep === 'result') {
    renderReport();
    goToStep('result', false);
  } else if (typeof state.currentStep === 'number' && state.currentStep >= 0 && state.currentStep <= 5) {
    goToStep(state.currentStep, false);
  } else {
    goToStep(0, false);
  }
}

// Fase 1: Validar i desar context
function submitContext() {
  const deptElem = document.getElementById('departament');
  const emailElem = document.getElementById('email-contacte');
  const procElem = document.getElementById('proces');

  if (!deptElem || !emailElem || !procElem) return;

  const deptInput = deptElem.value.trim();
  const emailInput = emailElem.value.trim();
  const procInput = procElem.value.trim();
  const isFirstAgent = document.getElementById('primer-agent')?.checked || false;
  const err = document.getElementById('error-0');

  const isEmailValid = emailInput.includes('@') && emailInput.includes('.');
  const isValid = deptInput && procInput && emailInput && isEmailValid;

  deptElem.setAttribute('aria-invalid', !deptInput);
  emailElem.setAttribute('aria-invalid', !emailInput || !isEmailValid);
  procElem.setAttribute('aria-invalid', !procInput);

  if (!isValid) {
    if (err) err.classList.remove('hidden');
    return;
  }

  if (err) err.classList.add('hidden');
  state.departament = deptInput;
  state.emailContacte = emailInput;
  state.proces = procInput;
  state.esPrimerAgent = isFirstAgent;

  saveStateToLocalStorage();
  goToStep(1);
}

// Fase 2: Navegació endavant
function nextQuestion(qNum) {
  const selected = Array.from(document.querySelectorAll(`input[name="p${qNum}"]:checked`)).map(c => c.value);
  const err = document.getElementById(`error-${qNum}`);

  if (selected.length === 0) {
    if (err) err.classList.remove('hidden');
    return;
  }

  if (err) err.classList.add('hidden');
  state.answers[`p${qNum}`] = selected;

  saveStateToLocalStorage();
  goToStep(qNum + 1);
}

// Botó "Enrere" per rectificar respostes
function prevStep() {
  if (typeof state.currentStep === 'number' && state.currentStep > 0) {
    goToStep(state.currentStep - 1);
  } else if (state.currentStep === 'result') {
    goToStep(5);
  }
}

// Canvi de pantalla, actualització de progrés i gestió del focus
function goToStep(stepNum, shouldFocus = true) {
  state.currentStep = stepNum;

  // Ocultar totes les targetes
  document.querySelectorAll('.step-card').forEach(card => card.classList.add('hidden'));

  const topBar = document.getElementById('top-progress-bar');
  const progressBar = document.getElementById('progress-bar-container');
  const stepLabel = document.getElementById('step-label');
  const stepCount = document.getElementById('step-count');

  if (topBar && progressPercentages[stepNum] !== undefined) {
    topBar.style.width = progressPercentages[stepNum];
  }

  let activeCardId = 'step-0';

  if (stepNum === 0) {
    if (progressBar) progressBar.classList.remove('hidden');
    if (stepLabel) stepLabel.innerText = "Fase 1: Context Inicial";
    if (stepCount) stepCount.innerText = "Pas 1 de 6";
    activeCardId = 'step-0';
  } else if (typeof stepNum === 'number' && stepNum >= 1 && stepNum <= 5) {
    if (progressBar) progressBar.classList.remove('hidden');
    if (stepLabel) stepLabel.innerText = "Fase 2: Qüestionari d'Avaluació";
    if (stepCount) stepCount.innerText = `Pas ${stepNum + 1} de 6`;
    activeCardId = `step-${stepNum}`;
  } else if (stepNum === 'result') {
    if (progressBar) progressBar.classList.add('hidden');
    activeCardId = 'step-result';
  }

  const activeCard = document.getElementById(activeCardId);
  if (activeCard) {
    activeCard.classList.remove('hidden');

    if (shouldFocus) {
      const heading = activeCard.querySelector('h2');
      if (heading) {
        heading.focus();
      }
    }
  }

  saveStateToLocalStorage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fase 3 & 4: Càlcul del Nivell Final i generació de l'Informe
function calculateResult() {
  const selectedP5 = Array.from(document.querySelectorAll('input[name="p5"]:checked')).map(c => c.value);
  const err5 = document.getElementById('error-5');

  if (selectedP5.length === 0) {
    if (err5) err5.classList.remove('hidden');
    return;
  }
  if (err5) err5.classList.add('hidden');
  state.answers.p5 = selectedP5;

  const questionLevels = {};
  let finalLevel = 1;

  for (let i = 1; i <= 5; i++) {
    const qKey = `p${i}`;
    const selectedOptions = state.answers[qKey] || [];
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
  if (!container) return;

  const finalLevel = state.computedFinalLevel;
  const questionLevels = state.computedQuestionLevels;

  let analysisHTML = '';
  for (let i = 1; i <= 5; i++) {
    const qKey = `p${i}`;
    const selected = state.answers[qKey] || [];
    const qLevel = questionLevels[qKey] || 1;
    const optsText = selected.map(o => `${o}) ${optionLabels[qKey][o]}`).join('; ');

    analysisHTML += `
      <div class="mb-3 pl-3 border-l-2 border-slate-300 dark:border-slate-600">
        <p class="font-semibold text-slate-900 dark:text-white">${questionTitles[qKey]}</p>
        <p class="text-slate-700 dark:text-slate-300">Opcions seleccionades: ${optsText}</p>
        <p class="text-slate-500 dark:text-slate-400">Nivell obtingut en aquesta pregunta: <strong>Nivell ${qLevel}</strong></p>
      </div>
    `;
  }

  let firstAgentNoticeHTML = '';
  if (state.esPrimerAgent) {
    firstAgentNoticeHTML = `
      <div class="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-3 no-print">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-sm space-y-1">
          <strong class="font-semibold text-base block">Sol·licitud d'acompanyament de l'Escola d'Agents</strong>
          <p>Heu indicat que és el vostre primer agent. Perquè l'Escola d'Agents us pugui acompanyar, <strong>recordeu prémer el botó "Enviar per correu"</strong> al final d'aquesta pàgina.</p>
          <p class="text-xs text-blue-700 dark:text-blue-300"><em>(L'opció de descarregar o copiar el text no envia cap notificació automàtica a l'equip de Governança).</em></p>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    ${firstAgentNoticeHTML}

    <!-- Capçalera Corporativa -->
    <div class="border-b-2 border-red-700 pb-3 mb-4 print:pb-2 print:mb-3">
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs font-bold text-red-700 uppercase tracking-wider">Generalitat de Catalunya</span>
        <span class="text-xs text-slate-500">Governança de la IA</span>
      </div>
      <h2 id="heading-step-result" tabindex="-1" class="text-2xl font-bold text-slate-900 dark:text-white print:text-xl focus:outline-none">
        Informe de Valoració del Cas d'Ús d'IA
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-300 mt-0.5 print:text-xs">
        Avaluació del nivell de risc, autonomia i recomanacions d'implantació.
      </p>
    </div>

    <!-- Resum del cas -->
    <div class="report-body-text mb-5 space-y-1 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 print:p-2.5 print:mb-2.5">
      <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 print:mb-1">Dades de la sol·licitud</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm print:text-xs">
        <p><strong>Departament / Ens:</strong> ${escapeHtml(state.departament)}</p>
        <p><strong>Correu de contacte:</strong> ${escapeHtml(state.emailContacte)}</p>
        <p><strong>Procés i Finalitat:</strong> ${escapeHtml(state.proces)}</p>
        <p><strong>Primer agent desenvolupat:</strong> ${state.esPrimerAgent ? "Sí (Sol·licita suport a l'Escola d'Agents)" : 'No'}</p>
      </div>
    </div>

    <!-- Anàlisi de respostes -->
    <div class="report-body-text mb-5 print:mb-2.5">
      <h3 class="font-bold text-slate-900 dark:text-white mb-2 print:text-sm print:mb-1">Anàlisi de respostes:</h3>
      ${analysisHTML}
    </div>

    <!-- Resultat de la valoració -->
    <div class="report-result-level my-5 p-4 rounded-xl border font-bold ${getLevelColorStyle(finalLevel)} print:p-2 print:my-2 print:text-xs">
      Resultat de la valoració: NIVELL FINAL ${finalLevel}
    </div>

    <!-- Text normatiu del nivell -->
    <div class="report-body-text mb-5 p-4 bg-slate-100 dark:bg-slate-700/40 rounded-lg print:p-2 print:mb-2">
      <p class="italic text-slate-800 dark:text-slate-200 print:text-xs">"${normativeTexts[finalLevel]}"</p>
    </div>

    <!-- Dades de contacte -->
    <div class="report-body-text mb-5 print:mb-2">
      <p><strong>Dades de contacte:</strong> Busqueu el <strong>referent d'automatització i IA</strong> de <strong>${escapeHtml(state.departament)}</strong> directament a la llista corporativa de SharePoint per validar el vostre cas d'ús.</p>
    </div>

    <!-- Frase literal de tancament -->
    <div class="report-body-text pt-3 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs print:pt-1">
      Espero haver-te ajudat, però recorda contactar amb el teu interlocutor per confirmar la informació.
    </div>

    <!-- Aclariment de les opcions d'acció -->
    <div class="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-600 dark:text-slate-300 space-y-3 no-print">
      <p class="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Indicacions per a la tramitació de l'informe:
      </p>
      <ul class="space-y-2 list-disc pl-5">
        <li><strong>Enviar per correu:</strong> Obre el gestor de correu electrònic amb l'informe dirigit a <code>${EMAIL_GOVERNANCA}</code> i descarrega la còpia .md. Aquest pas és necessari per registrar oficialment el cas d'ús i sol·licitar el suport de l'Escola d'Agents.</li>
        <li><strong>Copiar text:</strong> Copia el contingut íntegre de l'informe al portapapers per enganxar-lo en aplicacions com Outlook Web o Microsoft Teams.</li>
        <li><strong>Descarregar informe (.md):</strong> Desa una còpia del document en format Markdown al vostre equip.</li>
        <li><strong>Imprimir / Desar en PDF:</strong> Genera un document en format PDF maquetat per a expedients o arxius interns.</li>
      </ul>
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
    const selected = state.answers[qKey] || [];
    const qLevel = questionLevels[qKey] || 1;
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

// Botó "Copiar text de l'informe" al portapapers
function copyReportToClipboard() {
  const mdText = generateMarkdownReport();
  navigator.clipboard.writeText(mdText).then(() => {
    const copyBtn = document.getElementById('btn-copy-report');
    if (copyBtn) {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `Copiat al portapapers`;
      copyBtn.classList.add('bg-emerald-600', 'text-white');
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.classList.remove('bg-emerald-600', 'text-white');
      }, 2500);
    }
  }).catch(err => {
    alert("No s'ha pogut copiar el text automàticament. Seleccioneu el text manualment.");
    console.error('Error en copiar: ', err);
  });
}

// Imprimir / Desar en PDF
function printReport() {
  window.print();
}

// Descarregar fitxer .md
function downloadMarkdown() {
  const mdText = generateMarkdownReport();
  const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const safeDept = (state.departament || 'generalitat').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

  link.href = url;
  link.setAttribute('download', `informe_avaluacio_ia_${safeDept}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Enviar per correu mitjançant protocol mailto i descarregar informe .md
function sendEmailReport() {
  downloadMarkdown();

  const dept = state.departament || "Generalitat";
  const subject = encodeURIComponent(`[Avaluació IA] Informe de cas d'ús - ${dept}`);
  const bodyText = `Hola,\n\nAdjunt a aquest correu trobareu l'informe de valoració del cas d'ús d'IA en format Markdown (.md) per al departament/ens: ${dept}.\n\nNOTA: El fitxer ".md" s'ha descarregat automaticament a la vostra carpeta de Baixades (Downloads). Si us plau, adjunteu-lo a aquest correu abans d'enviar-lo.\n\nAtentament,\n${state.emailContacte || ''}`;
  const body = encodeURIComponent(bodyText);

  setTimeout(() => {
    window.location.href = `mailto:${EMAIL_GOVERNANCA}?subject=${subject}&body=${body}`;
  }, 500);
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
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Confirmació de seguretat per reiniciar l'avaluació
function confirmResetEvaluation() {
  const confirmed = window.confirm("Esteu segur que voleu reiniciar l'avaluació? Es perdran totes les respostes introduïdes.");
  if (confirmed) {
    resetEvaluation();
  }
}

function resetEvaluation() {
  state.departament = '';
  state.emailContacte = '';
  state.proces = '';
  state.esPrimerAgent = false;
  state.answers = { p1: [], p2: [], p3: [], p4: [], p5: [] };

  const deptEl = document.getElementById('departament');
  const emailEl = document.getElementById('email-contacte');
  const procEl = document.getElementById('proces');
  const primerAgentEl = document.getElementById('primer-agent');

  if (deptEl) deptEl.value = '';
  if (emailEl) emailEl.value = '';
  if (procEl) procEl.value = '';
  if (primerAgentEl) primerAgentEl.checked = false;

  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.warn("Error en esborrar localStorage:", e);
  }

  goToStep(0);
}

// Navegació ràpida amb la tecla ENTER
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON')) return;

    const visibleStep = document.querySelector('.step-card:not(.hidden)');
    if (!visibleStep) return;

    const stepId = visibleStep.id;

    if (stepId === 'step-0') {
      e.preventDefault();
      submitContext();
    } else if (stepId.startsWith('step-') && stepId !== 'step-result') {
      const qNum = parseInt(stepId.replace('step-', ''), 10);
      if (qNum >= 1 && qNum < 5) {
        e.preventDefault();
        nextQuestion(qNum);
      } else if (qNum === 5) {
        e.preventDefault();
        calculateResult();
      }
    }
  }
});