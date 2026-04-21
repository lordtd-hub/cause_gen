---
course_id: calculus1_real_check
source_title: Calculus 1 Continuity and Applications of Integrals Problem Set
source_type: latex-problem-set
source_file: user-provided-inline-latex
intake_status: example-fixture
math_format: latex
needs_human_review: true
---

# LaTeX Problem Set Intake

## Source Metadata

- Source title: Calculus 1 Continuity and Applications of Integrals Problem Set
- Source file: provided inline by user during Engine 3 intake-classification refinement
- Intended course: `calculus1_real_check`
- Use mode: `manual-review-first`

## Part To Module Map

| Part | Section Label | Suggested Module | Suggested CLO | Suggested Bloom | Notes |
| --- | --- | --- | --- | --- | --- |
| Part I | Continuity | continuity-and-applications | CLO1 | understand | some items may later support CLO2 or CLO3 |
| Part II | Applications of Integrals | integration | CLO2 | apply | some items may later support CLO3 |

## Review Notes

- This fixture exists to pressure-test the shared `LaTeX Problem Set Intake` block against explicit continuity and applied-integral prompts.
- All mathematics should remain in LaTeX form when rows are later moved into `problem-pool-starter.md` or `problem-pool.json`.
- The continuity section should help verify that grouped classification can surface `continuity-and-applications` as its own module cluster.

## Raw Problem Blocks

```tex
\begin{document}
\maketitle

\section*{Part I: Continuity (5 Problems)}

\begin{enumerate}

\item Determine whether the function
\[
f(x)=\frac{x^2-1}{x-1}
\]
is continuous at $x=1$. If not, can it be made continuous?

\item Find the value of $k$ such that the function
\[
f(x)=
\begin{cases}
x^2 + kx, & x \leq 2, \\
3x - 2, & x > 2
\end{cases}
\]
is continuous at $x=2$.

\item Determine all points of discontinuity of the function
\[
f(x)=\frac{1}{x^2-4}.
\]

\item Determine whether the function
\[
f(x)=\sqrt{x-1}
\]
is continuous on its domain. State the domain clearly.

\item The function is defined as
\[
f(x)=
\begin{cases}
\sin x, & x < 0, \\
kx, & x \geq 0
\end{cases}
\]
Find the value of $k$ that makes $f(x)$ continuous at $x=0$.

\end{enumerate}

\section*{Part II: Applications of Integrals (5 Problems)}

\begin{enumerate}

\item Find the area under the curve
\[
y = x^2
\]
from $x=0$ to $x=3$.

\item Find the area between the curves
\[
y = x^2 \quad \text{and} \quad y = 2x
\]
on the interval where they intersect.

\item Find the area between the curve
\[
y = \sin x
\]
and the $x$-axis on the interval $[0, \pi]$.

\item A particle moves along a line with velocity
\[
v(t) = 3t^2 - 6t.
\]
Find the displacement of the particle from $t=0$ to $t=3$.

\item The rate at which water flows into a tank is
\[
r(t) = 4 + 2t
\]
liters per minute. Find the total amount of water added between $t=0$ and $t=5$.

\end{enumerate}

\end{document}
```
