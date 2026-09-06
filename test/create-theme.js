import test from 'ava';
import chalk, {Chalk} from '../source/index.js';

chalk.level = 3;

// -----------------------------------------------------------------------------
// Built-in aurora theme
// -----------------------------------------------------------------------------

test('built-in aurora theme renders the original neon look', t => {
	const output = chalk.theme.aurora('hello');

	t.true(output.includes('\u{1B}[38;2;255;0;255m')); // magenta fg
	t.true(output.includes('\u{1B}[48;2;26;0;51m')); // aurora-night bg
	t.true(output.includes('\u{1B}[1m')); // bold
	t.true(output.includes('\u{1B}[3m')); // italic
	t.true(output.includes('\u{1B}[4:3m')); // curly underline
	t.true(output.includes('\u{1B}[58;2;0;255;255m')); // cyan underline color
	t.true(output.includes('hello'));
});

test('built-in aurora exposes named styles as own properties', t => {
	t.is(typeof chalk.theme.aurora.title, 'function');
	t.is(typeof chalk.theme.aurora.subtitle, 'function');
	t.is(typeof chalk.theme.aurora.success, 'function');
	t.is(typeof chalk.theme.aurora.warning, 'function');
	t.is(typeof chalk.theme.aurora.error, 'function');
});

test('built-in aurora named styles produce the expected escape codes', t => {
	t.is(
		chalk.theme.aurora.title('hi'),
		'\u{1B}[38;5;51m\u{1B}[1mhi\u{1B}[22m\u{1B}[39m',
	);
	t.is(
		chalk.theme.aurora.error('oops'),
		'\u{1B}[38;5;204m\u{1B}[1moops\u{1B}[22m\u{1B}[39m',
	);
});

// -----------------------------------------------------------------------------
// createTheme: creation and registration
// -----------------------------------------------------------------------------

test('createTheme returns the registered theme', t => {
	const theme = chalk.createTheme('__t_creation', {
		title: chalk.cyan.bold,
	});

	t.is(typeof theme, 'function');
	t.is(typeof theme.title, 'function');
	t.is(theme.title('x'), chalk.cyan.bold('x'));
});

test('createTheme registers the theme under chalk.theme.<name>', t => {
	const theme = chalk.createTheme('__t_registration', {
		greet: chalk.green,
	});

	t.is(chalk.theme.__t_registration, theme);
	t.is(chalk.theme.__t_registration.greet('hi'), theme.greet('hi'));
});

test('createTheme callable form invokes the default style', t => {
	const theme = chalk.createTheme('__t_default', {
		default: chalk.magenta.bold,
		other: chalk.cyan,
	});

	t.is(theme('hi'), chalk.magenta.bold('hi'));
	t.is(theme('a', 'b'), chalk.magenta.bold('a b'));
});

test('createTheme supports themes with no default style', t => {
	const theme = chalk.createTheme('__t_no_default', {
		title: chalk.yellow,
	});

	// Falls back to joining the arguments when no `default` style is present.
	t.is(theme('a', 'b'), 'a b');
	t.is(typeof theme.title, 'function');
});

test('createTheme accepts an empty styles object', t => {
	const theme = chalk.createTheme('__t_empty', {});
	t.is(typeof theme, 'function');
	t.is(theme('hello'), 'hello');
});

// -----------------------------------------------------------------------------
// createTheme: duplicate names
// -----------------------------------------------------------------------------

test('createTheme throws when the name is already registered', t => {
	chalk.createTheme('__t_dup', {title: chalk.cyan});

	const error = t.throws(() => {
		chalk.createTheme('__t_dup', {title: chalk.red});
	}, {instanceOf: Error});

	t.true(error.message.includes('__t_dup'));
	t.true(error.message.includes('already registered'));
});

test('built-in aurora name cannot be overridden', t => {
	t.throws(() => chalk.createTheme('aurora', {title: chalk.red}), {
		message: /already registered/,
	});
});

// -----------------------------------------------------------------------------
// createTheme: validation
// -----------------------------------------------------------------------------

test('createTheme rejects a non-string name', t => {
	t.throws(() => chalk.createTheme(123, {x: chalk.red}), {
		instanceOf: TypeError,
		message: /non-empty string/,
	});
	t.throws(() => chalk.createTheme(undefined, {x: chalk.red}), {
		instanceOf: TypeError,
		message: /non-empty string/,
	});
	t.throws(() => chalk.createTheme(null, {x: chalk.red}), {
		instanceOf: TypeError,
		message: /non-empty string/,
	});
});

