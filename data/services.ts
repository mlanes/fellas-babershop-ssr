import type { Service } from '~/types/service'

/**
 * Complete service data for Fellas Barbershop
 */
export const services: Service[] = [
  {
    id: 'combo-premium',
    name: 'Combo Premium',
    description: 'Experiência completa de cuidado e bem-estar',
    icon: 'checkmark',
    detailedDescription:
      'O Combo Premium é uma experiência completa de cuidado e bem-estar. Inclui: Corte de cabelo personalizado, Design de barba com barboterapia, toalha quente e ozono, Terapia facial, Massagem relaxante, Sobrancelhas modeladas. E, à sua escolha: depilação de orelha e nariz ou hidratação capilar. Tudo pensado para proporcionar relaxamento profundo, pele saudável e uma barba impecável, sem irritações.',
    price: '€32',
    duration: '60min',
  },
  {
    id: 'haircut',
    name: 'Corte',
    description: 'Corte de cabelo 100% personalizado',
    icon: 'checkmark',
    detailedDescription:
      'Corte de cabelo 100% personalizado, com estilo ajustado ao seu perfil e necessidade.',
    price: '€17',
    duration: '30min',
  },
  {
    id: 'haircut-beard',
    name: 'Corte e Barba',
    description: 'Corte e barba personalizados',
    icon: 'checkmark',
    detailedDescription: 'Corte de cabelo e barba alinhados para um visual impecável.',
    price: '€22',
    duration: '60min',
  },
  {
    id: 'barbotherapy',
    name: 'Barboterapia',
    description: 'Tratamento completo para barba',
    icon: 'checkmark',
    detailedDescription:
      'Barba tratada com toalha quente, ozono, terapia facial e massagem. Ideal para peles sensíveis e relaxamento profundo.',
    price: '€16',
    duration: '30min',
  },
  {
    id: 'beard-premium',
    name: 'Barba Premium',
    description: 'Barba com toalha quente e massagem',
    icon: 'checkmark',
    detailedDescription:
      'Barba alinhada com toalha quente e massagem facial relaxante cuidado e sofisticação para o seu rosto.',
    price: '€13',
    duration: '30min',
  },
  {
    id: 'beard-simple',
    name: 'Barba Simples',
    description: 'Alinhamento básico da barba',
    icon: 'checkmark',
    detailedDescription: 'Alinhamento básico da barba (linha), ideal para manutenção e definição.',
    price: '€9',
    duration: '30min',
  },
  {
    id: 'haircut-beard-eyebrows',
    name: 'Corte, Barba e Sobrancelhas',
    description: 'Pacote completo de grooming',
    icon: 'checkmark',
    detailedDescription:
      'Corte de cabelo sob medida, barba bem alinhada e sobrancelhas definidas  tudo para um visual impecável.',
    price: '€25',
    duration: '60min',
  },
  {
    id: 'haircut-barbotherapy',
    name: 'Corte e Barboterapia',
    description: 'Corte com tratamento relaxante',
    icon: 'checkmark',
    detailedDescription:
      'Corte personalizado + barboterapia com toalha quente, ozono e terapia facial para um cuidado completo e relaxante.',
    price: '€26',
    duration: '60min',
  },
  {
    id: 'haircut-beard-premium',
    name: 'Corte, Barba Premium',
    description: 'Corte com barba premium',
    icon: 'checkmark',
    detailedDescription:
      'Corte personalizado com barba premium, incluindo toalha quente e massagem facial.',
    price: '€24',
    duration: '60min',
  },
  {
    id: 'beard-fade',
    name: 'Barba com Degrade',
    description: 'Barba com degradê profissional',
    icon: 'checkmark',
    detailedDescription: 'Barba modelada com degradê suave ou marcante, conforme seu estilo.',
    price: '€11',
    duration: '30min',
  },
  {
    id: 'beard-fade-contour',
    name: 'Barba Degrade e Contorno do Cabelo',
    description: 'Barba com degradê e contorno',
    icon: 'checkmark',
    detailedDescription:
      'Barba com degradê e contorno capilar para um acabamento detalhado e bem definido.',
    price: '€14',
    duration: '30min',
  },
  {
    id: 'hair-contour',
    name: 'Contorno do Cabelo',
    description: 'Acabamento e definição capilar',
    icon: 'checkmark',
    detailedDescription: 'Contorno e acabamento do cabelo para um visual limpo e definido.',
    price: '€6',
    duration: '30min',
  },
  {
    id: 'eyebrows',
    name: 'Sobrancelhas',
    description: 'Modelagem de sobrancelhas',
    icon: 'checkmark',
    detailedDescription:
      'Modelagem das sobrancelhas para valorizar o olhar com simetria e precisão.',
    price: '€6',
    duration: '30min',
  },
  {
    id: 'head-shave',
    name: 'Raspar Cabeça',
    description: 'Corte rente com máquina',
    icon: 'checkmark',
    detailedDescription:
      'Corte apenas com 1 pente da máquina, ideal para quem procura praticidade e estilo limpo.',
    price: '€11',
    duration: '30min',
  },
  {
    id: 'head-shave-beard',
    name: 'Raspar Cabeça e Barba',
    description: 'Cabeça raspada com barba alinhada',
    icon: 'checkmark',
    detailedDescription:
      'Raspar a cabeça (não inclui degrade), lavagem opcional. Barba com ajuste de tamanho, volume, degradê com máquina, contornos com navalha e pós-barba revitalizante.',
    price: '€19',
    duration: '60min',
  },
  {
    id: 'hair-hydration',
    name: 'Hidratação Capilar',
    description: 'Tratamento nutritivo para cabelo',
    icon: 'checkmark',
    detailedDescription: 'Tratamento nutritivo que recupera o brilho, a maciez e a saúde dos fios.',
    price: '€11',
    duration: '30min',
  },
  {
    id: 'beard-hydration',
    name: 'Hidratação Barba',
    description: 'Hidratação profunda para barba',
    icon: 'checkmark',
    detailedDescription: 'Tratamento de hidratação para deixar a barba mais macia e saudável.',
    price: '€7',
    duration: '30min',
  },
  {
    id: 'facial-cleansing',
    name: 'Limpeza Facial',
    description: 'Esfoliação e hidratação facial',
    icon: 'checkmark',
    detailedDescription:
      'Esfoliação e hidratação profunda para remover impurezas e revitalizar a pele.',
    price: '€11',
    duration: '30min',
  },
  {
    id: 'hair-pigmentation',
    name: 'Pigmentação de Cabelo',
    description: 'Coloração com tinta base água',
    icon: 'checkmark',
    detailedDescription:
      'A pigmentação de cabelo com tinta à base de água é um serviço que escurece ou uniformiza a cor dos fios. Ideal para cobrir fios brancos, preencher falhas ou alterar a tonalidade do cabelo.',
    price: '€16',
    duration: '30min',
  },
  {
    id: 'beard-pigmentation',
    name: 'Pigmentação de Barba',
    description: 'Coloração para barba',
    icon: 'checkmark',
    detailedDescription:
      'Coloração da barba para corrigir falhas, uniformizar a cor e realçar o visual.',
    price: '€11',
    duration: '30min',
  },
  {
    id: 'nose-waxing',
    name: 'Depilação Nariz',
    description: 'Remoção de pelos do nariz',
    icon: 'checkmark',
    detailedDescription: 'Remoção higiênica e discreta dos pelos do nariz.',
    price: '€6',
    duration: '30min',
  },
  {
    id: 'waxing-combo',
    name: 'Depilação Combo (Nariz e Orelha)',
    description: 'Depilação completa',
    icon: 'checkmark',
    detailedDescription:
      'Remoção dos pelos indesejados de forma higiênica e discreta, promovendo limpeza e estética.',
    price: '€11',
    duration: '30min',
  },
  {
    id: 'haircut-student',
    name: 'Corte (Estudante)',
    description: 'Corte especial para estudantes',
    icon: 'checkmark',
    detailedDescription:
      'Corte personalizado com valor especial para estudantes, sem abrir mão do estilo. (Obrigatória apresentação do cartão de estudante válido)',
    price: '€15',
    duration: '30min',
  },
  {
    id: 'haircut-beard-student',
    name: 'Corte e Barba (Estudante)',
    description: 'Combo estudante',
    icon: 'checkmark',
    detailedDescription:
      'Corte e barba alinhados, pensado para estudantes que procuram praticidade e visual moderno.',
    price: '€20',
    duration: '60min',
  },
  {
    id: 'sealant',
    name: 'Selante',
    description: 'Tratamento selante capilar',
    icon: 'checkmark',
    detailedDescription:
      'Tratamento que sela os fios, reduz o frizz e proporciona brilho e proteção prolongada.',
    price: '€50',
    duration: '60min',
  },
  {
    id: 'haircut-beard-sealant',
    name: 'Corte, Barba e Selante',
    description: 'Combo premium com selante',
    icon: 'checkmark',
    detailedDescription:
      'Corte e barba personalizados com finalização em selante para brilho, proteção e durabilidade.',
    price: '€70',
    duration: '90min',
  },
  {
    id: 'botox',
    name: 'Botox',
    description: 'Tratamento capilar botox',
    icon: 'checkmark',
    detailedDescription: 'Tratamento de botox capilar para reconstrução e revitalização dos fios.',
    price: '€25',
    duration: '30min',
  },
  {
    id: 'highlights',
    name: 'Luzes',
    description: 'Coloração fio a fio',
    icon: 'checkmark',
    detailedDescription:
      'Técnica de coloração fio a fio para criar efeitos de luzes naturais e modernas.',
    price: '€60',
    duration: '120min',
  },
  {
    id: 'platinum',
    name: 'Platinado',
    description: 'Descoloração capilar',
    icon: 'checkmark',
    detailedDescription:
      'Descoloração capilar para atingir tons claros e modernos, marcante e atual.',
    price: '€70',
    duration: '120min',
  },
]
