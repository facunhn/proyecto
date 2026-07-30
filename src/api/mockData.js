export const CATEGORIES = ['Todos', 'Gastronomía', 'Indumentaria', 'Electrodomésticos', 'Supermercados', 'Farmacias', 'Bancos'];

export const BASE_LAT = -34.6037;
export const BASE_LON = -58.3816;

export const MOCK_PROMOS = [
  { id: 1, business: 'Panadería Norte', category: 'Gastronomía', discountLabel: '20% OFF', description: 'En panificados y facturas de la casa, todos los días.', expiry: '31/08', distance: '0.4 km', isBank: false, code: 'PAN20NRT', redeemHint: 'Mostrar código en caja', dLat: 0.0026, dLon: 0.0026 },
  { id: 2, business: 'Farmacity Centro', category: 'Farmacias', discountLabel: '2do al 70%', description: '2do producto de perfumería e higiene al 70% de descuento.', expiry: '15/09', distance: '0.9 km', isBank: false, code: 'FARM2X70', redeemHint: 'Mostrar código en caja', dLat: -0.0057, dLon: 0.0057 },
  { id: 3, business: 'Banco Andes', category: 'Bancos', discountLabel: '30% OFF', description: 'Con tarjeta de crédito Banco Andes, todos los jueves, tope de reintegro $6000.', expiry: '30/09', distance: 'Online', isBank: true, code: 'BAND30JUE', redeemHint: 'Pagar con tarjeta adherida' },
  { id: 4, business: 'DíaSuper', category: 'Supermercados', discountLabel: '3x2', description: 'En almacén y bebidas seleccionadas, todos los fines de semana.', expiry: '20/08', distance: '1.2 km', isBank: false, code: 'DIA3X2FDS', redeemHint: 'Mostrar código en caja', dLat: 0.0076, dLon: -0.0076 },
  { id: 5, business: 'Urbana Ropa', category: 'Indumentaria', discountLabel: '25% OFF', description: 'En la nueva colección de invierno, todos los locales del país.', expiry: '10/09', distance: '2.1 km', isBank: false, code: 'URB25INV', redeemHint: 'Mostrar código en caja', dLat: -0.0134, dLon: -0.0134 },
  { id: 6, business: 'Banco Sur', category: 'Bancos', discountLabel: '15% OFF', description: 'En supermercados, con tope de reintegro $4000, pagando con billetera Sur.', expiry: '28/08', distance: 'Online', isBank: true, code: 'SUR15SUP', redeemHint: 'Pagar con billetera Sur' },
  { id: 7, business: 'Trattoria Bianca', category: 'Gastronomía', discountLabel: '2x1 pastas', description: 'De domingo a jueves, no acumulable con otras promociones.', expiry: '05/09', distance: '1.6 km', isBank: false, code: 'BIANCA2X1', redeemHint: 'Mostrar código al mozo', dLat: 0.0102, dLon: 0.0102 },
  { id: 8, business: 'Farmalife', category: 'Farmacias', discountLabel: '15% OFF', description: 'En medicamentos de venta libre y dermocosmética.', expiry: '12/09', distance: '3.0 km', isBank: false, code: 'LIFE15DVL', redeemHint: 'Mostrar código en caja', dLat: -0.0191, dLon: 0.0191 },
  { id: 9, business: 'MegaHogar', category: 'Electrodomésticos', discountLabel: '6 cuotas sin interés', description: 'En electrodomésticos de línea blanca, pagando con tarjetas adheridas.', expiry: '25/09', distance: '4.4 km', isBank: false, code: 'MEGA6SI', redeemHint: 'Pagar con tarjeta adherida', dLat: 0.028, dLon: -0.028 },
  { id: 10, business: 'CoopMarket', category: 'Supermercados', discountLabel: '10% OFF', description: 'Todos los martes y miércoles, en compras superiores a $10000.', expiry: '18/08', distance: '0.7 km', isBank: false, code: 'COOP10MX', redeemHint: 'Mostrar código en caja', dLat: -0.0045, dLon: -0.0045 },
];
