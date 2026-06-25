/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Goal, Objective, Project, Initiative, Task, KPI, KataSession, UserProfile, CtqKanoItem } from './types';

export const DEFAULT_GOALS: Goal[] = [
  {
    id: 'g-1',
    title: 'Hållbarhetsmål',
    description: 'Bli den mest hållbara och CO2-neutrala aktören i branschen genom gröna initiativ.',
    kpi: 'Total CO₂-kontroll & Miljöcertifiering',
    category: 'financial',
    progress: 65,
    deadline: '2026-12-31'
  },
  {
    id: 'g-2',
    title: 'Marknadsledarskap och Tillväxt',
    description: 'Öka den nordiska marknadsandelen och expandera tjänsteportföljen.',
    kpi: 'Nettoomsättning & Marknadsandel',
    category: 'customer',
    progress: 45,
    deadline: '2026-12-31'
  },
  {
    id: 'g-3',
    title: 'Medarbetarnöjdhet och Innovation',
    description: 'Skapa en högpresterande och trivsam innovationskultur där talanger vill stanna.',
    kpi: 'eNPS Index & Innovationsgrad',
    category: 'learning',
    progress: 80,
    deadline: '2026-12-31'
  }
];

export const DEFAULT_OBJECTIVES: Objective[] = [
  {
    id: 'o-1',
    goalId: 'g-1',
    title: 'Minska koldioxidutsläpp med 30% inom 2 år',
    description: 'Reducera det operativa koldioxidavtrycket i produktion och leveranser.',
    kpi: '% utsläppsminskning per kvartal',
    progress: 45,
    deadline: '2027-06-30'
  },
  {
    id: 'o-2',
    goalId: 'g-2',
    title: 'Etablera fysiska kontor i 3 nya nordiska städer',
    description: 'Expandera den lokala närvaron i Oslo, Helsingfors och Köpenhamn.',
    kpi: 'Antal fungerande säljkontor',
    progress: 50,
    deadline: '2026-10-31'
  },
  {
    id: 'o-3',
    goalId: 'g-3',
    title: 'Maximera intern kunskapsöverföring',
    description: 'Öka den genomsnittliga utbildningstiden per anställd till 40 timmar per år.',
    kpi: 'Utbildningstimmar per anställd',
    progress: 75,
    deadline: '2026-09-30'
  }
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'p-1',
    goalId: 'g-1',
    objectiveId: 'o-1',
    title: 'Elektrifiera fordonsflottan',
    description: 'Byt successivt ut alla fossildrivna tjänste- och distributionsfordon mot moderna elbilar.',
    progress: 30,
    deadline: '2026-12-31'
  },
  {
    id: 'p-2',
    goalId: 'g-1',
    objectiveId: 'o-1',
    title: 'Lansera koldioxidsmart produktlinje',
    description: 'Utveckla, testa och certifiera nästa generations biologiskt nedbrytbara produkter.',
    progress: 65,
    deadline: '2026-08-31'
  },
  {
    id: 'p-3',
    goalId: 'g-3',
    objectiveId: 'o-3',
    title: 'Etablera internt kompetenscenter',
    description: 'Lansera ett digitalt utbildningssystem och erbjuda schemalagd kompetensutveckling.',
    progress: 80,
    deadline: '2026-06-30'
  }
];

export const DEFAULT_INITIATIVES: Initiative[] = [
  {
    id: 'i-1',
    projectId: 'p-1',
    title: 'Utforska och utvärdera elbilstillverkare',
    description: 'Testköra bilar och analysera fordonsdata, garantiavtal och leveranstider.',
    kpi: 'Analysrapport skickad till ledningen',
    progress: 60
  },
  {
    id: 'i-2',
    projectId: 'p-1',
    title: 'Bygga laddinfrastruktur vid distributionsdepåer',
    description: 'Säkra nätkapacitet och installera smarta tidsstyrda snabbladdare.',
    kpi: 'Procentuell färdigställandegrad av laddstationer',
    progress: 20
  },
  {
    id: 'i-3',
    projectId: 'p-2',
    title: 'Grönt materialval och livscykelanalys',
    description: 'Skapa en detaljerad analys av råvarornas koldioxidavtryck från ax till limpa.',
    kpi: 'Miljödeklaration (EPD) tillgänglig',
    progress: 90
  }
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: 't-1',
    projectId: 'p-1',
    initiativeId: 'i-1',
    title: 'Boka och genomföra möte med billeverantör A',
    completed: true,
    kpi: 'Möte avklarat',
    progress: 100
  },
  {
    id: 't-2',
    projectId: 'p-1',
    initiativeId: 'i-1',
    title: 'Jämföra batterikapacitet och räckviddsgarantier',
    completed: false,
    kpi: 'Jämförelseark sammanställt',
    progress: 0
  },
  {
    id: 't-3',
    projectId: 'p-1',
    initiativeId: 'i-2',
    title: 'Skicka in ansökan om elnätsanslutning till nätägaren',
    completed: true,
    kpi: 'Godkänd ansökan mottagen',
    progress: 100
  },
  {
    id: 't-4',
    projectId: 'p-2',
    initiativeId: 'i-3',
    title: 'Boka intervjuer till fokusgrupper med miljöprofil',
    completed: true,
    kpi: 'Intervjutider schemalagda',
    progress: 100
  },
  {
    id: 't-5',
    projectId: 'p-3',
    title: 'Skapa och strukturera kurskatalog i det nya LMS-systemet',
    completed: false,
    kpi: 'Milstolpe godkänd',
    progress: 30
  }
];

