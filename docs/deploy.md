# Deployment

Live URL: https://baditaflorin.github.io/reference-photo-organizer/

Repository: https://github.com/baditaflorin/reference-photo-organizer

Reference Photo Organizer deploys as a static GitHub Pages site from the `main` branch and `/docs` folder.

## Publish

```bash
make build
git add docs
git commit -m "chore: publish pages build"
git push origin main
```

## Rollback

Revert the commit that changed `/docs`, then push `main`.

## Custom Domain

If a custom domain is added, place a `CNAME` file in `/docs` and configure DNS according to GitHub Pages documentation:

https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
