import Lara from '@primeuix/themes/lara';
import { Theme, useTheme } from '@primeuix/styled';

useTheme({
	preset: Lara,
	options: {
		...Theme.defaults.options,
	},
});
