var tty = require('tty');
var ttys = require('ttys');
var stdin = ttys.stdin;
var stdout = ttys.stdout;

// stdout.write('hello world!\n');
// stdout.write('\033[1A');
// stdout.write('jhyu\n');

var readline = require('readline');
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// async function ask(question) {
// 	return new Promise((resolve, reject) => {
// 		rl.question(question, (answer) => {
// 			resolve(answer);
// 			// rl.close();
// 		});
// 	});
// }

// void async function () {
// 	console.log(await ask('Your project title？'));
// }();

// var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

// stdin.on('data', function (key) {
// 	if (key === '\u0003') {
// 		process.exit();
// 	}

// 	process.stdout.write(key.toString().charCodeAt(0).toString());
// });

function getChar() {
  return new Promise((resolve, reject) => {
    stdin.once('data', function (key) {
      resolve(key);
    });
  });
}

function up(n = 1) {
  stdout.write('\033[' + n + 'A');
}

function down(n = 1) {
  stdout.write('\033[' + n + 'B');
}

function right(n = 1) {
  stdout.write('\033[' + n + 'C');
}

function left(n = 1) {
  stdout.write('\033[' + n + 'D');
}

void(async function () {
  stdout.write('which framework do you want to sue ?\n');
  let answer = await select(['vue', 'react', 'angular']);
  stdout.write('You Selected ' + answer + '\n');
  process.exit();
})();

async function select(choices) {
  let selected = 0;
  for (let i = 0; i < choices.length; i++) {
    let choice = choices[i];
    if (i === selected) {
      stdout.write('[x]' + choice + '\n');
    } else {
      stdout.write('[ ]' + choice + '\n');
    }
  }

  up(choices.length);
  right();
  while (true) {
    let char = await getChar();
    if (char === '\u0003') {
      process.exit();
      break;
    }
    // w
    if (char === 'w' && selected > 0) {
      stdout.write(' ');
      left();
      selected--;
      up();
      stdout.write('x');
      left();
    }

    // s
    if (char === 's' && selected < choices.length - 2) {
      stdout.write(' ');
      left();
      selected++;
      down();
      stdout.write('x');
      left();
    }

    // 回车
    if (char === '\r') {
      down(choices.length - selected);
      left();
      return choices[selected];
    }
  }
}