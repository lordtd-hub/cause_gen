# Release Checklist

## Source Check

- [ ] `course.config.json` reflects the real course state
- [ ] `modules/*.md` matches the intended module map
- [ ] `missions/missions.json` matches the intended schema and CLO/module mapping
- [ ] `resources/manifest.json` points to real files
- [ ] `generated/` reflects the latest state

## Content Check

- [ ] CLO wording is tight and Bloom-aligned
- [ ] module titles, summaries, and order are consistent
- [ ] interactive widgets fit the nature of the content
- [ ] SBRA really tests process and reasoning
- [ ] misconception tags are specific enough to be useful

## Build Check

- [ ] run `node tools/build-course.mjs --course-dir courses/<course-id>`
- [ ] run `node tools/validate-course.mjs --course-dir courses/<course-id>`
- [ ] run `node tools/validate-course.mjs --course-dir courses/<course-id> --check-output`

## Output Check

- [ ] output exists under `courses/<course-id>/output/`
- [ ] `index.html`, `intro.html`, `lessons.html`, and `missions.html` exist
- [ ] `content/index.html` resolves resource links correctly
- [ ] module pages open correctly
- [ ] there are no leftover legacy root-relative output assumptions

## Review Notes

- outstanding issue 1:
- outstanding issue 2:
- next iteration:
