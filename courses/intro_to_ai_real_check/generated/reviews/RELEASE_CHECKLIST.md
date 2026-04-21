# RELEASE CHECKLIST

## Source Check

- [ ] `course.config.json` reflects the real course
- [ ] `modules/*.md` match the intended module map
- [ ] `missions/missions.json` matches the intended SBRA design
- [ ] `resources/manifest.json` points to real files
- [ ] `generated/*.md` reflects the latest state

## Build Check

- [ ] run `node tools/build-course.mjs --course-dir courses/intro_to_ai_real_check`
- [ ] run `node tools/validate-course.mjs --course-dir courses/intro_to_ai_real_check`
- [ ] run `node tools/validate-course.mjs --course-dir courses/intro_to_ai_real_check --check-output`

## Output Check

- [ ] output exists under `courses/intro_to_ai_real_check/output/`
- [ ] top-level pages were created
- [ ] module pages were created
- [ ] resource links work

