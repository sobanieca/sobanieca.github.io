// The two themes of the site. The colours of the site itself are CSS variables in
// public/assets/css/site.css, switched by the data-theme attribute that layout.js sets from the
// theme in force.
export const lightTheme = {
  name: 'blog-light',
  label: 'Light',
  base: 'imp-light',
  tokens: { 'color-primary': '#c026d3' },
}

export const darkTheme = {
  name: 'blog-dark',
  label: 'Dark',
  base: 'imp-dark',
  tokens: { 'color-primary': '#e879f9' },
}