export const DEFAULT_KPIS: KPI[] = [
  {
    id: 'k-1',
    title: 'Koldioxidutsläpp (Reduktion)',
    value: '-18%',
    target: '-30%',
    progress: 60,
    deadline: '12 månader',
    category: 'financial'
  },
  {
    id: 'k-2',
    title: 'Nordisk Marknadsandel',
    value: '+5%',
    target: '+15%',
    progress: 33,
    deadline: '6 månader',
    category: 'customer'
  },
  {
    id: 'k-3',
    title: 'Medarbetarnöjdhet (eNPS)',
    value: '+42',
    target: '+50',
    progress: 84,
    deadline: '9 månader',
    category: 'learning'
  },
  {
    id: 'k-4',
    title: 'Leveransprecision i logistikkedjan',
    value: '96.2%',
    target: '99.0%',
    progress: 96,
    deadline: 'Löpande',
    category: 'process'
  }
];

export const DEFAULT_KATA_SESSIONS: KataSession[] = [
  {
    id: 'ka-1',
    title: 'Elektrifiering av lastbilsflotta',
    date: '2026-05-15',
    goal: 'Uppnå full laddkapacitet för tre tunga fordon på distributionscentralen vid årsskiftet.',
    current: 'Inga installerade laddstationer finns ännu, fordon laddas i externa nät vilket är ineffektivt.',
    obstacles: 'Fastighetens inkommande kablar klarar inte den spikaffekt som krävs för tunga fordon i drift.',
    nextStep: 'Beställa mätning av effektuttag under belastningstoppar och utreda lokal batterilagring.',
    learnings: 'Lokal batteribuffert kan halvera behovet av dyr uppgradering av elnätsabonnemanget.',
    progress: 70
  },
  {
    id: 'ka-2',
    title: 'Öka eNPS via mer flexibelt hybridarbete',
    date: '2026-04-02',
    goal: 'Införa ett flexibelt hybridkontrakt som presterar lika bra som förut men ökar välbefinnandet.',
    current: 'Strikta krav på kontorsnärvaro 5 dagar i veckan, vilket möter motstånd och minskar nöjdheten.',
    obstacles: 'Vissa chefer saknar verktyg och riktlinjer för att mäta leveransbaserat resultat på distans.',
    nextStep: 'Utföra ett fyraveckors pilotprogram med 2 valfria hemdagar per vecka i två team.',
    learnings: 'När vi fokuserar på överenskomna sprintleveranser istället för närvarotimmar ökar eNPS utan produktivitetstapp.',
    progress: 90
  }
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Admin Användare',
  email: 'admin@foretaget.se',
  role: 'Administratör',
  language: 'Svenska',
  dateFormat: 'YYYY-MM-DD',
  notificationFrequency: 'Dagligen'
};

export const DEFAULT_CTQ_KANO: CtqKanoItem[] = [
  {
    id: 'ck-1',
    voc: 'Jag vill veta att mina strategiska mål sparas säkert utan att datan försvinner vid uppdatering av sidan.',
    driver: 'Dataintegritet och automatisk synk',
    specification: '100% automatisk synkning till Firestore/LocalStorage med visuell statusindikator.',
    kanoCategory: 'Must-be',
    functionalScore: 4,
    dysfunctionalScore: 1,
    priority: 'High',
    associatedGoalId: 'g-1'
  },
  {
    id: 'ck-2',
    voc: 'Systemet måste ladda snabbt, särskilt när vi analyserar värdeflödesanalyser eller stora mätetal.',
    driver: 'Prestanda och användbarhet',
    specification: 'Svarstid för laddning av KPI- dashboards under 1.5 sekunder.',
    kanoCategory: 'One-dimensional',
    functionalScore: 5,
    dysfunctionalScore: 2,
    priority: 'Medium'
  },
  {
    id: 'ck-3',
    voc: 'Jag skulle älska om systemet kunde analysera våra framsteg automatiskt och ge intelligenta förbättringsförslag.',
    driver: 'Intelligent beslutsstöd',
    specification: 'Integrerad AI-analysmodul som rekommenderar konkreta åtgärder baserat på målutfall.',
    kanoCategory: 'Attractive',
    functionalScore: 5,
    dysfunctionalScore: 3,
    priority: 'High',
    associatedGoalId: 'g-3',
    associatedProjectId: 'p-3'
  },
  {
    id: 'ck-4',
    voc: 'Färgteman på gränssnittet bör anpassas automatiskt efter tid på dygnet så det är skonsamt för ögonen.',
    driver: 'Visuell ergonomi',
    specification: 'Manuella eller automatiska mörkt/ljust tema switchar som ändrar hela färgschemat.',
    kanoCategory: 'Attractive',
    functionalScore: 4,
    dysfunctionalScore: 3,
    priority: 'Low'
  }
];

