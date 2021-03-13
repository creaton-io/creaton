const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: false,
  theme: {
    extend: {
      colors: {
        palette: {
          white: '#ffffff',
          gray100: colors.gray[100],
          gray500: colors.gray[500],
          gray900: colors.gray[900],
          navy: '#5E2BF6',
          navyDark: '#42389D',
          navyLight: '#EFEAFE',
          green: '#43E296',
          greenDark: '#27B76F',
          greenLight: '#ECFCF4',
          bluePrimary: '#2A64F6',
          blue: '#5C89FF',
          blueDark: '#2355CF',
          blueLight: '#EAEFFE',
          pink: '#E54775',
          pinkLight: '#FADAE3',
        },
        current: 'currentColor',
        primary: {
          DEFAULT: 'var(--color-navy)',
          dark: 'var(--color-navy-dark)',
        },
        navy: {
          DEFAULT: 'var(--color-navy)',
          dark: 'var(--color-navy-dark)',
          light: 'var(--color-navy-light)',
        },
        green: {
          DEFAULT: 'var(--color-green)',
          dark: 'var(--color-green-dark)',
          light: 'var(--color-green-light)',
        },
        blue: {
          primary: 'var(--color-blue-primary)',
          DEFAULT: 'var(--color-blue)',
          dark: 'var(--color-blue-dark)',
          light: 'var(--color-blue-light)'
        },
        pink: {
          DEFAULT: 'var(--color-pink)',
          light: 'var(--color-pink-light)'
        },
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
