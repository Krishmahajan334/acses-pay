# Member Social Links Guide

When updating the new holographic cards in `members.html`, you will notice that each card contains a `.social-bar` element housing three placeholder icons (LinkedIn, GitHub, and Email):

```html
<div class="social-bar">
    <a href="#" class="s-icon"><i class="fa-brands fa-linkedin"></i></a>
    <a href="#" class="s-icon"><i class="fa-brands fa-github"></i></a>
    <a href="#" class="s-icon"><i class="fa-solid fa-envelope"></i></a>
</div>
```

## Action Required

If a core member **has** these professional accounts:
- Replace the `#` in the `href` attribute with their actual URL (e.g., `href="https://linkedin.com/in/krishmahajan"`).

If a core member **DOES NOT have** one or more of these professional accounts:
- You **MUST** completely delete the corresponding `<a href="#" class="s-icon">...</a>` line for that specific icon.
- Leaving empty `#` links will result in "dead" placeholder icons floating on the UI, which creates a broken user experience. 

If a member has no links at all, you can safely remove the entire `<div class="social-bar">` block for that individual card.


## Dynamic Home Page Sync

You do **NOT** need to manually update the Home page (`index.html`) when you change the photos or social links for the **President** or **Vice President**. 

A dynamic JavaScript engine automatically reads `members.html` and instantly ports those top two cards directly onto the Home page!

*Important Note:* If you are completely replacing the leadership for a new year, you should also update the hardcoded fallback cards located inside `acses/page-home.js` (inside the `catch` block of `loadTeamPreview()`). This ensures the correct people are shown even if someone views the website offline from their desktop.
