import chalk from 'chalk'

export function consoleWarning(message) {
  console.warn(
    chalk.yellow(`${chalk.bold('@inframanufaktur/parse-blog')}: ${message}`),
  )
}
