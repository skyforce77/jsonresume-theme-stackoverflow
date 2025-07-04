const Handlebars = require('handlebars');
const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');

const HELPERS = join(__dirname, 'theme/hbs-helpers');

const { birthDate } = require(join(HELPERS, 'birth-date.js'));
const { dateHelpers } = require(join(HELPERS, 'date-helpers.js'));
const { paragraphSplit } = require(join(HELPERS, 'paragraph-split.js'));
const { toLowerCase } = require(join(HELPERS, 'to-lower-case.js'));
const { spaceToDash } = require(join(HELPERS, 'space-to-dash.js'));

const { MY, Y, DMY } = dateHelpers;

Handlebars.registerHelper('birthDate', birthDate);
Handlebars.registerHelper('MY', MY);
Handlebars.registerHelper('Y', Y);
Handlebars.registerHelper('DMY', DMY);
Handlebars.registerHelper('paragraphSplit', paragraphSplit);
Handlebars.registerHelper('toLowerCase', toLowerCase);
Handlebars.registerHelper('spaceToDash', spaceToDash);

function render(resume) {
  if (resume.meta.properties != null && resume.meta.properties.theme.skyoverflow != null &&
      resume.meta.properties.theme.skyoverflow.highlighter != null) {
    var resumeString = JSON.stringify(resume);
    resume.meta.properties.theme.skyoverflow.highlighter.forEach(keyword =>
      resumeString = resumeString.replaceAll(new RegExp(keyword, "ig"), function replacer(match, offset, string, groups) {
        return "==" + match + "==";
      }));
    resume = JSON.parse(resumeString);
  }

  const css = readFileSync(`${__dirname}/style.css`, 'utf-8');
  const tpl = readFileSync(`${__dirname}/resume.hbs`, 'utf-8');
  const partialsDir = join(__dirname, 'theme/partials');
  const filenames = readdirSync(partialsDir);

  filenames.forEach((filename) => {
    const matches = /^([^.]+).hbs$/.exec(filename);
    if (!matches) return;
    const name = matches[1];
    const filepath = join(partialsDir, filename);
    const template = readFileSync(filepath, 'utf8');
    Handlebars.registerPartial(name, template);
  });

  return Handlebars.compile(tpl, {noEscape: true})({
    css,
    resume,
  });
}

const marginValue = '0.8 cm';
const pdfRenderOptions = {
  margin: {
    top: marginValue,
    bottom: marginValue,
    left: marginValue,
    right: marginValue,
  }
}

module.exports = { render, pdfRenderOptions };
