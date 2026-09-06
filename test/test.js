import chalk from 'chalk';

// console.log(chalk.blue('Hello World!'));
// console.log(chalk.green('✓ Success!'));
// console.log(chalk.yellow('⚠ Warning!'));
// console.log(chalk.red('✗ Error!'));

// console.log(
//   chalk.blue.bgWhite.bold('Chalk is working!')
// );



// Custom theme registered with createTheme.
const myTheme = chalk.createTheme('mythem', {
    title: chalk.hex('#7DF9FF').bold.italic,
    subtitle: chalk.hex('#B8F7FF'),
    success: chalk.hex('#7CFFB2'),
    warning: chalk.hex('#FFE66D').underline,
    error: chalk.hex('#FF6B81').bold,
});

const myTheme2 = chalk.createTheme('mytheme2', {
  text: chalk
    .hex('#df1692')
    .bgRgb(26, 0, 51)
    .bold
    .italic
    .underlineRgb(0, 255, 255)
    .underlineCurly,
});


console.log(myTheme.title('Custom myTheme title'));
console.log(myTheme.warning('Custom myTheme warning'));

console.log(myTheme2.text('My Theme 2 text'));