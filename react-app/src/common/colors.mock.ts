
const colors = {
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
};

export const colorsMockData = {
    colors: Object.entries(colors).map(([key, value]) => ({
        name: key,
        value,
    }))
}
