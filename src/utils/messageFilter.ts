
// Função para detectar e filtrar dados de contato em mensagens
export const filterContactInfo = (message: string): { filtered: string; isFiltered: boolean } => {
  let filtered = message;
  let isFiltered = false;

  const patterns = [
    // Números de telefone (vários formatos)
    {
      regex: /(\(?\d{2}\)?\s?)?(\d{4,5}[-\s]?\d{4})/g,
      replacement: '🔒 Dados de contato são ocultados. Use o chat seguro da plataforma.'
    },
    // WhatsApp
    {
      regex: /(whats?app?|zap|wpp)/gi,
      replacement: '🔒 Dados de contato são ocultados. Use o chat seguro da plataforma.'
    },
    // Instagram
    {
      regex: /(@\w+|instagram|insta)/gi,
      replacement: '🔒 Dados de contato são ocultados. Use o chat seguro da plataforma.'
    },
    // Email
    {
      regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      replacement: '🔒 Dados de contato são ocultados. Use o chat seguro da plataforma.'
    },
    // Links externos
    {
      regex: /(https?:\/\/[^\s]+|www\.[^\s]+)/g,
      replacement: '🔒 Dados de contato são ocultados. Use o chat seguro da plataforma.'
    },
    // Números genéricos (sequências de 8+ dígitos)
    {
      regex: /\b\d{8,}\b/g,
      replacement: '🔒 Dados de contato são ocultados. Use o chat seguro da plataforma.'
    }
  ];

  patterns.forEach(pattern => {
    const originalLength = filtered.length;
    filtered = filtered.replace(pattern.regex, pattern.replacement);
    if (filtered.length !== originalLength) {
      isFiltered = true;
    }
  });

  return { filtered, isFiltered };
};
