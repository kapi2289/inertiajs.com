import { A, Code, CodeBlock, H1, H2, Notice, P, React, Svelte, TabbedCode, Vue, Vue2, Vue3 } from '@/Components'
import dedent from 'dedent-js'

export const meta = {
  title: 'Server-side rendering (SSR)',
  links: [
    { url: '#laravel-starter-kits', name: 'Laravel starter kits' },
    { url: '#install-dependencies', name: 'Install dependencies' },
    { url: '#add-server-entry-point', name: 'Add server entry-point' },
    { url: '#setup-vite-js', name: 'Setup Vite.js' },
    { url: '#update-npm-script', name: 'Update npm script' },
    { url: '#running-the-ssr-server', name: 'Running the SSR server' },
    { url: '#client-side-hydration', name: 'Client side hydration' },
    { url: '#hosting-setup', name: 'Hosting setup' },
  ],
}

export default function () {
  return (
    <>
      <H1>Server-side Rendering (SSR)</H1>
      <P>
        Server-side rendering pre-renders your JavaScript pages on the server, allowing your visitors to see your
        website prior to the JavaScript fully loading. It also makes it easier for search engines to index your site.
      </P>
      <Notice>
        Server-side rendering uses Node.js to render your pages in a background process, and therefore must be available
        on your server.
      </Notice>
      <H2>Laravel starter kits</H2>
      <P>
        If you are using <A href="https://laravel.com/docs/starter-kits">Laravel Breeze or Jetstream</A>, you may
        install the starter kit's scaffolding with Inertia SSR support pre-configured using the <Code>--ssr</Code> flag.
      </P>
      <TabbedCode
        examples={[
          {
            name: 'Laravel',
            language: 'bash',
            code: dedent`
              php artisan breeze:install react --ssr
              php artisan breeze:install vue --ssr
            `,
          },
        ]}
      />
      <H2>Install dependencies</H2>
      <P>
        First, we'll install the additional dependencies required for server-side rendering. This is only necessary for
        the Vue adapters, so if you're using React or Svelte you can skip this step.
      </P>
      <TabbedCode
        examples={[
          {
            name: 'Vue 2',
            language: 'bash',
            code: dedent`
              npm install vue-server-renderer
            `,
          },
          {
            name: 'Vue 3',
            language: 'bash',
            code: dedent`
              npm install @vue/server-renderer
            `,
          },
          {
            name: 'React',
            language: 'js',
            code: dedent`
              // No additional dependencies required
            `,
          },
          {
            name: 'Svelte',
            language: 'js',
            code: dedent`
              // No additional dependencies required
            `,
          },
        ]}
      />
      <P>Also, make sure you have the latest version of the Inertia Laravel adapter installed:</P>
      <CodeBlock
        language="bash"
        children={dedent`
          composer require inertiajs/inertia-laravel
        `}
      />
      <H2>Add server entry-point</H2>
      <P>
        Next, we'll create a <Code>resources/js/ssr.js</Code> file within our Laravel project that will serve as our SSR
        entry point:
      </P>
      <CodeBlock
        language="bash"
        children={dedent`
          touch resources/js/ssr.js
        `}
      />
      <P>
        This file is going to look very similar to your <Code>resources/js/app.js</Code> file, except it's not going to
        run in the browser, but rather in Node.js. Here's a complete example:
      </P>
      <TabbedCode
        examples={[
          {
            name: 'Vue 2',
            language: 'js',
            code: dedent`
              import { createInertiaApp } from '@inertiajs/vue2'
              import createServer from '@inertiajs/vue2/server'
              import Vue from 'vue'
              import { createRenderer } from 'vue-server-renderer'

              createServer(page =>
                createInertiaApp({
                  page,
                  render: createRenderer().renderToString,
                  resolve: name => {
                    const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
                    return pages[\`./Pages/\${name}.vue\`]
                  },
                  setup({ app, props, plugin }) {
                    Vue.use(plugin)
                    return new Vue({
                      render: h => h(app, props),
                    })
                  },
                }),
              )
            `,
          },
          {
            name: 'Vue 3',
            language: 'js',
            code: dedent`
              import { createInertiaApp } from '@inertiajs/vue3'
              import createServer from '@inertiajs/vue3/server'
              import { renderToString } from '@vue/server-renderer'
              import { createSSRApp, h } from 'vue'

              createServer(page =>
                createInertiaApp({
                  page,
                  render: renderToString,
                  resolve: name => {
                    const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
                    return pages[\`./Pages/\${name}.vue\`]
                  },
                  setup({ app, props, plugin }) {
                    return createSSRApp({
                      render: () => h(app, props),
                    }).use(plugin)
                  },
                }),
              )
            `,
          },
          {
            name: 'React',
            language: 'jsx',
            code: dedent`
              import { createInertiaApp } from '@inertiajs/react'
              import createServer from '@inertiajs/react/server'
              import ReactDOMServer from 'react-dom/server'

              createServer(page =>
                createInertiaApp({
                  page,
                  render: ReactDOMServer.renderToString,
                  resolve: name => {
                    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
                    return pages[\`./Pages/\${name}.jsx\`]
                  },
                  setup: ({ App, props }) => <App {...props} />,
                }),
              )
            `,
          },
          {
            name: 'Svelte',
            language: 'js',
            code: dedent`
              import { createInertiaApp } from '@inertiajs/svelte'
              import createServer from '@inertiajs/svelte/server'

              createServer(page =>
                createInertiaApp({
                  page,
                  resolve: name => {
                    const pages = import.meta.glob('./Pages/**/*.svelte', { eager: true })
                    return pages[\`./Pages/\${name}.svelte\`]
                  },
                }),
              )
            `,
          },
        ]}
      />
      <P>
        Be sure to add anything that's missing from your <Code>app.js</Code> file that makes sense to run in SSR mode,
        such as plugins or custom mixins.
      </P>
      <H2>Setup Vite.js</H2>
      <P>
        Next, we need to update our Vite.js configuration to build our new <Code>ssr.js</Code> file. We can do this by
        adding a <Code>ssr</Code> property to the Laravel plugin configuration in our <Code>vite.config.js</Code> file:
      </P>
      <CodeBlock
        language="diff"
        children={dedent`
          export default defineConfig({
            plugins: [
              laravel({
                input: ['resources/css/app.css', 'resources/js/app.js'],
          +     ssr: 'resources/js/ssr.js',
                refresh: true,
              }),
              // ...
            ],
          })
        `}
      />
      <H2>Update npm script</H2>
      <P>
        Next, let's update the <Code>build</Code> script in our <Code>package.json</Code> file to also build our new{' '}
        <Code>ssr.js</Code> file:
      </P>
      <CodeBlock
        language="diff"
        children={dedent`
           "scripts": {
             "dev": "vite",
         -   "build": "vite build"
         +   "build": "vite build && vite build --ssr"
           },
        `}
      />
      <P>Now you can build both your client-side and server-side bundles:</P>
      <CodeBlock
        language="bash"
        children={dedent`
          npm run build
        `}
      />
      <H2>Running the SSR server</H2>
      <P>
        Now that you have built both your client-side and server-side bundles, you should be able run the Node-based
        Inertia SSR server using the following command:
      </P>
      <CodeBlock
        language="bash"
        children={dedent`
          php artisan inertia:start-ssr
        `}
      />
      <P>
        With the server running, you should now be able to access your app within the browser with server-side rendering
        enabled. In fact, you should be able to disable JavaScript entirely and still navigate around your application.
      </P>
      <H2>Client side hydration</H2>
      <P>
        Since your website is now being server-side rendered, you can instruct <Vue>Vue</Vue>
        <React>React</React>
        <Svelte>Svelte</Svelte> to "hydrate" the static markup and make it interactive instead of re-rendering all the
        HTML that we just generated.
      </P>
      <Vue2>
        <P>Inertia automatically enables client-side hydration in Vue 2 apps, so no changes are required.</P>
      </Vue2>
      <Vue3>
        <P>
          To enable client-side hydration in a Vue 3 app, update your <Code>app.js</Code> file to use{' '}
          <Code>createSSRApp</Code> instead of <Code>createApp</Code>:
        </P>
      </Vue3>
      <React>
        <P>
          To enable client-side hydration in a React app, update your <Code>app.js</Code> file to use{' '}
          <Code>hydrateRoot</Code> instead of <Code>createRoot</Code>:
        </P>
      </React>
      <Svelte>
        <P>
          To enable client-side hydration in a Svelte app, set the <Code>hydratable</Code> compiler option to{' '}
          <Code>true</Code> in your <Code>vite.config.js</Code> file:
        </P>
      </Svelte>
      <TabbedCode
        examples={[
          {
            name: 'Vue 2',
            language: 'js',
            code: dedent`
              // No changes required
            `,
          },
          {
            name: 'Vue 3',
            language: 'diff',
            code: dedent`
            - import { createApp, h } from 'vue'
            + import { createSSRApp, h } from 'vue'
              import { createInertiaApp } from '@inertiajs/vue3'

              createInertiaApp({
                resolve: name => {
                  const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
                  return pages[\`./Pages/\${name}.vue\`]
                },
                setup({ el, App, props, plugin }) {
            -     createApp({ render: () => h(App, props) })
            +     createSSRApp({ render: () => h(App, props) })
                    .use(plugin)
                    .mount(el)
                },
              })
            `,
          },
          {
            name: 'React',
            language: 'diff',
            code: dedent`
              import { createInertiaApp } from '@inertiajs/react'
            - import { createRoot } from 'react-dom/client'
            + import { hydrateRoot } from 'react-dom/client'

              createInertiaApp({
                resolve: name => {
                  const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
                  return pages[\`./Pages/\${name}.jsx\`]
                },
                setup({ el, App, props }) {
            -     createRoot(el).render(<App {...props} />)
            +     hydrateRoot(el, <App {...props} />)
                },
              })
            `,
          },
          {
            name: 'Svelte',
            language: 'diff',
            code: dedent`
              import { svelte } from '@sveltejs/vite-plugin-svelte'
              import laravel from 'laravel-vite-plugin'
              import { defineConfig } from 'vite'

              export default defineConfig({
                plugins: [
                  laravel.default({
                    input: ['resources/css/app.css', 'resources/js/app.js'],
                    ssr: 'resources/js/ssr.js',
                    refresh: true,
                  }),
            -     svelte(),
            +     svelte({
            +       compilerOptions: {
            +         hydratable: true,
            +       },
            +     }),
                ],
              })
            `,
          },
        ]}
      />
      <H2>Hosting setup</H2>
      <P>
        When deploying your SSR enabled app to production, you'll need to build both the client-side (
        <Code>app.js</Code>) and server-side bundles (<Code>ssr.js</Code>), and then enable the SSR server in a
        background process:
      </P>
      <CodeBlock
        language="bash"
        children={dedent`
          php artisan inertia:start-ssr
        `}
      />
      <P>To stop the SSR server, for instance when you deploy a new version of your website, run:</P>
      <CodeBlock
        language="bash"
        children={dedent`
          php artisan inertia:stop-ssr
        `}
      />
      <H2>Laravel Forge</H2>
      <P>
        To run the SSR server on Forge, you should create a new daemon that runs{' '}
        <Code>php artisan inertia:start-ssr</Code> from the root of your app.
      </P>
      <P>
        Next, whenever you deploy your application, you'll need to automatically restart the SSR server by calling the{' '}
        <Code>php artisan inertia:start-ssr</Code> command. This will stop the existing SSR server, forcing a new one to
        start.
      </P>
      <H2>Heroku</H2>
      <P>
        To run the SSR server on Heroku, update the <Code>web</Code> configuration in your <Code>Procfile</Code> to
        first run the SSR server before starting your web server.
      </P>
      <CodeBlock
        language="bash"
        children={dedent`
        web: php artisan inertia:start-ssr & vendor/bin/heroku-php-apache2 public/
      `}
      />
      <P>
        Note, you must have the <Code>heroku/nodejs</Code> buildpack installed in addition to the{' '}
        <Code>heroku/php</Code> buildback for the SSR server to run.
      </P>
    </>
  )
}
