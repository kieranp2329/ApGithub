import * as sapper from '@sapper/app';

require('./styles');

sapper.start({
	target: document.querySelector('#sapper')
});