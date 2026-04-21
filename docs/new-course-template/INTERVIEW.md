# INTERVIEW

Use these questions before scaffolding a new course.

## Course Basics

- Thai course name
- English course name
- short course label
- `course_id`
- instructor or attribution
- short course description

## CLO / Learning Design

- how many CLOs exist?
- what Bloom level is attached to each CLO?
- does the course mainly emphasize concept, proof, application, or a mix?

## Content Inputs

- which file types will be provided: `.md`, `.docx`, `.tex`, or others?
- are materials already available under `courses/<course-id>/materials/raw/`?
- if the source starts from TQF3, which parts are already extractable into the TQF3 package?

## Interaction / Assessment

- which major areas should be active first: `resources`, `missions`, `games`, or others?
- which interactive blocks are expected to appear often?
- which modules should use SBRA first?
- will assessment evidence need badge hooks at the CLO level?

## TQF3 Bridge Readiness

If the course starts from TQF3, ask:

- can `tqf3-course-anchor.md` be prepared now?
- can `tqf3-clo-map.md` be prepared now?
- can `tqf3-week-to-module-map.md` be prepared now?
- can `tqf3-assessment-evidence-map.md` be prepared now?
- is the first goal only a buildable honest output, or deeper authoring right away?

## Repo Law Reminder

After the answers are clear, the next step is to create source in:

- `courses/<course-id>/`

and build output in:

- `courses/<course-id>/output/`

