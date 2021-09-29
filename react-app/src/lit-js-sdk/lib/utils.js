
export const printError = (e) => {
  console.log('Error Stack', e.stack)
  console.log('Error Name', e.name)
  console.log('Error Message', e.message)
}

export const mostCommonString = (arr) => {
  return arr.sort((a, b) =>
    arr.filter(v => v === a).length -
    arr.filter(v => v === b).length
  ).pop()
}