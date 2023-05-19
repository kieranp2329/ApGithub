import glob from 'glob';
import loadPost from './_load_post';

export async function get(req, res) {
  // List the Markdown files and return their filenames
  const posts = await new Promise((resolve, reject) =>
      glob('static/_til/*@(.md|.pug)', (err, files) => {
      if (err) return reject(err);
      return resolve(files);
    }),
  );

  // Read the files and parse the metadata + content
  const postsFrontMatter = await Promise.all(
    posts.map(loadPost),
  );

  // Sort by reverse date, because it's a blog
  postsFrontMatter.sort((a, b) => (a.date < b.date ? 1 : -1));

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });

  // Send the list of blog posts to our Svelte component
  res.end(JSON.stringify(postsFrontMatter));
}