test('createTheme rejects an empty name', t => {
	t.throws(() => chalk.createTheme('', {x: chalk.red}), {
		instanceOf: TypeError,
		message: /non-empty string/,
	});
});

test('createTheme rejects names with invalid characters', t => {
	t.throws(() => chalk.createTheme('my-theme', {x: chalk.red}), {
		instanceOf: Error,
		message: /Invalid theme name/,
	});
	t.throws(() => chalk.createTheme('1leading', {x: chalk.red}), {
		instanceOf: Error,
		message: /Invalid theme name/,
	});
	t.throws(() => chalk.createTheme('has space', {x: chalk.red}), {
		instanceOf: Error,
		message: /Invalid theme name/,
	});
});

test('createTheme accepts valid identifier names', t => {
	t.notThrows(() => chalk.createTheme('__t_valid', {x: chalk.red}));
	t.notThrows(() => chalk.createTheme('camelCase', {x: chalk.red}));
	t.notThrows(() => chalk.createTheme('$dollar', {x: chalk.red}));
	t.notThrows(() => chalk.createTheme('_under', {x: chalk.red}));
});

test('createTheme rejects non-object styles', t => {
	t.throws(() => chalk.createTheme('__t_bad_styles_1', null), {
		instanceOf: TypeError,
		message: /plain object/,
	});
	t.throws(() => chalk.createTheme('__t_bad_styles_2', 'string'), {
		instanceOf: TypeError,
		message: /plain object/,
	});
	t.throws(() => chalk.createTheme('__t_bad_styles_3', 42), {
		instanceOf: TypeError,
		message: /plain object/,
	});
	t.throws(() => chalk.createTheme('__t_bad_styles_4', [chalk.red]), {
		instanceOf: TypeError,
		message: /plain object/,
	});
});

test('createTheme rejects style values that are not functions', t => {
	t.throws(
		() => chalk.createTheme('__t_bad_value', {title: 'not a function'}),
		{
			instanceOf: TypeError,
			message: /__t_bad_value\.title/,
		},
	);
	t.throws(
		() => chalk.createTheme('__t_bad_value_2', {title: {nested: chalk.red}}),
		{
			instanceOf: TypeError,
			message: /must be a function/,
		},
	);
});

// -----------------------------------------------------------------------------
// createTheme: cross-instance visibility
// -----------------------------------------------------------------------------

test('createTheme is exposed on chalkStderr and shares the registry', t => {
	const theme = chalkStderr.createTheme('__t_shared', {
		greet: chalkStderr.blue,
	});

	t.is(chalkStderr.theme.__t_shared, theme);
	t.is(chalk.theme.__t_shared, theme);
});

test('createTheme is exposed on user-created Chalk instances', t => {
	const instance = new Chalk({level: 3});
	const theme = instance.createTheme('__t_instance', {
		greet: instance.green,
	});

	t.is(instance.theme.__t_instance, theme);
	t.is(chalk.theme.__t_instance, theme);
});

test('themes registered after import are visible everywhere', t => {
	const theme = chalk.createTheme('__t_late', {greet: chalk.yellow});
	const instance = new Chalk({level: 3});

	t.is(instance.theme.__t_late, theme);
	t.is(chalkStderr.theme.__t_late, theme);
});

// -----------------------------------------------------------------------------
// Backward compatibility
// -----------------------------------------------------------------------------

test('built-in aurora theme still works as a callable (backward compat)', t => {
	t.is(typeof chalk.theme.aurora, 'function');
	t.is(chalk.theme.aurora('hi'), chalk.theme.aurora.default('hi'));
});

test('existing chalk APIs still work', t => {
	t.is(chalk.red('foo'), '\u{1B}[31mfoo\u{1B}[39m');
	t.is(chalk.blue.bold('bar'), '\u{1B}[34m\u{1B}[1mbar\u{1B}[22m\u{1B}[39m');
	t.is(chalk.level, 3);
});

// -----------------------------------------------------------------------------
// Namespace safety
// -----------------------------------------------------------------------------

test('chalk.theme namespace does not inherit prototype methods', t => {
	// Object.create(null) is used so an inherited `toString` cannot shadow
	// a theme literally named `toString`.
	t.is(typeof chalk.theme.toString, 'undefined');
	t.is(typeof chalk.theme.hasOwnProperty, 'undefined');
});

test('chalk.theme returns a fresh object on each access', t => {
	t.not(chalk.theme, chalk.theme);
});
