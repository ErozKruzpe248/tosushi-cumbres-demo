'use strict';

const menuCategories = ['Entradas', 'Arroces', 'Rollos especiales', 'Rollos generales', 'Especialidades calientes',
  'Conocedores', 'A la plancha', 'Pokes y ramen', 'Niños', 'Bebidas', 'Postres', 'Extras'];

const samePrice = (price, labels) => labels.map(label => ({ label, price }));
const pricesFor = pairs => pairs.map(([label, price]) => ({ label, price }));
const choice = (id, label, items, { required = true, max = 1 } = {}) => ({
  id, label, required, max, options: items.map(item => Array.isArray(item) ? { label: item[0], price: item[1] } : { label: item, price: 0 }),
});

const rollProteins = ['Pulpo', 'Salmón', 'Cangrejo', 'Marlín', 'California', 'Tampico', 'Piel de salmón', 'Atún', 'Camarón'];
const seafood = ['Cangrejo', 'Pulpo', 'Camarón', 'Salmón', 'Atún'];
const rollExtras = [
  { id: 'mazago', label: 'Aderezo mazago', price: 25 }, { id: 'queso', label: 'Queso extra', price: 12 },
  { id: 'chipotle', label: 'Salsa chipotle', price: 12 }, { id: 'anguila', label: 'Salsa de anguila extra', price: 12 },
  { id: 'soya', label: 'Soya extra', price: 6 }, { id: 'morron', label: 'Salsa morrón', price: 10 },
  { id: 'tartara', label: 'Salsa tártara', price: 12 }, { id: 'chiles', label: 'Chiles toreados', price: 7 },
];
const basicExtras = rollExtras.filter(extra => ['soya', 'anguila'].includes(extra.id)).reverse();
const optional = { required: false };
const filling = choice('relleno', 'Pescado o marisco', [...rollProteins, 'Anguila', 'Mazago']);
const pokeChoices = proteins => [
  choice('base', 'Base', ['Arroz blanco', 'Arroz frito', 'Jícama', 'Mix de lechugas', 'Noodles', 'Noodles de pepino']),
  choice('proteina', 'Proteína', proteins),
  choice('vegetales', 'Vegetales', ['Aguacate', 'Apio', 'Brócoli', 'Calabaza asada', 'Cebolla', 'Cebolla morada',
    'Cebollín', 'Edamames', 'Elote', 'Germen de soya', 'Jengibre', 'Jícama', 'Lechuga orejona', 'Mango', 'Morrón',
    'Pepino', 'Pimiento rojo', 'Piña', 'Plátano frito', 'Tomate cherry', 'Zanahoria'], { required: false, max: 4 }),
  choice('toppings', 'Toppings', ['Ajonjolí blanco', 'Ajonjolí negro', 'Alga nori', 'Brotes tempura', 'Cacahuate',
    'Cebolla caramelizada', 'Cebolla crujiente', 'Chile toreado', 'Chile tostado', 'Cilantro', 'Piel de salmón crujiente',
    'Furikake', 'Jengibre gari', 'Queso crema', 'Shiitake', 'Tampico', 'Togarashi', 'Wonton frito'], { required: false, max: 2 }),
  choice('salsa', 'Salsa', ['Anguila', 'Ajonjolí', 'Cacahuate', 'Chamoy', 'Chipotle', 'Habanero', 'Morrón', 'Ponzu',
    'Sriracha', 'Tare', 'Tártara', 'Wasabi']),
];

function menuItems(category, rows) {
  return rows.map(([id, name, amount, description, settings]) => ({
    id, name, category, description, extras: basicExtras,
    ...(typeof amount === 'number' ? { price: amount } : { options: amount, optionLabel: 'Elige una opción' }),
    ...settings,
  }));
}

function riceOptions(medium, large) {
  return pricesFor([['Mediano', medium], ['Grande', large]]);
}

const plateDescription = 'Verduras salteadas a la plancha, como calabacita, brócoli, champiñones y cebolla cambray.';
const teppanyaki = (id, protein, half, full, description) => [
  `teppanyaki-${id}`, `Teppanyaki de ${protein}`, pricesFor([['Media orden', half], ['Orden', full]]),
  `${plateDescription} ${description}`, { optionLabel: 'Porción' },
];
const spicyRamen = [choice('picante', 'Picante', ['Salsa picante'], optional)];
const ramen = (id, protein, price) => [
  `ramen-${id}`, `Ramen de ${protein}`, price, `Caldo con fideos de arroz, verduras y ${protein.toLowerCase()}.`,
  { groups: spicyRamen, extras: [] },
];
const noExtras = { extras: [] };

