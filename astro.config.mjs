import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Adapter wrapper that ensures generated Vercel Serverless Functions target
 * the currently supported Node.js 22 runtime and eliminates outdated nodejs18.x.
 */
function vercelWithNode22(options = {}) {
  const baseAdapter = vercel(options);
  return {
    ...baseAdapter,
    name: '@astrojs/vercel/serverless',
    hooks: {
      ...baseAdapter.hooks,
      'astro:build:done': async (args) => {
        // Execute original build:done hook
        if (baseAdapter.hooks && baseAdapter.hooks['astro:build:done']) {
          await baseAdapter.hooks['astro:build:done'](args);
        }

        // Ensure all generated .vc-config.json files use supported nodejs22.x
        const functionsDir = path.resolve(process.cwd(), '.vercel/output/functions');
        if (fs.existsSync(functionsDir)) {
          const entries = fs.readdirSync(functionsDir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isDirectory() && entry.name.endsWith('.func')) {
              const vcConfigPath = path.join(functionsDir, entry.name, '.vc-config.json');
              if (fs.existsSync(vcConfigPath)) {
                try {
                  const cfg = JSON.parse(fs.readFileSync(vcConfigPath, 'utf-8'));
                  const validRuntimes = ['nodejs22.x', 'nodejs20.x'];
                  if (!validRuntimes.includes(cfg.runtime)) {
                    cfg.runtime = 'nodejs22.x';
                    fs.writeFileSync(vcConfigPath, JSON.stringify(cfg, null, '\t'), 'utf-8');
                  }
                } catch (err) {
                  console.error(`Failed to verify ${vcConfigPath}:`, err);
                }
              }
            }
          }
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://my-editorial-blog.vercel.app',
  output: 'hybrid',
  adapter: vercelWithNode22(),
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
});
