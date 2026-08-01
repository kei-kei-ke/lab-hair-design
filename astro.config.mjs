import { defineConfig } from 'astro/config';

export default defineConfig({
	site: import.meta.env.PUBLIC_SITE_URL || 'https://lab-hair-design.com',
	output: 'static',
});
