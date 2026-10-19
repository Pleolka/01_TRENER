// Wyróżnienie w nagłówkach z CMS-u: fragment w gwiazdkach (*tekst*)
// dostaje <span class="accent"> — kolor ustawia komponent (--color-energy).
const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const accent = (text: string) =>
  escapeHtml(text).replace(/\*(.+?)\*/g, '<span class="accent">$1</span>');
