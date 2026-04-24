/* ===========================
   AcheiDoc — Dados Simulados
   =========================== */

function createDocMockImage(typeLabel, toneA, toneB) {
  var safeLabel = String(typeLabel || 'Documento').replace(/[&<>]/g, '');
  var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 520'>" +
    "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
    "<stop offset='0%' stop-color='" + toneA + "'/>" +
    "<stop offset='100%' stop-color='" + toneB + "'/>" +
    "</linearGradient></defs>" +
    "<rect width='800' height='520' rx='28' fill='url(%23g)'/>" +
    "<rect x='36' y='36' width='728' height='448' rx='24' fill='rgba(255,255,255,0.88)'/>" +
    "<rect x='72' y='88' width='196' height='236' rx='18' fill='rgba(18,48,95,0.12)'/>" +
    "<rect x='300' y='102' width='264' height='22' rx='11' fill='rgba(18,48,95,0.18)'/>" +
    "<rect x='300' y='146' width='344' height='16' rx='8' fill='rgba(18,48,95,0.12)'/>" +
    "<rect x='300' y='184' width='304' height='16' rx='8' fill='rgba(18,48,95,0.12)'/>" +
    "<rect x='72' y='360' width='572' height='18' rx='9' fill='rgba(18,48,95,0.1)'/>" +
    "<rect x='72' y='396' width='412' height='18' rx='9' fill='rgba(18,48,95,0.1)'/>" +
    "<text x='300' y='286' font-size='42' font-family='Arial, sans-serif' font-weight='700' fill='%2312305f'>" + safeLabel + "</text>" +
    "<text x='404' y='288' transform='rotate(-24 404 288)' text-anchor='middle' font-size='62' font-family='Arial, sans-serif' font-weight='700' fill='rgba(18,48,95,0.12)'>ACHEIDOC</text>" +
    "</svg>";
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

var STORAGE_KEYS = {
  documentos: 'acheidoc_documentos',
  pagamentos: 'acheidoc_pagamentos'
};

const DOCUMENTOS = [
  {
    id: 'DOC-2026-000001',
    tipo: 'Bilhete de Identidade',
    nomeCompleto: 'Carlos Alberto Mendes Ferreira',
    nomeParcial: 'Carlos A*** F*****',
    foto: createDocMockImage('Bilhete de Identidade', '#dbeafe', '#bfdbfe'),
    localEncontrado: 'Largo do Kinaxixi, Luanda',
    localParcial: 'Largo do ***, Luanda',
    dataCriacao: '2026-04-20',
    status: 'PUBLICADO',
    risco: 'BAIXO',
    taxaKz: 500,
    pontoEntregaId: 1,
    encontradoPor: 'Paulo Fernando Mateus',
    contactoEncontrador: '+244 923 888 111'
  },
  {
    id: 'DOC-2026-000002',
    tipo: 'Carta de Condução',
    nomeCompleto: 'Maria Isabel Neto Cardoso',
    nomeParcial: 'Maria I*** C*****',
    foto: createDocMockImage('Carta de Conducao', '#fde68a', '#f59e0b'),
    localEncontrado: 'Av. 4 de Fevereiro, Luanda',
    localParcial: 'Av. *** de Fevereiro, Luanda',
    dataCriacao: '2026-04-21',
    status: 'AGUARDANDO_ENTREGA',
    risco: 'MEDIO',
    taxaKz: 500,
    pontoEntregaId: 2,
    encontradoPor: 'Helena Gouveia',
    contactoEncontrador: '+244 912 400 210'
  },
  {
    id: 'DOC-2026-000003',
    tipo: 'Passaporte',
    nomeCompleto: 'João Paulo Silva Domingos',
    nomeParcial: 'João P*** D*****',
    foto: createDocMockImage('Passaporte', '#fecaca', '#f97316'),
    localEncontrado: 'Aeroporto Internacional 4 de Fevereiro',
    localParcial: 'Aeroporto ***, Luanda',
    dataCriacao: '2026-04-19',
    status: 'PENDENTE',
    risco: 'ALTO',
    taxaKz: 1000,
    pontoEntregaId: 1,
    encontradoPor: 'Marta Ines Kassoma',
    contactoEncontrador: '+244 934 111 908'
  },
  {
    id: 'DOC-2026-000004',
    tipo: 'Cartão Bancário',
    nomeCompleto: 'Ana Beatriz Lopes Teixeira',
    nomeParcial: 'Ana B*** T*****',
    foto: createDocMockImage('Cartao Bancario', '#ddd6fe', '#a78bfa'),
    localEncontrado: 'Shopping Belas, Luanda',
    localParcial: 'Shopping ***, Luanda',
    dataCriacao: '2026-04-22',
    status: 'DISPONIVEL_LEVANTAMENTO',
    risco: 'BAIXO',
    taxaKz: 500,
    pontoEntregaId: 3,
    encontradoPor: 'Luis António Neves',
    contactoEncontrador: '+244 945 333 222'
  },
  {
    id: 'DOC-2026-000005',
    tipo: 'Bilhete de Identidade',
    nomeCompleto: 'Pedro António Gomes Nkosi',
    nomeParcial: 'Pedro A*** N****',
    foto: createDocMockImage('Bilhete de Identidade', '#dcfce7', '#86efac'),
    localEncontrado: 'Mercado do Rocha Pinto, Viana',
    localParcial: 'Mercado ***, Viana',
    dataCriacao: '2026-04-18',
    status: 'ENTREGUE',
    risco: 'BAIXO',
    taxaKz: 500,
    pontoEntregaId: 2,
    encontradoPor: 'Sonia Patrícia Cabral',
    contactoEncontrador: '+244 922 555 010'
  }
];

const PONTOS_ENTREGA = [
  {
    id: 1,
    nome: 'Loja AcheiDoc — Maianga',
    endereco: 'Rua Rainha Ginga, Nº 45, Maianga, Luanda',
    horario: 'Seg–Sex: 08h–18h | Sáb: 09h–14h',
    telefone: '+244 923 456 789',
    agente: 'Agente Manuel Sebastião'
  },
  {
    id: 2,
    nome: 'Ponto AcheiDoc — Viana',
    endereco: 'Av. do Trabalhador, Nº 12, Viana, Luanda',
    horario: 'Seg–Sex: 08h–17h | Sáb: 09h–13h',
    telefone: '+244 912 345 678',
    agente: 'Agente Filomena Dias'
  },
  {
    id: 3,
    nome: 'Ponto AcheiDoc — Cacuaco',
    endereco: 'Rua Principal, Nº 8, Cacuaco, Luanda',
    horario: 'Seg–Sex: 08h–17h',
    telefone: '+244 934 567 890',
    agente: 'Agente Domingos Carvalho'
  }
];

const AGENTES = [
  {
    id: 1,
    nome: 'Manuel Sebastião',
    email: 'agente@acheidoc.ao',
    senha: '1234',
    pontoId: 1,
    pontos: 340,
    status: 'ATIVO',
    ultimaActividade: '2026-04-24'
  },
  {
    id: 2,
    nome: 'Filomena Dias',
    email: 'filomena@acheidoc.ao',
    senha: '1234',
    pontoId: 2,
    pontos: 210,
    status: 'ATIVO',
    ultimaActividade: '2026-04-23'
  }
];

const ADMIN = [
  { id: 1, nome: 'Administrador', email: 'admin@acheidoc.ao', senha: 'admin123' }
];

const HISTORICO_PONTOS = [
  { data: '2026-04-20', acao: 'Documento entregue', docId: 'DOC-2026-000005', pontos: +60 },
  { data: '2026-04-18', acao: 'Documento recebido', docId: 'DOC-2026-000003', pontos: +10 },
  { data: '2026-04-15', acao: 'Documento entregue', docId: 'DOC-2026-000001', pontos: +60 }
];

const CODIGOS_RESGATE = {
  'DOC-2026-000001': 'AB12CD',
  'DOC-2026-000002': 'XY34ZW',
  'DOC-2026-000004': 'MN56PQ'
};

const CHAVES_ENTREGA = {
  'DOC-2026-000001': 'RC11PT',
  'DOC-2026-000002': 'VG24LU',
  'DOC-2026-000004': 'NX08CA'
};

/* ──────────────────────────────────────────────
   PAGAMENTOS — PayPay (Entidade + Referência)
   Entidade fixa: 00282
   Referência única por transacção (9 dígitos)
   ────────────────────────────────────────────── */
const PAYPAY_ENTIDADE = '00282';

const PAGAMENTOS = [
  {
    id: 'PAG-2026-0001',
    docId: 'DOC-2026-000001',
    utilizador: 'Carlos Alberto Ferreira',
    email: 'carlos@gmail.com',
    tipoDoc: 'Bilhete de Identidade',
    valor: 500,
    entidade: PAYPAY_ENTIDADE,
    referencia: '100 201 301',
    status: 'PAGO',
    dataCriacao: '2026-04-20',
    dataPagamento: '2026-04-20'
  },
  {
    id: 'PAG-2026-0002',
    docId: 'DOC-2026-000002',
    utilizador: 'Maria Isabel Neto Cardoso',
    email: 'maria@gmail.com',
    tipoDoc: 'Carta de Condução',
    valor: 500,
    entidade: PAYPAY_ENTIDADE,
    referencia: '100 201 302',
    status: 'PENDENTE',
    dataCriacao: '2026-04-21',
    dataPagamento: null
  },
  {
    id: 'PAG-2026-0003',
    docId: 'DOC-2026-000003',
    utilizador: 'João Paulo Silva Domingos',
    email: 'joao.domingos@gmail.com',
    tipoDoc: 'Passaporte',
    valor: 1000,
    entidade: PAYPAY_ENTIDADE,
    referencia: '100 201 303',
    status: 'PENDENTE',
    dataCriacao: '2026-04-19',
    dataPagamento: null
  },
  {
    id: 'PAG-2026-0004',
    docId: 'DOC-2026-000004',
    utilizador: 'Ana Beatriz Lopes Teixeira',
    email: 'ana.teixeira@gmail.com',
    tipoDoc: 'Cartão Bancário',
    valor: 500,
    entidade: PAYPAY_ENTIDADE,
    referencia: '100 201 304',
    status: 'PAGO',
    dataCriacao: '2026-04-22',
    dataPagamento: '2026-04-22'
  },
  {
    id: 'PAG-2026-0005',
    docId: 'DOC-2026-000005',
    utilizador: 'Pedro António Gomes Nkosi',
    email: 'pedro.nkosi@gmail.com',
    tipoDoc: 'Bilhete de Identidade',
    valor: 500,
    entidade: PAYPAY_ENTIDADE,
    referencia: '100 201 305',
    status: 'PAGO',
    dataCriacao: '2026-04-18',
    dataPagamento: '2026-04-18'
  }
];

const UTILIZADORES = [
  {
    id: 1,
    nome: 'Carlos Alberto Ferreira',
    email: 'carlos@gmail.com',
    senha: '1234',
    telefone: '+244 923 111 222',
    municipio: 'Luanda',
    dataCadastro: '2026-01-15',
    status: 'ATIVO',
    pontos: 120,
    documentosPublicados: ['DOC-2026-000001'],
    documentosResgatados: []
  },
  {
    id: 2,
    nome: 'Maria Isabel Cardoso',
    email: 'maria@gmail.com',
    senha: '1234',
    telefone: '+244 912 333 444',
    municipio: 'Viana',
    dataCadastro: '2026-02-20',
    status: 'ATIVO',
    pontos: 60,
    documentosPublicados: [],
    documentosResgatados: ['DOC-2026-000002']
  }
];

// Utilitários

function getStatusLabel(status) {
  const map = {
    'PENDENTE': 'Pendente',
    'CORRECAO_SOLICITADA': 'Correcao Solicitada',
    'PUBLICADO': 'Publicado',
    'AGUARDANDO_ENTREGA': 'Aguardando Entrega',
    'DISPONIVEL_LEVANTAMENTO': 'Disponível p/ Levantamento',
    'ENTREGUE': 'Entregue',
    'REJEITADO': 'Rejeitado'
  };
  return map[status] || status;
}

function getStatusBadgeClass(status) {
  const map = {
    'PENDENTE': 'badge-pendente',
    'CORRECAO_SOLICITADA': 'badge-aguardando',
    'PUBLICADO': 'badge-publicado',
    'AGUARDANDO_ENTREGA': 'badge-aguardando',
    'DISPONIVEL_LEVANTAMENTO': 'badge-disponivel',
    'ENTREGUE': 'badge-entregue',
    'REJEITADO': 'badge-rejeitado'
  };
  return map[status] || 'badge-pendente';
}

function getRiscoLabel(risco) {
  const map = { 'ALTO': 'Alto Risco', 'MEDIO': 'Médio Risco', 'BAIXO': 'Baixo Risco' };
  return map[risco] || risco;
}

function getRiscoBadgeClass(risco) {
  const map = { 'ALTO': 'badge-risco-alto', 'MEDIO': 'badge-risco-medio', 'BAIXO': 'badge-risco-baixo' };
  return map[risco] || '';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function buildDocCard(doc, basePath) {
  const statusClass = getStatusBadgeClass(doc.status);
  const statusLabel = getStatusLabel(doc.status);
  const detalhesUrl = (basePath || '') + 'detalhes.html?id=' + doc.id;
  return `
    <div class="card-doc">
      <div class="card-doc-img">
        <img src="${doc.foto}" alt="${doc.tipo}" loading="lazy">
        <div class="card-doc-watermark"><span>Marca D'Água</span></div>
      </div>
      <div class="card-doc-body">
        <div class="card-doc-title">${doc.tipo}</div>
        <div class="card-doc-meta">👤 ${doc.nomeParcial}</div>
        <div class="card-doc-meta">📍 ${doc.localParcial}</div>
        <div class="card-doc-meta">📅 ${formatDate(doc.dataCriacao)}</div>
      </div>
      <div class="card-doc-footer">
        <span class="badge ${statusClass}">${statusLabel}</span>
        <a href="${detalhesUrl}" class="btn btn-primary btn-sm">Ver Detalhes</a>
      </div>
    </div>
  `;
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function getStoredCollection(storageKey, fallbackData) {
  var fromStorage = null;

  try {
    fromStorage = JSON.parse(localStorage.getItem(storageKey) || 'null');
  } catch (error) {
    fromStorage = null;
  }

  if (Array.isArray(fromStorage) && fromStorage.length) {
    return fromStorage;
  }

  var seeded = cloneData(fallbackData);
  try {
    localStorage.setItem(storageKey, JSON.stringify(seeded));
  } catch (error) {
    return cloneData(fallbackData);
  }

  return seeded;
}

function saveStoredCollection(storageKey, data) {
  localStorage.setItem(storageKey, JSON.stringify(data));
  return data;
}

function getDocumentosData() {
  return getStoredCollection(STORAGE_KEYS.documentos, DOCUMENTOS);
}

function saveDocumentosData(documentos) {
  return saveStoredCollection(STORAGE_KEYS.documentos, documentos);
}

function getPagamentosData() {
  return getStoredCollection(STORAGE_KEYS.pagamentos, PAGAMENTOS);
}

function savePagamentosData(pagamentos) {
  return saveStoredCollection(STORAGE_KEYS.pagamentos, pagamentos);
}

function updateDocumentoById(docId, patch) {
  var documentos = getDocumentosData().map(function (doc) {
    if (doc.id !== docId) return doc;
    return Object.assign({}, doc, patch);
  });
  saveDocumentosData(documentos);
  return documentos.find(function (doc) { return doc.id === docId; }) || null;
}

function upsertPagamentoRecord(record) {
  var pagamentos = getPagamentosData();
  var existingIndex = pagamentos.findIndex(function (item) {
    return item.id === record.id || item.docId === record.docId;
  });

  if (existingIndex >= 0) {
    pagamentos[existingIndex] = Object.assign({}, pagamentos[existingIndex], record);
  } else {
    pagamentos.unshift(record);
  }

  savePagamentosData(pagamentos);
  return record;
}