const catalog = [
  ...menuItems('Rollos especiales', [
    ['avocado', 'Rollo Avocado Especial', 92, 'Aguacate por fuera. Dentro, pepino, queso crema y el pescado o marisco que elijas.', { featured: true, groups: [filling] }],
  ]),
  ...menuItems('Entradas', [
    ['verduras-tempura', 'Verduras Tempura', 78, 'Verduras capeadas y fritas hasta quedar crujientes.'],
    ['tempura', 'Camarones Tempura', 141, 'Camarones grandes y verduras con capeado crujiente.'],
    ['crab-fritters', 'Crab Fritters', 95, 'Tiras de cangrejo en tempura con aderezo de chipotle.'],
    ['kushiague', 'Kushiague', 90, 'Ocho cubos de queso gouda con panko y salsa de tomate.'],
    ['yakitori', 'Yakitori', 89, 'Tres brochetas de pollo a la plancha con zanahoria, pimientos, teriyaki y shichimi.'],
    ['yakicarne', 'Yakicarne', 112, 'Tres brochetas de rib eye a la plancha con zanahoria, pimientos y teriyaki.'],
    ['camarones-phila', 'Camarones Phila', 141, 'Camarones rellenos de queso crema con verduras tempura.'],
    ['kani-especial', 'Kani Especial', 77, 'Rebanadas de surimi empanizado acompañadas de aderezos.'],
    ['shitakes', 'Shitakes', 115, 'Tres hongos shiitake empanizados y rellenos de pasta de cangrejo.'],
    ['camarones-fuji', 'Camarones Fuji', 121, 'Cinco brochetas de camarón a la plancha con aderezo a elegir.', {
      groups: [choice('aderezo', 'Aderezo', ['Chipotle', 'Tártara'])],
    }],
    ['giosas', 'Giosas', 82, 'Cinco empanadas japonesas de carne y verduras con salsa especial.', {
      groups: [choice('preparacion', 'Preparación', ['Fritas', 'Al vapor'])],
    }],
    ['baby-squid', 'Baby Squid', 89, 'Calamares rellenos de pasta de cangrejo con salsa dulce y shichimi.'],
    ['sunomono', 'Sunomono', samePrice(129, [...seafood, 'Mixto']), 'Ensalada de pepino con limón, vinagre preparado, furikake y tu elección de marisco.', { optionLabel: 'Proteína' }],
    ['ensalada-oriental', 'Ensalada Oriental', 81, 'Mezcla de lechugas y verduras con aderezos de la casa.', {
      groups: [choice('proteina', 'Agrega una proteína', [['Pollo a la plancha', 26], ['Camarones roca', 43], ['Salmón', 43], ['Atún', 43]], optional)],
    }],
    ['egg-roll', 'Egg Roll', 71, 'Tres rollitos orientales de masa crujiente.'],
    ['ebi-egg-roll', 'Ebi Egg Roll', 84, 'Tres rollitos orientales crujientes de camarón.'],
    ['marlin-egg-roll', 'Marlín Egg Roll', 76, 'Tres rollitos orientales crujientes de marlín.'],
    ['camaron-roca', 'Camarón Roca', 141, 'Bocados de camarón tempura con salsa picante.'],
    ['kaisen-ceviche', 'Kaisen Ceviche', 76, 'Camarón, calamar, tomate, aguacate y salsas negras en una concha crujiente de harumaki.'],
    ['gyu-tataky', 'Gyu Tataky', 179, 'Láminas de res selladas con ponzu, cebollín, ajonjolí y togarashi.'],
    ['satzu-sashimi', 'Satzu Sashimi', 119, 'Tres tostadas de harina de arroz con aguacate, verduras, salsa y proteína a elegir.', {
      groups: [choice('proteina', 'Proteína', ['Atún', 'Pulpo', 'Salmón', 'Marlín', 'Camarón', 'Combinado'])],
    }],
    ['edamame', 'Edamame', 83, 'Vainas de soya al vapor con sal de grano.'],
    ['miso-shiro', 'Miso Shiro', 65, 'Caldo de miso con tofu y cebollín.'],
  ]),
  ...menuItems('Arroces', [
    ['gohan', 'Gohan', riceOptions(43, 50), 'Arroz blanco al vapor.', { optionLabel: 'Tamaño' }],
    ['gohan-especial', 'Gohan Especial', riceOptions(62, 76), 'Arroz con pasta de cangrejo y furikake. Puede ser picante.', { optionLabel: 'Tamaño' }],
    ['yakimeshi', 'Yakimeshi', riceOptions(65, 84), 'Arroz frito con pollo, res, verduras, huevo y brotes de soya.', { optionLabel: 'Tamaño' }],
    ['yakimeshi-vegetariano', 'Yakimeshi Vegetariano', riceOptions(59, 74), 'Arroz frito con verduras, huevo y brotes de soya, dorado con mantequilla y soya.', { optionLabel: 'Tamaño' }],
    ['arroz-camarones', 'Yakimeshi con Camarones', riceOptions(74, 96), 'Arroz frito con camarones.', { optionLabel: 'Tamaño' }],
  ]),
  ...menuItems('Rollos especiales', [
    ['chino-roll', 'Chino Roll', 166, 'Mazago por fuera y, dentro, salmón y camarón empanizados, pepino, aguacate, queso crema, cebollín y pasta de cangrejo.'],
    ['arcoiris', 'Rollo Arcoíris', 102, 'Salmón, camarón, mazago y cangrejo por fuera, con pepino, queso crema y aguacate dentro.'],
    ['dosi', 'Rollo Dosi', 105, 'Camarón, mazago y aguacate por fuera, con pasta de cangrejo, queso crema y pepino dentro.'],
    ['pastel', 'Rollo Pastel', 134, 'Cubierta de mazago y relleno de pepino, aguacate, piña y pasta de cangrejo. Lleva ajonjolí, furikake y salsa de anguila.'],
    ['cangrejo-fuera', 'Rollo Cangrejo por Fuera', 86, 'Surimi por fuera, con aguacate, pepino, queso crema y cangrejo dentro.'],
    ['ebi-especial', 'Rollo Ebi Especial', 101, 'Mazago por fuera y camarón tempura, aguacate, queso crema y pepino dentro.'],
    ['jumbo-roll', 'Jumbo Roll', 103, 'Salmón, cangrejo y camarón en tempura con pasta de cangrejo, pepino, aguacate y queso crema.'],
    ['mazago-fuera', 'Rollo Mazago por Fuera', 121, 'Mazago por fuera, con pepino, aguacate, queso crema y el pescado o marisco que elijas.', { groups: [filling] }],
    ['tlc', 'Rollo TLC', 91, 'Alga nori por fuera, con camarón y salmón empanizados, aguacate, mazago, queso crema y pepino.'],
    ['nevado', 'Rollo Nevado', 120, 'Cubierta de queso crema, relleno de pepino y aguacate, y salsa de anguila.'],
    ['fresh', 'Fresh Roll', 92, 'Camarón, pasta Tampico, queso crema y pepino en hoja de lechuga fresca.'],
    ['lomas', 'Rollo Lomas', 87, 'Aguacate por fuera, con piel de salmón tostada, pepino, queso crema y salsa tártara.'],
    ['coral', 'Rollo Coral', 90, 'Camarón empanizado, aguacate y pepino, con queso crema por fuera y pasta Tampico encima.'],
    ['trevi', 'Rollo Trevi', 108, 'Camarón tempura, queso crema, aguacate y pepino, con kanikama y ajonjolí por fuera.'],
    ['dinamita', 'Rollo Dinamita', 90, 'Atún y salmón por fuera, con mazago, queso crema, aguacate, pepino y salsa tártara.'],
    ['alaska', 'Rollo Alaska', 90, 'Pescado empanizado, aguacate y pepino, con queso crema, mazago y salsa tártara.'],
    ['toro-roll', 'Toro Roll', 79, 'Salmón, pepino, aguacate y queso crema, cubiertos de chiles toreados.'],
    ['unagui-especial', 'Rollo Unagui Especial', 207, 'Rollo con anguila, aguacate, pepino, camarón y queso crema.'],
    ['spicy-roll', 'Spicy Roll', 85, 'Salmón, pepino, aguacate y queso crema con salsa sriracha.'],
    ['gouda-roll', 'Gouda Roll', 99, 'Camarón, pepino, aguacate, chile serrano y queso gouda.'],
    ['diana', 'Rollo Diana', 90, 'Pasta de cangrejo por fuera. Dentro lleva pepino, aguacate, queso crema y un pescado o marisco a elegir.', { groups: [filling] }],
    ['salmon-especial', 'Rollo Salmón Especial', 123, 'Salmón por fuera y pepino, aguacate, queso crema y cangrejo por dentro.'],
  ]),
  ...menuItems('Rollos generales', [
    ['rollo-personalizado', 'Arma tu rollo', pricesFor([['Arroz por fuera', 77], ['Alga por fuera', 91]]),
      'Escoge relleno y estilo. Puedes sumar una cubierta, un topping y extras.', {
        optionLabel: 'Estilo', extras: rollExtras,
        groups: [
          choice('relleno', 'Relleno', [...rollProteins, ['Anguila', 21], ['Mazago', 21]]),
          choice('cubierta', 'Cubierta', [['Empanizado', 27], ['Tempura', 17], ['Mazago', 32], ['Aguacate', 17]], optional),
          choice('topping', 'Topping', [['Tampico', 17], ['Roca', 65]], optional),
        ],
      }],
  ]),
  ...menuItems('Especialidades calientes', [
    ['tosushi-especial', 'To Sushi Especial', 159, 'Rollo empanizado de camarón, pulpo y queso crema.'],
    ['apolo', 'Apolo', 126, 'Rollo empanizado con camarón picado, gouda, pulpo y pasta de cangrejo. Puede ser picante.'],
    ['mila-roll', 'Mila Roll', 146, 'Camarón empanizado, cebollín, pasta Tampico, gouda y carne de res.'],
    ['dosi-empanizado', 'Dosi Empanizado', 163, 'Rollo empanizado con camarones enteros por fuera, pulpo y queso crema dentro, y pasta de cangrejo encima.'],
    ['grace', 'Grace', 113, 'Rollo empanizado de camarón, cangrejo y queso crema, con pasta de cangrejo y ajonjolí por fuera.'],
    ['manchego', 'Manchego', 123, 'Rollo empanizado con manchego rallado por fuera y salmón, camarón y pasta Tampico dentro.'],
    ['norteno', 'Norteño', 98, 'Rollo empanizado con pollo, queso crema y chile serrano.'],
    ['empanizado-especial', 'Empanizado Especial', 139, 'Salmón picado por fuera y anguila, pepino, aguacate y queso crema por dentro.'],
    ['cangrejo-tempura', 'Cangrejo Tempura', 95, 'Rollo capeado con cangrejo por fuera y salmón, atún y queso crema dentro.'],
    ['mazago-tempura', 'Mazago Tempura', 133, 'Rollo capeado de salmón y camarón con pasta de cangrejo y mazago.'],
    ['arroz-frito-tempura', 'Arroz Frito Tempura', 149, 'Rollo capeado de arroz frito y queso crema con pasta de cangrejo y salsa de anguila.'],
    ['villa', 'Villa', 133, 'Rollo tempura con arroz frito, camarón y queso crema.'],
    ['vegas', 'Vegas', 105, 'Rollo tempura con salmón por fuera, camarón, pasta Tampico y queso crema, servido con salsa tártara.'],
  ]),
  ...menuItems('Conocedores', [
    ['cono', 'Cono', 71, 'Alga nori rellena de arroz al vapor, aguacate, queso crema, pepino, ajonjolí y tu elección de pescado o marisco.', { groups: [filling] }],
    ['piezas', 'Pieza de sushi', 49, 'Porción de arroz al vapor con pescado o marisco a elegir.', { groups: [filling] }],
    ['sashimi', 'Sashimi', pricesFor([['Corte fino', 196], ['Corte grueso', 239]]), 'Láminas de atún, pulpo o salmón en el corte que prefieras.', {
      optionLabel: 'Corte', groups: [choice('proteina', 'Proteína', ['Atún', 'Pulpo', 'Salmón']), choice('elite', 'Suplemento', [['Elite', 21]], optional)],
    }],
  ]),
  ...menuItems('A la plancha', [
    teppanyaki('pollo', 'Pollo', 89, 141, 'Servido con pollo.'),
    teppanyaki('pescado', 'Pescado', 66, 96, 'Servido con pescado.'),
    ['teppanyaki-7-mares', 'Teppanyaki 7 Mares', pricesFor([['Media orden', 104], ['Orden', 132]]), `${plateDescription} Con una mezcla de mariscos.`, { optionLabel: 'Porción' }],
    teppanyaki('rib-eye', 'Rib Eye', 127, 205, 'Servido con rib eye.'),
    teppanyaki('camaron', 'Camarón', 119, 145, 'Servido con camarón.'),
    teppanyaki('salmon', 'Salmón', 185, 285, 'Servido con salmón.'),
    teppanyaki('atun', 'Atún', 152, 210, 'Servido con atún.'),
    ['teppanyaki-verduras', 'Teppanyaki de Verduras', pricesFor([['Media orden', 64], ['Orden', 103]]), plateDescription, { optionLabel: 'Porción' }],
    ['terigohan', 'Terigohan', pricesFor([['Pollo', 81], ['Carne de res', 92], ['Camarón', 100], ['Mixto', 109], ['Verduras', 74]]),
      'Arroz Calrose al vapor con verduras finas, salsa teriyaki y un toque de shichimi.', { optionLabel: 'Variedad' }],
  ]),
  ...menuItems('Pokes y ramen', [
    ['poke-basico', 'Poke Básico', 105, 'Bowl a tu gusto con base, proteína, vegetales, toppings y salsa.', {
      groups: pokeChoices(['Atún', 'Atún spicy', 'Cangrejo', 'Pollo teriyaki', 'Boneless', 'Salmón', 'Tofu', 'Tofu frito', 'Pescado']), extras: [],
    }],
    ['poke-especial', 'Poke Especial', 135, 'Bowl con proteína especial, base, vegetales, toppings y salsa a elegir.', {
      groups: pokeChoices(['Camarón', 'Camarón empanizado', 'Camarón tempura', 'Kanikama', 'Pulpo', 'Res']), extras: [],
    }],
    ['miso-ramen', 'Miso Ramen', 182, 'Caldo de miso con fideos de arroz, verduras y proteína a elegir.', {
      groups: [choice('proteina', 'Proteína', ['Camarón', 'Cerdo', 'Pescado', 'Pollo', 'Res']), ...spicyRamen], extras: [],
    }],
    ramen('camaron', 'Camarón', 185),
    ramen('cerdo', 'Cerdo', 170),
    ramen('pescado', 'Pescado', 145),
    ramen('pollo', 'Pollo', 145),
    ramen('res', 'Res', 190),
  ]),
  ...menuItems('Niños', [
    ['nuggets', 'Nuggets', 58, 'Bocaditos de pollo empanizados.'],
    ['kushiagues-ninos', 'Kushiagues', 90, 'Bocaditos de queso empanizado para el menú infantil.'],
    ['papas', 'Papas a la Francesa', 38, 'Bastones de papa fritos y dorados.'],
    ['kodomo', 'Kodomo Plate', 90, 'Plato infantil con cuatro rebanadas de sushi, dos nuggets y dos kushiagues.'],
  ]),
  ...menuItems('Bebidas', [
    ['aguas-frescas', 'Aguas Frescas', 35, 'Agua fresca del día. El sabor depende de la disponibilidad.', noExtras],
    ['refrescos', 'Refrescos', samePrice(27, ['Coca-Cola', 'Coca-Cola Light', 'Fanta', 'Joya', 'Sprite']), 'Elige tu refresco.', { ...noExtras, optionLabel: 'Refresco' }],
    ['sangria', 'Sangría', samePrice(39, ['Sangría', 'Sangría Light']), 'Bebida de sangría en versión regular o ligera.', { ...noExtras, optionLabel: 'Variedad' }],
    ['nestea', 'Nestea', 36, 'Té helado Nestea.', noExtras],
    ['cerveza', 'Cerveza', samePrice(29, ['Indio', 'Bohemia', 'Sol', 'Lager', 'Carta Blanca', 'Tecate', 'Tecate Light']), 'Elige una cerveza de la lista del menú.', { ...noExtras, optionLabel: 'Cerveza' }],
    ['bebida-nacional', 'Bebida Nacional', pricesFor([['Vaso', 79], ['Litro', 109]]), 'Bebida nacional servida en vaso o litro.', { ...noExtras, optionLabel: 'Presentación' }],
    ['bebida-importada', 'Bebida Importada', pricesFor([['Vaso', 98], ['Litro', 159]]), 'Bebida importada servida en vaso o litro.', { ...noExtras, optionLabel: 'Presentación' }],
  ]),
  ...menuItems('Postres', [
    ['pasteles-casa', 'Pasteles de la Casa', 65, 'Porción de pastel de la casa. El sabor depende de la disponibilidad.', noExtras],
  ]),
  ...menuItems('Extras', [
    ['extra-mazago', 'Aderezo Mazago', 45, 'Porción adicional de aderezo de mazago.', noExtras],
    ['extra-queso', 'Queso Phila', 12, 'Porción adicional de queso crema.', noExtras],
    ['extra-chipotle', 'Salsa Chipotle', 12, 'Porción adicional de salsa de chipotle.', noExtras],
    ['extra-anguila', 'Salsa de Anguila', 12, 'Porción adicional de salsa de anguila.', noExtras],
    ['extra-soya', 'Soya Extra', 6, 'Porción adicional de salsa de soya.', noExtras],
    ['extra-morron', 'Salsa Morrón', 10, 'Porción adicional de salsa de pimiento morrón.', noExtras],
    ['extra-tartara', 'Salsa Tártara', 12, 'Porción adicional de salsa tártara.', noExtras],
    ['extra-chiles', 'Chiles Toreados', 7, 'Porción de chiles toreados para acompañar.', noExtras],
  ]),
];
