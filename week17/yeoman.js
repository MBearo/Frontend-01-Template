var Generator = require('yeoman-generator');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('babel');
  }
  // TODO: 1
  // method1() {
  //   this.log('this is method 1');
  // }
  // method2() {
  //   this.log('this is method 2');
  // }
  // _private_method() {
  //   console.log('private hey')
  // }

  // TODO: 2
  // async prompting() {
  //   const answers = await this.prompt([
  //     {
  //       type: 'input',
  //       name: 'name',
  //       message: 'Your project name',
  //       default: this.appname
  //     },
  //     {
  //       type: 'confirm',
  //       name: 'cool',
  //       message: 'Cool!!!!',
  //     },
  //   ]);
  //   this.log('app name', answers.name);
  //   this.log('cool', answers.cool)
  // }

  // TODO: 3
  // writing() {
  //   const pckJson = {
  //     devDependencies: {
  //       eslint: '^3.15.0'
  //     },
  //     dependencies: {
  //       react: '^16.2.0'
  //     }
  //   }
  //   this.fs.extendJSON(this.destinationPath('package.json'), pckJson);
  // }
  // installLoadash() {
  //   this.npmInstall(['lodash'], { 'save-dev': true })
  // }

  // TODO: 4
  async prompting() {
    this.answers = await this.prompt([{
      type: 'input',
      name: 'title',
      message: 'Your project title',
    }])
  }
  writing() {
    this.fs.copyTpl(
      this.templatePath('./template/index.html'),
      this.destinationPath('public/index.html'),
      { title: this.answers.title }
    );
  }
}