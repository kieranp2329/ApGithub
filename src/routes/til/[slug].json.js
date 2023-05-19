import fm from 'front-matter';
import glob from 'glob';
import {fs} from 'mz';
import path from 'path';
import loadPost from './_load_post';

export async function get(req, res, next) {
	// the `slug` parameter is available because
	// this file is called [slug].json.js
	const { slug } = req.params;

	// List the Markdown files and return their filenames
  const posts = await new Promise((resolve, reject) =>
      glob(`static/_til/${slug}@(.md|.pug)`, (err, files) => {
      if (err) return reject(err);
      return resolve(files);
    }),
	);

	if (posts.length) {
		const post = posts[0];
		res.writeHead(200, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify(await loadPost(post, true), null, 2));
	} else {
		res.writeHead(404, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			message: `Not found`
		}));
	}
}
