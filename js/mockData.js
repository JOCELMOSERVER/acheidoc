/* ===========================
   AcheiDoc — Dados Simulados
   =========================== */

const DOCUMENTOS = [
  {
    id: 'DOC-2026-000001',
    tipo: 'Bilhete de Identidade',
    nomeCompleto: 'Carlos Alberto Mendes Ferreira',
    nomeParcial: 'Carlos A*** F*****',
    foto: 'https://via.placeholder.com/300x200?text=BI+%5BMarca+D%27Agua%5D',
    localEncontrado: 'Largo do Kinaxixi, Luanda',
    localParcial: 'Largo do ***, Luanda',
    dataCriacao: '2026-04-20',
    status: 'PUBLICADO',
    risco: 'BAIXO',
    taxaKz: 500,
    pontoEntregaId: 1
  },
  {
    id: 'DOC-2026-000002',
    tipo: 'Carta de Condução',
    nomeCompleto: 'Maria Isabel Neto Cardoso',
    nomeParcial: 'Maria I*** C*****',
    foto: 'https://via.placeholder.com/300x200?text=CC+%5BMarca+D%27Agua%5D',
    localEncontrado: 'Av. 4 de Fevereiro, Luanda',
    localParcial: 'Av. *** de Fevereiro, Luanda',
    dataCriacao: '2026-04-21',
    status: 'AGUARDANDO_ENTREGA',
    risco: 'MEDIO',
    taxaKz: 500,
    pontoEntregaId: 2
  },
  {
    id: 'DOC-2026-000003',
    tipo: 'Passaporte',
    nomeCompleto: 'João Paulo Silva Domingos',
    nomeParcial: 'João P*** D*****',
    foto: 'https://via.placeholder.com/300x200?text=Passaporte+%5BMarca+D%27Agua%5D',
    localEncontrado: 'Aeroporto Internacional 4 de Fevereiro',
    localParcial: 'Aeroporto ***, Luanda',
    dataCriacao: '2026-04-19',
    status: 'PENDENTE',
    risco: 'ALTO',
    taxaKz: 1000,
    pontoEntregaId: 1
  },
  {
    id: 'DOC-2026-000004',
    tipo: 'Cartão Bancário',
    nomeCompleto: 'Ana Beatriz Lopes Teixeira',
    nomeParcial: 'Ana B*** T*****',
    foto: 'https://via.placeholder.com/300x200?text=Cartao+%5BMarca+D%27Agua%5D',
    localEncontrado: 'Shopping Belas, Luanda',
    localParcial: 'Shopping ***, Luanda',
    dataCriacao: '2026-04-22',
    status: 'DISPONIVEL_LEVANTAMENTO',
    risco: 'BAIXO',
    taxaKz: 500,
    pontoEntregaId: 3
  },
  {
    id: 'DOC-2026-000005',
    tipo: 'Bilhete de Identidade',
    nomeCompleto: 'Pedro António Gomes Nkosi',
    nomeParcial: 'Pedro A*** N****',
    foto: 'https://via.placeholder.com/300x200?text=BI+%5BMarca+D%27Agua%5D',
    localEncontrado: 'Mercado do Rocha Pinto, Viana',
    localParcial: 'Mercado ***, Viana',
    dataCriacao: '2026-04-18',
    status: 'ENTREGUE',
    risco: 'BAIXO',
    taxaKz: 500,
    pontoEntregaId: 2
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
  { id: 1, nome: 'Manuel Sebastião', email: 'agente@acheidoc.ao', senha: '1234', pontoId: 1, pontos: 340 },
  { id: 2, nome: 'Filomena Dias', email: 'filomena@acheidoc.ao', senha: '1234', pontoId: 2, pontos: 210 }
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

const UTILIZADORES = [
  {
    id: 1,
    nome: 'Carlos Alberto Ferreira',
    email: 'carlos@gmail.com',
    senha: '1234',
    telefone: '+244 923 111 222',
    municipio: 'Luanda',
    dataCadastro: '2026-01-15',
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
    pontos: 60,
    documentosPublicados: [],
    documentosResgatados: ['DOC-2026-000002']
  }
];

// Utilitários

function getStatusLabel(status) {
  const map = {
    'PENDENTE': 'Pendente',
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
