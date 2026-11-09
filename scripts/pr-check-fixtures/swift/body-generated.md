Feed thumbnails stay in memory once loaded.

## Changes

<dl><dd><details>
<summary>Add a memory cache for feed thumbnails</summary>
<dl><dd><br>

**Before**: each scroll reloaded the thumbnail.

**Now**: `ThumbnailCache` keeps it by URL.

</dd></dl>
</details></dd></dl>

- Update translations from Loco

## To test

Scroll the feed up and down.
