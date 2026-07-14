# TODO - Integración Gmail App Password + Supabase (Mensajes)

- [ ] Confirmar URL del endpoint HTTP en frontend (window.__LEARNMORE_SEND_CONTACT_EMAIL_URL__)
- [ ] Verificar variables de entorno en Cloud Functions: `GMAIL_SMTP_USER`, `GMAIL_SMTP_APP_PASSWORD`, `ADMIN_EMAIL`
- [ ] Confirmar que `functions/package.json` tiene `nodemailer`
- [ ] Revisar/ajustar `functions/index.js` para endpoint `sendContactEmail` y que compile (si falta/ sobra algo)
- [ ] Revisar `js/guides.js` para que llame al endpoint luego de insertar en Supabase
- [ ] (Opcional) Eliminar/ignorar sincronización de inbox Gmail con OAuth2 (no aplica para App Password)
- [ ] Probar: enviar mensaje desde el formulario → debe insertarse en Supabase y llegar correo
- [ ] Probar: admin muestra el mensaje en “Mensajes”
