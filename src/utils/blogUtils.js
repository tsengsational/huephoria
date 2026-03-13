// Custom front-matter parser to avoid Buffer dependency in the browser
function parseFrontMatter(content) {
  const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(fmRegex);
  
  if (!match) return { data: {}, body: content };
  
  const yamlContent = match[1];
  const body = match[2];
  const data = {};
  
  yamlContent.split('\n').forEach(line => {
    const [key, ...value] = line.split(':');
    if (key && value.length > 0) {
      data[key.trim()] = value.join(':').trim().replace(/^['"](.*)['"]$/, '$1');
    }
  });
  
  return { data, body };
}

// Use Vite's glob import to get all markdown files in the blog directory
const blogFiles = import.meta.glob('../content/blog/*.md', { query: '?raw', import: 'default' });
const pageFiles = import.meta.glob('../content/pages/*.md', { query: '?raw', import: 'default' });

export async function getAllPosts() {
  const posts = await Promise.all(
    Object.keys(blogFiles).map(async (path) => {
      try {
        const content = await blogFiles[path]();
        const { data } = parseFrontMatter(content);
        const slug = path.split('/').pop().replace('.md', '');
        
        return {
          slug,
          ...data,
          content
        };
      } catch (err) {
        console.error(`Error parsing ${path}:`, err);
        return null;
      }
    })
  );

  // Filter out nulls and sort
  return posts.filter(p => p !== null).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getPostBySlug(slug) {
  const path = `../content/blog/${slug}.md`;
  if (!blogFiles[path]) return null;

  try {
    const rawContent = await blogFiles[path]();
    const { data, body } = parseFrontMatter(rawContent);
    
    return {
      slug,
      ...data,
      body
    };
  } catch (err) {
    console.error(`Error loading post ${slug}:`, err);
    return null;
  }
}

export async function getPageBySlug(slug) {
  const path = `../content/pages/${slug}.md`;
  if (!pageFiles[path]) return null;

  try {
    const rawContent = await pageFiles[path]();
    const { data, body } = parseFrontMatter(rawContent);
    
    return {
      slug,
      ...data,
      body
    };
  } catch (err) {
    console.error(`Error loading page ${slug}:`, err);
    return null;
  }
}
