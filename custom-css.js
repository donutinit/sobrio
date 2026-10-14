// The CSS sobrio puts on every site. Edit it here, as plain CSS.
sobrio.CUSTOM_CSS = String.raw`
html {
  scroll-behavior: auto !important;
}

/* Eliminar efectos visuales globalmente */
*,
*::before,
*::after {
  border-radius: 0 !important;
  box-shadow: none !important;
  text-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background-attachment: scroll !important;
}

/* Desactivar animaciones EXCEPTO en el reproductor de YouTube */
*:not(#movie_player, #movie_player *),
*:not(#movie_player, #movie_player *)::before,
*:not(#movie_player, #movie_player *)::after {
  animation-duration: .01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: .01ms !important;
  transition-delay: 0s !important;
}

/* Scrollbars */
* {
  scrollbar-width: thin !important;
}
`;
