# Phase 3 Stranger Test

Date: 2026-05-09

Method: fresh Playwright browser context against the Pages-style build served locally from `tmp/pages/reference-photo-organizer/`.

Input used:

- One tiny PNG fixture
- Exported workspace JSON from the same session
- Manual text pasted into the import field

## Path Walked

1. Open the app cold.
2. Import one image with the standard file picker.
3. Export a workspace file.
4. Copy the board summary.
5. Factory reset the workspace.
6. Re-import the downloaded workspace file.
7. Use the text field to import pasted content.

## What Happened

- Image import worked.
- Workspace export worked.
- Copy summary worked when clipboard permission was available.
- Factory reset cleared the local workspace.
- Workspace re-import restored the image and workspace state.
- Invalid pasted text produced a clear error.

## Top 3 Issues Found

1. The text field said it accepted workspace JSON, but the button only routed to URL import.
   Status: fixed in this pass by routing the field through the generic text importer.

2. Clipboard copy had no graceful fallback if the browser blocked write access.
   Status: fixed in this pass by surfacing an actionable clipboard-permission message.

3. Folder import support was still implicit and easy to misunderstand in unsupported browsers.
   Status: fixed in this pass by adding explicit fallback guidance near the folder controls.

## Result After Fixes

- The input field now accepts direct image URLs and pasted workspace JSON.
- Copy summary now succeeds or explains the permission problem in domain language.
- Folder import caveats are visible in the UI instead of being left to guesswork.

## Remaining Notes

- The local-first workflow now feels coherent for a stranger on desktop Chromium.
- Physical mobile validation is still missing.
- Folder APIs remain browser-dependent by nature, even with clearer guidance.
