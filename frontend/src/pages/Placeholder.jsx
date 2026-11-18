import React from 'react';
export default function Placeholder({ title, description = 'Esta pantalla se incorporará en una etapa posterior.' }) { return <section className="placeholder"><p className="eyebrow">Entre Créditos</p><h1>{title}</h1><p>{description}</p></section>; }
