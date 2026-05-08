# Privacy

Reference Photo Organizer is local-first.

No analytics are enabled in v1. The app does not create accounts, upload imported images, or send image metadata to an application backend.

CLIP auto-tagging lazy-loads a public browser model from Hugging Face when enabled. The image classification request runs in the browser against the locally loaded model; imported images are not uploaded by this app.

Model files may be cached by the browser Cache API for faster future tagging.
