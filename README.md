

## GitHub Pages deployment

This repository deploys through `.github/workflows/deploy-pages.yml`. The workflow runs `pnpm check`, builds the Vite site into `dist/public`, and deploys that directory with the official GitHub Pages artifact actions.

For `CodeWithJawadYT/jiji`, open **Settings → Pages** on GitHub and set **Source** to **GitHub Actions**. The expected project-site URL is `https://codewithjawadyt.github.io/jiji/`. The Vite base path switches to `/jiji/` only inside the GitHub Actions build, while Manus preview and hosting continue using `/`.

The site currently references Manus storage URLs for some uploaded images. If GitHub Pages is expected to host those images independently, copy the assets into a GitHub-hosted static asset directory and update those references separately; the Pages workflow fixes the root 404 and builds the application, but it does not recreate the Manus storage proxy.
